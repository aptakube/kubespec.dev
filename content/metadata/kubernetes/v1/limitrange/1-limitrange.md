---
title: A basic LimitRange to enforce use of CPU and Memory requests
description: It's a good practice to set CPU and Memory requests for each pod. You can use a LimitRange to enforce a minimum CPU and Memory request on all pods in a namespace that do not specify a CPU request.
---

```yaml
apiVersion: v1
kind: LimitRange
metadata:
  name: defaults-cpu-memory
  namespace: payments # only pods in the payments namespace will be affected
spec:
  limits:
    - defaultRequest: # pods without a CPU or Memory request defined in their spec will get this value
        cpu: 500m
        memory: 512Mi
      type: Container
```
