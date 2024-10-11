---
title: Create a CronJob that forbids concurrent runs and keeps 5 successful jobs
description: In this example the CronJob will run every 15 minutes on weekdays (Mon-Fri) and will run two containers. The CronJob is not allowed to run concurrently and will keep 5 successful jobs. Older successful jobs will be deleted automatically.
---

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: complex-cron-job
  namespace: checkout # CronJob is namespaced resource
spec:
  schedule: '*/15 * * * 1-5' # run every 15 minutes on weekdays (Mon-Fri)
  jobTemplate:
    spec:
      template:
        metadata:
          name: multi-container-job
        spec:
          containers:
            - name: container-1
              image: busybox
              command: ['echo', 'This is container 1']
            - name: container-2
              image: busybox
              command: ['echo', 'This is container 2']
          restartPolicy: OnFailure
  concurrencyPolicy: Forbid
  successfulJobsHistoryLimit: 5
```
