---
title: Create a RoleBinding named 'pod-reader-role-binding-alice'
description: A simple role binding that grants the permissions defined in a role (`pod-reader-role-alice`) to `Alice` in dev namespace. Refer to the associated Role example `pod-reader-role-alice` for the configuration to be complete.
---

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: pod-reader-role-binding-alice
  namespace: dev # RoleBinding is a namespaced resource
roleRef:
  apiGroup: rbac.authorization.k8s.io
  name: pod-reader-role-alice
  kind: Role
subjects:
  - kind: User
    name: Alice
    namespace: dev
```
