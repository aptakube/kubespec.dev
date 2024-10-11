---
title: Create with labels and annotations
description: It's a good practice to add labels and annotations to your namespaces to help you organize resources in your cluster.
---

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: my-namespace # Replace with your namespace name
  labels:
    environment: production # In case you have multiple environments in your cluster
    app: my-app # Namespace per application is a good practice :)
  annotations:
    description: This namespace contains resources for my-app in production
    created-by: john.doe@example.com
```
