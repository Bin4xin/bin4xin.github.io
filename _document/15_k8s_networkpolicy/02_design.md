---
layout: document
title: "NetworkPolicy策略设计与部署"
short_title: "策略设计"
order: 2
icon: "fas fa-cubes"
status: "stable"
tags: [Kubernetes, NetworkPolicy, 零信任, 微隔离, 云原生安全]
author: sentryCyberSec
version: "3.0"
description: "Kubernetes网络策略精细化隔离技战法，涵盖集群通信梳理分析、NetworkPolicy策略设计部署和验证测试与持续维护三个阶段。"
---
## 场景 3 — 阶段二：NetworkPolicy 策略设计与部署

### 策略设计原则

| 原则 | 说明 |
|------|------|
| 默认拒绝 | 每个命名空间部署 Default-Deny 策略 |
| 最小授权 | 仅放行业务必需的通信路径 |
| 按命名空间隔离 | 不同环境/业务域命名空间互相隔离 |
| 标签驱动 | 基于 Pod Label 进行策略匹配 |
| 分层策略 | 集群级 → 命名空间级 → Pod 级三层策略 |

### 部署顺序

1. **Default-Deny 基础策略**：每个命名空间部署默认拒绝所有入站和出站
2. **基础设施放行**：DNS (kube-dns)、监控、日志采集等基础设施通信放行
3. **业务通信放行**：基于通信矩阵逐条添加 Allow 策略
4. **跨命名空间策略**：定义必要的跨命名空间通信规则
5. **外部访问策略**：Ingress Controller 到后端服务的放行

### Default-Deny 策略示例

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: prod
spec:
  podSelector: {}          # 匹配命名空间内所有 Pod
  policyTypes:
    - Ingress              # 默认拒绝所有入站
    - Egress               # 默认拒绝所有出站
```

### 业务 Allow 策略示例

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-api-gateway-to-user-svc
  namespace: prod
spec:
  podSelector:
    matchLabels:
      app: user-service    # 目标：user-service
  policyTypes:
    - Ingress
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: api-gateway   # 仅允许 api-gateway 访问
      ports:
        - protocol: TCP
          port: 8081
```

### DNS 放行策略（必须）

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-dns-egress
  namespace: prod
spec:
  podSelector: {}
  policyTypes:
    - Egress
  egress:
    - to:
        - namespaceSelector:
            matchLabels:
              name: kube-system
      ports:
        - protocol: UDP
          port: 53
        - protocol: TCP
          port: 53
```

### 策略层级模型

| 层级 | 策略 | 说明 |
|------|------|------|
| L1 默认拒绝 | Default-Deny All | 所有命名空间部署，零信任基础 |
| L2 基础设施 | DNS/Monitor/Logging | 必需的基础设施通信放行 |
| L3 业务通信 | Service-to-Service | 基于通信矩阵的精确 Allow |
| L4 外部入口 | Ingress Controller | 仅允许入口到网关的通信 |
| L5 特殊控制 | Egress 限制 | 限制 Pod 对外网的访问 |
