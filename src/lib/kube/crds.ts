import { readFile, readdir } from "fs/promises";
import type {
  CustomResourceDefinition,
  OpenAPIV3Schema,
  Resource,
  ResourceDefinition,
} from "./types";
import { parseAllDocuments } from "yaml";

const manifestsCache = new Map<string, CustomResourceDefinition[]>();

export async function listManifests(
  slug: string,
  tag: string
): Promise<CustomResourceDefinition[]> {
  const cacheKey = `${slug}/${tag}`;
  const cached = manifestsCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const dir = `./content/projects/${cacheKey}`;
  const entries = await readdir(dir, { withFileTypes: true });
  const manifests: CustomResourceDefinition[] = [];

  for (const entry of entries) {
    if (!entry.isFile()) continue; // ✅ skip directories
    const file = entry.name;

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

  manifestsCache.set(cacheKey, manifests);
  return manifests;
}

export async function listAllCRDs(
  slug: string,
  tag: string
): Promise<Resource[]> {
  const manifests = await listManifests(slug, tag);
  return manifests.flatMap((manifest) => {
    return manifest.spec.versions.map((version: any) => {
      return {
        gvk: {
          group: manifest.spec.group,
          version: version.name,
          kind: manifest.spec.names.kind,
        },
        category: manifest.spec.group,
        scope: manifest.spec.scope,
        definition: toResourceDefinition(version.schema.openAPIV3Schema),
      } as Resource;
    });
  });
}

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
