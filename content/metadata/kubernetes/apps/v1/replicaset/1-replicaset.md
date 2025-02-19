---
title: An NGINX ReplicaSet with 3 replicas
description: In this example the ReplicaSet will schedule 3 pods on the cluster. Note how the label `app:nginx` is used to match the pods to the ReplicaSet
---

```yaml
apiVersion: apps/v1
kind: ReplicaSet
metadata:
  name: nginx-replicaset
  namespace: shopping-cart # ReplicaSet is a namespaced resource
  labels:
    app: nginx
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.19.5
        ports:
        - containerPort: 80
```
