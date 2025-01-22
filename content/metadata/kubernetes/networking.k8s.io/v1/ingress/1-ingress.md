---
title: Expose your service running in GKE
description: Creates an external HTTPS Application Load Balancer (ALB) in GCP.
---

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: example-ingress
  namespace: public-api # Ingress is a namespaced resource
  annotations:
    kubernetes.io/ingress.class: "gce" # Required for GKE
    networking.gke.io/managed-certificates: "my-managed-cert" # Pre-created managed certificate
    kubernetes.io/ingress.global-static-ip-name: "my-static-ip" # Pre-created static IP
spec:
  defaultBackend:
    service:
      name: default-backend # Service object to route unmatched traffic to.
      port:
        number: 80
  rules:
  - host: example.com # Specify the host (domain)
    http:
      paths:
      - path: /v1
        pathType: Prefix # Prefix or Exact
        backend:
          service:
            name: my-service # Service object to route traffic to.
            port:
              number: 80
```
