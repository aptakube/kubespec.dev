---
title: Create a Secret with a connection string to Postgres
description: A basic example of how to create a Secret with a connection string to Postgres
---

```yaml
kind: Secret
apiVersion: v1
metadata:
  name: database-connection
data:
  # this value is base64 encoded, actual content is postgres://postgres:123456@127.0.0.1:5432/dummy
  DATABASE_URL: cG9zdGdyZXM6Ly9wb3N0Z3JlczoxMjM0NTZAMTI3LjAuMC4xOjU0MzIvZHVtbXk=
```
