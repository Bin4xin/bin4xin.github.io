---
layout: document
title: "基线核查清单速查表"
short_title: "核查清单"
order: 4
icon: "fas fa-terminal"
status: "stable"
tags: [Linux, 安全基线, 最小权限, 自动化核查, 安全加固]
author: sentryCyberSec
version: "3.0"
description: "Linux服务器安全基线加固技战法，涵盖安全基线制定、基线配置实施和自动化核查与持续合规三个阶段。"
---

## 场景 5 — 基线核查清单速查表

### SSH 安全核查

| 编号 | 检查项 | 基线值 | 命令 |
|------|--------|--------|------|
| SSH-001 | 禁止 root 远程登录 | PermitRootLogin no | grep PermitRootLogin /etc/ssh/sshd_config |
| SSH-002 | 使用 SSHv2 | Protocol 2 | grep Protocol /etc/ssh/sshd_config |
| SSH-003 | 禁用密码认证 | PasswordAuthentication no | grep PasswordAuthentication /etc/ssh/sshd_config |
| SSH-004 | 启用公钥认证 | PubkeyAuthentication yes | grep PubkeyAuthentication /etc/ssh/sshd_config |
| SSH-005 | 最大认证尝试 | MaxAuthTries 3 | grep MaxAuthTries /etc/ssh/sshd_config |
| SSH-006 | 会话超时 | ClientAliveInterval 300 | grep ClientAliveInterval /etc/ssh/sshd_config |
| SSH-007 | 修改默认端口 | 非 22 | grep ^Port /etc/ssh/sshd_config |
| SSH-008 | 限制登录用户 | AllowUsers 白名单 | grep AllowUsers /etc/ssh/sshd_config |

### 用户与权限核查

| 编号 | 检查项 | 基线值 | 命令 |
|------|--------|--------|------|
| USR-001 | 无空口令用户 | 0 个 | awk -F: '($2==""){print}' /etc/shadow |
| USR-002 | 仅 root UID=0 | 仅 root | awk -F: '($3==0){print}' /etc/passwd |
| USR-003 | 密码最长有效期 | ≤90 天 | grep PASS_MAX_DAYS /etc/login.defs |
| USR-004 | 密码最短使用 | ≥7 天 | grep PASS_MIN_DAYS /etc/login.defs |
| USR-005 | 密码最小长度 | ≥12 位 | grep PASS_MIN_LEN /etc/login.defs |
| USR-006 | 账户锁定阈值 | 5 次 | grep pam_faillock /etc/pam.d/system-auth |
| USR-007 | sudo 配置合理 | 精确授权 | grep -v '^#' /etc/sudoers |
| USR-008 | 不活跃锁定 | ≤90 天 | useradd -D |

### 文件权限核查

| 编号 | 检查项 | 基线值 | 命令 |
|------|--------|--------|------|
| FILE-001 | /etc/passwd | 644 | stat -c '%a' /etc/passwd |
| FILE-002 | /etc/shadow | 600 | stat -c '%a' /etc/shadow |
| FILE-003 | /etc/gshadow | 600 | stat -c '%a' /etc/gshadow |
| FILE-004 | /etc/group | 644 | stat -c '%a' /etc/group |
| FILE-005 | /etc/ssh/sshd_config | 600 | stat -c '%a' /etc/ssh/sshd_config |
| FILE-006 | /etc/sudoers | 440 | stat -c '%a' /etc/sudoers |
| FILE-007 | /tmp 粘滞位 | 1777 | stat -c '%a' /tmp |
| FILE-008 | 无 world-writable 文件 | 0 个 | find / -xdev -type f -perm -0002 |

### 服务与网络核查

| 编号 | 检查项 | 基线值 | 命令 |
|------|--------|--------|------|
| SVC-001 | telnet 禁用 | disabled | systemctl is-enabled telnet |
| SVC-002 | rpcbind 禁用 | disabled | systemctl is-enabled rpcbind |
| SVC-003 | avahi 禁用 | disabled | systemctl is-enabled avahi-daemon |
| SVC-004 | cups 禁用 | disabled | systemctl is-enabled cups |
| NET-001 | IP 转发关闭 | 0 | sysctl net.ipv4.ip_forward |
| NET-002 | ICMP 重定向关闭 | 0 | sysctl net.ipv4.conf.all.send_redirects |
| NET-003 | SYN Cookie 启用 | 1 | sysctl net.ipv4.tcp_syncookies |
| NET-004 | ASLR 启用 | 2 | sysctl kernel.randomize_va_space |

### 审计日志核查

| 编号 | 检查项 | 基线值 | 命令 |
|------|--------|--------|------|
| AUD-001 | auditd 已启用 | active | systemctl is-active auditd |
| AUD-002 | 审计规则完整 | 含关键规则 | auditctl -l |
| AUD-003 | 日志集中转发已配置 | 已配置 | grep '@' /etc/rsyslog.conf |
| AUD-004 | 日志保留 ≥180 天 | rotate 26 | grep rotate /etc/logrotate.conf |
| AUD-005 | 日志文件保护 | 不可删除 | lsattr /var/log/messages |
