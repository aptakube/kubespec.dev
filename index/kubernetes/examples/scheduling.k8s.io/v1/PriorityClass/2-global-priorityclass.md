---
title: Global priority class
description: Used by all pods without an explicitly defined priority class.
---

```yaml
apiVersion: scheduling.k8s.io/v1
kind: PriorityClass
metadata:
  name: global-default
  annotations:
    description: "This is the global default priority class."
value: 1000
globalDefault: true
preemptionPolicy: PreemptLowerPriority
```
