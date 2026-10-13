---
title: Simple Validating Webhook Configuration
description: Configures a webhook to validate Pod specifications during creation.
---

```yaml
apiVersion: admissionregistration.k8s.io/v1
kind: ValidatingWebhookConfiguration
metadata:
  name: simple-validating-webhook
webhooks:
  - name: validate.webhook.k8s.io
    clientConfig:
      service:
        name: validate-webhook-service
        namespace: default
        path: /validate
    rules:
      - operations: ["CREATE"]
        apiGroups: [""]
        apiVersions: ["v1"]
        resources: ["pods"]
    admissionReviewVersions: ["v1"]
```

