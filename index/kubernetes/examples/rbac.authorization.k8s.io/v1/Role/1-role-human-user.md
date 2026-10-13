---
title: Create a Role named 'pod-reader-role-alice'
description: A simple Role that gives read permissions for a human user `Alice` on all pods in dev namespace. Refer to the associated RoleBinding example `pod-reader-role-binding-alice` for the configuration to be complete.
---

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: pod-reader-role-alice
  namespace: dev # Role is a namespaced a resource
rules:
  - apiGroups: [""]
    resources: ["pods"]
    verbs: ["get", "list", "watch"]
  
```
