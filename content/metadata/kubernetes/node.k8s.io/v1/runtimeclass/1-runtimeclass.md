---
title: Simple RuntimeClass
description: Can be referenced in Deployment, StatefulSet, DaemonSet, Job, Pod etc.
---

```yaml
apiVersion: node.k8s.io/v1
kind: RuntimeClass
metadata:
  name: my-runtime-class
spec:
  runtimeHandler: runc # # This handler needs to be configured on the nodes.
```
