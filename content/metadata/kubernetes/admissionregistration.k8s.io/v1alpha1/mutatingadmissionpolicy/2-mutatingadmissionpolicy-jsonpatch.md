---
title: Mutating Admission Policy using JSONPatch
description: Configures a policy to automatically modify Pod specifications during creation, but this time using JSONPatch.
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
    - patchType: "JSONPatch"
      jsonPatch:
        expression: >
          [
            JSONPatch{
              op: "add", path: "/metadata/labels/mutated",
              value: "true"
            }
          ]
```
