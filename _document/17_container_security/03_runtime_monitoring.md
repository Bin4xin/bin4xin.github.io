---
layout: document
title: "运行时四维行为监控"
short_title: "运行时监控"
order: 3
icon: "fas fa-eye"
status: "stable"
tags: [容器安全, 运行时监控, 系统调用, 文件完整性, 网络行为, 进程基线]
author: sentryCyberSec
version: "3.0"
description: "容器运行时四维行为监控，从系统调用、文件系统完整性、网络行为、进程行为基线四个维度检测逃逸与横向移动等异常行为。"
---

## 场景 3 — 运行时四维行为监控

通过系统调用、文件系统、网络行为、进程基线四个维度实时监控容器运行时行为，检测逃逸相关异常。

### 系统调用监控

通过 eBPF / Falco 监控容器内系统调用，检测逃逸相关行为。

| 系统调用 | 风险等级 | 说明 |
|----------|----------|------|
| mount() | ALERT | 重新挂载 /proc 等逃逸前置行为 |
| ptrace() | ALERT | 进程注入/调试逃逸 |
| unshare() | WARN | 创建新命名空间逃逸 |
| clone(CLONE_NEWUSER) | WARN | 用户命名空间逃逸 |
| read() | NORMAL | 正常读写 |
| write() | NORMAL | 正常读写 |

告警示例：mount() /proc 触发告警 — 容器内尝试重新挂载 /proc，典型逃逸前置行为。

工具：`eBPF` `Falco` `Tracee` `Sysdig`

### 文件系统完整性监控

监控容器内关键文件的创建、修改、删除行为，检测逃逸痕迹。

| 路径 | 事件 | 风险 |
|------|------|------|
| /proc/self/exe | read+overwrite | CRITICAL |
| /host/etc/crontab | append | CRITICAL |
| /tmp/.x | create+exec | HIGH |
| /dev/shm/exploit | create+mmap | HIGH |
| /app/config.yml | modify | NORMAL |

告警示例：宿主机文件系统被访问 — 检测到 /host/etc/ 路径写入，容器已逃逸挂载宿主机 FS。

工具：`AIDE` `OSSEC` `Falco`

### 网络行为监控

监控容器网络连接，检测异常外联、内网扫描和横向移动。

| 方向 | 连接 | 风险 |
|------|------|------|
| ↗ | Container → 10.0.0.1:6443（Kubelet API Server 异常访问） | ALERT |
| ↗ | Container → 169.254.169.254（Cloud metadata API 访问） | WARN |
| ↔ | Container → 同节点其他 Pod（异常横向通信） | WARN |
| ↗ | Container → registry.k8s.io（正常镜像拉取） | NORMAL |

告警示例：检测到 K8s API Server 异常访问 — 非系统组件 Pod 访问 :6443，可能已获取 ServiceAccount Token。

工具：`Cilium` `Calico` `NetworkPolicy`

### 进程行为基线

建立容器内正常进程基线，检测偏离基线的异常进程。

| 基线指标 | 状态 |
|----------|------|
| 新进程出现 | +3（偏离基线）|
| 异常父子关系 | +2（偏离基线）|
| Shell 启动 | +1（偏离基线）|
| CPU 使用 | 偏高 |

告警示例：检测到非基线进程 /bin/sh → /tmp/exploit — 容器启动后首次出现 Shell 进程执行 /tmp 下可疑文件。

工具：`Falco` `Tetragon` `KubeArmor`
