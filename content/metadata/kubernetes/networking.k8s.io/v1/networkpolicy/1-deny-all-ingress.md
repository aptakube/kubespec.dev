---
title: Deny all ingress by default
description: This network policy denies ingress traffic to all pods in a namespace
---

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-ingress
  namespace: public-api # NetworkPolicy is namespaced resource
spec:
  podSelector: {}
  policyTypes:
    - Ingress
```
