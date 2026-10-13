---
title: Simple Mutating Webhook Configuration
description: Configures a webhook to automatically modify Pod specifications during creation.
---

```yaml
apiVersion: admissionregistration.k8s.io/v1
kind: MutatingWebhookConfiguration
metadata:
  name: simple-mutating-webhook
webhooks:
  - name: simple.webhook.k8s.io
    clientConfig:
      service:
        name: simple-webhook-service
        namespace: default
        path: /mutate
    rules:
      - operations: ["CREATE"]
        apiGroups: [""]
        apiVersions: ["v1"]
        resources: ["pods"]
    admissionReviewVersions: ["v1"]
```
