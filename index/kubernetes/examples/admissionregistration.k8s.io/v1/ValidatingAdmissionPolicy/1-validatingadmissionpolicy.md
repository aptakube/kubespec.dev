---
title: Validating Admission Policy for Pod Label Enforcement
description: Must be referenced by a ValidatingAdmissionPolicyBinding to have effect.
---

```yaml
apiVersion: admissionregistration.k8s.io/v1
kind: ValidatingAdmissionPolicy
metadata:
  name: pod-label-enforcement-policy
spec:
  matchConstraints:
    resourceRules:
      - apiGroups: [""]
        apiVersions: ["v1"]
        resources: ["pods"]
        operations: ["CREATE", "UPDATE"]
  validations:
    - expression: "object.metadata.labels['environment'] == 'production'"
      message: "Pods must have the label 'environment' set to 'production'."
```
