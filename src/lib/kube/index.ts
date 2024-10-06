import type { GVK, SwaggerSpec } from "@lib/swagger";

export type GVKByCategory = { [category: string]: GVK[] };

const kindToCategory: Record<string, string> = {
  "Pod": "Workloads",
  "Deployment": "Workloads",
  "DaemonSet": "Workloads",
  "StatefulSet": "Workloads",
  "Job": "Workloads",
  "CronJob": "Workloads",
  "ReplicaSet": "Workloads",
  "ReplicationController": "Workloads",
  
  "Node": "Cluster",
  "Event": "Cluster",
  "Namespace": "Cluster",

  "Service": "Networking",
  "Ingress": "Networking",
  "Endpoint": "Networking",
  "Endpoints": "Networking",
  "NetworkPolicy": "Networking",
  "EndpointSlice": "Networking",
  "IngressClass": "Networking",
  
  "ConfigMap": "Configuration",
  "LimitRange": "Configuration",
  "Secret": "Configuration",
  "Lease": "Configuration",
  "ResourceQuota": "Configuration",
  "HorizontalPodAutoscaler": "Configuration",
  "VerticalPodAutoscaler": "Configuration",
  "PodDisruptionBudget": "Configuration",
  
  "CSINode": "Storage",
  "CSIDriver": "Storage",
  "CSIStorageCapacity": "Storage",
  "StorageClass": "Storage",
  "VolumeAttachment": "Storage",
  "PersistentVolume": "Storage",
  "PersistentVolumeClaim": "Storage",
  
  "MutatingWebhookConfiguration": "Administration",
  "ValidatingWebhookConfiguration": "Administration",
  "ValidatingAdmissionPolicy": "Administration",
  "ValidatingAdmissionPolicyBinding": "Administration",
  "RuntimeClass": "Administration",
  "PriorityClass": "Administration",
  "ResourceClass": "Administration",
  
  "ServiceAccount": "Access Control",
  "Role": "Access Control",
  "RoleBinding": "Access Control",
  "ClusterRole": "Access Control",
  "ClusterRoleBinding": "Access Control",
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
]

export function gvkSortFn(left: GVK, right: GVK): number {
  return left.kind.localeCompare(right.kind);
}

export function categorySortFn(left: string, right: string): number {
  return categories.indexOf(left) - categories.indexOf(right);
}

export function getAllGVK(swagger: SwaggerSpec): GVKByCategory {
  const gvk = Object.values(swagger.paths)
    .flatMap((p) => Object.values(p))
    .filter((a) => a['x-kubernetes-action'] === 'list')
    .map((a) => a['x-kubernetes-group-version-kind'])

  const deduped = Object.values(gvk.reduce((acc, item) => {
    const key = `${item.group}/${item.version}/${item.kind}`;
    return {
      ...acc,
      [key]: item,
    };
  }, {} as Record<string, GVK>));


  return deduped.reduce((acc, item) => {
    const category = kindToCategory[item.kind] || "Other";
    return {
      ...acc,
      [category]: [...(acc[category] || []), item],
    };
  }, {} as GVKByCategory);
}