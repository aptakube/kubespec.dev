import { readdir } from "fs/promises";
import type { GVK, Project, Resource } from "./types";
import ALL_PROJECTS from "./projects";
import { listAllCRDs } from "./crds";
import { compareVersions, listAllBuiltInResources } from "./kubernetes";
import { compareCRDVersion } from "./compare";

export * from "./compare";
export * from "./metadata";
export * from "./types";

let cachedProjects: Project[] | undefined = undefined;

export async function listProjects(): Promise<Project[]> {
  if (cachedProjects) {
    return cachedProjects;
  }

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
          : [...tags].sort().reverse(), // 👈 simple lexicographic sort, no semver filter
    });
  }
  cachedProjects = projects;
  return projects;
}

const resourcesCache = new Map<string, Resource[]>();

export async function getProject(slug: string): Promise<Project> {
  const project = await findProject(slug);
  if (!project) {
    throw new Error(`Project with slug "${slug}" not found`);
  }
  return project;
}

export async function findProject(slug: string): Promise<Project | undefined> {
  const projects = await listProjects();
  return projects.find((p) => p.slug === slug);
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

  const resources =
    slug === "kubernetes"
      ? await listAllBuiltInResources(tag)
      : await listAllCRDs(slug, tag);

  const latestByKind = new Map<string, Resource>();
  for (const resource of resources) {
    const key = `${resource.gvk.group}/${resource.gvk.version.substring(0, 2)}/${resource.gvk.kind}`;
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
