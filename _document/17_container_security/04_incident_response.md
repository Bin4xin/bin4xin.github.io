---
layout: document
title: "应急响应处置管线"
short_title: "应急响应"
order: 4
icon: "fas fa-bolt"
status: "stable"
tags: [容器安全, 应急响应, 即时隔离, 证据收集, 攻击溯源, 安全修复]
author: sentryCyberSec
version: "3.0"
description: "容器逃逸应急响应处置管线，按即时隔离、证据收集、攻击路径溯源、安全修复四步处置，遏制影响范围并根除风险。"
---

## 场景 4 — 应急响应处置管线

容器逃逸应急响应处置管线：确认逃逸后，按"即时隔离 → 证据收集 → 攻击溯源 → 安全修复"四步闭环处置。

### STEP 1 即时隔离

确认逃逸后第一时间遏制影响范围，防止横向扩展。

| 处置动作 | 操作 |
|----------|------|
| 节点隔离 | `kubectl cordon <node>` 标记不可调度；`kubectl drain <node>` 驱逐现有 Pod |
| 容器冻结 | `kill -STOP <pid>` 暂停恶意进程，保留内存状态用于取证 |
| 网络阻断 | NetworkPolicy 默认 deny all，仅允许取证工具网络通信 |

终端示例：

```bash
$ kubectl cordon node-03
[OK] node-03 marked unschedulable
$ kubectl drain node-03 --force
[WARN] evicting 12 pods...
```

### STEP 2 证据收集

在不破坏现场的前提下，全面收集攻击证据。

| 证据类型 | 采集内容 |
|----------|----------|
| 容器镜像 | docker commit 保存容器当前状态；docker save 导出镜像 tar |
| 文件系统 | 导出容器 rootfs，检查 /tmp /dev/shm 变更 |
| 进程快照 | ps aux / /proc/*/cmdline，进程树 + 打开文件列表 |
| 日志收集 | K8s Events / Audit Log，容器 stdout/stderr 日志 |
| 网络流量 | PCAP 抓包，连接记录 / DNS 查询日志 |
| 凭证快照 | ServiceAccount Token，环境变量中的密钥 |

### STEP 3 攻击路径溯源

基于收集的证据，还原完整攻击链。

| 时间 | 阶段 | 说明 |
|------|------|------|
| T0 · 2025-08-01 03:14 | 初始入侵 | 应用 RCE 漏洞获取容器 Shell（CVE-2024-xxxx） |
| T1 · 03:15 | 环境侦察 | 检查 /proc/1/cgroup、特权模式 |
| T2 · 03:17 | 漏洞利用 | CVE-2019-5736 runc 覆盖逃逸 |
| T3 · 03:18 | 宿主机提权 | 获取宿主机 root shell |
| T4 · 03:22 | 凭证获取 | 读取 kubelet kubeconfig |
| T5 · 03:25 | 集群横向 | kubectl 获取 cluster-admin |

### STEP 4 安全修复

根据溯源结果，实施针对性修复。

| 修复项 | 措施 |
|--------|------|
| 升级 runc/containerd | 修补 CVE-2019-5736，升级到安全版本 |
| 修复应用漏洞 | 修补初始入侵的 RCE 漏洞入口 |
| 消除特权容器 | 移除 --privileged，最小化 Capabilities |
| 轮换凭证 | 轮换所有 ServiceAccount Token，重置 kubelet 证书 |
| 加固网络策略 | 部署 NetworkPolicy 默认 deny，限制 Pod 间通信 |
| 启用运行时防护 | 部署 Falco/KubeArmor，配置逃逸检测规则 |
