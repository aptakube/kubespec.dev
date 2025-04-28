export type ProjectDef = {
  name: string;
  slug: string;
  repo: string;
  pathToManifests?: string[];
  releaseFileName?: string;
  filterTag?: (tag: string) => boolean;
  mapTag?: (tag: string) => string;
};

export default [
  {
    name: "Prometheus Operator",
    slug: "prometheus-operator",
    logo: "https://avatars.githubusercontent.com/u/66682517?s=200&v=4",
    repo: "prometheus-operator/prometheus-operator",
    pathToManifests: ["example/prometheus-operator-crd", "bundle.yaml"],
  },
  {
    name: "Kubernetes",
    slug: "kubernetes",
    logo: "https://avatars.githubusercontent.com/u/13629408?s=48&v=4",
    repo: "kubernetes/kubernetes",
    pathToManifests: ["api/openapi-spec/swagger.json"],
    // Ignore Kubernetes patch releases and older than v1.9
    filterTag: (tag: string) =>
      tag.length >= 7 && tag.endsWith(".0") && !tag.startsWith("v0."),
    mapTag: (tag: string) => tag.substring(0, tag.length - 2),
  },
  {
    name: "Gateway API",
    slug: "gateway-api",
    logo: "https://avatars.githubusercontent.com/u/36015203?s=200&v=4",
    repo: "kubernetes-sigs/gateway-api",
    pathToManifests: ["config/crd/standard"],
  },
  {
    name: "Cluster API",
    slug: "cluster-api",
    logo: "https://avatars.githubusercontent.com/u/36015203?s=200&v=4",
    repo: "kubernetes-sigs/cluster-api",
    pathToManifests: ["config/crd/bases"],
  },
  {
    name: "Istio",
    slug: "istio",
    logo: "https://avatars.githubusercontent.com/u/23534644?s=200&v=4",
    repo: "istio/istio",
    pathToManifests: [
      "install/kubernetes/helm/istio/templates/crds.yaml",
      "manifests/charts/base/files/gen-istio-cluster.yaml",
      "manifests/charts/base/crds/crd-all.gen.yaml",
      "manifests/charts/base/files/crd-all.gen.yaml",
    ],
  },
  {
    name: "Keda",
    slug: "keda",
    logo: "https://avatars.githubusercontent.com/u/49917779?s=200&v=4",
    repo: "kedacore/keda",
    pathToManifests: ["deploy/crds", "config/crd/bases"],
  },
  {
    name: "Kyverno",
    slug: "kyverno",
    logo: "https://avatars.githubusercontent.com/u/68448710?s=200&v=4",
    repo: "kyverno/kyverno",
    pathToManifests: ["definitions/crds", "config/crds"],
  },
  {
    name: "CloudNativePG",
    slug: "cloudnative-pg",
    logo: "https://avatars.githubusercontent.com/u/100373852?s=200&v=4",
    repo: "cloudnative-pg/cloudnative-pg",
    pathToManifests: ["config/crd/bases"],
  },
  {
    name: "cert-manager",
    slug: "cert-manager",
    logo: "https://avatars.githubusercontent.com/u/39950598?s=200&v=4",
    repo: "cert-manager/cert-manager",
    releaseFileName: "cert-manager.yaml",
    filterTag: (tag: string) => !tag.startsWith("cmd/ctl"),
  },
  {
    name: "Cilium",
    slug: "cilium",
    logo: "https://avatars.githubusercontent.com/u/21054566?s=200&v=4",
    repo: "cilium/cilium",
    pathToManifests: ["examples/crds", "pkg/k8s/apis/cilium.io/client/crds"],
    // For some reason, the cilium repo has duplicate tags like "v1.10.0" and "1.10.0"
    filterTag: (tag: string) => !tag.startsWith("v"),
  },
  {
    name: "Karpenter",
    slug: "karpenter",
    logo: "https://avatars.githubusercontent.com/u/2232217?s=200&v=4",
    repo: "aws/karpenter-provider-aws",
    pathToManifests: ["pkg/apis/crds"],
    filterTag: (tag: string) => !tag.startsWith("v0."),
  },
  {
    name: "eck-operator",
    slug: "eck-operator",
    logo: "https://avatars.githubusercontent.com/u/6764390?s=48&v=4",
    repo: "elastic/cloud-on-k8s",
    pathToManifests: ["config/crds"],
  },
  {
    name: "Agones",
    slug: "agones",
    logo: "https://github.com/googleforgames/agones/raw/main/docs/agones.png",
    repo: "googleforgames/agones",
    pathToManifests: ["install/yaml/install.yaml"],
    filterTag: (tag: string) => !tag.startsWith("v0."),
  },
];
