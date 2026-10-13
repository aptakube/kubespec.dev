---
title: A complex policy targeting specific pods and with multiple ingress and egress rules
description: This network policy controls ingress and egress traffic for pods with the label role=db in the public-api namespace. The policy allows traffic from pods within a specific CIDR, or pods with label role=frontend, or pods in namespaces with label project=myproject. The policy also allows traffic to CIDR 10.0.0.0/24 on port 5978.
---

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: test-network-policy
  namespace: public-api # NetworkPolicy is a namespaced resource
spec:
  podSelector:
    matchLabels:
      role: db
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - ipBlock:
            cidr: 172.17.0.0/16
            except:
              - 172.17.1.0/24
        - namespaceSelector:
            matchLabels:
              project: myproject
        - podSelector:
            matchLabels:
              role: frontend
      ports:
        - protocol: TCP
          port: 6379
  egress:
    - to:
        - ipBlock:
            cidr: 10.0.0.0/24
      ports:
        - protocol: TCP
          port: 5978
```
