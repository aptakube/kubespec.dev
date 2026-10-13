---
title: Create a RoleBinding named 'restricted-secret-reader'
description: In this example we are creating a RoleBinding that uses a globally declared ClusterRole. This lets the cluster admin to create a global cluster role policy yet restrict the service accounts to their namespace only. Refer to the associated ClusterRole `secret-reader` for the configuration to be complete.
---
```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: restricted-secret-reader
  namespace: test
roleRef:
  apiGroup: rbac.authorization.k8s.io
  name: secret-reader
  kind: ClusterRole
subjects:
  - kind: ServiceAccount
    name: test-sa
    namespace: test
```
