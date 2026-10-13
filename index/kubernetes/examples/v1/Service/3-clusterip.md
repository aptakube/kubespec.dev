---
title: Create a service of type ClusterIP
description: This service will expose pod's matching label app=my-app internally to the cluster on port 80.
---

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-clusterip-service
  namespace: default # Service is a namespaced resource
spec:
  type: ClusterIP # this is the default, but it's good to be explicit!
  selector:
    app: my-app
  ports:
    - port: 80 # the internal port of the service that can be reached from inside the cluster
      targetPort: 8080 # pod's port for internal routing
```
