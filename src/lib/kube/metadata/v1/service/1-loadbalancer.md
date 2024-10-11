---
title: Create a service of type LoadBalancer
description: This service will expose pod's matching label app=my-app on a public Load Balancer via ports 80 and 443. This example assumes the my-app pods are listening on port 8080 and 8443 respectively.
---

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-loadbalancer-service
  namespace: default # Service is a namespaced resource
spec:
  type: LoadBalancer
  selector:
    app: my-app
  ports:
    - port: 80 # port that will be externally exposed on the load balancer
      targetPort: 8080 # pod's port for internal routing
    - port: 443 # port that will be externally exposed on the load balancer
      targetPort: 8443 # pod's port for internal routing
```
