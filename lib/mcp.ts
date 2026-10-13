import { getKindChangelog, getProjectIndex, getVersionChanges, listProjectIndexes } from "./index";
import { findKind } from "./kind-route";
import { getKindSchema, type SchemaTypes } from "./kind-schema";
import { groupOf, resolveKinds, versionRank } from "./kinds";
import type { KindChanges, KindRef, ProjectIndex, ProjectVersion } from "./types";
import { SITE_URL, kindHref, projectHref } from "./urls";

// The tools of the MCP server at /mcp (see app/mcp/route.ts). Each returns plain text meant to be read by a model:
// compact, one item per line, with links back to the website.

// thrown for bad arguments, returned to the client as a tool error rather than a protocol error
export class ToolError extends Error {}

type Args = Record<string, unknown>;

export type Tool = {
  name: string;
  description: string;
  inputSchema: { type: "object"; properties: Record<string, unknown>; required?: string[] };
  run: (args: Args) => Promise<string>;
};

const projectArg = { type: "string", description: 'Project slug, e.g. "kubernetes", "cert-manager" or "argo-cd" (see list_projects)' };
const versionArg = { type: "string", description: 'Project version, e.g. "v1.30" for Kubernetes or "v1.15.0". Defaults to the latest version.' };
const kindArg = { type: "string", description: 'Kind name, e.g. "Deployment" (case-insensitive)' };
const apiVersionArg = {
  type: "string",
  description: 'apiVersion, e.g. "apps/v1" or "v1". Defaults to the most stable apiVersion the kind is served at in that version.',
};

const str = (args: Args, key: string): string | undefined => {
  const value = args[key];
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string") throw new ToolError(`"${key}" must be a string`);
  return value.trim();
};
const int = (args: Args, key: string, fallback: number, max: number): number => {
  const value = args[key] ?? fallback;
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1) throw new ToolError(`"${key}" must be a positive integer`);
  return Math.min(value, max);
};

function project(args: Args): ProjectIndex {
  const slug = str(args, "project");
  if (!slug) throw new ToolError('"project" is required');
  const found = getProjectIndex(slug.toLowerCase()) ?? listProjectIndexes().find((p) => p.name.toLowerCase() === slug.toLowerCase());
  if (!found) throw new ToolError(`Unknown project "${slug}". Known projects: ${listProjectIndexes().map((p) => p.slug).join(", ")}`);
  return found;
}

// accepts the version with or without the leading "v"
function findVersion(p: ProjectIndex, name: string): ProjectVersion {
  const bare = name.replace(/^v/, "");
  const found = p.versions.find((v) => v.version === name || v.version.replace(/^v/, "") === bare);
  if (!found) {
    const recent = p.versions.slice(0, 10).map((v) => v.version).join(", ");
    throw new ToolError(`${p.name} has no version "${name}". Recent versions: ${recent} (see list_versions for all)`);
  }
  return found;
}

const version = (p: ProjectIndex, args: Args, key = "version"): ProjectVersion => {
  const name = str(args, key);
  return name ? findVersion(p, name) : p.versions[0];
};

const kindsOf = (p: ProjectIndex, v: ProjectVersion): KindRef[] => resolveKinds(p.versions).get(v.tag)!;

// the kind at the given apiVersion, or at its most stable one
function kind(p: ProjectIndex, v: ProjectVersion, args: Args): KindRef {
  const name = str(args, "kind");
  if (!name) throw new ToolError('"kind" is required');
  const apiVersion = str(args, "apiVersion");
  const candidates = kindsOf(p, v)
    .filter((k) => k.kind.toLowerCase() === name.toLowerCase())
    .sort((a, b) => versionRank(b.apiVersion) - versionRank(a.apiVersion));

  if (candidates.length === 0) throw new ToolError(`${p.name} ${v.version} has no kind "${name}". Use list_kinds or search_kinds to find it.`);
  if (!apiVersion) return candidates[0];
  const found = candidates.find((k) => k.apiVersion === apiVersion);
  if (!found) {
    throw new ToolError(`${name} isn't served at ${apiVersion} in ${p.name} ${v.version}. It is at: ${candidates.map((k) => k.apiVersion).join(", ")}`);
  }
  return found;
}

const pageUrl = (p: ProjectIndex, v: ProjectVersion, k: KindRef) => `${SITE_URL}${kindHref(p.slug, v.version, k.apiVersion, k.kind, p.versions[0].version)}`;
const oneLine = (text: string) => text.replace(/\s+/g, " ").trim();
const truncate = (text: string, max: number) => (text.length > max ? `${text.slice(0, max - 1)}…` : text);
const dotted = (path: string) => (path ? `.${path}` : "(the kind itself)");

