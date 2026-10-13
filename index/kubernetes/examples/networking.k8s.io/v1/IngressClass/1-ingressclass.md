---
title: IngressClass for Ingerss-NGINX controller
description: Creates an IngressClass for the Ingress-NGINX controller, setting it as the default IngressClass
---

```yaml
apiVersion: networking.k8s.io/v1
kind: IngressClass
metadata:
  labels:
    app.kubernetes.io/component: controller
  name: nginx-example
  annotations:
    ingressclass.kubernetes.io/is-default-class: "true"
spec:
  controller: k8s.io/ingress-nginx
```
