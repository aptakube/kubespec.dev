---
title: Create a RoleBinding named 'restricted-secret-reader'
description: In this example we are creating a RoleBinding that uses the Role `pod-reader-role-svc-acct` created under `test` namespace. However this RoleBinding gives access to service account `dev-sa` under `dev` namespace
---
```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: test-pod-reader-rb
  namespace: test
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: Role
  name: pod-reader-role-svc-acct
subjects:
  - apiGroup: ""
    kind: ServiceAccount
    name: dev-sa
    namespace: dev
```
