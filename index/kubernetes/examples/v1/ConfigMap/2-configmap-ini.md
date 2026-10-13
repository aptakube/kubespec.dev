---
title: Create a ConfigMap with an ini file content
description: Some apps might require an ini file (or json, toml, etc) to configure themselves. This example shows how to create a ConfigMap with an ini file content.
---

```yaml
kind: ConfigMap
apiVersion: v1
metadata:
  name: inifile-configmap
  namespace: payments # ConfigMap is a namespaced resource
data:
  # It's handy to have multiline content here and mount them as files in your containers
  config.ini: |
    [telemetry]
    enabled = false
    [log]
    level = debug
    [directories]
    data = /var/lib/data
    logs = /var/log/app
```
