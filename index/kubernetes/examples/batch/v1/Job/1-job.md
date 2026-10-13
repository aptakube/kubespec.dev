---
title: Create a Job
description: This example shows how to create a Job that prints a message to stdout.

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
      - name: hello-kube
        image: busybox
        command: ['echo', 'Hello from Kubernetes Job']
      restartPolicy: Never
```
