---
layout: document
title: "自动化核查与持续合规"
short_title: "自动化核查"
order: 3
icon: "fas fa-terminal"
status: "stable"
tags: [Linux, 安全基线, 最小权限, 自动化核查, 安全加固]
author: sentryCyberSec
version: "3.0"
description: "Linux服务器安全基线加固技战法，涵盖安全基线制定、基线配置实施和自动化核查与持续合规三个阶段。"
---

## 场景 4 — 阶段三：自动化核查与持续合规

### 自动化核查方案

| 工具 | 说明 |
|------|------|
| OpenSCAP | 开源安全合规框架，支持 XCCDF/OVAL 标准，CIS Profile 内置 |
| Lynis | 开源安全审计工具，一键扫描 + 详细报告 + 评分 |
| 脚本自研 | 基于 Shell/Python 的自定义核查脚本，精确匹配企业基线 |
| Ansible Playbook | 自动化加固 + 核查一体化，可批量执行 |
| CIS-CAT | CIS 官方工具，Benchmark 专业扫描 |

### 核查脚本设计

```bash
#!/bin/bash
# 基线核查脚本框架
PASS=0; FAIL=0; WARN=0

check() {
    local id=$1 desc=$2 cmd=$3 expect=$4
    result=$(eval "$cmd" 2>/dev/null)
    if echo "$result" | grep -q "$expect"; then
        echo "[PASS] $id: $desc"; ((PASS++))
    else
        echo "[FAIL] $id: $desc"; ((FAIL++))
    fi
}

# SSH 检查
check "SSH-001" "禁止root远程登录" \
    "grep '^PermitRootLogin' /etc/ssh/sshd_config" "no"
check "SSH-002" "使用SSHv2" \
    "grep '^Protocol' /etc/ssh/sshd_config" "2"

# 用户检查
check "USR-001" "无空口令用户" \
    "awk -F: '($2==""){print}' /etc/shadow | wc -l" "0"
check "USR-002" "仅root的UID为0" \
    "awk -F: '($3==0){print $1}' /etc/passwd" "root"

# 文件权限检查
check "FILE-001" "shadow文件权限600" \
    "stat -c '%a' /etc/shadow" "600"

# 服务检查
check "SVC-001" "telnet未启用" \
    "systemctl is-enabled telnet 2>/dev/null" "disabled"

echo "结果: PASS=$PASS FAIL=$FAIL WARN=$WARN"
```

### 核查频率与范围

| 频率 | 范围 | 说明 |
|------|------|------|
| 新服务器上线前 | 全量 119 项 | 上线前必须通过 L1 基线核查 |
| 每日自动化抽查 | 核心服务器 | SSH/权限/日志关键项 |
| 每周全量自动化核查 | 所有服务器 | 全量扫描，输出报告 |
| 每月人工抽检 + 报告 | 10% 服务器 | 人工验证，月度合规报告 |
| 重大变更后 | 变更影响范围 | 配置变更后立即核查相关项 |

### 合规度量指标

| 指标 | 当前 | 目标 |
|------|------|------|
| L1 基线合规率 | 72% | ≥ 95% |
| L2 基线合规率 | 45% | ≥ 85% |
| L3 基线合规率 | 28% | ≥ 75% |
| 高危项合规率 | 68% | ≥ 99% |
| 修复及时率 | 60% | ≥ 90% |
| 新上线合规率 | 85% | 100% |

### 持续合规机制

| 机制 | 说明 |
|------|------|
| 基线版本管理 | 基线标准版本化管理，变更需评审 |
| 核查结果看板 | 实时展示各服务器/集群合规状态 |
| 不合规告警 | 高危项不合规实时告警通知责任人 |
| 整改跟踪 | 不合规项自动生成整改工单，跟踪闭环 |
| 定期通报 | 周报：合规率趋势，月报：整改进展 |
| 基线更新跟踪 | CIS/等保标准更新，季度评审基线 |

### 典型不合规整改

| 不合规项 | 风险 | 整改措施 |
|----------|------|----------|
| SSH 允许 root 登录 | 高 | 修改 sshd_config，PermitRootLogin no |
| 密码策略过弱 | 高 | 配置 PAM 密码复杂度要求 |
| 不必要服务开放 | 中 | systemctl disable + mask |
| 关键文件权限过宽 | 中 | chmod 精确设置权限 |
| 审计规则缺失 | 中 | 补充 auditd 规则并重启服务 |
| 内核参数未加固 | 低 | 更新 sysctl.conf 并 sysctl -p |
