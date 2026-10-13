import type { SpecFile } from "./spec.ts";
import type { ChangeCounts, KindChangelog, KindChangelogFile, KindChanges } from "./types.ts";

type FlatField = { type: string; description?: string; required?: boolean };

// Every field reachable from a kind's root, keyed by its dotted path, e.g. "spec.template.spec.containers.image".
// A type is not expanded again inside itself, so recursive types (e.g. JSONSchemaProps) stay finite.
function flatten(spec: SpecFile, root: string): Map<string, FlatField> {
  const fields = new Map<string, FlatField>();
  const walk = (key: string, prefix: string, ancestors: Set<string>) => {
    for (const { name, type, description, required, ref } of spec.types[key] ?? []) {
      const path = prefix ? `${prefix}.${name}` : name;
      fields.set(path, { type, description, required });
      if (ref && !ancestors.has(ref)) walk(ref, path, new Set(ancestors).add(ref));
    }
  };
  walk(root, "", new Set([root]));
  return fields;
}

const parentOf = (path: string) => path.slice(0, Math.max(0, path.lastIndexOf(".")));

// KindChanges with the descriptions themselves instead of indexes into a file's texts
export type DiffedChanges = Omit<KindChanges, "descriptions"> & {
  descriptions?: Record<string, [string | null, string | null]>;
};

// Changes to one kind between two versions, undefined when nothing changed
function diffKind(older: SpecFile, newer: SpecFile, id: string): DiffedChanges | undefined {
  const before = flatten(older, older.kinds[id].root);
  const after = flatten(newer, newer.kinds[id].root);
  const changes: DiffedChanges = {};
  const describe = (path: string, from: string | undefined, to: string | undefined) => {
    if (from || to) (changes.descriptions ??= {})[path] = [from || null, to || null];
  };
  const push = (key: "required" | "optional" | "descriptionChanged", path: string) => (changes[key] ??= []).push(path);

  for (const [path, field] of after) {
    const old = before.get(path);
    if (!old) {
      const parent = parentOf(path);
      if (!parent || before.has(parent)) {
        (changes.added ??= {})[path] = field.type;
        describe(path, undefined, field.description);
      }
      continue;
    }
    const descriptionChanged = (old.description ?? "") !== (field.description ?? "");
    if (old.type !== field.type) (changes.typeChanged ??= {})[path] = [old.type, field.type];
    if (!old.required !== !field.required) push(field.required ? "required" : "optional", path);
    if (descriptionChanged) push("descriptionChanged", path);
    if (old.type !== field.type || !old.required !== !field.required || descriptionChanged) {
      describe(path, descriptionChanged ? old.description : undefined, field.description);
    }
  }
  for (const [path, field] of before) {
    if (after.has(path)) continue;
    const parent = parentOf(path);
    if (!parent || after.has(parent)) {
      (changes.removed ??= {})[path] = field.type;
      describe(path, field.description, undefined);
    }
  }

  const { description: from } = older.kinds[id];
  const { description: to } = newer.kinds[id];
  if ((from ?? "") !== (to ?? "")) {
    changes.description = true;
    describe("", from, to);
  }
  return Object.keys(changes).length > 0 ? changes : undefined;
}

// Changes to the given kinds ("apiVersion/Kind") that exist in both versions, keyed by the same id.
// Each version's spec files should be merged first, since a kind is defined in exactly one of them.
export function diffSpecs(older: SpecFile, newer: SpecFile, ids: string[]): Record<string, DiffedChanges> {
  const result: Record<string, DiffedChanges> = {};
  for (const id of ids) {
    if (!older.kinds[id] || !newer.kinds[id]) continue;
    const changes = diffKind(older, newer, id);
    if (changes) result[id] = changes;
  }
  return result;
}

export function countChanges(changes: KindChanges): ChangeCounts {
  return {
    added: Object.keys(changes.added ?? {}).length,
    removed: Object.keys(changes.removed ?? {}).length,
    changed:
      Object.keys(changes.typeChanged ?? {}).length +
      (changes.required?.length ?? 0) +
      (changes.optional?.length ?? 0) +
      (changes.descriptionChanged?.length ?? 0) +
      (changes.description ? 1 : 0),
  };
}

export function mergeSpecFiles(files: SpecFile[]): SpecFile {
  return {
    kinds: Object.assign({}, ...files.map((f) => f.kinds)),
    types: Object.assign({}, ...files.map((f) => f.types)),
  };
}

// Moves the descriptions into a shared texts table, keeping the tags in the given order (newest first)
export function packChangelog(byTag: Record<string, DiffedChanges>, order: string[]): KindChangelogFile {
  const texts: string[] = [];
  const indexes = new Map<string, number>();
  const ref = (text: string | null) => {
    if (text === null) return null;
    if (!indexes.has(text)) indexes.set(text, texts.push(text) - 1);
    return indexes.get(text)!;
  };

  const versions: KindChangelog = {};
  for (const tag of order) {
    if (!byTag[tag]) continue;
    const { descriptions, ...changes } = byTag[tag];
    versions[tag] = changes;
    if (descriptions) {
      versions[tag].descriptions = Object.fromEntries(Object.entries(descriptions).map(([path, [from, to]]) => [path, [ref(from), ref(to)]]));
    }
  }
  return { versions, texts };
}

export function unpackChangelog({ versions, texts }: KindChangelogFile): Record<string, DiffedChanges> {
  const text = (i: number | null) => (i === null ? null : texts[i]);
  return Object.fromEntries(
    Object.entries(versions).map(([tag, { descriptions, ...changes }]) => [
      tag,
      descriptions
        ? { ...changes, descriptions: Object.fromEntries(Object.entries(descriptions).map(([path, [from, to]]) => [path, [text(from), text(to)]])) }
        : changes,
    ]),
  );
}
