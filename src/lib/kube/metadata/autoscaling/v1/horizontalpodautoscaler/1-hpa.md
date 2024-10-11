---
title: An Horizontal Pod Autoscaler to automatically scale based on CPU
description: This HPA will automatically scale the deployment my-app-deployment from 1 to 10 replicas based on the CPU usage
---

```yaml
apiVersion: autoscaling/v1
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
  maxReplicas: 10
  targetCPUUtilizationPercentage: 50
```