// models are given trees that fit comfortably in their context; anything larger asks them to narrow it down
const MAX_OUTPUT = 60_000;

const listProjects: Tool = {
  name: "list_projects",
  description: "Lists every project on kubespec.dev (Kubernetes and popular CRD projects), with its latest version and how many versions are indexed.",
  inputSchema: { type: "object", properties: {} },
  run: async () =>
    listProjectIndexes()
      .map((p) => `${p.slug}: ${p.name} (github.com/${p.repo}), latest ${p.versions[0].version} released ${p.versions[0].date}, ${p.versions.length} versions`)
      .join("\n"),
};

const listVersions: Tool = {
  name: "list_versions",
  description: "Lists the versions of a project, newest first, with their release dates.",
  inputSchema: {
    type: "object",
    properties: { project: projectArg, limit: { type: "integer", description: "How many versions to list, newest first (default 50)" } },
    required: ["project"],
  },
  run: async (args) => {
    const p = project(args);
    const limit = int(args, "limit", 50, 1000);
    const lines = p.versions.slice(0, limit).map((v) => `${v.version} (${v.date})`);
    if (p.versions.length > limit) lines.push(`… and ${p.versions.length - limit} older versions, down to ${p.versions.at(-1)!.version}`);
    return `${p.name} versions, newest first:\n${lines.join("\n")}`;
  },
};

const listKinds: Tool = {
  name: "list_kinds",
  description: "Lists every kind (resource type) of a project at one version, grouped by API group, with the apiVersions each kind is served at and its scope.",
  inputSchema: { type: "object", properties: { project: projectArg, version: versionArg }, required: ["project"] },
  run: async (args) => {
    const p = project(args);
    const v = version(p, args);
    const groups = new Map<string, Map<string, KindRef[]>>();
    for (const k of kindsOf(p, v)) {
      const byKind = groups.get(groupOf(k.apiVersion)) ?? groups.set(groupOf(k.apiVersion), new Map()).get(groupOf(k.apiVersion))!;
      (byKind.get(k.kind) ?? byKind.set(k.kind, []).get(k.kind)!).push(k);
    }

    const lines = [`${p.name} ${v.version}: ${kindsOf(p, v).length} kind/apiVersion pairs. ${SITE_URL}${projectHref(p.slug, v.version, p.versions[0].version)}`];
    for (const [group, byKind] of [...groups].sort(([a], [b]) => (a === "" ? -1 : b === "" ? 1 : a.localeCompare(b)))) {
      lines.push("", `${group || "core"}:`);
      for (const [name, refs] of [...byKind].sort(([a], [b]) => a.localeCompare(b))) {
        const apiVersions = refs.map((k) => k.apiVersion).sort((a, b) => versionRank(b) - versionRank(a));
        lines.push(`  ${name} (${refs[0].scope}): ${apiVersions.join(", ")}`);
      }
    }
    return lines.join("\n");
  },
};

const searchKinds: Tool = {
  name: "search_kinds",
  description:
    'Finds kinds by name across every project\'s latest version, e.g. "Certificate", "Gateway" or "policy". Useful to find which project defines a CRD.',
  inputSchema: {
    type: "object",
    properties: { query: { type: "string", description: "Part of a kind name, or an API group (case-insensitive)" } },
    required: ["query"],
  },
  run: async (args) => {
    const query = str(args, "query")?.toLowerCase();
    if (!query) throw new ToolError('"query" is required');
    const lines: string[] = [];
    for (const p of listProjectIndexes()) {
      const latest = p.versions[0];
      for (const k of kindsOf(p, latest)) {
        if (k.kind.toLowerCase().includes(query) || groupOf(k.apiVersion).toLowerCase().includes(query)) {
          lines.push(`${p.slug} ${latest.version}: ${k.kind} (${k.apiVersion}, ${k.scope}) ${pageUrl(p, latest, k)}`);
        }
      }
    }
    if (lines.length === 0) return `No kinds match "${query}".`;
    return truncateOutput(lines.join("\n"), "Use a more specific query.");
  },
};

