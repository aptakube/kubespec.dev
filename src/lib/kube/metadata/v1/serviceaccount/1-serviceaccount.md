---
title: The simplest ServiceAccount
description: All you need is a name and a namespace
---

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: my-app-service-account # just give it a name and then use it on your Pods/Deployments/etc
automountServiceAccountToken: false # you can opt out of the API credential automounting
```
