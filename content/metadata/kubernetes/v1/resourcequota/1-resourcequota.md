---
title: A basic ResourceQuota to enforce use of CPU and Memory request on namespace level
description: A ResourceQuota defines the CPU and Memory requests of a whole namespace (compared to LimitRange which sets it on pod/container level).
---

```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: payments-quota
  namespace: payments # only pods in the payments namespace will be affected
spec:
  hard:
    requests.cpu: 500m
    requests.memory: 512Mi
```
