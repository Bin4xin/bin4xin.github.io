---
layout: document
title: "策略模板与应急处置手册"
short_title: "策略模板"
order: 4
icon: "fas fa-cubes"
status: "stable"
tags: [Kubernetes, NetworkPolicy, 零信任, 微隔离, 云原生安全]
author: sentryCyberSec
version: "3.0"
description: "Kubernetes网络策略精细化隔离技战法，涵盖集群通信梳理分析、NetworkPolicy策略设计部署和验证测试与持续维护三个阶段。"
---
## 场景 5 — 策略模板与应急处置手册

### 通用策略模板

| 模板 | 说明 |
|------|------|
| Default-Deny | 命名空间默认拒绝所有 Ingress/Egress |
| DNS 放行 | 允许所有 Pod 访问 kube-dns |
| 监控放行 | 允许 Prometheus 采集 metrics |
| 日志放行 | 允许 Fluentd/Filebeat 采集日志 |
| Ingress 放行 | 允许 Ingress Controller 到后端服务 |
| 跨 NS 通信 | 按需放行跨命名空间服务调用 |
| 外部服务放行 | 允许访问特定外部 API/域名 |

### 应急处置：网络策略故障

| 场景 | 症状 | 处置 |
|------|------|------|
| 应用大面积不可达 | 多个服务健康检查失败 | 临时删除最近变更的 NetworkPolicy |
| DNS 解析失败 | 服务发现不可用 | 检查 DNS egress 策略是否被误删 |
| 部分服务通信中断 | 个别服务间调用超时 | kubectl describe netpol 定位问题策略 |
| 新部署服务不可用 | 上线后服务无响应 | 检查是否缺少对应 Allow 策略 |

### 紧急回退命令

```bash
# 查看命名空间所有策略
kubectl get networkpolicy -n <namespace>

# 删除特定策略
kubectl delete networkpolicy <policy-name> -n <namespace>

# 临时删除命名空间所有策略（紧急情况）
kubectl delete networkpolicy --all -n <namespace>

# 查看策略详情
kubectl describe networkpolicy <policy-name> -n <namespace>

# 使用 Cilium 查看策略效果
cilium monitor --type drop

# 使用 Calico 诊断
calicoctl get networkpolicy -A
```

### CI/CD 集成检查

```yaml
# CI 流水线 NetworkPolicy 检查
steps:
  - name: 检查 NetworkPolicy 是否存在
    run: |
      NS=$(yq '.metadata.namespace' k8s/*.yaml)
      if ! kubectl get networkpolicy -n $NS -o name | grep -q .; then
        echo "ERROR: 命名空间 $NS 缺少 NetworkPolicy"
        exit 1
      fi
  - name: 检查是否存在 any-to-any 策略
    run: |
      for f in k8s/netpol/*.yaml; do
        if yq '.spec.podSelector == {}' $f | grep -q true; then
          if yq '.spec.ingress[0].from == [{}]' $f 2>/dev/null; then
            echo "WARN: $f 存在 any-to-any 规则"
          fi
        fi
      done
  - name: 部署前验证
    run: |
      kubectl apply --dry-run=client -f k8s/netpol/
```
