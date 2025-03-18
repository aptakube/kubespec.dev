---
title: High value priority class
description: Can be referenced in Deployment, StatefulSet, DaemonSet, Job, Pod etc.
---

```yaml
apiVersion: scheduling.k8s.io/v1
kind: PriorityClass
metadata:
  name: high-critical
  labels:
    team: core-infra
    environment: production
  annotations:
    description: "Priority class for critical system and infrastructure pods."
value: 1000000
globalDefault: false
preemptionPolicy: PreemptLowerPriority # or Never
```
