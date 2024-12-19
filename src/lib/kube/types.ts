export type GVK = {
  group: string;
  version: string;
  kind: string;
};

export type Resource = {
  gvk: GVK;
  category: string;
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
      required: boolean;
      definition?: ResourceDefinition;
    };
  };
};

export type Project = {
  name: string;
  logo: string;
  slug: string;
  tags: string[];
};

export type CustomResourceDefinition = {
  kind: string;
  apiVersion: string;
  spec: {
    scope: string;
    group: string;
    names: {
      kind: string;
    };
    versions: Array<{
      name: string;
      schema: {
        openAPIV3Schema: OpenAPIV3Schema;
      };
    }>;
  };
};

export type OpenAPIV3Schema = {
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

export type SwaggerDocument = {
  paths: {
    [path: string]: {
      [method: string]: {
        "x-kubernetes-action"?: string;
        "x-kubernetes-group-version-kind": GVK;
      };
    };
  };
  definitions: {
    [key: string]: {
      description?: string;
      properties?: {
        [name: string]: {
          description?: string;
          items?: {
            type?: string;
            $ref?: string;
          };
          type?: string;
          $ref?: string;
        };
      };
      required?: string[];
      "x-kubernetes-group-version-kind"?: GVK[];
    };
  };
};
