export const VERSIONS = [
  "1.31",
  "1.30",
  "1.29",
  "1.28",
  "1.27",
  "1.26",
  "1.25",
];
export const LATEST_VERSION = VERSIONS[0];

export function readSwaggerSpec(version: string): Promise<SwaggerSpec> {
  return import(`../../../public/swagger-${version}.json`);
}

export type GVK = {
  group: string;
  version: string;
  kind: string;
};

export type SwaggerSpec = {
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
      "x-kubernetes-group-version-kind"?: GVK[];
    };
  };
};
