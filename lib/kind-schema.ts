import { cacheLife } from "next/cache";
import { parseSpecFile, type SchemaTypes, type SpecFile } from "./spec";

export type { Field, SchemaTypes } from "./spec";

export type KindSchema = {
  description?: string;
  // the spec file it came from
  url: string;
  // the kind's top-level type
  root: string;
  // only the types reachable from root
  types: SchemaTypes;
};

// Downloads a spec file from GitHub and extracts its kinds and types. Only the extracted data is
// cached, not the raw file (Kubernetes' swagger.json is several MB). URLs are pinned to a tag,
// so the content never changes.
async function getSpecFile(url: string): Promise<SpecFile> {
  "use cache";
  cacheLife("max");

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to download ${url}: ${response.status}`);
  return parseSpecFile(url, await response.text());
}

// Finds a kind in a version's spec files, with the types reachable from it
export async function getKindSchema(urls: string[], apiVersion: string, kind: string): Promise<KindSchema | undefined> {
  // pass only the url: every argument becomes part of the cache key
  const files = await Promise.all(urls.map((url) => getSpecFile(url)));
  const i = files.findIndex((file) => file.kinds[`${apiVersion}/${kind}`]);
  if (i === -1) return undefined;

  const { kinds, types: all } = files[i];
  const { description, root } = kinds[`${apiVersion}/${kind}`];

  const types: SchemaTypes = {};
  const pending = [root];
  while (pending.length > 0) {
    const key = pending.pop()!;
    if (types[key] || !all[key]) continue;
    types[key] = all[key];
    for (const field of all[key]) if (field.ref) pending.push(field.ref);
  }

  return { description, url: urls[i], root, types };
}
