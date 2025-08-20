export type ProjectDef = {
  name: string;
  slug: string;
  repo: string;
  pathToManifests?: string[];
  filterTag?: (tag: string) => boolean;
  mapTag?: (tag: string) => string;
};

export default [
  {
    name: "Kubernetes",
    slug: "kubernetes",
    logo: "https://avatars.githubusercontent.com/u/13629408?s=48&v=4",
    repo: "kubernetes/kubernetes",
    pathToManifests: ["api/openapi-spec/swagger.json"],
    // Ignore Kubernetes patch releases and older than v1.9
    filterTag: (tag: string) =>
      tag.endsWith(".0") && (tag.startsWith("v1.28") || tag.startsWith("v1.29") || tag.startsWith("v1.30") || tag.startsWith("v1.31") || tag.startsWith("v1.32")),
    // mapTag: (tag: string) => tag.substring(0, tag.length - 2),
  },
  {
    name: "Gateway API",
    slug: "gateway-api",
    logo: "https://avatars.githubusercontent.com/u/36015203?s=200&v=4",
    repo: "kubernetes-sigs/gateway-api",
    pathToManifests: ["config/crd/standard"],
    filterTag: (tag: string) => tag.startsWith("v1.2"),
  },
  {
    name: "Argo CD", //  // https://github.com/argoproj/argo-cd
    slug: "argo-cd",
    logo: "https://avatars.githubusercontent.com/u/30269780?s=200&v=4",
    repo: "argoproj/argo-cd",
    pathToManifests: ["manifests/crds"],
    filterTag: (tag: string) => tag === "v2.11.2",
  },
  {
    name: "Argo Workflows", // https://github.com/argoproj/argo-workflows
    slug: "argo-workflows",
    logo: "https://avatars.githubusercontent.com/u/30269780?s=200&v=4",
    repo: "argoproj/argo-workflows",
    pathToManifests: ["manifests/base/crds/full"],
    filterTag: (tag: string) => tag === "v3.6.10",
  },
  
  {
    name: "Argo Events", // https://github.com/argoproj/argo-events
    slug: "argo-events",
    logo: "https://avatars.githubusercontent.com/u/30269780?s=200&v=4",
    repo: "argoproj/argo-events",
    pathToManifests: ["manifests/base/crds"],
    filterTag: (tag: string) => tag === "v1.9.6",
  },
  // {
  //   name: "Argo Rollouts", // https://github.com/argoproj/argo-rollouts
  //   slug: "argo-rollouts",
  //   logo: "https://avatars.githubusercontent.com/u/30269780?s=200&v=4",
  //   repo: "argoproj/argo-rollouts",
  //   pathToManifests: ["manifests/crds"],
  //   filterTag: (tag: string) => 
  //     tag.startsWith("v1.7") && !tag.includes("stable") && !tag.includes("rc"),
  // },
  {
    name: "Prometheus Operator", // https://github.com/prometheus-operator/prometheus-operator + https://github.com/prometheus-operator/kube-prometheus
    slug: "prometheus-operator",
    logo: "https://avatars.githubusercontent.com/u/66682517?s=48&v=4",
    repo: "prometheus-operator/kube-prometheus",
    pathToManifests: [
      "manifests/setup/0alertmanagerConfigCustomResourceDefinition.yaml",
      "manifests/setup/0alertmanagerCustomResourceDefinition.yaml",
      "manifests/setup/0podmonitorCustomResourceDefinition.yaml",
      "manifests/setup/0probeCustomResourceDefinition.yaml",
      "manifests/setup/0prometheusCustomResourceDefinition.yaml",
      "manifests/setup/0prometheusagentCustomResourceDefinition.yaml",
      "manifests/setup/0prometheusruleCustomResourceDefinition.yaml",
      "manifests/setup/0scrapeconfigCustomResourceDefinition.yaml",
      "manifests/setup/0servicemonitorCustomResourceDefinition.yaml",
      "manifests/setup/0thanosrulerCustomResourceDefinition.yaml",
    ],
    // prometheus-operator
    // filterTag: (tag: string) => 
    //   tag.startsWith("v0.7") && tag.length >= 7,
    // kube-prometheus
    filterTag: (tag: string) => tag === "0.72.0",
  },
  {
    name: "Logging Operator", // https://github.com/kube-logging/logging-operator
    slug: "logging-operator",
    logo: "https://avatars.githubusercontent.com/u/124196698?s=48&v=4",
    repo: "kube-logging/logging-operator",
    pathToManifests: ["charts/logging-operator/crds"],
    filterTag: (tag: string) => tag === "4.5.1",
  },
  {
    name: "GCP Config Connector", // https://github.com/GoogleCloudPlatform/k8s-config-connector
    slug: "gcp-config-connector",
    logo: "https://avatars.githubusercontent.com/u/2810941?s=48&v=4",
    repo: "GoogleCloudPlatform/k8s-config-connector",
    pathToManifests: ["crds"],
    filterTag: (tag: string) => tag === "v1.128.0",
  },
  {
    name: "Strimzi Kafka Operator", // https://github.com/strimzi/strimzi-kafka-operator
    slug: "strimzi-kafka-operator",
    logo: "https://avatars.githubusercontent.com/u/34767428?s=48&v=4",
    repo: "strimzi/strimzi-kafka-operator",
    pathToManifests: ["helm-charts/helm3/strimzi-kafka-operator/crds"],
    filterTag: (tag: string) => tag === "v0.36.1"
  },
  {
    name: "rbac manager", // https://github.com/FairwindsOps/rbac-manager
    slug: "rbac-manager",
    logo: "https://avatars.githubusercontent.com/u/8583528?s=48&v=4",
    repo: "FairwindsOps/rbac-manager",
    pathToManifests: ["deploy/2_crd.yaml"],
    filterTag: (tag: string) => tag === "v1.9.0",
  },
  {
    name: "Vertical Pod Autoscaler", // https://github.com/kubernetes/autoscaler/tree/master/vertical-pod-autoscaler
    slug: "vpa",
    logo: "https://avatars.githubusercontent.com/u/13629408?s=48&v=4",
    repo: "kubernetes/autoscaler",
    pathToManifests: ["vertical-pod-autoscaler/deploy/vpa-v1-crd.yaml"],
    filterTag: (tag: string) => tag === "v1.2.1",
    mapTag: (tag: string) => tag.substring(tag.length - 5, tag.length),
  },
  {
    name: "Traefik", // https://github.com/traefik/traefik + https://github.com/traefik/traefik-helm-chart
    slug: "traefik",
    logo: "https://avatars.githubusercontent.com/u/14280338?s=48&v=4",
    repo: "traefik/traefik-helm-chart",
    pathToManifests: ["traefik-crds/crds-files/traefik"],
    // traefik
    // filterTag: (tag: string) => 
    //   !tag.startsWith("v0.") && !tag.startsWith("v1.") && !tag.startsWith("v2."),
    // traefik helm chart
    filterTag: (tag: string) => tag === "v34.0.0",
  },
  {
    name: "Keycloak Operator", // https://github.com/keycloak/keycloak + https://github.com/keycloak/keycloak-k8s-resources
    slug: "keycloak-operator",
    logo: "https://avatars.githubusercontent.com/u/4921466?s=48&v=4",
    repo: "keycloak/keycloak-k8s-resources",
    pathToManifests: ["kubernetes/keycloaks.k8s.keycloak.org-v1.yml", "kubernetes/keycloakrealmimports.k8s.keycloak.org-v1.yml"],
    filterTag: (tag: string) => tag === "v26.0.5",
  },
  // {
  //   name: "Grafana Operator", // https://github.com/grafana/grafana-operator
  //   slug: "grafana-operator",
  //   logo: "https://avatars.githubusercontent.com/u/7195757?s=48&v=4",
  //   repo: "grafana/grafana-operator",
  //   pathToManifests: ["deploy/kustomize/base/crds.yaml"],
  //   filterTag: (tag: string) => tag.startsWith("v5.16"),
  // },
  // {
  //   name: "MongoDB Community Operator", // https://github.com/mongodb/mongodb-kubernetes-operator
  //   slug: "mongodb-community-operator",
  //   logo: "https://avatars.githubusercontent.com/u/45120?s=48&v=4",
  //   repo: "mongodb/mongodb-kubernetes-operator",
  //   pathToManifests: ["config/crd/bases/mongodbcommunity.mongodb.com_mongodbcommunity.yaml"],
  //   filterTag: (tag: string) => tag.startsWith("v0.12"),
  // },
  // {
  //   name: "Cluster API",
  //   slug: "cluster-api",
  //   logo: "https://avatars.githubusercontent.com/u/36015203?s=200&v=4",
  //   repo: "kubernetes-sigs/cluster-api",
  //   pathToManifests: ["config/crd/bases"],
  //   filterTag: (tag: string) => tag.startsWith("v1.9"),
  // },
  // {
  //   name: "Istio",
  //   slug: "istio",
  //   logo: "https://avatars.githubusercontent.com/u/23534644?s=200&v=4",
  //   repo: "istio/istio",
  //   pathToManifests: [
  //     "install/kubernetes/helm/istio/templates/crds.yaml",
  //     "manifests/charts/base/files/gen-istio-cluster.yaml",
  //     "manifests/charts/base/crds/crd-all.gen.yaml",
  //     "manifests/charts/base/files/crd-all.gen.yaml",
  //   ],
  //   filterTag: (tag: string) => tag.startsWith("1.24"),
  // },
  // {
  //   name: "Keda",
  //   slug: "keda",
  //   logo: "https://avatars.githubusercontent.com/u/49917779?s=200&v=4",
  //   repo: "kedacore/keda",
  //   pathToManifests: ["deploy/crds", "config/crd/bases"],
  //   filterTag: (tag: string) => tag.startsWith("v2.16"),
  // },
  // {
  //   name: "CloudNativePG",
  //   slug: "cloudnative-pg",
  //   logo: "https://avatars.githubusercontent.com/u/100373852?s=200&v=4",
  //   repo: "cloudnative-pg/cloudnative-pg",
  //   pathToManifests: ["config/crd/bases"],
  //   filterTag: (tag: string) => tag.startsWith("v1.25"),
  // },
  // {
  //   name: "cert-manager",
  //   slug: "cert-manager",
  //   logo: "https://avatars.githubusercontent.com/u/39950598?s=200&v=4",
  //   repo: "cert-manager/cert-manager",
  //   pathToManifests: "cert-manager.yaml",
  //   filterTag: (tag: string) =>
  //     !tag.startsWith("cmd/ctl") && tag.startsWith("v1.16"),
  // },
  // {
  //   name: "Cilium",
  //   slug: "cilium",
  //   logo: "https://avatars.githubusercontent.com/u/21054566?s=200&v=4",
  //   repo: "cilium/cilium",
  //   pathToManifests: ["examples/crds", "pkg/k8s/apis/cilium.io/client/crds"],
  //   // For some reason, the cilium repo has duplicate tags like "v1.10.0" and "1.10.0"
  //   filterTag: (tag: string) =>
  //     !tag.startsWith("v") && tag.startsWith("1.16"),
  // },
];
