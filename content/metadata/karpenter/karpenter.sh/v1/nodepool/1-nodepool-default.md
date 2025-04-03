---
title: A NodePool supporting typical cluster workloads
description: This NodePool will select from standard EC2 instance types to right-size cluster nodes based on workload requests (e.g., cores, memory, CPU architecture).
---

```yaml
apiVersion: karpenter.sh/v1
kind: NodePool
metadata:
  name: default
spec:
  # Constrain the maximum size of the node pool
  limits:
    cpu: 256
    memory: 1024Gi
  disruption:
    # Allow Karpenter to consolidate nodes when they are empty or underutilized
    consolidationPolicy: WhenEmptyOrUnderutilized
    consolidateAfter: 5m
    budgets:
      # Allow voluntary disruptions to 5% of the nodes in the pool for any reason
      - nodes: "5%"
  template:
    spec:
      # Use the EC2NodeClass named "private" as the node template in this pool
      nodeClassRef:
        group: karpenter.k8s.aws
        kind: EC2NodeClass
        name: private
      # Force node replacement after about a month
      expireAfter: 720h
      requirements:
        # Select from standard instance families (compute, general, memory)
        - key: karpenter.k8s.aws/instance-category
          operator: In
          values: ["c", "m", "r"]
        # Only choose instances greater than this generation
        - key: karpenter.k8s.aws/instance-generation
          operator: Gt
          values: ["2"]
        # Only use on-demand instances in this pool
        - key: karpenter.sh/capacity-type
          operator: In
          values: ["on-demand"]
        - key: kubernetes.io/arch
          operator: In
          # Allow AMD64 and ARM64 (e.g., Graviton) proceseors
          values: ["amd64", "arm64"]
        # Only use Linux as the OS in this pool
        - key: kubernetes.io/os
          operator: In
          values: ["linux"]
```
