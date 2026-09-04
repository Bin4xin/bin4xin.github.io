---
layout: document
title: "基线配置实施"
short_title: "安全加固"
order: 2
icon: "fas fa-terminal"
status: "stable"
tags: [Linux, 安全基线, 最小权限, 自动化核查, 安全加固]
author: sentryCyberSec
version: "3.0"
description: "Linux服务器安全基线加固技战法，涵盖安全基线制定、基线配置实施和自动化核查与持续合规三个阶段。"
---
## 场景 3 — 阶段二：基线配置实施

### 安装与初始化加固

| 配置项 | 基线要求 | 说明 |
|--------|----------|------|
| 最小化安装 | 仅安装必要软件包 | 减少攻击面，不安装 GUI/游戏/办公软件 |
| 独立分区 | /home /var /tmp /var/log 独立分区 | 防止日志/临时文件占满根分区 |
| 文件系统 | ext4/xfs + noatime | 提升性能，减少不必要的磁盘写入 |
| 引导加载 | GRUB 密码保护 | 防止未授权修改启动参数 |

### 服务管理加固

| 配置项 | 基线要求 | 说明 |
|--------|----------|------|
| 禁用不必要服务 | 关闭 rpcbind/avahi/cups 等 | 减少攻击面 |
| 服务端口控制 | 仅开放业务必需端口 | netstat/ss 检查监听端口 |
| xinetd 服务 | 全部禁用或严格控制 | 已过时的服务管理框架 |
| 定时任务 | 限制 cron 使用权限 | 仅授权用户可设置定时任务 |

### SSH 安全加固

```bash
# /etc/ssh/sshd_config 基线配置
Protocol 2                       # 仅使用 SSHv2
Port 2222                        # 修改默认端口
PermitRootLogin no               # 禁止 root 远程登录
PasswordAuthentication no        # 禁用密码认证，仅允许密钥
PubkeyAuthentication yes         # 启用公钥认证
MaxAuthTries 3                   # 最大认证尝试次数
ClientAliveInterval 300          # 会话超时 5 分钟
ClientAliveCountMax 2            # 超时断开
AllowUsers deploy admin          # 仅允许特定用户
```

### 用户与权限加固

| 配置项 | 基线要求 | 说明 |
|--------|----------|------|
| 密码策略 | ≥12 位 + 大小写 + 数字 + 特殊字符 | /etc/login.defs / PAM 配置 |
| 密码有效期 | 最长 90 天，最短 7 天 | 强制定期更换 |
| 账户锁定 | 5 次失败锁定 15 分钟 | pam_tally2/pam_faillock |
| 空口令检查 | 禁止空口令账户 | 定期扫描确认 |
| sudo 配置 | 精确授权，禁止 sudo su | 最小权限原则 |
| UID 0 检查 | 仅 root 的 UID 为 0 | 防止后门超级用户 |
| 不活跃锁定 | 90 天不活跃自动锁定 | useradd -f 90 |

### 关键文件权限

| 文件/目录 | 权限 | 所有者 | 说明 |
|-----------|------|--------|------|
| /etc/passwd | 644 | root:root | 用户信息 |
| /etc/shadow | 600 | root:shadow | 密码哈希 |
| /etc/gshadow | 600 | root:shadow | 组密码 |
| /etc/ssh/sshd_config | 600 | root:root | SSH 配置 |
| /etc/sudoers | 440 | root:root | sudo 配置 |
| /var/log/ | 755 | root:root | 日志目录 |
| /tmp | 1777 | root:root | 临时目录(粘滞位) |
| /boot/grub/grub.cfg | 600 | root:root | GRUB 配置 |

### 网络内核参数加固

```bash
# /etc/sysctl.conf 基线配置
net.ipv4.ip_forward = 0                  # 禁止 IP 转发
net.ipv4.conf.all.send_redirects = 0     # 禁止 ICMP 重定向
net.ipv4.conf.all.accept_redirects = 0   # 禁止接受 ICMP 重定向
net.ipv4.conf.all.rp_filter = 1          # 启用反向路径过滤
net.ipv4.conf.all.log_martians = 1       # 记录异常数据包
net.ipv4.tcp_syncookies = 1              # 启用 SYN Cookie
net.ipv6.conf.all.accept_redirects = 0   # 禁止 IPv6 ICMP 重定向
kernel.randomize_va_space = 2            # 完全启用 ASLR
```

### 审计与日志加固

| 配置项 | 基线要求 | 说明 |
|--------|----------|------|
| auditd 启用 | 审计守护进程开机自启 | 记录关键安全事件 |
| 关键操作审计 | 用户/权限/配置变更全记录 | 审计规则覆盖 |
| 日志集中转发 | 日志同步至中央日志平台 | syslog/rsyslog 配置 |
| 日志保留 | ≥ 180 天本地 + 1 年集中 | 满足合规要求 |
| 日志完整性 | 日志文件不可删除/篡改 | 权限 + chattr +a |
