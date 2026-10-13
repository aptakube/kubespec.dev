---
title: An NGINX deployment with 3 replicas and CPU/Memory requests/limits
description: These 3 replicas will be scheduled on the cluster with CPU/Memory requests/limits
---

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
  namespace: shopping-cart # Deployment is a namespaced resource
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
          resources:
            requests:
              cpu: 100m
              memory: 200Mi
            limits:
              cpu: 2000m
              memory: 2Gi
```
