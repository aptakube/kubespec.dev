export type ProjectDef = {
  name: string;
  slug: string;
  repo: string;
  pathToManifest?: string;
  pathToManifests?: string;
  releaseFileName?: string;
  filterTag?: (tag: string) => boolean;
};

export default [
  {
    name: "Gateway API",
    slug: "gateway-api",
    repo: "kubernetes-sigs/gateway-api",
    pathToManifests: "config/crd/standard",
  },
  {
    name: "Cluster API",
    slug: "cluster-api",
    repo: "kubernetes-sigs/cluster-api",
    pathToManifests: "config/crd/bases",
  },
  {
    name: "Istio",
    slug: "istio",
    repo: "istio/istio",
    pathToManifest: "manifests/charts/base/files/crd-all.gen.yaml",
  },
  {
    name: "Keda",
    slug: "keda",
    repo: "kedacore/keda",
    pathToManifests: "config/crd/bases",
  },
  {
    name: "Kyverno",
    slug: "kyverno",
    repo: "kyverno/kyverno",
    pathToManifests: "config/crds/kyverno",
  },
  {
    name: "CloudNativePG",
    slug: "cloudnative-pg",
    repo: "cloudnative-pg/cloudnative-pg",
    pathToManifests: "config/crd/bases",
  },
  {
    name: "cert-manager",
    slug: "cert-manager",
    repo: "cert-manager/cert-manager",
    releaseFileName: "cert-manager.yaml",
    filterTag: (tag: string) => !tag.startsWith("cmd/ctl"),
  },
  {
    name: "Cilium",
    slug: "cilium",
    repo: "cilium/cilium",
    pathToManifests: "pkg/k8s/apis/cilium.io/client/crds",
    // For some reason, the cilium repo has duplicate tags like "v1.10.0" and "1.10.0"
    filterTag: (tag: string) => !tag.startsWith("v"),
  },
];
