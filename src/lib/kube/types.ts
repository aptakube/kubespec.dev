export type GVK = {
  group: string;
  version: string;
  kind: string;
};

export type Resource = {
  gvk: GVK;
  scope: "Cluster" | "Namespaced";
  definition: ResourceDefinition;
};

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
