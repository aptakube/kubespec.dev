---
title: Argo CD Application
description: This example shows how to create an Application with auto-sync enabled.
---

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: hello-kube
  labels:
    key: value
  annotations:
    argocd.argoproj.io/sync-wave: "1"
spec:
  project: production
  source:
    repoURL: https://git-provider.com/hello-kube
    targetRevision: main
    path: path/to/hello-kube/yaml/manifests
  destination:
    name: production
    namespace: hello-ns
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=false
      - ApplyOutOfSyncOnly=true
      - PrunePropagationPolicy=foreground
      - PruneLast=true
      - FailOnSharedResource=true
    retry:
      limit: 5
      backoff:
        duration: 5s
        factor: 2
        maxDuration: 5m
```
