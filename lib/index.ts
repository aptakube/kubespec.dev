import { existsSync, readFileSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { cacheLife } from "next/cache";
import { countChanges } from "./changelog";
import { projects } from "./projects";
import type { KindChangelog, KindChangelogFile, ProjectChangelog, ProjectIndex, ProjectVersion, VersionChanges } from "./types";

// The index of every project in lib/projects.ts, in that order, written by scripts/build-index.ts.
// Projects not indexed yet are left out. The files are traced into the build in next.config.ts.
const indexes: ProjectIndex[] = projects
  .map((p) => path.join(process.cwd(), "index", p.slug, "versions.json"))
  .filter((file) => existsSync(file))
  .map((file) => JSON.parse(readFileSync(file, "utf-8")));

export function listProjectIndexes(): ProjectIndex[] {
  return indexes;
}

export function getProjectIndex(slug: string): ProjectIndex | undefined {
  return indexes.find((p) => p.slug === slug);
}

export function getProjectVersion(slug: string, version: string): { project: ProjectIndex; version: ProjectVersion } | undefined {
  const project = getProjectIndex(slug);
  const found = project?.versions.find((v) => v.version === version);
  return project && found ? { project, version: found } : undefined;
}

// Whether a project's index has the kind at the apiVersion in any version.
// Checked before the names become a file path.
export function isIndexedKind(slug: string, apiVersion: string, kind: string): boolean {
  return !!getProjectIndex(slug)?.versions.some((v) => v.added?.some((k) => k.apiVersion === apiVersion && k.kind === kind) || v.moved?.some((m) => m.to === apiVersion && m.kind === kind));
}

// A kind's changelog file, written by scripts/build-index.ts, or undefined when the kind has none.
// The files are traced into the build in next.config.ts.
async function readKindChangelogFile(slug: string, apiVersion: string, kind: string): Promise<KindChangelogFile | undefined> {
  "use cache";
  cacheLife("max");

  // the arguments become a file path, so only kinds from the index are read
  if (!isIndexedKind(slug, apiVersion, kind)) return undefined;
  try {
    return JSON.parse(await readFile(path.join(process.cwd(), "index", slug, "changelog", apiVersion, `${kind}.json`), "utf-8"));
  } catch {
    return undefined;
  }
}

// A kind's changes per version tag, without the descriptions (see getChangeDescription)
export async function getKindChangelog(slug: string, apiVersion: string, kind: string): Promise<KindChangelog> {
  const file = await readKindChangelogFile(slug, apiVersion, kind);
  return Object.fromEntries(Object.entries(file?.versions ?? {}).map(([tag, { descriptions, ...changes }]) => [tag, changes]));
}

// The kinds whose fields changed in each version of a project, with how much changed.
// Reads every changelog file of the project once, but only keeps the counts.
export async function getProjectChangelog(slug: string): Promise<ProjectChangelog> {
  "use cache";
  cacheLife("max");

  // the slug becomes a file path, so only known projects are read
  if (!getProjectIndex(slug)) return {};
  const dir = path.join(process.cwd(), "index", slug, "changelog");
  const files = (await readdir(dir, { recursive: true }).catch(() => [])).filter((f) => f.endsWith(".json")).sort();

  const result: ProjectChangelog = {};
  for (const file of files) {
    const id = file.slice(0, -".json".length).split(path.sep).join("/");
    const apiVersion = id.slice(0, id.lastIndexOf("/"));
    const kind = id.slice(id.lastIndexOf("/") + 1);
    const { versions }: KindChangelogFile = JSON.parse(await readFile(path.join(dir, file), "utf-8"));
    for (const [tag, changes] of Object.entries(versions)) {
      (result[tag] ??= []).push({ apiVersion, kind, ...countChanges(changes) });
    }
  }
  return result;
}

// The kinds that changed in a version compared to the one before it, undefined for the oldest version
export async function getVersionChanges(slug: string, tag: string): Promise<VersionChanges | undefined> {
  const versions = getProjectIndex(slug)?.versions ?? [];
  const i = versions.findIndex((v) => v.tag === tag);
  if (i === -1 || i === versions.length - 1) return undefined;
  const { added = [], removed = [], moved = [] } = versions[i];
  return { olderVersion: versions[i + 1].version, added, removed, moved, changed: (await getProjectChangelog(slug))[tag] ?? [] };
}

// The description of a changed field ("" for the kind itself) before and after the change
export async function getChangeDescription(slug: string, apiVersion: string, kind: string, tag: string, field: string) {
  const file = await readKindChangelogFile(slug, apiVersion, kind);
  const [before, after] = file?.versions[tag]?.descriptions?.[field] ?? [null, null];
  return { before: before === null ? undefined : file!.texts[before], after: after === null ? undefined : file!.texts[after] };
}
