---
title: Create a simple Cluster Role Binding named 'read-secrets-global'
description: In this example we are creating a ClusterRoleBinding that uses a globally declared ClusterRole. This lets the user Bob accesses secrets across the cluster. Refer to the associated ClusterRole `secret-reader` for the configuration to be complete.
---

```yaml

apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: read-secrets-global
subjects:
- kind: User
  name: Bob # Name is case sensitive
  apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: ClusterRole
  name: secret-reader
  apiGroup: rbac.authorization.k8s.io
  
```
