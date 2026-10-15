import type { DiffPart } from "./word-diff";

export type ProjectIndex = {
  name: string;
  slug: string;
  repo: string;
  logo: string;
  // newest first
  versions: ProjectVersion[];
  // tags where no kinds were found, so later runs don't look at them again
  skipped?: string[];
};

export type ProjectVersion = {
  version: string;
  tag: string;
  // release date of the tag, YYYY-MM-DD
  date: string;
  urls: string[];
  // the tag this version's changelog was compared to (see scripts/build-index.ts), unset on the oldest version
  changelogBase?: string;
  // changes compared to the previous (older) version, omitted when empty
  added?: KindRef[];
  removed?: KindRef[];
  // kinds that left one apiVersion for another of the same group, e.g. v1beta1 -> v1
  moved?: KindMove[];
};

export type KindMove = {
  kind: string;
  scope: KindRef["scope"];
  from: string;
  to: string;
};

export type KindRef = {
  apiVersion: string;
  kind: string;
  scope: "Namespaced" | "Cluster";
};

// What changed in a kind since the previous (older) version. Paths are dotted, e.g. "spec.template.spec.containers.image".
// Fields under an added or removed field aren't listed, since they come and go with it.
export type KindChanges = {
  // the kind's own description changed
  description?: true;
  // path -> type
  added?: Record<string, string>;
  removed?: Record<string, string>;
  // path -> [old type, new type]
  typeChanged?: Record<string, [string, string]>;
  required?: string[];
  optional?: string[];
  descriptionChanged?: string[];
  // path ("" for the kind itself) -> [description before, description after] as indexes into the file's texts.
  // "before" is only set when the field was removed or its description changed.
  descriptions?: Record<string, [number | null, number | null]>;
};

// A kind's changes per version tag. Only versions where the kind changed are listed.
export type KindChangelog = Record<string, KindChanges>;

// How many fields of a kind were added, removed, or changed in any other way in one version
export type ChangeCounts = { added: number; removed: number; changed: number };

// The kinds whose fields changed in each version tag, sorted by apiVersion and kind
export type ProjectChangelog = Record<string, ({ apiVersion: string; kind: string } & ChangeCounts)[]>;

// The kinds that changed in one version compared to the one before it (olderVersion)
export type VersionChanges = {
  olderVersion: string;
  added: KindRef[];
  removed: KindRef[];
  moved: KindMove[];
  changed: ProjectChangelog[string];
};

// index/<project>/changelog/<apiVersion>/<Kind>.json. Descriptions are stored once in texts,
// since the same one often appears under many paths (e.g. containers, initContainers, ephemeralContainers).
export type KindChangelogFile = {
  versions: KindChangelog;
  texts: string[];
};

// A changed field's description, as a word diff when it changed (see app/api/change-description)
export type ChangeDescription = { text?: string; diff?: DiffPart[] };
