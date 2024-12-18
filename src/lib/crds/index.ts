import { readFile, readdir } from "fs/promises";
import { parseAllDocuments } from "yaml";
import semver from "semver";
import type { GVK, Resource, ResourceDefinition } from "@lib/kube";
import ALL_PROJECTS from "./projects";

export type Project = {
  name: string;
  logo: string;
  slug: string;
  versions: string[];
};

const manifestsCache = new Map<string, any[]>();

export async function listManifests(slug: string, tag: string): Promise<any[]> {
  const cached = manifestsCache.get(`${slug}/${tag}`);
  if (cached) {
    return cached;
  }

  const dir = `./public/projects/${slug}/${tag}`;
  const files = await readdir(dir);
  const manifests = [];

  for (const file of files) {
    const content = await readFile(`${dir}/${file}`, "utf-8");
    const docs = parseAllDocuments(content);
    for (const doc of docs) {
      if (doc.errors.length > 0) {
        throw new Error(
          `Error parsing ${file}: ${doc.errors.map((e) => e.message).join(", ")}`
        );
      }

      const docJSON = doc.toJSON();

      if (
        !!docJSON &&
        docJSON.kind === "CustomResourceDefinition" &&
        docJSON.apiVersion === "apiextensions.k8s.io/v1"
      ) {
        manifests.push(docJSON);
      }
    }
  }

  manifestsCache.set(`${slug}/${tag}`, manifests);
  return manifests;
}

export async function listCustomResources(
  projectSlug: string,
  tag: string
): Promise<Resource[]> {
  const manifests = await listManifests(projectSlug, tag);
  return manifests.flatMap((manifest) => {
    return manifest.spec.versions.map((version: any) => {
      return {
        gvk: {
          group: manifest.spec.group,
          version: version.name,
          kind: manifest.spec.names.kind,
        },
        scope: manifest.spec.scope,
        definition: toResourceDefinition(version.schema.openAPIV3Schema),
      } as Resource;
    });
  });
}

export async function findCustomResource(
  projectSlug: string,
  tag: string,
  gvk: GVK
): Promise<Resource | undefined> {
  const resources = await listCustomResources(projectSlug, tag);

  return resources.find(
    (resource) =>
      resource.gvk.group === gvk.group &&
      resource.gvk.version === gvk.version &&
      resource.gvk.kind === gvk.kind
  );
}

export async function listProjects(): Promise<Project[]> {
  const projects: Project[] = [];
  for (const project of ALL_PROJECTS) {
    const versions = await readdir(`./public/projects/${project.slug}`);
    projects.push({
      name: project.name,
      slug: project.slug,
      logo: project.logo,
      versions: semver.rsort(versions),
    });
  }
  return projects;
}

export async function findProject(slug: string): Promise<Project> {
  const projects = await listProjects();
  const project = projects.find((project) => project.slug === slug);
  if (!project) {
    throw new Error(`Project not found: ${slug}`);
  }
  return project;
}

type OpenAPIV3Schema = {
  description?: string;
  properties?: {
    [name: string]: OpenAPIV3Property;
  };
  required?: string[];
};

type OpenAPIV3Property = {
  description?: string;
  type?: string;
  items?: {
    type?: string;
    properties?: {
      [name: string]: OpenAPIV3Property;
    };
  };
};

function toResourceDefinition(schema: OpenAPIV3Schema): ResourceDefinition {
  const definition: ResourceDefinition = {
    description: schema.description ?? "",
    properties: {},
  };

  for (const [name, property] of Object.entries(schema.properties || {})) {
    definition.properties[name] = {
      description: property.description || "",
      type: property.type || "",
      required: (schema.required || []).includes(name),
      isArray: property.type === "array",
    };

    if (definition.properties[name].isArray && property.items?.type) {
      definition.properties[name].type = `${property.items.type}[]`;
      definition.properties[name].definition = toResourceDefinition(
        property.items
      );
    } else {
      definition.properties[name].definition = toResourceDefinition(property);
    }
  }

  return definition;
}
