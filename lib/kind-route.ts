import { getProjectIndex, getProjectVersion } from "./index";
import { resolveKinds } from "./kinds";
import type { KindChangelog, KindRef, ProjectIndex, ProjectVersion } from "./types";

export type KindRoute = {
  project: ProjectIndex;
  version: ProjectVersion;
  ref: KindRef;
  // the URL names the latest version explicitly, so the page redirects to the canonical URL
  explicitLatest: boolean;
  // the oldest version that has this kind at this apiVersion
  introducedIn: ProjectVersion;
  // whether the latest version still has this kind at this apiVersion
  inLatest: boolean;
};

// Two URL shapes share the kind route (see kindHref):
//   /{project}/{version}/{apiVersion}/{Kind} for older versions, e.g. /kubernetes/v1.20/apps/v1/Deployment
//   /{project}/{apiVersion}/{Kind} for the latest version, e.g. /kubernetes/apps/v1/Deployment or /kubernetes/v1/Pod
// so a [version] that isn't a known version is the start of the apiVersion instead.
export function resolveKindRoute({ project: slug, version: v, kind: rest }: { project: string; version: string; kind: string[] }): KindRoute | undefined {
  const found = getProjectVersion(slug, v);
  const project = found?.project ?? getProjectIndex(slug);
  if (!project) return undefined;

  const version = found?.version ?? project.versions[0];
  const segments = found ? rest : [v, ...rest];
  if (segments.length < 2) return undefined;

  const apiVersion = segments.slice(0, -1).map(decodeURIComponent).join("/");
  const kind = segments.at(-1)!;
  return findKind(project, version, apiVersion, kind, !!found && version === project.versions[0]);
}

export function findKind(project: ProjectIndex, version: ProjectVersion, apiVersion: string, kind: string, explicitLatest = false): KindRoute | undefined {
  const resolved = resolveKinds(project.versions);
  const has = (tag: string) => resolved.get(tag)!.find((k) => k.apiVersion === apiVersion && k.kind === kind);
  const ref = has(version.tag);
  if (!ref) return undefined;

  const introducedIn = project.versions.findLast((v) => has(v.tag))!;
  return { project, version, ref, explicitLatest, introducedIn, inLatest: !!has(project.versions[0].tag) };
}

// The newest version up to `version` that changed the kind, or the one that introduced it
export function lastChangedIn({ project, version, introducedIn }: KindRoute, changelog: KindChangelog): ProjectVersion {
  return project.versions.slice(project.versions.indexOf(version)).find((v) => changelog[v.tag]) ?? introducedIn;
}