const getKindSchemaTool: Tool = {
  name: "get_kind_schema",
  description:
    "Returns the fields of a kind as a tree: name, type, whether it's required (*), and its description. " +
    'Large kinds are cut off at `depth` levels; pass `path` (e.g. "spec.template.spec.containers") to see a field\'s full description and expand below it.',
  inputSchema: {
    type: "object",
    properties: {
      project: projectArg,
      kind: kindArg,
      apiVersion: apiVersionArg,
      version: versionArg,
      path: { type: "string", description: 'Dotted path of a field to start from, e.g. "spec.replicas" or "spec.template.spec". Defaults to the top level.' },
      depth: { type: "integer", description: "How many levels of fields to show below the starting point (default 2, max 8)" },
      descriptions: { type: "boolean", description: "Include field descriptions, shortened to one line (default true)" },
    },
    required: ["project", "kind"],
  },
  run: async (args) => {
    const p = project(args);
    const v = version(p, args);
    const k = kind(p, v, args);
    const depth = int(args, "depth", 2, 8);
    const withDescriptions = args.descriptions !== false;
    const schema = await getKindSchema(v.urls, k.apiVersion, k.kind);
    if (!schema) throw new ToolError(`No schema found for ${k.kind} (${k.apiVersion}) in ${p.name} ${v.version}`);

    const header = [`${k.kind} (${k.apiVersion}, ${k.scope}) in ${p.name} ${v.version}. ${pageUrl(p, v, k)}`];
    const segments = (str(args, "path") ?? "").replace(/^\./, "").split(".").filter(Boolean);

    let type = schema.root;
    let ancestors = new Set([type]);
    if (segments.length === 0) {
      if (schema.description) header.push("", schema.description);
    } else {
      for (const [i, segment] of segments.entries()) {
        const field = schema.types[type]?.find((f) => f.name === segment);
        const at = segments.slice(0, i).join(".");
        if (!field) {
          const available = schema.types[type]?.map((f) => f.name).join(", ");
          throw new ToolError(`No field "${segment}" at ${dotted(at)}.${available ? ` Fields there: ${available}` : " It has no fields."}`);
        }
        if (i === segments.length - 1) {
          header.push("", `.${segments.join(".")}: ${field.type}${field.required ? " (required)" : ""}`);
          if (field.description) header.push(field.description);
        }
        if (!field.ref || !schema.types[field.ref]) {
          if (i < segments.length - 1) throw new ToolError(`.${segments.slice(0, i + 1).join(".")} is a ${field.type} and has no fields.`);
          return header.join("\n");
        }
        type = field.ref;
        ancestors = new Set(ancestors).add(type);
      }
    }

    const lines: string[] = [];
    renderFields(schema.types, type, ancestors, depth, "", lines, withDescriptions);
    return truncateOutput(
      [...header, "", "Fields (* = required):", ...lines].join("\n"),
      "Pass a smaller depth, a path to start from, or descriptions: false.",
    );
  },
};

function renderFields(types: SchemaTypes, type: string, ancestors: Set<string>, depth: number, indent: string, lines: string[], withDescriptions: boolean) {
  for (const field of types[type] ?? []) {
    const children = field.ref ? types[field.ref] : undefined;
    let line = `${indent}${field.name}${field.required ? "*" : ""}: ${field.type}`;
    if (withDescriptions && field.description) line += ` — ${truncate(oneLine(field.description), 200)}`;
    const expand = children && depth > 1 && !ancestors.has(field.ref!);
    if (children && !expand) line += ` [${children.length} fields, not shown]`;
    lines.push(line);
    if (expand) renderFields(types, field.ref!, new Set(ancestors).add(field.ref!), depth - 1, `${indent}  `, lines, withDescriptions);
  }
}

function truncateOutput(text: string, hint: string): string {
  if (text.length <= MAX_OUTPUT) return text;
  const cut = text.lastIndexOf("\n", MAX_OUTPUT);
  return `${text.slice(0, cut)}\n… output cut off at ${MAX_OUTPUT} characters. ${hint}`;
}

