import { readFile } from "fs/promises";
import pluralize from "pluralize";
import type {
  GVK,
  Resource,
  ResourceDefinition,
  SwaggerDocument,
} from "./types";

export function compareVersions(a: string, b: string): number {
  const aParts = a.split(".").map(Number);
  const bParts = b.split(".").map(Number);

  for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
    const aPart = aParts[i] || 0; // Default to 0 if part is missing
    const bPart = bParts[i] || 0; // Default to 0 if part is missing

    if (aPart > bPart) return 1;
    if (aPart < bPart) return -1;
  }
  return 0;
}

export async function listAllBuiltInResources(
  tag: string
): Promise<Resource[]> {
  const content = await readFile(
    `./content/projects/kubernetes/${tag}/swagger.json`,
    "utf-8"
  );

  const swagger = JSON.parse(content) as SwaggerDocument;
  const gvks = getAllGVK(swagger);
  const resources: Resource[] = [];

  for (const gvk of gvks) {
    const result = Object.entries(swagger.definitions).find(
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
      continue;
    }

    const apiVersion = gvk.group ? `${gvk.group}/${gvk.version}` : gvk.version;

    const namespacedPath =
      apiVersion === "v1"
        ? `/api/${apiVersion}/namespaces/{namespace}/${pluralize(gvk.kind.toLowerCase())}`
        : `/apis/${apiVersion}/namespaces/{namespace}/${pluralize(gvk.kind.toLowerCase())}`;
    const scope = Object.keys(swagger.paths).includes(namespacedPath)
      ? "Namespaced"
      : "Cluster";

    const def = getDefinitionByKey(swagger, result[0]);
    resources.push({
      definition: def,
      gvk,
      category: kindToCategory[gvk.kind] || "Other",
      scope,
    });
  }

  return resources;
}

function getAllGVK(spec: SwaggerDocument): GVK[] {
  const gvk = Object.values(spec.paths)
    .flatMap((p) => Object.values(p))
    .filter((a) => a["x-kubernetes-action"] === "list")
    .map((a) => a["x-kubernetes-group-version-kind"])
    .filter((a) => a.kind !== "CustomResourceDefinition");

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

  return deduped;
}

function getDefinitionByKey(
  swagger: SwaggerDocument,
  key: string
): ResourceDefinition {
  const root = swagger.definitions[key];
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
      required: (root.required || []).includes(name),
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
          swagger,
          refKey
        );
      }
    }
  }

  return definition;
}

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
  MutatingAdmissionPolicy: "Administration",
  MutatingAdmissionPolicyBinding: "Administration",
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
