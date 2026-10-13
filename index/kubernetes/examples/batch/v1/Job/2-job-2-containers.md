---
title: Create a Job that forbids concurrent runs
description: In this example the Job will run two containers. The Job is not allowed to run concurrently.
---

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: hello-kube
  namespace: checkout # Job is a namespaced resource
spec:
  template:
    spec:
      containers:
      - name: container-1
        image: busybox
        command: ['echo', 'This is container 1']
      - name: container-2
        image: busybox
        command: ['echo', 'This is container 2']
      restartPolicy: Never
  parallelism: 1
```
