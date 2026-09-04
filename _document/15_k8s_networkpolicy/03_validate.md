---
layout: document
title: "验证测试与持续维护"
short_title: "验证维护"
order: 3
icon: "fas fa-cubes"
status: "stable"
tags: [Kubernetes, NetworkPolicy, 零信任, 微隔离, 云原生安全]
author: sentryCyberSec
version: "3.0"
description: "Kubernetes网络策略精细化隔离技战法，涵盖集群通信梳理分析、NetworkPolicy策略设计部署和验证测试与持续维护三个阶段。"
---
## 场景 4 — 阶段三：验证测试与持续维护

### 策略验证测试

| 测试类型 | 方法 | 说明 |
|----------|------|------|
| 正向测试 | 从业务 Pod 发起合法调用 | 验证允许的通信路径正常工作 |
| 反向测试 | 从非授权 Pod 发起调用 | 验证拒绝的通信路径被正确阻断 |
| DNS 测试 | 验证服务发现正常 | 确保 DNS 策略未被阻断 |
| 健康检查 | 验证探针不受影响 | liveness/readiness probe 正常 |
| 性能测试 | 压测验证延迟无影响 | NetworkPolicy 不应增加明显延迟 |

### 验证脚本

```bash
# 正向测试：api-gateway 应能访问 user-service
kubectl exec -n prod deploy/api-gateway -- \
  curl -s -o /dev/null -w "%{http_code}" http://user-service:8081/health
# 预期: 200

# 反向测试：frontend 不应直接访问 user-service
kubectl exec -n prod deploy/frontend -- \
  curl -s --connect-timeout 3 http://user-service:8081/health
# 预期: 超时/连接拒绝

# DNS 测试
kubectl exec -n prod deploy/api-gateway -- nslookup user-service
# 预期: 正确解析

# 跨命名空间测试：prod 不应访问 staging
kubectl exec -n prod deploy/api-gateway -- \
  curl -s --connect-timeout 3 http://staging-service.staging:8080/health
# 预期: 超时/连接拒绝
```

### 常见问题与处理

| 问题 | 原因 | 处理 |
|------|------|------|
| 应用无法解析域名 | DNS egress 策略缺失 | 补充 kube-dns 放行策略 |
| 健康检查失败 | liveness probe 被拒绝 | 放行 kubelet 到 Pod 的探针流量 |
| Pod 无法访问外部 | egress default-deny | 按需添加外部服务放行策略 |
| Service Mesh 通信失败 | sidecar 流量被阻断 | 放行 istio-system/cilium 通信 |
| 策略不生效 | CNI 插件不支持 | 确认使用 Calico/Cilium/Weave |

### CNI 插件 NetworkPolicy 支持

| CNI | NetworkPolicy | 扩展策略 |
|------|--------------|----------|
| Calico | ✅ 完整支持 | GlobalNetworkPolicy / 应用层策略 |
| Cilium | ✅ 完整支持 | L7 策略 / DNS 策略 / 审计模式 |
| Weave Net | ✅ 基础支持 | — |
| Flannel | ❌ 不支持 | 需配合 Calico (Canal) |
| kube-router | ✅ 基础支持 | — |

### 持续维护机制

| 机制 | 说明 |
|------|------|
| 通信矩阵自动更新 | Cilium Hubble / Istio Kiali 持续采集通信关系 |
| 策略漂移检测 | GitOps 管理策略，检测实际与期望状态差异 |
| 新服务策略审核 | 新部署服务必须配套 NetworkPolicy，CI/CD 流水线集成检查 |
| 策略效果监控 | 监控策略拒绝的连接数/来源，识别误拦和漏放 |
| 定期策略审计 | 季度审计策略覆盖度和精确度 |

### 度量指标

| 指标 | 目标 |
|------|------|
| 命名空间策略覆盖率 | 100%（所有命名空间有 Default-Deny） |
| 策略精确度 | Allow 策略无 any-to-any |
| DNS 放行率 | 100% |
| 策略误拦率 | < 1% |
| 新服务策略配套率 | 100% |
| 策略更新响应时间 | < 30min |
