---
title: An example of PodDisruptionBudget using maxUnavailable
description: 20% of the pods matching label `app=pricing-calculator` can be unavailable at any given time
---

```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: pdb-pricing-calculator
  namespace: pricing
spec:
  maxUnavailable: '20%' # 20% of the pods can be unavailable at any given time
  selector:
    matchLabels:
      app: pricing-calculator # The pods that this PDB will apply to
```
