---
title: Create a ConfigMap with a few settings
description: A basic example of how to create a ConfigMap with a few application settings and a file.
---

```yaml
kind: ConfigMap
apiVersion: v1
metadata:
  name: example-configmap
  namespace: payments # ConfigMap is namespaced resource
data:
  database_max_conn: 20
  log_level: DEBUG

  notes.txt: |
    config maps can be mounted as files too
```
