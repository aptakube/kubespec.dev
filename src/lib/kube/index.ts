import type { GVK, SwaggerSpec } from "@lib/swagger";
import pluralize from "pluralize";

export type GVKByCategory = { [category: string]: GVK[] };

const kindToCategory: Record<string, string> = {
  Pod: "Workloads",
  Deployment: "Workloads",
  DaemonSet: "Workloads",
  StatefulSet: "Workloads",
  Job: "Workloads",
  CronJob: "Workloads",
  ReplicaSet: "Workloads",
  ReplicationController: "Workloads",

  Node: "Cluster",
  Event: "Cluster",
  Namespace: "Cluster",

  Service: "Networking",
  Ingress: "Networking",
  Endpoint: "Networking",
  Endpoints: "Networking",
  NetworkPolicy: "Networking",
  EndpointSlice: "Networking",
  IngressClass: "Networking",

  ConfigMap: "Configuration",
  LimitRange: "Configuration",
  Secret: "Configuration",
  Lease: "Configuration",
  ResourceQuota: "Configuration",
  HorizontalPodAutoscaler: "Configuration",
  VerticalPodAutoscaler: "Configuration",
  PodDisruptionBudget: "Configuration",

  CSINode: "Storage",
  CSIDriver: "Storage",
  CSIStorageCapacity: "Storage",
  StorageClass: "Storage",
  VolumeAttachment: "Storage",
  PersistentVolume: "Storage",
  PersistentVolumeClaim: "Storage",

  MutatingWebhookConfiguration: "Administration",
  ValidatingWebhookConfiguration: "Administration",
  ValidatingAdmissionPolicy: "Administration",
  ValidatingAdmissionPolicyBinding: "Administration",
  RuntimeClass: "Administration",
  PriorityClass: "Administration",
  ResourceClass: "Administration",

  ServiceAccount: "Access Control",
  Role: "Access Control",
  RoleBinding: "Access Control",
  ClusterRole: "Access Control",
  ClusterRoleBinding: "Access Control",
};

const categories = [
  "Workloads",
  "Cluster",
  "Networking",
  "Configuration",
  "Storage",
  "Administration",
  "Access Control",
  "Other",
];

export function gvkSortFn(left: GVK, right: GVK): number {
  return left.kind.localeCompare(right.kind);
}

export function categorySortFn(left: string, right: string): number {
  return categories.indexOf(left) - categories.indexOf(right);
}

export function parseGVKRef(ref: string): GVK {
  const parts = ref.split("/");
  return parts.length === 2
    ? { group: "", version: parts[0], kind: parts[1] }
    : { group: parts[0], version: parts[1], kind: parts[2] };
}

export function getAllGVK(spec: SwaggerSpec): GVKByCategory {
  const gvk = Object.values(spec.paths)
    .flatMap((p) => Object.values(p))
    .filter((a) => a["x-kubernetes-action"] === "list")
    .map((a) => a["x-kubernetes-group-version-kind"])
    .filter((a) => a.kind !== "CustomResourceDefinition"); // TODO: Handle CRDs later, they are not supported yet

  const deduped = Object.values(
    gvk.reduce(
      (acc, item) => {
        const key = `${item.group}/${item.version}/${item.kind}`;
        return {
          ...acc,
          [key]: item,
        };
      },
      {} as Record<string, GVK>
    )
  );

  return deduped.reduce((acc, item) => {
    const category = kindToCategory[item.kind] || "Other";
    return {
      ...acc,
      [category]: [...(acc[category] || []), item],
    };
  }, {} as GVKByCategory);
}

export type ResourceDefinition = {
  description: string;
  properties: {
    [name: string]: {
      description: string;
      type: string;
      isArray: boolean;
      definition?: ResourceDefinition;
    };
  };
};

export function getGVKDefinition(
  spec: SwaggerSpec,
  gvk: GVK
): ResourceDefinition & { scope: "Cluster" | "Namespaced" } {
  const result = Object.entries(spec.definitions).find(
    ([_, def]) =>
      def["x-kubernetes-group-version-kind"] &&
      def["x-kubernetes-group-version-kind"].find(
        (x) =>
          x.group === gvk.group &&
          x.version === gvk.version &&
          x.kind === gvk.kind
      )
  );

  if (!result) {
    throw new Error(
      `No definition found for ${gvk.group}/${gvk.version}/${gvk.kind}`
    );
  }

  const apiVersion = gvk.group ? `${gvk.group}/${gvk.version}` : gvk.version;

  const namespacedPath = `/apis/${apiVersion}/namespaces/{namespace}/${pluralize(gvk.kind.toLowerCase())}`;
  const scope = namespacedPath in spec.paths ? "Namespaced" : "Cluster";

  const def = getDefinitionByKey(spec, result[0]);
  return { ...def, scope };
}

export function getDefinitionByKey(
  spec: SwaggerSpec,
  key: string
): ResourceDefinition {
  const root = spec.definitions[key];
  if (!root) {
    throw new Error(`No definition found for ${key}`);
  }

  const definition: ResourceDefinition = {
    description: root.description ?? "",
    properties: {},
  };

  for (const [name, property] of Object.entries(root.properties || {})) {
    definition.properties[name] = {
      description: property.description || "",
      type: property.type || "",
      isArray: property.type === "array",
    };

    if (definition.properties[name].isArray && property.items?.type) {
      definition.properties[name].type = `${property.items.type}[]`;
    }

    if (property.$ref || property.items?.$ref) {
      const refKey = (property.$ref || property.items?.$ref || "").replace(
        "#/definitions/",
        ""
      );

      const refType = refKey.split(".").pop() || "";
      definition.properties[name].type = definition.properties[name].isArray
        ? `${refType}[]`
        : refType;

      if (refType !== "Time") {
        definition.properties[name].definition = getDefinitionByKey(
          spec,
          refKey
        );
      }
    }
  }

  return definition;
}

type GVKMetadata = {
  links: Array<{ name: string; href: string }>;
};

export async function readMetadata(gvk: GVK): Promise<GVKMetadata> {
  const apiVersion = gvk.group ? `${gvk.group}/${gvk.version}` : gvk.version;

  try {
    const { links } = await import(
      `./metadata/${apiVersion}/${gvk.kind.toLowerCase()}/${gvk.kind.toLowerCase()}.json`
    );
    return { links: links ?? [] };
  } catch (e) {
    return { links: [] };
  }
}
