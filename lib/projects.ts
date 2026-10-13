export type ProjectDef = {
  name: string;
  slug: string;
  repo: string;
  logo: string;
  // files or directories (searched recursively) in the repo that contain the specs
  pathToManifests?: string[];
  // or a file attached to each GitHub release, e.g. "cert-manager.yaml"
  releaseFileName?: string;
  // return false to skip a tag
  filterTag?: (tag: string) => boolean;
  // maps a git tag to the version displayed on the website
  mapTag?: (tag: string) => string;
};

// stable releases only: "v1.2.3", without pre-release or build suffixes
const vSemver = (tag: string) => /^v\d+\.\d+\.\d+$/.test(tag);
// the same, for projects that tag without the "v": "1.2.3"
const semver = (tag: string) => /^\d+\.\d+\.\d+$/.test(tag);

export const projects: ProjectDef[] = [
  {
    name: "Kubernetes",
    slug: "kubernetes",
    logo: "https://avatars.githubusercontent.com/u/13629408?s=48&v=4",
    repo: "kubernetes/kubernetes",
    pathToManifests: ["api/openapi-spec/swagger.json"],
    // Ignore Kubernetes patch releases and anything older than v1.10
    filterTag: (tag) => /^v1\.\d+\.0$/.test(tag) && Number(tag.split(".")[1]) >= 10,
    mapTag: (tag) => tag.substring(0, tag.length - 2),
  },
  {
    name: "Prometheus Operator",
    slug: "prometheus-operator",
    logo: "https://avatars.githubusercontent.com/u/66682517?s=200&v=4",
    repo: "prometheus-operator/prometheus-operator",
    pathToManifests: ["example/prometheus-operator-crd", "bundle.yaml"],
    filterTag: vSemver,
  },
  {
    name: "Gateway API",
    slug: "gateway-api",
    logo: "https://avatars.githubusercontent.com/u/36015203?s=200&v=4",
    repo: "kubernetes-sigs/gateway-api",
    pathToManifests: ["config/crd/standard"],
    filterTag: vSemver,
  },
  {
    name: "Cluster API",
    slug: "cluster-api",
    logo: "https://avatars.githubusercontent.com/u/36015203?s=200&v=4",
    repo: "kubernetes-sigs/cluster-api",
    pathToManifests: ["config/crd/bases"],
    filterTag: vSemver,
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
    filterTag: semver,
  },
  {
    name: "Keda",
    slug: "keda",
    logo: "https://avatars.githubusercontent.com/u/49917779?s=200&v=4",
    repo: "kedacore/keda",
    pathToManifests: ["deploy/crds", "config/crd/bases"],
    filterTag: vSemver,
  },
  {
    name: "Kyverno",
    slug: "kyverno",
    logo: "https://avatars.githubusercontent.com/u/68448710?s=200&v=4",
    repo: "kyverno/kyverno",
    pathToManifests: ["definitions/crds", "config/crds"],
    filterTag: vSemver,
  },
  {
    name: "CloudNativePG",
    slug: "cloudnative-pg",
    logo: "https://avatars.githubusercontent.com/u/100373852?s=200&v=4",
    repo: "cloudnative-pg/cloudnative-pg",
    pathToManifests: ["config/crd/bases"],
    filterTag: vSemver,
  },
  {
    name: "cert-manager",
    slug: "cert-manager",
    logo: "https://avatars.githubusercontent.com/u/39950598?s=200&v=4",
    repo: "cert-manager/cert-manager",
    releaseFileName: "cert-manager.yaml",
    filterTag: vSemver,
  },
  {
    name: "Cilium",
    slug: "cilium",
    logo: "https://avatars.githubusercontent.com/u/21054566?s=200&v=4",
    repo: "cilium/cilium",
    pathToManifests: ["examples/crds", "pkg/k8s/apis/cilium.io/client/crds"],
    // the repo has duplicate tags like "v1.10.0" and "1.10.0"
    filterTag: semver,
  },
  {
    name: "Karpenter",
    slug: "karpenter",
    logo: "https://avatars.githubusercontent.com/u/2232217?s=200&v=4",
    repo: "aws/karpenter-provider-aws",
    pathToManifests: ["pkg/apis/crds"],
    filterTag: vSemver,
  },
  {
    name: "eck-operator",
    slug: "eck-operator",
    logo: "https://avatars.githubusercontent.com/u/6764390?s=48&v=4",
    repo: "elastic/cloud-on-k8s",
    pathToManifests: ["config/crds"],
    // tags before v2.7.0 have no "v"
    filterTag: (tag) => vSemver(tag) || semver(tag),
  },
  {
    name: "k6 Operator",
    slug: "k6-operator",
    logo: "https://avatars.githubusercontent.com/u/7195757?s=48&v=4",
    repo: "grafana/k6-operator",
    pathToManifests: ["config/crd/bases"],
    filterTag: vSemver,
  },
  {
    name: "Couchbase Operator",
    slug: "couchbase-operator",
    logo: "https://avatars.githubusercontent.com/u/636956?s=48&v=4",
    // the operator repo doesn't have the CRDs, but its helm chart does
    repo: "couchbase-partners/helm-charts",
    pathToManifests: ["charts/couchbase-operator/crds"],
    // chart "2.93.0" ships operator 2.9.3; later chart patches are re-releases of the same operator version
    filterTag: (tag) => /^couchbase-operator-\d+\.\d\d\.0$/.test(tag),
    mapTag: (tag) => tag.replace(/^couchbase-operator-(\d+)\.(\d)(\d)\.0$/, "$1.$2.$3"),
  },
  {
    name: "Kgateway",
    slug: "kgateway",
    logo: "https://avatars.githubusercontent.com/u/186092512?s=48&v=4",
    repo: "kgateway-dev/kgateway",
    pathToManifests: ["install/helm/kgateway-crds/templates"],
    filterTag: vSemver,
  },
  {
    name: "ArgoCD",
    slug: "argo-cd",
    logo: "https://avatars.githubusercontent.com/u/30269780?s=48&v=4",
    repo: "argoproj/argo-cd",
    pathToManifests: ["manifests/crds"],
    filterTag: vSemver,
  },
  {
    name: "Flux",
    slug: "flux",
    logo: "https://avatars.githubusercontent.com/u/52158677?s=48&v=4",
    repo: "fluxcd/flux2",
    // the CRDs live in each controller's repo, but every release bundles them in one file
    releaseFileName: "install.yaml",
    filterTag: vSemver,
  },
  {
    name: "Vertical Pod Autoscaler",
    slug: "vertical-pod-autoscaler",
    logo: "https://avatars.githubusercontent.com/u/13629408?s=48&v=4",
    repo: "kubernetes/autoscaler",
    pathToManifests: ["vertical-pod-autoscaler/charts/vertical-pod-autoscaler/crds"],
    filterTag: (tag) => /^vertical-pod-autoscaler-chart-\d+\.\d+\.\d+$/.test(tag),
    mapTag: (tag) => tag.replace("vertical-pod-autoscaler-chart-", ""),
  },
  {
    name: "Kuberay",
    slug: "kuberay",
    logo: "https://avatars.githubusercontent.com/u/22125274?s=48&v=4",
    repo: "ray-project/kuberay",
    pathToManifests: ["ray-operator/config/crd/bases"],
    filterTag: vSemver,
  },
  {
    name: "External Secrets Operator",
    slug: "external-secrets-operator",
    logo: "https://avatars.githubusercontent.com/u/68335991?s=48&v=4",
    repo: "external-secrets/external-secrets",
    pathToManifests: ["deploy/crds"],
    filterTag: vSemver,
  },
  {
    name: "OpenTelemetry Operator",
    slug: "opentelemetry-operator",
    logo: "https://avatars.githubusercontent.com/u/49998002?s=48&v=4",
    repo: "open-telemetry/opentelemetry-operator",
    pathToManifests: ["config/crd/bases"],
    filterTag: vSemver,
  },
  {
    name: "Envoy Gateway",
    slug: "envoy-gateway",
    logo: "https://avatars.githubusercontent.com/u/30125649?s=48&v=4",
    repo: "envoyproxy/gateway",
    pathToManifests: ["charts/gateway-helm/charts/crds/crds/generated"],
    filterTag: vSemver,
  },
  {
    name: "Tailscale Operator",
    slug: "tailscale-operator",
    logo: "https://avatars.githubusercontent.com/u/48932923?s=48&v=4",
    repo: "tailscale/tailscale",
    pathToManifests: ["cmd/k8s-operator/deploy/crds"],
    filterTag: vSemver,
  },
  {
    name: "Agentgateway",
    slug: "agentgateway",
    logo: "https://avatars.githubusercontent.com/u/208695296?s=48&v=4",
    repo: "agentgateway/agentgateway",
    pathToManifests: ["controller/install/helm/agentgateway-crds/templates"],
    filterTag: vSemver,
  },
  {
    name: "Kargo",
    slug: "kargo",
    logo: "https://avatars.githubusercontent.com/u/84434210?s=48&v=4",
    repo: "akuity/kargo",
    pathToManifests: ["charts/kargo/resources/crds"],
    filterTag: vSemver,
  },
  {
    name: "Grafana Operator",
    slug: "grafana-operator",
    logo: "https://avatars.githubusercontent.com/u/7195757?s=48&v=4",
    repo: "grafana/grafana-operator",
    pathToManifests: ["deploy/helm/grafana-operator/files/crds"],
    filterTag: vSemver,
  },
];
