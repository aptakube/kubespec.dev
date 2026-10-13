// Builds the index of versions and spec file URLs for each project.
//
// Usage:
//   GH_TOKEN=$(gh auth token) pnpm build-index                   # all projects
//   GH_TOKEN=$(gh auth token) pnpm build-index kubernetes        # one project
//   GH_TOKEN=$(gh auth token) pnpm build-index kubernetes --full # re-resolve existing versions
//
// Versions (and tags skipped for having no kinds) already in the index are kept as-is
// unless --full is passed, so only new tags hit the GitHub API. The index is saved after
// every tag, so an interrupted run picks up where it left off.
//
// The index of a project is written to index/<project>/versions.json, and each kind's changes per version
// to index/<project>/changelog/<apiVersion>/<Kind>.json. Each version records the version it was compared
// to (changelogBase), so only versions that are new, or whose previous version changed, are compared again.
//
// Spec files and directory listings are cached in .cache/specs/<project>/<md5 of url>.<json|yaml>
// (everything is pinned to a tag, so it never expires). Delete that directory to force a re-download.

import { createHash } from "node:crypto";
import { readFile, readdir, writeFile, mkdir, rename, rm } from "node:fs/promises";
import { projects, type ProjectDef } from "../lib/projects.ts";
import { resolveKinds, sortKinds, toDeltas, type ResolvedVersion } from "../lib/kinds.ts";
import { diffSpecs, mergeSpecFiles, packChangelog, unpackChangelog, type DiffedChanges } from "../lib/changelog.ts";
import { parseManifests, parseSpecFile, type SpecFile } from "../lib/spec.ts";
import type { KindRef, ProjectIndex } from "../lib/types.ts";

const INDEX_DIR = new URL("../index/", import.meta.url);
const CACHE_DIR = new URL("../.cache/specs/", import.meta.url);

const tagsToIgnore = ["rc", "test", "alpha", "dev", "snapshot", "beta", "pre", "chart", "helm"];

// non-manifest files that some projects ship alongside their CRDs
const filesToIgnore = [/^NOTES\.txt$/i, /^kustomization\.ya?ml$/i, /\.go$/i, /\.md$/i];

// how many tags are processed at the same time
const CONCURRENCY = 8;

// returns the contents from the disk cache, calling load() on a miss
async function cached(project: ProjectDef, url: string, ext: "json" | "yaml", load: () => Promise<string>): Promise<string> {
  const dir = new URL(`${project.slug}/`, CACHE_DIR);
  const file = new URL(`${createHash("md5").update(url).digest("hex")}.${ext}`, dir);
  try {
    return await readFile(file, "utf-8");
  } catch {}

  const content = await load();

  // write to a temp file first so an interrupted run never leaves a partial file behind
  await mkdir(dir, { recursive: true });
  const tmp = new URL(`${file.href}.${process.pid}.tmp`);
  await writeFile(tmp, content);
  await rename(tmp, file);
  return content;
}

// runs fn over items with at most `limit` calls in flight
async function forEachLimit<T>(items: T[], limit: number, fn: (item: T) => Promise<void>): Promise<void> {
  let next = 0;
  const worker = async () => {
    while (next < items.length) await fn(items[next++]);
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
}

async function gh(path: string): Promise<Response> {
  const response = await fetch(`https://api.github.com${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${process.env.GH_TOKEN}`,
    },
  });

  // out of requests for this hour: wait for the limit to reset, then try again
  if ((response.status === 403 || response.status === 429) && response.headers.get("x-ratelimit-remaining") === "0") {
    const reset = Number(response.headers.get("x-ratelimit-reset")) * 1000;
    const wait = Math.max(reset - Date.now(), 0) + 5000;
    console.log(`- GitHub rate limit reached, waiting ${Math.ceil(wait / 60000)} min until it resets`);
    await new Promise((resolve) => setTimeout(resolve, wait));
    return gh(path);
  }
  if (response.status === 401 || response.status === 403) {
    throw new Error(`GitHub API ${response.status} for ${path}: ${await response.text()}`);
  }
  return response;
}

// GraphQL, because the REST tags endpoint doesn't include dates
const TAGS_QUERY = `
  query ($owner: String!, $name: String!, $cursor: String) {
    repository(owner: $owner, name: $name) {
      refs(refPrefix: "refs/tags/", first: 100, after: $cursor) {
        pageInfo { hasNextPage endCursor }
        nodes {
          name
          target {
            ... on Commit { committedDate }
            ... on Tag { tagger { date } target { ... on Commit { committedDate } } }
          }
        }
      }
    }
  }
`;

