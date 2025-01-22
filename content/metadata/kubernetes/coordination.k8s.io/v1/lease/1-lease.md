---
title: Create a lease used to mark deployment is locked
description: Must be checked by other components of your CI/CD, doesn't do anything standalone.
---

```yaml
apiVersion: coordination.k8s.io/v1
kind: Lease
metadata:
  name: some-component-deployment-lock
  namespace: default # Lease is a namespaced resource
spec:
  holderIdentity: locking-person-name
```
