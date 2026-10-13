---
title: Validating Admission Policy Binding for Pod Label Enforcement
description: References ValidatingAdmissionPolicy example 1. to enforce label rules on Pods only within the specified namespace.
---

```yaml
apiVersion: admissionregistration.k8s.io/v1
kind: ValidatingAdmissionPolicyBinding
metadata:
  name: pod-label-enforcement-binding
spec:
  policyName: pod-label-enforcement-policy
  validationActions: [Deny]
  matchResources:
    namespaceSelector:
      matchLabels:
        environment: production
```
