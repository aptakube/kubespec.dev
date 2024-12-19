---
title: An example of PodDisruptionBudget using minAvailable
description: At least 4 pods matching label `app=pricing-calculator` should be available at any given time
---

```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: pdb-pricing-calculator
  namespace: pricing
spec:
  minAvailable: 4 # At least 4 pods should be available at any given time
  selector:
    matchLabels:
      app: pricing-calculator # The pods that this PDB will apply to
```
