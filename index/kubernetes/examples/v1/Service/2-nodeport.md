---
title: Create a service of type NodePort
description: This service will expose pod's matching label app=my-app on port 30000 of each node.
---

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-nodeport-service
  namespace: default # Service is a namespaced resource
spec:
  type: NodePort
  selector:
    app: my-app
  ports:
    - port: 80 # the internal port of the service that can be reached from inside the cluster
      nodePort: 30000 # port that will be externally exposed on each node
      targetPort: 8080 # pod's port for internal routing
```
