---
title: An NGINX deployment with 3 replicas
description: In this example the Deployment will schedule 3 pods on the cluster. Note how the label `app:nginx` is used to match the pods to the Deployment
---

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
  namespace: shopping-cart # Deployment is namespaced resource
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
