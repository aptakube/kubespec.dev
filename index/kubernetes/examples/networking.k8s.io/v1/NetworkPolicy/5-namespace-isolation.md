---
title: Isolate a namespace from other namespaces
description: This network policy disallows all ingress and egress traffic to and from all pods in a namespace
---

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: public-api # NetworkPolicy is a namespaced resource
spec:
  podSelector: {}
  policyTypes:
    - Ingress
    - Egress
```
