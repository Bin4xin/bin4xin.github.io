---
layout: document
title: "容器安全全生命周期防线"
short_title: "全生命周期防线"
order: 5
icon: "fas fa-layer-group"
status: "stable"
tags: [容器安全, 构建阶段, 部署阶段, 运行阶段, 响应阶段, 纵深防御]
author: sentryCyberSec
version: "3.0"
description: "容器安全全生命周期防线，覆盖构建、部署、运行、响应四个阶段共 13 项防护措施，实现容器安全纵深防御。"
---

## 场景 5 — 容器安全全生命周期防线

容器安全覆盖构建、部署、运行、响应四个阶段：构建期检查 2 项、部署期防线 3 项、运行期监控 4 项、响应期步骤 4 项，共 13 项防护措施。

### 构建阶段

#### 镜像安全扫描

| 检查项 | 说明 |
|--------|------|
| CVE 漏洞扫描 | Trivy/Grype 扫描镜像层 |
| 恶意软件检测 | ClamAV 检测后门/挖矿 |
| 敏感信息检查 | 硬编码密钥/Token/密码 |
| Dockerfile 合规 | 最小基础镜像 + 非 root |

工具：`Trivy` `Grype` `Dockle`

#### 镜像供应链

| 检查项 | 说明 |
|--------|------|
| 可信基础镜像 | 仅使用经过审批的基础镜像 |
| 镜像签名 | Cosign/Notary 签名验证 |
| SBOM 生成 | Syft 生成软件物料清单 |

工具：`Cosign` `Syft` `Harbor`

### 部署阶段

#### 运行时配置审计

| 检查项 | 说明 |
|--------|------|
| 禁止特权容器 | `--privileged=false` |
| 禁止敏感挂载 | `/` `/proc` `/sys` `/docker.sock` |
| 最小 Capabilities | drop ALL + 按需 add |
| 非 root 运行 | `runAsNonRoot: true` |

工具：`kube-bench` `Polaris`

#### K8s 安全策略

| 检查项 | 说明 |
|--------|------|
| Pod Security Admission | restricted 级别强制执行 |
| OPA/Gatekeeper | Rego 自定义策略引擎 |
| Kyverno | YAML 声明式策略 |
| CI/CD 安全门禁 | 扫描不过 → 阻断部署 |

工具：`PSA` `OPA` `Kyverno`

#### 内核安全检查

| 检查项 | 说明 |
|--------|------|
| 内核版本 & CVE 补丁 | 对比安全公告 |
| Namespace/Cgroup | 隔离机制正常 |
| Seccomp/AppArmor | enforce 模式启用 |

### 运行阶段

#### 系统调用监控

| 检查项 | 说明 |
|--------|------|
| eBPF/Falco 实时监控 | mount/ptrace/unshare 等逃逸相关调用 |
| 异常 syscall 告警 | 容器内非预期系统调用触发 |

工具：`Falco` `Tetragon` `Tracee`

#### 文件完整性

| 检查项 | 说明 |
|--------|------|
| 关键路径监控 | /proc /host /tmp /dev/shm |
| 新增可执行文件 | 容器内不应有新二进制 |

工具：`AIDE` `Falco`

#### 网络行为

| 检查项 | 说明 |
|--------|------|
| 异常外联检测 | API Server / metadata / 外部 C2 |
| Pod 间横向通信 | NetworkPolicy 违规告警 |

工具：`Cilium` `Calico`

#### 进程基线

| 检查项 | 说明 |
|--------|------|
| 进程白名单 | 建立正常进程画像 |
| 异常进程告警 | 新进程/Shell/异常父子关系 |

工具：`KubeArmor` `Sysdig`

### 响应阶段

#### 即时隔离

| 检查项 | 说明 |
|--------|------|
| kubectl cordon/drain | 节点标记不可调度 + Pod 驱逐 |
| 容器冻结 | kill -STOP 保留内存取证 |
| 网络阻断 | NetworkPolicy deny all |

#### 证据收集

| 检查项 | 说明 |
|--------|------|
| 容器镜像快照 | docker commit + save |
| 进程/文件/网络 | /proc 快照 + PCAP + 日志 |
| 凭证状态 | ServiceAccount Token |

#### 攻击溯源

| 检查项 | 说明 |
|--------|------|
| 还原攻击链 | 初始入侵→提权→逃逸→横向 |
| 确定入侵路径 | 关联 CVE + 配置缺陷 |

#### 安全修复

| 检查项 | 说明 |
|--------|------|
| 升级运行时 | runc/containerd/K8s 补丁 |
| 凭证轮换 | Token/证书/API Key |
| 策略加固 | 消除特权 + 部署防护 |
