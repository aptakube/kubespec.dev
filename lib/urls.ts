// Kept free of index imports, so client components can use it without bundling the index.

// the project shown on the home page, served at / instead of /{project}
export const HOME_PROJECT = "kubernetes";

// the latest version lives at /{project} (or / for the home project), older ones at /{project}/{version}
export function projectHref(project: string, version?: string, latestVersion?: string): string {
  if (version && version !== latestVersion) return `/${project}/${version}`;
  return project === HOME_PROJECT ? "/" : `/${project}`;
}

// kinds of the latest version leave the version out, e.g. /kubernetes/apps/v1/Deployment or /kubernetes/v1/Pod;
// older versions include it, e.g. /kubernetes/v1.20/apps/v1/Deployment
export function kindHref(project: string, version: string, apiVersion: string, kind: string, latestVersion: string): string {
  return version === latestVersion ? `/${project}/${apiVersion}/${kind}` : `/${project}/${version}/${apiVersion}/${kind}`;
}

export const SITE_URL = "https://kubespec.dev";

export const GITHUB_REPO = "aptakube/kubespec.dev";
