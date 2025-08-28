---
title: Simple Mutating Admission Policy Binding
description: Binds a policy to namespaces with a specific label.
---

```yaml
apiVersion: admissionregistration.k8s.io/v1beta1
kind: MutatingAdmissionPolicyBinding
metadata:
  name: simple-mutating-policy-binding
spec:
  policyName: simple-mutating-policy
  matchResources:
    namespaceSelector:
      matchLabels:
        environment: test
```
