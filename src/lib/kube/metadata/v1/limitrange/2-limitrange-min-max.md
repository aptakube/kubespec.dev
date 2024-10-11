---
title: LimitRange to enforce default, minimum and maximum CPU and Memory limits
description: You may want to have constraints around CPU and Memory limits of your pods, in this example the LimitRange has a default, max and min values for CPU and Memory. These values apply to limits only, not requests
---

```yaml
apiVersion: v1
kind: LimitRange
metadata:
  name: minmax-cpu-memory
  namespace: payments # only pods in the payments namespace will be affected
spec:
  limits:
    - max: # pods in this namespace can't have limits higher than 1 CPU and 2Gi Memory
        cpu: '1'
        memory: 2Gi
      min: # pods in this namespace must have limits higher than 100m CPU and 512Mi Memory
        cpu: 100m
        memory: 512Mi
      default: # in case a pod doesn't specify a CPU or Memory limit, it will get this value
        cpu: 500m
        memory: 1Gi
      type: Container
```
