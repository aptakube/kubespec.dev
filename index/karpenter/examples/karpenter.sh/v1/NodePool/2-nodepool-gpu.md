---
title: A NodePool supporting GPU workloads
description: This NodePool will select from EC2 instances having NVIDIA GPUs and right-size cluster nodes based on workload requests (e.g., cores, memory, number of GPUs).
---

```yaml
apiVersion: karpenter.sh/v1
kind: NodePool
metadata:
  name: gpu
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
      # Never force replacement of nodes
      expireAfter: Never
      # Taint nodes so arbitrary workloads don't wind up provisioning expensive
      # GPU instances.
      taints:
        - effect: NoSchedule
          key: karpenter.sh/nodepool
          value: "gpu"
      requirements:
        # Only use instances with NVIDIA GPUs
        - key: karpenter.k8s.aws/instance-gpu-manufacturer
          operator: In
          values: ["nvidia"]
        # Only use on-demand instances in this pool
        - key: karpenter.sh/capacity-type
          operator: In
          values: ["on-demand"]
        # Only use Linux as the OS in this pool
        - key: kubernetes.io/os
          operator: In
          values: ["linux"]
```
