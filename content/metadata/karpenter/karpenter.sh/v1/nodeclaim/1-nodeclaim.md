---
title: A NodeClaim created by Karpenter
description: This NodeClaim represents a m5a.large AWS EC2 instance serving as a cluster node provisioned by the Karpenter controller in a NodePool named "default" using a EC2NodeClass named "private."
---

```yaml
apiVersion: karpenter.sh/v1
kind: NodeClaim
metadata:
  annotations:
    compatibility.karpenter.k8s.aws/cluster-name-tagged: "true"
    karpenter.k8s.aws/ec2nodeclass-hash: "17027975244315209952"
    karpenter.k8s.aws/ec2nodeclass-hash-version: v4
    karpenter.k8s.aws/tagged: "true"
    karpenter.sh/nodepool-hash: "7192598826009892108"
    karpenter.sh/nodepool-hash-version: v3
  creationTimestamp: "2025-03-31T15:59:25Z"
  finalizers:
    - karpenter.sh/termination
  generateName: default-
  generation: 1
  labels:
    karpenter.k8s.aws/ec2nodeclass: private
    karpenter.k8s.aws/instance-category: m
    karpenter.k8s.aws/instance-cpu: "2"
    karpenter.k8s.aws/instance-cpu-manufacturer: amd
    karpenter.k8s.aws/instance-cpu-sustained-clock-speed-mhz: "2500"
    karpenter.k8s.aws/instance-ebs-bandwidth: "2880"
    karpenter.k8s.aws/instance-encryption-in-transit-supported: "false"
    karpenter.k8s.aws/instance-family: m5a
    karpenter.k8s.aws/instance-generation: "5"
    karpenter.k8s.aws/instance-hypervisor: nitro
    karpenter.k8s.aws/instance-memory: "8192"
    karpenter.k8s.aws/instance-network-bandwidth: "750"
    karpenter.k8s.aws/instance-size: large
    karpenter.sh/capacity-type: on-demand
    karpenter.sh/nodepool: default
    kubernetes.io/arch: amd64
    kubernetes.io/os: linux
    node.kubernetes.io/instance-type: m5a.large
    topology.k8s.aws/zone-id: use1-az2
    topology.kubernetes.io/region: us-east-1
    topology.kubernetes.io/zone: us-east-1b
  name: default-qmhg4
  ownerReferences:
    - apiVersion: karpenter.sh/v1
      blockOwnerDeletion: true
      kind: NodePool
      name: default
      uid: 1e1334cf-9696-406a-9a7f-e92780d6042b
  resourceVersion: "688079106"
  uid: e0d67077-3c60-4e1b-8c03-fe2a294485b5
spec:
  expireAfter: Never
  nodeClassRef:
    group: karpenter.k8s.aws
    kind: EC2NodeClass
    name: private
  requirements:
    - key: karpenter.sh/capacity-type
      operator: In
      values:
        - on-demand
    - key: topology.kubernetes.io/zone
      operator: In
      values:
        - us-east-1b
    - key: karpenter.k8s.aws/ec2nodeclass
      operator: In
      values:
        - private
    - key: node.kubernetes.io/instance-type
      operator: In
      values:
        - c3.xlarge
        - c4.xlarge
        - c5.xlarge
        - c5a.xlarge
        - c5ad.xlarge
        - c5d.xlarge
        - c5n.large
        - c5n.xlarge
        - c6a.xlarge
        - c6i.xlarge
        - c6id.xlarge
        - c6in.xlarge
        - c7a.xlarge
        - c7i-flex.xlarge
        - c7i.xlarge
        - m3.large
        - m4.large
        - m4.xlarge
        - m5.large
        - m5.xlarge
        - m5a.large
        - m5a.xlarge
        - m5ad.large
        - m5ad.xlarge
        - m5d.large
        - m5d.xlarge
        - m5dn.large
        - m5n.large
        - m5zn.large
        - m6a.large
        - m6a.xlarge
        - m6i.large
        - m6i.xlarge
        - m6id.large
        - m6idn.large
        - m6in.large
        - m7a.large
        - m7i-flex.large
        - m7i-flex.xlarge
        - m7i.large
        - m7i.xlarge
        - r3.large
        - r4.large
        - r5.large
        - r5a.large
        - r5a.xlarge
        - r5ad.large
        - r5b.large
        - r5d.large
        - r5dn.large
        - r5n.large
        - r6a.large
        - r6a.xlarge
        - r6i.large
        - r6id.large
        - r6idn.large
        - r6in.large
        - r7a.large
        - r7i.large
        - r7iz.large
    - key: kubernetes.io/os
      operator: In
      values:
        - linux
    - key: karpenter.k8s.aws/instance-category
      operator: In
      values:
        - c
        - m
        - r
    - key: kubernetes.io/arch
      operator: In
      values:
        - amd64
    - key: karpenter.sh/nodepool
      operator: In
      values:
        - default
    - key: karpenter.k8s.aws/instance-generation
      operator: Gt
      values:
        - "2"
  resources:
    requests:
      cpu: 885m
      memory: 4288Mi
      pods: "13"
```