const getKindChangelogTool: Tool = {
  name: "get_kind_changelog",
  description:
    "Lists how a kind's fields changed across versions, newest first: fields added, removed, changed type, made required or optional, and changed descriptions. " +
    'Use `since` and `until` to see everything that changed between two versions, e.g. before upgrading from "v1.28" to "v1.31".',
  inputSchema: {
    type: "object",
    properties: {
      project: projectArg,
      kind: kindArg,
      apiVersion: apiVersionArg,
      until: { type: "string", description: "The newest version to include. Defaults to the latest version." },
      since: { type: "string", description: "Only include changes made after this version (exclusive). Defaults to every version." },
      limit: { type: "integer", description: "How many versions with changes to list, newest first (default 20)" },
    },
    required: ["project", "kind"],
  },
  run: async (args) => {
    const p = project(args);
    const until = version(p, args, "until");
    const since = str(args, "since") ? findVersion(p, str(args, "since")!) : undefined;
    const limit = int(args, "limit", 20, 500);
    const k = kind(p, until, args);
    const route = findKind(p, until, k.apiVersion, k.kind)!;
    const changelog = await getKindChangelog(p.slug, k.apiVersion, k.kind);

    const from = p.versions.indexOf(until);
    const to = since ? p.versions.indexOf(since) : p.versions.length;
    if (to <= from) throw new ToolError(`"since" (${since!.version}) must be older than "until" (${until.version})`);

    const changed = p.versions.slice(from, to).filter((v) => changelog[v.tag]);
    const lines = [
      `Changes to ${k.kind} (${k.apiVersion}) in ${p.name}${since ? ` after ${since.version}` : ""} up to ${until.version}, compared to the version before each. ${pageUrl(p, until, k)}#changelog`,
      `${k.kind} at ${k.apiVersion} first appeared in ${route.introducedIn.version}${route.introducedIn === p.versions.at(-1) ? " (the oldest version indexed)" : ""}.`,
    ];
    if (changed.length === 0) lines.push("", "No changes in this range.");
    for (const v of changed.slice(0, limit)) lines.push("", `${v.version} (${v.date}):`, ...describeChanges(changelog[v.tag]));
    if (changed.length > limit) lines.push("", `… ${changed.length - limit} older versions with changes not shown. Raise limit or pass since.`);
    return truncateOutput(lines.join("\n"), "Narrow it down with since and until.");
  },
};

function describeChanges(c: KindChanges): string[] {
  const lines: string[] = [];
  const list = (label: string, paths: string[]) => paths.length > 0 && lines.push(`  ${label}: ${paths.join(", ")}`);
  list("added", Object.entries(c.added ?? {}).map(([path, type]) => `${dotted(path)} (${type})`));
  list("removed", Object.entries(c.removed ?? {}).map(([path, type]) => `${dotted(path)} (${type})`));
  list("type changed", Object.entries(c.typeChanged ?? {}).map(([path, [from, to]]) => `${dotted(path)} (${from} → ${to})`));
  list("now required", (c.required ?? []).map(dotted));
  list("no longer required", (c.optional ?? []).map(dotted));
  list("description changed", [...(c.description ? ["(the kind itself)"] : []), ...(c.descriptionChanged ?? []).map(dotted)]);
  return lines;
}

const getVersionChangesTool: Tool = {
  name: "get_version_changes",
  description:
    "Summarizes a release of a project: the kinds added, removed, moved to another apiVersion, and the kinds whose fields changed (with counts), compared to the version before it. " +
    "Use get_kind_changelog for the field-level details of a kind.",
  inputSchema: { type: "object", properties: { project: projectArg, version: versionArg }, required: ["project"] },
  run: async (args) => {
    const p = project(args);
    const v = version(p, args);
    const changes = await getVersionChanges(p.slug, v.tag);
    if (!changes) return `${v.version} is the oldest version of ${p.name} indexed, so there's nothing to compare it to.`;

    const lines = [`${p.name} ${v.version} (${v.date}) compared to ${changes.olderVersion}. ${SITE_URL}${projectHref(p.slug, v.version, p.versions[0].version)}#changelog`];
    const section = (title: string, items: string[]) => items.length > 0 && lines.push("", `${title}:`, ...items.map((i) => `  ${i}`));
    section("Kinds added", changes.added.map((k) => `${k.kind} (${k.apiVersion})`));
    section("Kinds removed", changes.removed.map((k) => `${k.kind} (${k.apiVersion})`));
    section("Kinds moved to another apiVersion", changes.moved.map((m) => `${m.kind}: ${m.from} → ${m.to}`));
    section(
      "Kinds whose fields changed (+added −removed ~changed)",
      changes.changed.map((c) => `${c.kind} (${c.apiVersion}): +${c.added} −${c.removed} ~${c.changed}`),
    );
    if (lines.length === 1) lines.push("", "No kinds changed in this version.");
    return lines.join("\n");
  },
};

export const tools: Tool[] = [listProjects, listVersions, listKinds, searchKinds, getKindSchemaTool, getKindChangelogTool, getVersionChangesTool];