type Tag = { name: string; date: string };

// returns the tags along with their release date (YYYY-MM-DD): the tagger date for
// annotated tags, falling back to the commit date for lightweight ones
async function findTags(project: ProjectDef): Promise<Tag[]> {
  const [owner, name] = project.repo.split("/");
  const tags: Tag[] = [];
  for (let cursor: string | null = null; ; ) {
    const response: Response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.GH_TOKEN}` },
      body: JSON.stringify({ query: TAGS_QUERY, variables: { owner, name, cursor } }),
    });
    const body: any = await response.json();
    if (!response.ok || body.errors) {
      throw new Error(`GitHub GraphQL ${response.status} for ${project.repo}: ${JSON.stringify(body.errors ?? body)}`);
    }

    const { nodes, pageInfo } = body.data.repository.refs;
    for (const { name, target } of nodes) {
      const date: string | undefined = target?.tagger?.date ?? target?.committedDate ?? target?.target?.committedDate;
      if (date) tags.push({ name, date: date.slice(0, 10) });
    }
    if (!pageInfo.hasNextPage) break;
    cursor = pageInfo.endCursor;
  }

  // the ignored words are checked on the version, since some projects keep theirs in tags like "...-chart-1.2.3"
  return tags
    .filter((t) => (project.filterTag ?? (() => true))(t.name))
    .filter((t) => !tagsToIgnore.some((p) => (project.mapTag ? project.mapTag(t.name) : t.name).includes(p)));
}

// a GitHub API response, cached; null when it's a 404
async function ghCached(project: ProjectDef, apiPath: string): Promise<any> {
  return JSON.parse(await cached(project, apiPath, "json", async () => {
    const response = await gh(apiPath);
    if (response.status === 404) return "null";
    if (!response.ok) throw new Error(`GitHub API ${response.status} for ${apiPath}: ${await response.text()}`);
    return response.text();
  }));
}

async function findManifestUrls(project: ProjectDef, tag: string): Promise<string[]> {
  if (project.releaseFileName) {
    const release = await ghCached(project, `/repos/${project.repo}/releases/tags/${encodeURIComponent(tag)}`);
    const asset = release?.assets?.find((a: any) => a.name === project.releaseFileName);
    return asset ? [asset.browser_download_url] : [];
  }

  const urls: string[] = [];
  const pathsToLook = (project.pathToManifests ?? []).map((p) => p.replace(/\/+$/, ""));

  while (pathsToLook.length > 0) {
    const path = pathsToLook.pop()!;
    // a path missing at this tag is cached as null, so it isn't looked up again
    const body = await ghCached(project, `/repos/${project.repo}/contents/${path}?ref=${encodeURIComponent(tag)}`);
    if (body === null) continue;

    const entries = Array.isArray(body) ? body : [body];
    for (const entry of entries) {
      if (entry.type === "dir") {
        pathsToLook.push(entry.path);
      } else if (entry.type === "file" && !filesToIgnore.some((p) => p.test(entry.name))) {
        urls.push(`https://raw.githubusercontent.com/${project.repo}/${tag}/${entry.path}`);
      }
    }
  }

  return urls.sort();
}

// Kubernetes' swagger.json: every listable GVK, namespaced if any of its list paths has {namespace}
function kindsFromSwagger(swagger: any): KindRef[] {
  const kinds = new Map<string, KindRef>();
  for (const [path, ops] of Object.entries<any>(swagger.paths ?? {})) {
    for (const op of Object.values<any>(ops)) {
      const gvk = op?.["x-kubernetes-group-version-kind"];
      if (op?.["x-kubernetes-action"] !== "list" || !gvk) continue;

      const apiVersion = gvk.group ? `${gvk.group}/${gvk.version}` : gvk.version;
      const key = `${apiVersion}/${gvk.kind}`;
      const namespaced = path.includes("/namespaces/{namespace}/");
      const existing = kinds.get(key);
      if (!existing || namespaced) {
        kinds.set(key, { apiVersion, kind: gvk.kind, scope: namespaced ? "Namespaced" : "Cluster" });
      }
    }
  }
  return [...kinds.values()];
}

