---
title: Allow all ingress policy by default
description: This network policy explicitly allow all incoming connections to all pods in a namespace
---

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-all-ingress
  namespace: public-api # NetworkPolicy is namespaced resource
spec:
  podSelector: {}
  ingress:
    - {}
  policyTypes:
    - Ingress
```
