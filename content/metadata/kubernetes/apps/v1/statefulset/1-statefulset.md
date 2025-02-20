---
title: An NGINX statefulset with 3 replica's, a service and a volume
description: In this example the Statefulset will schedule 3 pods on the cluster, each mounting the same volume. Note that there's also a Service defined, as ReplicaSets require a service.
---

```yaml
apiVersion: v1
kind: Service
metadata:
  labels:
    app: nginx
    namespace: shopping-cart # StatefulSet is a namespaced resource, so we need to match it
  name: nginx
spec:
  ports:
  - port: 80
  selector:
    app: nginx
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: nginx-statefulset
  namespace: shopping-cart # StatefulSet is a namespaced resource
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  serviceName: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - image: nginx:1.19.5
        name: nginx
        ports:
        - containerPort: 80
        volumeMounts:
        - mountPath: /usr/share/nginx/html
          name: web-data
  volumeClaimTemplates:
  - metadata:
      name: web-data
    spec:
      accessModes:
      - ReadWriteOnce
      resources:
        requests:
          storage: 1Gi
```