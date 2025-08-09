---
title: Simple Mutating Admission Policy
description: Configures a policy to automatically modify Pod specifications during creation.
---

```yaml
apiVersion: admissionregistration.k8s.io/v1alpha1
kind: MutatingAdmissionPolicy
metadata:
  name: simple-mutating-policy
spec:
  matchConstraints:
    resourceRules:
      - operations: ["CREATE"]
        apiGroups: [""]
        apiVersions: ["v1"]
        resources: ["pods"]
  reinvocationPolicy: IfNeeded
  mutations:
    - patchType: "ApplyConfiguration"
      applyConfiguration:
        expression: >
          Object{
            metadata: Object.metadata{
              labels: Object.metadata.labels{
                mutated: "true"
              }
            }
          }
```
