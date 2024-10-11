---
title: A deployment with 2 containers in each pod
description: In this example each pod (3 replicas) will have 2 containers. One for the frontend and one for the backend. The frontend container is the only one that exposes a port, but the frontend container can still talk to the backend container through `localhost`.
---

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: fullstack-deployment
  namespace: shopping-cart # Deployment is namespaced resource
  labels:
    app: fullstack
spec:
  replicas: 3
  selector:
    matchLabels:
      app: fullstack
  template:
    metadata:
      labels:
        app: fullstack
    spec:
      containers:
        - name: frontend
          image: yourregistry/frontend:1.0
          ports:
            - containerPort: 80
        - name: backend
          image: yourregistry/backend:1.0
```
