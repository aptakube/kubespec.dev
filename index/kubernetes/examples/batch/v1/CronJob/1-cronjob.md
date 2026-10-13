---
title: Create a CronJob that runs every daily
description: This example shows how to create a CronJob that runs every day at midnight and prints a message to stdout.
---

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: hello-kube
  namespace: checkout # CronJob is a namespaced resource
spec:
  schedule: '0 0 * * *' # run every day at midnight
  jobTemplate:
    spec:
      template:
        metadata:
          name: hello-kube-job
        spec:
          containers:
            - name: hello-kube
              image: busybox
              command: ['echo', 'Hello from Kubernetes CronJob']
```
