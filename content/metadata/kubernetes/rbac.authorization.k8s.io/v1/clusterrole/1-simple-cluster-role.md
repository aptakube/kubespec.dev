---
title: Create a simple Cluster Role named 'pod-reader-role-alice'
description: A simple ClusterRole that gives `read` access to secrets across the cluster. Refer to the associated role bindings `read-secrets-global` and/or `restricted-secret-reader` for the configuration to be complete
---

```yaml

apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: secret-reader # ClusterRoles are not namespaced
rules:
- apiGroups: [""]
  resources: ["secrets"]
  verbs: ["get", "watch", "list"]
  
```
