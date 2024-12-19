import { readdir } from "fs/promises";
import type { GVK, Project, Resource } from "./types";
import ALL_PROJECTS from "./projects";
import semver from "semver";
import { listAllCRDs } from "./crds";
import { compareVersions, listAllBuiltInResources } from "./kubernetes";
import { compareCRDVersion } from "./compare";
export * from "./compare";
export * from "./metadata";

export * from "./types";

export async function listProjects(): Promise<Project[]> {
  const projects: Project[] = [];
  for (const project of ALL_PROJECTS) {
    const tags = new Set<string>();
    const baseDir = `./content/projects/${project.slug}`;
    for (const file of await readdir(baseDir, { recursive: true })) {
      const tag = file.substring(0, file.indexOf("/"));
      if (tag) {
        tags.add(tag);
      }
    }

    projects.push({
      name: project.name,
      slug: project.slug,
      logo: project.logo,
      tags:
        project.slug === "kubernetes"
          ? [...tags].sort(compareVersions).reverse()
          : semver.rsort([...tags]),
    });
  }
  return projects;
}

const resourcesCache = new Map<string, Resource[]>();

export async function findProject(slug: string): Promise<Project> {
  const projects = await listProjects();
  const project = projects.find((p) => p.slug === slug);
  if (!project) {
    throw new Error(`Project not found: ${slug}`);
  }
  return project;
}

export async function listAllResources(
  slug: string,
  tag: string
): Promise<Resource[]> {
  const cacheKey = `${slug}/${tag}`;
  const cached = resourcesCache.get(cacheKey);
  if (cached) {
    return cached;
  }
  // Kubernetes is a special case with Swagger files instead of CRD Manifests
  const resources =
    slug === "kubernetes"
      ? await listAllBuiltInResources(tag)
      : await listAllCRDs(slug, tag);

  const latestByKind = new Map<string, Resource>();
  for (const resource of resources) {
    const key = `${resource.gvk.group}/${resource.gvk.kind}`;
    const existing = latestByKind.get(key);
    if (existing) {
      if (compareCRDVersion(resource.gvk.version, existing.gvk.version) > 0) {
        latestByKind.set(key, resource);
      }
    } else {
      latestByKind.set(key, resource);
    }
  }

  const latestResources = Array.from(latestByKind.values());

  resourcesCache.set(cacheKey, latestResources);
  return latestResources;
}

export async function findResource(
  slug: string,
  tag: string,
  gvk: GVK
): Promise<Resource | undefined> {
  const resources = await listAllResources(slug, tag);
  return resources.find(
    (r) =>
      r.gvk.group === gvk.group &&
      r.gvk.version === gvk.version &&
      r.gvk.kind === gvk.kind
  );
}

export function parseGVKRef(ref: string): GVK {
  const parts = ref.split("/");
  return parts.length === 2
    ? { group: "", version: parts[0], kind: parts[1] }
    : { group: parts[0], version: parts[1], kind: parts[2] };
}