// CRD manifests (apiextensions.k8s.io v1 and v1beta1): one entry per served version
function kindsFromCRDs(content: string, url: string): KindRef[] {
  const kinds: KindRef[] = [];
  for (const doc of parseManifests(content)) {
    if (doc.errors.length > 0) {
      console.warn(`  ! Skipping unparseable document in ${url}: ${doc.errors[0].message}`);
      continue;
    }

    const crd = doc.toJS();
    if (crd?.kind !== "CustomResourceDefinition") continue;

    const { group, names, scope } = crd.spec;
    const versions: string[] = crd.spec.versions?.map((v: any) => v.name) ?? [crd.spec.version];
    for (const version of versions) {
      kinds.push({ apiVersion: `${group}/${version}`, kind: names.kind, scope });
    }
  }
  return kinds;
}

function download(project: ProjectDef, url: string): Promise<string> {
  return cached(project, url, url.endsWith(".json") ? "json" : "yaml", async () => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to download ${url}: ${response.status}`);
    return response.text();
  });
}

// downloads each file and returns the kinds it defines, along with the files that defined at least one
async function findKinds(project: ProjectDef, urls: string[]): Promise<{ urls: string[]; kinds: KindRef[] }> {
  const kinds = new Map<string, KindRef>();
  const specUrls: string[] = [];
  for (const url of urls) {
    const content = await download(project, url);
    const found = url.endsWith(".json") ? kindsFromSwagger(JSON.parse(content)) : kindsFromCRDs(content, url);
    if (found.length > 0) specUrls.push(url);
    for (const k of found) kinds.set(`${k.apiVersion}/${k.kind}`, k);
  }

  return {
    urls: specUrls,
    kinds: sortKinds([...kinds.values()]),
  };
}

async function readIndex(slug: string): Promise<ProjectIndex | undefined> {
  try {
    return JSON.parse(await readFile(new URL(`${slug}/versions.json`, INDEX_DIR), "utf-8"));
  } catch {
    return undefined;
  }
}

async function writeIndex(index: ProjectIndex) {
  const dir = new URL(`${index.slug}/`, INDEX_DIR);
  await mkdir(dir, { recursive: true });
  await writeFile(new URL("versions.json", dir), JSON.stringify(index, null, 2) + "\n");
}

// "apiVersion/Kind" -> its changes per tag
type Changelog = Map<string, Record<string, DiffedChanges>>;

const changelogDir = (slug: string) => new URL(`${slug}/changelog/`, INDEX_DIR);

async function readChangelog(slug: string): Promise<Changelog> {
  const changelog: Changelog = new Map();
  const dir = changelogDir(slug);
  const files = await readdir(dir, { recursive: true }).catch(() => []);
  for (const file of files) {
    if (!file.endsWith(".json")) continue;
    changelog.set(file.slice(0, -".json".length), unpackChangelog(JSON.parse(await readFile(new URL(file, dir), "utf-8"))));
  }
  return changelog;
}

// tags are written newest first, following the order of the versions
async function writeChangelog(slug: string, changelog: Changelog, order: string[]) {
  for (const [id, byTag] of changelog) {
    const file = new URL(`${id}.json`, changelogDir(slug));
    await mkdir(new URL(".", file), { recursive: true });
    await writeFile(file, JSON.stringify(packChangelog(byTag, order), null, 2) + "\n");
  }
}

// Compares each version (newest first) to the previous (older) one, skipping those whose changelogBase
// already is that version. Sets changelogBase and calls save() after each comparison.
async function updateChangelog(project: ProjectDef, versions: ResolvedVersion[], full: boolean, save: () => Promise<void>) {
  if (full) await rm(changelogDir(project.slug), { recursive: true, force: true });
  const changelog = await readChangelog(project.slug);
  const order = versions.map((v) => v.tag);

  // the two most recently loaded versions, since each comparison shares one with the next
  const specs = new Map<string, SpecFile>();
  const loadSpec = async (v: ResolvedVersion) => {
    let spec = specs.get(v.tag);
    if (!spec) {
      const files: SpecFile[] = [];
      for (const url of v.urls) files.push(parseSpecFile(url, await download(project, url)));
      spec = mergeSpecFiles(files);
      specs.set(v.tag, spec);
      if (specs.size > 2) specs.delete(specs.keys().next().value!);
    }
    return spec;
  };

  // oldest first
  for (let i = versions.length - 2; i >= 0; i--) {
    const { tag } = versions[i];
    const base = versions[i + 1].tag;
    if (versions[i].changelogBase === base) continue;

    const ids = versions[i].kinds.map((k) => `${k.apiVersion}/${k.kind}`);
    const changes = diffSpecs(await loadSpec(versions[i + 1]), await loadSpec(versions[i]), ids);
    for (const byTag of changelog.values()) delete byTag[tag];
    for (const [id, c] of Object.entries(changes)) {
      const byTag = changelog.get(id) ?? changelog.set(id, {}).get(id)!;
      byTag[tag] = c;
    }
    // the changes are written before the index, so an interrupted run never records a comparison it didn't save
    await writeChangelog(project.slug, changelog, order);
    versions[i].changelogBase = base;
    await save();
    console.log(`- Compared ${project.slug}@${tag} to ${base} (${Object.keys(changes).length} kinds changed)`);
  }

  // drop changes of versions that are gone, or of the oldest one, which has nothing to be compared to
  const oldest = versions.at(-1);
  const keep = new Set(order.slice(0, -1));
  let stale = false;
  for (const byTag of changelog.values()) {
    for (const tag of Object.keys(byTag)) {
      if (!keep.has(tag)) {
        delete byTag[tag];
        stale = true;
      }
    }
  }
  if (stale) await writeChangelog(project.slug, changelog, order);
  if (oldest?.changelogBase) {
    delete oldest.changelogBase;
    await save();
  }
}

function compareVersionsDesc(a: string, b: string): number {
  const pa = a.replace(/^v/, "").split(/[.-]/).map((x) => parseInt(x, 10) || 0);
  const pb = b.replace(/^v/, "").split(/[.-]/).map((x) => parseInt(x, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const diff = (pb[i] ?? 0) - (pa[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

async function processProject(project: ProjectDef, full: boolean) {
  console.log(`Processing ${project.slug}...`);

  // expand existing deltas to full lists, so deltas can be recomputed after new tags are slotted in
  const existing = full ? undefined : await readIndex(project.slug);
  const existingKinds = resolveKinds(existing?.versions ?? []);
  const versions = new Map<string, ResolvedVersion>(
    existing?.versions.map(({ version, tag, date, urls, changelogBase }) => [
      tag,
      { version, tag, date, urls, ...(changelogBase && { changelogBase }), kinds: existingKinds.get(tag)! },
    ]) ?? [],
  );

  const tags = await findTags(project);

  // backfill dates on versions indexed before dates were recorded
  for (const { name, date } of tags) {
    const v = versions.get(name);
    if (v) v.date = date;
  }

  const skipped = new Set(existing?.skipped ?? []);

  const buildIndex = (): ProjectIndex => ({
    name: project.name,
    slug: project.slug,
    repo: project.repo,
    logo: project.logo,
    versions: toDeltas([...versions.values()].sort((a, b) => compareVersionsDesc(a.version, b.version))),
    ...(skipped.size > 0 && { skipped: [...skipped].sort(compareVersionsDesc) }),
  });

  // writes are chained so concurrent tags never interleave them
  let saving = Promise.resolve();
  const save = () => (saving = saving.then(() => writeIndex(buildIndex())));

  const newTags = tags.filter((t) => !versions.has(t.name) && !skipped.has(t.name));
  console.log(`- ${newTags.length} new tags to process`);
  await forEachLimit(newTags, CONCURRENCY, async ({ name: tag, date }) => {
    const { urls, kinds } = await findKinds(project, await findManifestUrls(project, tag));
    if (kinds.length === 0) {
      skipped.add(tag);
      console.log(`- Skipped ${project.slug}@${tag} (no kinds found)`);
    } else {
      const version = project.mapTag ? project.mapTag(tag) : tag;
      versions.set(tag, { version, tag, date, urls, kinds });
      console.log(`- Indexed ${project.slug}@${tag} (${urls.length} files, ${kinds.length} kinds)`);
    }
    await save();
  });

  // also covers runs with no new tags, which may still have backfilled dates
  await save();
  console.log(`Wrote index/${project.slug}/versions.json (${versions.size} versions, ${skipped.size} skipped)`);

  await updateChangelog(project, [...versions.values()].sort((a, b) => compareVersionsDesc(a.version, b.version)), full, save);
  console.log(`Wrote index/${project.slug}/changelog/`);
}

if (!process.env.GH_TOKEN) {
  throw new Error("GH_TOKEN environment variable is required (try: GH_TOKEN=$(gh auth token))");
}

const args = process.argv.slice(2);
const full = args.includes("--full");
const slugs = args.filter((a) => !a.startsWith("--"));

const selected = slugs.length > 0 ? slugs.map((slug) => {
  const project = projects.find((p) => p.slug === slug);
  if (!project) throw new Error(`Project with slug '${slug}' not found`);
  return project;
}) : projects;

for (const project of selected) {
  await processProject(project, full);
}
