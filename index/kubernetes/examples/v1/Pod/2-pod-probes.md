---
title: NGINX with liveness probe
description: This pod starts a NGINX container and adds a liveness probe to it, with some custom timeout values
---

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx-pod
  namespace: default # Pod is a namespaced a resource
spec:
  containers:
    - name: nginx
      image: nginx:latest
      livenessProbe: # A liveness probe checks if the container is running
        httpGet:
          path: /
          port: 80
        initialDelaySeconds: 15
        periodSeconds: 10
        timeoutSeconds: 5
        successThreshold: 1
        failureThreshold: 3
```
