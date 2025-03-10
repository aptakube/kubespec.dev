---
title: Create a Role named 'pod-reader-role-svc-acct'
description: A simple Role that gives read permissions on all pods in `test` namespace. Refer to the associated RoleBinding example `pod-reader-role-binding-svc-acct` for the configuration to be complete.
---
```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: pod-reader-role-svc-acct
  namespace: test
rules:
  - apiGroups: ["*"]
    resources: ["pods"]
    verbs: ["get", "list", "watch"]
  
```