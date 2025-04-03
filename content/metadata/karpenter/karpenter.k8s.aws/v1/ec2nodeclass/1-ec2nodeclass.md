---
title: An EC2NodeClass using a pinned version of the Amazon Linux 2023 AMI
description: This EC2NodeClass will configure cluster node EC2 instances to use a specific AL2023 AMI version and associate them with tagged "cluster-private" subnet and "cluster-worker" security group.
---

```yaml
apiVersion: karpenter.k8s.aws/v1
kind: EC2NodeClass
metadata:
  name: private
spec:
  metadataOptions:
    # Set the hop limit to 2 to allow containers to contact the Instance Metadata
    # Service (IMDS) https://github.com/kubernetes-sigs/karpenter/issues/1769
    httpPutResponseHopLimit: 2
  blockDeviceMappings:
    # Use encrypted, gp3, 50Gi root volumes
    - deviceName: /dev/xvda
      ebs:
        volumeSize: 50Gi
        volumeType: gp3
        encrypted: true
  # Required: Use an specific Amazon Linux 2023 AMI release compatible with the instance type
  # https://github.com/awslabs/amazon-eks-ami/releases
  amiFamily: AL2023
  amiSelectorTerms:
    - alias: al2023@v20250317
  # IAM role name to use as the node role
  role: KarpenterNode
  # Don't associate a public IP address with the node, even if the subnet defaults to doing so
  associatePublicIPAddress: false
  subnetSelectorTerms:
    # Required: Launch nodes in subnets with the following tags
    - tags:
        karpenter.sh/discovery: cluster-private
        karpenter.sh/discovery/private: "true"
  securityGroupSelectorTerms:
    # Required: Launch nodes in security groups with the following tags
    - tags:
        karpenter.sh/discovery: cluster-worke
  tags:
    # Propagate AWS tags to the EC2 instances launched using this class
    karpenter.sh/discovery: cluster-private
```
