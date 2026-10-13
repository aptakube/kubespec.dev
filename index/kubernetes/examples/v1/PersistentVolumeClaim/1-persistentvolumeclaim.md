---
title: Create a PersistentVolumeClaim that uses a custom StorageClass
description: Can be referenced in a Deployment, StatefulSet, CronJob, Pod, or other workloads.
---

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: pvc-example
  namespace: default # PersistentVolumeClaim is a namespaced resource
spec:
  storageClassName: my-custom-storage-class # Reference a custom StorageClass. Omit line to use the default StorageClass
  accessModes:
    - ReadWriteOnce # ReadWriteOnce, ReadOnlyMany, ReadWriteMany
  resources:
    requests:
      storage: 10Gi # Unit in Ti, Gi, Mi, etc.
```
