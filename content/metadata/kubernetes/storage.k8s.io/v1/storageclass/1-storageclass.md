---
title: Create a custom StorageClass for GKE, setting a few options.
description: Can be referenced in a PersistentVolumeClaim or StatefulSet.
---

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: my-custom-storage-class
  annotations:
    storageclass.kubernetes.io/is-default-class: "false"
provisioner: pd.csi.storage.gke.io # replacement for kubernetes.io/gce-pd
parameters:
  type: pd-ssd # pd-ssd, pd-standard, or pd-balanced
  replication-type: none # zonal, regional-pd for regional replication
reclaimPolicy: Retain # Retain, Delete, or Recycle
```

