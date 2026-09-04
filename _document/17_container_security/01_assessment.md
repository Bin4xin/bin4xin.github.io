---
layout: document
title: "容器环境安全评估"
short_title: "环境评估"
order: 1
icon: "fas fa-magnifying-glass-chart"
status: "stable"
tags: [容器安全, 环境评估, 资产盘点, 风险识别, 基线核查]
author: sentryCyberSec
version: "3.0"
description: "容器环境安全评估，对容器运行时、镜像仓库、Kubernetes 集群与 CI/CD 流水线进行资产盘点、基线核查与风险评估，为后续防线建设提供依据。"
---

## 场景 1 — 容器环境安全评估

对容器基础设施进行全面安全评估，识别配置缺陷和风险，为部署前防线、运行时监控与应急响应建设提供依据。

### 评估范围与维度

| 评估对象 | 评估项数 | 说明 |
|----------|---------|------|
| 容器运行时 | 15 | 运行时版本/逃逸补丁、Seccomp/AppArmor 状态 |
| 镜像仓库 | 12 | 仓库权限、镜像签名、镜像扫描策略 |
| Kubernetes 集群 | 20 | 控制平面、RBAC、Pod 安全配置 |
| CI/CD 流水线 | 10 | 构建环境隔离、凭据管理、供应链校验 |
| 宿主机内核 | 8 | 内核补丁、共享内核攻击面、容器逃逸面 |
| 网络策略 | 10 | NetworkPolicy 覆盖、微隔离现状 |

**总计：75 项评估检查点**

### 容器运行时评估

| 评估项 | 风险等级 | 检查内容 |
|--------|----------|----------|
| 运行时版本 | 高 | containerd/runc 版本是否含已知逃逸 CVE |
| 特权容器 | 高 | 是否存在 --privileged 运行的容器 |
| 敏感挂载 | 高 | 是否挂载 / /proc /sys /docker.sock |
| Capabilities | 高 | 是否保留 SYS_ADMIN/SYS_PTRACE 等危险能力 |
| Seccomp 配置 | 中 | 是否启用 RuntimeDefault/自定义 profile |
| AppArmor/SELinux | 中 | 是否 enforce 模式加载 |
| 非 root 运行 | 中 | 是否设置 runAsNonRoot |
| 只读根文件系统 | 低 | 是否启用 readOnlyRootFilesystem |

### Kubernetes 集群评估

| 评估项 | 风险等级 | 检查内容 |
|--------|----------|----------|
| API Server 暴露 | 高 | 控制平面是否公网暴露/未鉴权 |
| RBAC 过度授权 | 高 | cluster-admin 是否滥用、默认 SA 权限 |
| Pod 安全标准 | 高 | 是否强制 PSA restricted/baseline |
| kubelet 配置 | 中 | 匿名访问、--read-only-port |
| 密钥管理 | 中 | Secret 加密、etcd 访问控制 |
| 网络策略覆盖 | 高 | 命名空间是否有默认拒绝策略 |

### 镜像仓库与供应链评估

| 评估项 | 检查内容 |
|--------|----------|
| 仓库访问控制 | 是否按团队/环境最小授权 |
| 镜像签名 | 是否启用 Cosign/Notary 签名验证 |
| 扫描策略 | 是否强制镜像入库前扫描 |
| 私有/公共镜像 | 是否限制可信仓库来源 |
| 镜像版本管理 | 是否禁止 latest 标签部署 |

### CI/CD 流水线评估

| 评估项 | 检查内容 |
|--------|----------|
| 构建环境隔离 | 构建容器是否与生产网络隔离 |
| 凭据管理 | 构建密钥是否加密存储、最小暴露 |
| 供应链校验 | 依赖是否锁定版本、校验哈希 |
| 安全门禁 | 扫描/审计不通过是否阻断部署 |

### 评估工具矩阵

| 工具 | 用途 | 说明 |
|------|------|------|
| kube-bench | 集群基线核查 | CIS Kubernetes Benchmark 自动核查 |
| docker-bench-security | 主机/运行时核查 | CIS Docker Benchmark |
| kubescape | 云原生安全扫描 | 合规 + 配置 + 漏洞一键扫描 |
| Trivy | 镜像漏洞扫描 | 镜像/文件系统/SBOM 漏洞检测 |
| Grype | 镜像扫描 | 镜像层 CVE 与恶意软件检测 |
| Falco | 运行时行为采集 | 采集逃逸相关系统调用行为 |
| Polaris | 配置审计 | Kubernetes 配置最佳实践审计 |

### 评估输出

| 输出物 | 说明 |
|--------|------|
| 安全评分报告 | 各评估维度评分 + 对标 |
| 风险清单 | 按高/中/低分类的配置缺陷 |
| 攻击面分析 | 逃逸路径与横向移动风险评估 |
| 加固建议 | 按优先级排序的整改措施 |
| 基线差距分析 | 当前状态 vs 安全基线的差距 |
