import type { KindMove, KindRef, ProjectVersion } from "./types.ts";

export type ResolvedVersion = Omit<ProjectVersion, "added" | "removed" | "moved"> & { kinds: KindRef[] };

function kindKey(k: KindRef): string {
  return `${k.apiVersion}/${k.kind}/${k.scope}`;
}

// "apps/v1" -> "apps", "v1" -> ""
export function groupOf(apiVersion: string): string {
  return apiVersion.includes("/") ? apiVersion.split("/")[0] : "";
}

// Kubernetes version priority: v2 > v1 > v1beta2 > v1beta1 > v1alpha1
export function versionRank(apiVersion: string): number {
  const match = /v(\d+)(?:(alpha|beta)(\d+))?$/.exec(apiVersion);
  if (!match) return 0;
  const [, major, level, minor] = match;
  const stability = level === "alpha" ? 100 : level === "beta" ? 200 : 300;
  return Number(major) * 1000 + stability + Number(minor ?? 0);
}

export function sortKinds(kinds: KindRef[]): KindRef[] {
  return [...kinds].sort((a, b) => a.apiVersion.localeCompare(b.apiVersion) || a.kind.localeCompare(b.kind));
}

// Replays the deltas from the oldest version to rebuild the full list of kinds per tag.
// Expects versions newest first, as stored in the index.
export function resolveKinds(versions: ProjectVersion[]): Map<string, KindRef[]> {
  const result = new Map<string, KindRef[]>();
  const current = new Map<string, KindRef>();

  for (const v of [...versions].reverse()) {
    for (const k of v.removed ?? []) current.delete(kindKey(k));
    for (const { kind, scope, from, to } of v.moved ?? []) {
      current.delete(kindKey({ apiVersion: from, kind, scope }));
      current.set(kindKey({ apiVersion: to, kind, scope }), { apiVersion: to, kind, scope });
    }
    for (const k of v.added ?? []) current.set(kindKey(k), k);
    result.set(v.tag, sortKinds([...current.values()]));
  }

  return result;
}

// Inverse of resolveKinds: stores each version's kinds as a delta from the previous (older) version.
// A kind removed from one apiVersion and added to another of the same group is recorded as moved,
// to the most stable of the candidates when more than one was added.
// Expects versions newest first.
export function toDeltas(versions: ResolvedVersion[]): ProjectVersion[] {
  return versions.map(({ kinds, ...v }, i) => {
    const previous = new Map((versions[i + 1]?.kinds ?? []).map((k) => [kindKey(k), k]));
    const next = new Set(kinds.map(kindKey));

    let added = kinds.filter((k) => !previous.has(kindKey(k)));
    let removed = [...previous.values()].filter((k) => !next.has(kindKey(k)));
    const moved: KindMove[] = [];

    for (const r of sortKinds(removed)) {
      const target = added
        .filter((a) => a.kind === r.kind && a.scope === r.scope && groupOf(a.apiVersion) === groupOf(r.apiVersion))
        .sort((a, b) => versionRank(b.apiVersion) - versionRank(a.apiVersion))[0];
      if (!target) continue;

      moved.push({ kind: r.kind, scope: r.scope, from: r.apiVersion, to: target.apiVersion });
      added = added.filter((a) => a !== target);
      removed = removed.filter((k) => k !== r);
    }

    return {
      ...v,
      ...(added.length > 0 && { added: sortKinds(added) }),
      ...(removed.length > 0 && { removed: sortKinds(removed) }),
      ...(moved.length > 0 && { moved }),
    };
  });
}
