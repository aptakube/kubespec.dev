---
title: A DaemonSet that does not run on control plane nodes
description: In this example the DaemonSet will only schedule pods on worker nodes. Pods will also have resource requests and limits set.
---

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: fluentd-elasticsearch
  namespace: monitoring # DaemonSet is namespaced resource
spec:
  selector:
    matchLabels:
      name: fluentd-elasticsearch
  template:
    metadata:
      labels:
        name: fluentd-elasticsearch
    spec:
      containers:
        - name: fluentd-elasticsearch
          image: quay.io/fluentd_elasticsearch/fluentd:v2.5.2
          resources:
            requests:
              cpu: 100m
              memory: 200Mi
            limits:
              cpu: 2000m
              memory: 2Gi
```
