import { type Resource, type ResourceDefinition } from "./types";

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
  previous: Resource | undefined,
  next: Resource | undefined
): Promise<Change[]> {
  if (!previous && !!next) {
    return [{ type: "new-gvk" }];
  }

  let changes = [
    ...findNewProperties("", previous?.definition, next?.definition),
    ...findRemovedProperties("", previous?.definition, next?.definition),
    ...findModifiedDescription("", previous?.definition, next?.definition),
  ];

  return changes;
}

export function compareCRDVersion(versionA: string, versionB: string): number {
  // Extract components of the version strings
  const parseVersion = (
    version: string
  ): {
    major: number;
    phase: "alpha" | "beta" | "stable";
    phaseNumber: number;
  } => {
    const match = version.match(/^v(\d+)(alpha(\d+)|beta(\d+))?$/);
    if (!match) {
      throw new Error(`Invalid version format: ${version}`);
    }

    const major = parseInt(match[1], 10);
    const phase = match[2]
      ? match[2].startsWith("alpha")
        ? "alpha"
        : "beta"
      : "stable";
    const phaseNumber = match[3]
      ? parseInt(match[3], 10)
      : match[4]
        ? parseInt(match[4], 10)
        : Infinity;

    return { major, phase, phaseNumber };
  };

  const phases = { stable: 3, beta: 2, alpha: 1 };

  const a = parseVersion(versionA);
  const b = parseVersion(versionB);

  // Compare major versions
  if (a.major !== b.major) {
    return a.major > b.major ? 1 : -1;
  }

  // Compare phases (stable > beta > alpha)
  if (phases[a.phase] !== phases[b.phase]) {
    return phases[a.phase] > phases[b.phase] ? 1 : -1;
  }

  // Compare phase numbers
  if (a.phaseNumber !== b.phaseNumber) {
    return a.phaseNumber > b.phaseNumber ? 1 : -1;
  }

  // Versions are equal
  return 0;
}
