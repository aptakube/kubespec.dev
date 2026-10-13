---
title: Create a pod named 'sleep'
description: A simple pod with a single that sleeps for 3600 seconds, useful for shelling into and test connectivity
---

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: sleep
  namespace: default # Pod is a namespaced a resource
spec:
  containers:
    - name: pods-sleep
      image: busybox
      command:
        - sleep
        - '3600'
```
