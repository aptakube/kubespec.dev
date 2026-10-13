---
title: Create a PersistentVolume that uses a custom StorageClass
description: PersistentVolume is a cluster-wide resource, so the PVs can be accessed from any namespace across the cluster. In this example, PV is created on the hostPath, it is not recommended for Production settings!
---

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv-example
spec:
  storageClassName: my-custom-storage-class # Reference a custom StorageClass. Omit line to use the default StorageClass
  accessModes:
    - ReadWriteOnce # ReadWriteOnce, ReadOnlyMany, ReadWriteMany
  capacity:
    storage: 15Gi
  hostPath:
    path: /etc/vol
```
