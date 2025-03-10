---
title: Create a RoleBinding named 'pod-reader-role-binding-svc-acct'
description: A simple role binding that grants the permissions defined in a role `pod-reader-role-svc-acct` to service account `test-sa` in `test` namespace. Refer to the associated Role example `pod-reader-role-svc-acct` for the configuration to be complete
---
```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: pod-reader-role-binding-svc-acct
  namespace: test
roleRef:
  apiGroup: rbac.authorization.k8s.io
  name: pod-reader-role-svc-acct
  kind: Role
subjects:
  - kind: ServiceAccount
    name: test-sa
    namespace: test
```
