---
title: Allow all egress by default
description: This network policy explicitly allows all outgoing connections from pods in that namespace
---

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-all-egress
  namespace: public-api # NetworkPolicy is namespaced resource
spec:
  podSelector: {}
  egress:
    - {}
  policyTypes:
    - Egress
```
