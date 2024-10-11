---
title: Deny all egress by default
description: This network policy denies egress traffic from all pods in a namespace
---

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-egress
  namespace: public-api # NetworkPolicy is namespaced resource
spec:
  podSelector: {}
  policyTypes:
    - Egress
```
