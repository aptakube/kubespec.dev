import { parseAllDocuments } from "yaml";

// Parses spec files (Kubernetes' swagger.json and CRD manifests) into kinds and their field types.
// Shared by the website and scripts/build-index.ts, so it must not import anything from Next.js.

export type Field = {
  name: string;
  // display type, e.g. "string", "Container[]", "map[string]string", "Quantity"
  type: string;
  description?: string;
  required?: boolean;
  // key into SchemaTypes for the fields of an object type (also behind arrays and maps)
  ref?: string;
};

// type key -> its fields
export type SchemaTypes = Record<string, Field[]>;

// everything extracted from one spec file
export type SpecFile = {
  kinds: Record<string, { description?: string; root: string }>;
  types: SchemaTypes;
};

const shortName = (ref: string) => ref.split("/").at(-1)!.split(".").at(-1)!;

// Kubernetes' swagger.json: definitions reference each other by $ref
function fromSwagger(swagger: any): SpecFile {
  const defs: Record<string, any> = swagger.definitions ?? {};
  const types: SchemaTypes = {};

  const refOf = (prop: any): string | undefined => prop.$ref ?? prop.allOf?.[0]?.$ref;

  // returns the display type, and the type key when it has fields to expand
  const describe = (prop: any): { type: string; ref?: string } => {
    const $ref = refOf(prop);
    if ($ref) {
      const name = $ref.replace("#/definitions/", "");
      return { type: shortName(name), ref: defs[name]?.properties ? name : undefined };
    }
    if (prop.type === "array") {
      const item = describe(prop.items ?? {});
      return { type: `${item.type}[]`, ref: item.ref };
    }
    if (prop.type === "object" && prop.additionalProperties) {
      const value = describe(prop.additionalProperties);
      return { type: `map[string]${value.type}`, ref: value.ref };
    }
    return { type: prop.format === "int-or-string" ? "int | string" : (prop.type ?? "object") };
  };

  for (const [name, def] of Object.entries(defs)) {
    if (!def.properties) continue;
    const required = new Set<string>(def.required ?? []);
    types[name] = Object.entries<any>(def.properties).map(([field, prop]) => ({
      name: field,
      description: prop.description ?? defs[refOf(prop)?.replace("#/definitions/", "") ?? ""]?.description,
      required: required.has(field) || undefined,
      ...describe(prop),
    }));
  }

  const kinds: SpecFile["kinds"] = {};
  for (const [name, def] of Object.entries(defs)) {
    for (const gvk of def["x-kubernetes-group-version-kind"] ?? []) {
      const apiVersion = gvk.group ? `${gvk.group}/${gvk.version}` : gvk.version;
      if (types[name]) kinds[`${apiVersion}/${gvk.kind}`] = { description: def.description, root: name };
    }
  }

  return { kinds, types };
}

// CRD manifests: each version has an inline openAPIV3Schema (v1), or one shared by all versions (v1beta1).
// Nested objects get a type key from their path, e.g. "keda.sh/v1alpha1/ScaledObject#.spec.triggers[]"
function fromCRDs(content: string): SpecFile {
  const types: SchemaTypes = {};
  const kinds: SpecFile["kinds"] = {};

  // registers the object's fields under key, returning the key when it has any
  const addObject = (key: string, schema: any): string | undefined => {
    if (!schema?.properties) return undefined;
    const required = new Set<string>(schema.required ?? []);
    types[key] = Object.entries<any>(schema.properties).map(([field, prop]) => ({
      name: field,
      description: prop.description,
      required: required.has(field) || undefined,
      ...describe(`${key}.${field}`, prop),
    }));
    return key;
  };

  const describe = (key: string, prop: any): { type: string; ref?: string } => {
    if (prop["x-kubernetes-int-or-string"]) return { type: "int | string" };
    if (prop.type === "array") {
      const item = describe(`${key}[]`, prop.items ?? {});
      return { type: `${item.type}[]`, ref: item.ref };
    }
    if (prop.type === "object" && !prop.properties && prop.additionalProperties) {
      const value = describe(`${key}{}`, prop.additionalProperties);
      return { type: `map[string]${value.type}`, ref: value.ref };
    }
    return { type: prop.type ?? "object", ref: addObject(key, prop) };
  };

  for (const doc of parseManifests(content)) {
    if (doc.errors.length > 0) continue;

    const crd = doc.toJS();
    if (crd?.kind !== "CustomResourceDefinition") continue;

    const { group, names } = crd.spec;
    const shared = crd.spec.validation?.openAPIV3Schema;
    const versions: any[] = crd.spec.versions ?? [{ name: crd.spec.version }];
    for (const v of versions) {
      const schema = v.schema?.openAPIV3Schema ?? shared;
      const id = `${group}/${v.name}/${names.kind}`;
      const root = addObject(`${id}#`, schema);
      if (root) kinds[id] = { description: schema.description, root };
    }
  }

  return { kinds, types };
}

// Parses a multi-document YAML file. Lines that are only a Helm template directive (e.g. "{{- if .Values.crds }}")
// are dropped first, since some projects ship their CRDs as Helm templates.
export function parseManifests(content: string) {
  return parseAllDocuments(content.replace(/^\s*\{\{.*\}\}\s*$/gm, ""));
}

export function parseSpecFile(url: string, content: string): SpecFile {
  return url.endsWith(".json") ? fromSwagger(JSON.parse(content)) : fromCRDs(content);
}
