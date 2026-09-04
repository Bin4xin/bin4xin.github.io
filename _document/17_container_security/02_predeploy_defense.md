---
layout: document
title: "部署前安全防线"
short_title: "部署前防线"
order: 2
icon: "fas fa-shield-halved"
status: "stable"
tags: [容器安全, 镜像扫描, 运行时配置, 内核安全, 策略准入]
author: sentryCyberSec
version: "3.0"
description: "容器部署前安全防线，涵盖镜像安全扫描、容器运行时配置审计、内核安全状态检查和 Kubernetes 安全策略框架四道防线，并在 CI/CD 中设置安全门禁。"
---

## 场景 2 — 部署前安全防线

部署前防线覆盖镜像、配置、内核、策略四个维度，任一环节未通过即阻断部署。

### 镜像安全扫描

1. 静态漏洞扫描：Trivy/Grype 扫描镜像层中的 CVE
2. 恶意软件检测：ClamAV / 扫描后门、挖矿程序、WebShell
3. 敏感信息泄漏：检查硬编码密钥、Token、密码、证书私钥
4. 合规基线检查：Dockerfile 最佳实践：非 root 用户、最小化包、无 shell

扫描结果示例：

| 分类 | 数量 |
|------|------|
| Critical CVE | 12 |
| High CVE | 28 |
| Secrets Found | 3 |
| Misconfig | 5 |

工具：`Trivy` `Grype` `Dockle` `Snyk`

### 容器运行时配置审计

| 状态 | 检查项 | 配置 |
|------|--------|------|
| ✗ | 特权模式 | `--privileged=true` |
| ✗ | 敏感挂载 | `/` `/proc` `/sys` `/var/run/docker.sock` |
| ✗ | 危险 Capabilities | `SYS_ADMIN` `SYS_PTRACE` `NET_RAW` |
| ✗ | Host 命名空间 | `hostNetwork` `hostPID` `hostIPC` |
| ✗ | Root 运行 | 未设置 `runAsNonRoot: true` |
| ✓ | 只读根文件系统 | `readOnlyRootFilesystem: true` |
| ✓ | Seccomp | `RuntimeDefault` profile 已启用 |
| ✓ | AppArmor | 已加载 enforce 模式 |

工具：`kube-bench` `kubescape` `Polaris`

### 内核安全状态检查

1. 内核版本 & 补丁：检查已知逃逸 CVE 是否已修补（`uname -r` 对比安全公告）
2. Namespace 支持：确认 User/PID/Mount/Net namespace 隔离正常
3. Cgroup 版本：cgroup v2 已启用，资源限制生效
4. 安全模块状态：SELinux/AppArmor enforce 模式，Seccomp 默认 profile 启用
5. 禁止不安全系统调用：`unshare` / `mount` / `ptrace` 权限收紧

工具：`sysctl` `auditd` `falco`

### Kubernetes 安全策略框架

#### Pod Security Admission (PSA)

K8s 内置准入控制，三级策略：`privileged` / `baseline` / `restricted`，强制 namespace 级别安全基线。

#### OPA/Gatekeeper

基于 Rego 策略语言的通用策略引擎，自定义约束模板，灵活度最高。

#### Kyverno

K8s 原生策略引擎，YAML 声明式，支持 validate/mutate/generate 三种模式。

强制策略示例：

- 禁止特权容器 · 必须设置资源限制
- 禁止 hostNetwork · 必须 runAsNonRoot
- 限制 allowedRegistries · 禁止 latest 标签

### CI/CD 安全门禁

镜像扫描 + 配置审计 + 策略校验全部通过方可部署；任一环节不通过 → 阻断部署 → 通知开发人员修复 → 重新提交。
