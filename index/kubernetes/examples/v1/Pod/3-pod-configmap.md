---
title: Pod with environment variables from a ConfigMap
description: All the environment variables in the pod will be sourced from the ConfigMap
---

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-pod
  namespace: default # Pod is a namespaced a resource
spec:
  containers:
    - name: sample
      image: hellokube
      envFrom:
        - configMapRef:
            name: my-configmap # The name of the ConfigMap, which must be in the same namespace as the pod
```
