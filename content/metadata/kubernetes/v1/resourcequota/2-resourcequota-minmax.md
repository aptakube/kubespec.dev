---
title: A ResourceQuota to enforce a minimum and maximum CPU and Memory usage on namespace level
description: A ResourceQuota defines the CPU and Memory requests of a whole namespace (compared to LimitRange which sets it on pod/container level). This example enforces a request & limit on namespace level, ensuring that there is a minimum amount of CPU and Memory available, while also setting a maximum CPU and Memory usage.
---

```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: payments-quota
  namespace: payments # only pods in the payments namespace will be affected
spec:
  hard:
    limits.cpu: "1"
    limits.memory: "2Gi"
    requests.cpu: "100m"
    requests.memory: "512Mi"
```
