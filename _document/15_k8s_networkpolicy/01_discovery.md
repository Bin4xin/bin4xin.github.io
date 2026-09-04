---
layout: document
title: "集群网络通信梳理与分析"
short_title: "通信梳理"
order: 1
icon: "fas fa-cubes"
status: "stable"
tags: [Kubernetes, NetworkPolicy, 零信任, 微隔离, 云原生安全]
author: sentryCyberSec
version: "3.0"
description: "Kubernetes网络策略精细化隔离技战法，涵盖集群通信梳理分析、NetworkPolicy策略设计部署和验证测试与持续维护三个阶段。"
---
## 场景 2 — 阶段一：集群网络通信梳理与分析

### 通信关系采集方法

| 方法 | 工具 | 说明 |
|------|------|------|
| 流量镜像采集 | Istio / Cilium Hubble | Service Mesh 采集 Pod 间实际通信流量 |
| eBPF 流量监控 | Cilium / Pixie | 内核级无侵入流量采集，记录所有 L3/L4 连接 |
| 日志分析 | kube-proxy / iptables 日志 | 分析 Service 转发和连接记录 |
| 服务依赖梳理 | 代码审查 / 架构文档 | 从业务架构层面梳理服务间调用关系 |
| 主动探测 | nmap / network-工具 Pod | 从各命名空间探测可达性 |

### 通信矩阵采集示例

| 源 Pod (Namespace) | 目标 Pod (Namespace) | 端口 | 协议 | 通信量 |
|---------------------|----------------------|------|------|--------|
| frontend (prod) | api-gateway (prod) | 8080 | TCP | 高 |
| api-gateway (prod) | user-service (prod) | 8081 | TCP | 高 |
| api-gateway (prod) | order-service (prod) | 8082 | TCP | 高 |
| user-service (prod) | mysql-primary (data) | 3306 | TCP | 中 |
| order-service (prod) | mysql-primary (data) | 3306 | TCP | 中 |
| order-service (prod) | redis-cluster (data) | 6379 | TCP | 中 |
| monitoring (infra) | all pods (all) | 9090 | TCP | 低 |
| logging-agent (infra) | all pods (all) | — | TCP | 低 |

### 服务分层架构

```text
┌─────────────────────────────────────────────┐
│ 接入层  │ frontend  │ web-app  │ CDN        │
├─────────────────────────────────────────────┤
│ 网关层  │ api-gateway  │ ingress-ctrl      │
├─────────────────────────────────────────────┤
│ 服务层  │ user-svc  │ order-svc  │ pay-svc  │
├─────────────────────────────────────────────┤
│ 数据层  │ MySQL  │ Redis  │ MongoDB         │
├─────────────────────────────────────────────┤
│ 基础设施│ monitoring  │ logging  │ DNS      │
└─────────────────────────────────────────────┘
```

### 通信分类结果

| 分类 | 数量 | 说明 |
|------|------|------|
| 正常业务通信 | 45 条 | 服务间必要的调用关系 |
| 基础设施通信 | 12 条 | 监控/日志/DNS 等 |
| 可疑通信 | 8 条 | 非预期的跨命名空间通信 |
| 未授权通信 | 3 条 | 不应存在的直接访问 |
