---
title: An Horizontal Pod Autoscaler to automatically scale based on CPU and Memory
description: This HPA will automatically scale the deployment my-app-deployment from 1 to 4 replicas based on the CPU and Memory usage
---

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: my-app-hpa
  namespace: default # HorizontalPodAutoscaler is a namespaced resource
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: my-app-deployment
  minReplicas: 1
  maxReplicas: 4
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 50
    - type: Resource
      resource:
        name: memory
        target:
          type: AverageValue
          averageValue: 400Mi
```
