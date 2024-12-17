import {
  getBuiltinResource,
  type GVK,
  type ResourceDefinition,
} from "@lib/kube";
import { readSwaggerSpec } from "./spec";
import { VERSIONS } from "./versions";

export function getPreviousVersions(version: string): string[] {
  const index = VERSIONS.indexOf(version);
  return VERSIONS.slice(index);
}

export function getPreviousVersion(version: string): string | undefined {
  const index = VERSIONS.indexOf(version);
  return VERSIONS[index + 1];
}

export function findNewProperties(
  path: string,
  defPrev: ResourceDefinition | undefined,
  defNext: ResourceDefinition | undefined
): NewProperty[] {
  let changes: NewProperty[] = [];

  for (const [name, property] of Object.entries(defNext?.properties || {})) {
    if (!defPrev?.properties?.[name]) {
      changes.push({
        type: "new",
        path: `${path}.${name}`,
        description: property.description,
      });
    } else {
      changes = changes.concat(
        findNewProperties(
          `${path}.${name}`,
          defPrev?.properties?.[name].definition,
          defNext?.properties?.[name].definition
        )
      );
    }
  }

  return changes;
}

export function findRemovedProperties(
  path: string,
  defPrev: ResourceDefinition | undefined,
  defNext: ResourceDefinition | undefined
): RemovedProperty[] {
  let changes: RemovedProperty[] = [];

  for (const [name, property] of Object.entries(defPrev?.properties || {})) {
    if (!defNext?.properties?.[name]) {
      changes.push({
        type: "removed",
        path: `${path}.${name}`,
        description: property.description,
      });
    } else {
      changes = changes.concat(
        findRemovedProperties(
          `${path}.${name}`,
          defPrev?.properties?.[name].definition,
          defNext?.properties?.[name].definition
        )
      );
    }
  }

  return changes;
}

export function findModifiedDescription(
  path: string,
  defPrev: ResourceDefinition | undefined,
  defNext: ResourceDefinition | undefined
): ModifiedDescription[] {
  let changes: ModifiedDescription[] = [];

  for (const [name, property] of Object.entries(defPrev?.properties || {})) {
    if (
      defNext?.properties?.[name] &&
      defNext?.properties?.[name].description !== property.description
    ) {
      changes.push({
        type: "description",
        path: `${path}.${name}`,
        previous: property.description,
        next: defNext?.properties?.[name].description || "",
      });
    } else {
      changes = changes.concat(
        findModifiedDescription(
          `${path}.${name}`,
          defPrev?.properties?.[name]?.definition,
          defNext?.properties?.[name]?.definition
        )
      );
    }
  }

  return changes;
}

type NewGVK = { type: "new-gvk" };
type NewProperty = { type: "new"; path: string; description: string };
type RemovedProperty = { type: "removed"; path: string; description: string };
type ModifiedDescription = {
  type: "description";
  path: string;
  previous: string;
  next: string;
};
type Change = NewGVK | NewProperty | RemovedProperty | ModifiedDescription;

export async function compareVersions(
  vPrev: string,
  vNext: string,
  gvk: GVK
): Promise<Change[]> {
  const specPrev = await readSwaggerSpec(vPrev);
  const specNext = await readSwaggerSpec(vNext);

  let resourceNext = getBuiltinResource(specNext, gvk);
  let resourcePrev = getBuiltinResource(specPrev, gvk);

  if (!resourcePrev && !!resourceNext) {
    return [{ type: "new-gvk" }];
  }

  let changes = [
    ...findNewProperties(
      "",
      resourcePrev?.definition,
      resourceNext?.definition
    ),
    ...findRemovedProperties(
      "",
      resourcePrev?.definition,
      resourceNext?.definition
    ),
    ...findModifiedDescription(
      "",
      resourcePrev?.definition,
      resourceNext?.definition
    ),
  ];

  return changes;
}
