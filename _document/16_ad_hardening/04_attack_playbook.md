---
layout: document
title: "攻击手法应急与回退手册"
short_title: "应急手册"
order: 4
icon: "fas fa-network-wired"
status: "stable"
tags: [ActiveDirectory, 组策略, 域安全, 凭据保护, 横向移动]
author: sentryCyberSec
version: "3.0"
description: "Windows Active Directory 域环境安全加固技战法，涵盖域环境安全评估、组策略安全加固实施和攻击面验证与持续优化三个阶段。"
---
## 场景 5 — 攻击手法应急与回退手册

### 应急响应速查

| 攻击事件 | 关键迹象 | 紧急处置 |
|----------|----------|----------|
| 发现 Golden Ticket | Event 4769 异常 + 短时大量 TGT | 立即重置 krbtgt 密码(双重重置) |
| 发现 DCSync | Event 4662 非 DC 发起 DS 复制 | 移除该账户复制权限 |
| 发现 Kerberoasting | Event 4769 RC4 请求 + 大量 SPN | 重置相关 SPN 账户密码 |
| 发现 PtH 攻击 | Event 4624 Type 3 + 异常账户 | 启用 Credential Guard + 禁用 NTLM |
| 发现 NTLM Relay | Event 4624 NTLM + 异常来源 | 启用 SMB 签名 + EPA |
| 发现 Skeleton Key | Event 4673 异常 + 万能密码 | 重启 DC + 检查内存注入 |
| GPP 密码泄露 | SYSVOL 中存在 Groups.xml | 删除 GPP 文件 + 重置所有相关密码 |

### GPO 回退方案

| 场景 | 回退措施 |
|------|----------|
| 密码策略导致业务中断 | 调整 GPO 密码策略，放宽部分要求 |
| NTLM 限制导致应用失败 | 临时允许特定服务器 NTLM，配置白名单 |
| Credential Guard 兼容性 | 特定服务器排除，逐步推进 |
| Kerberos 加密类型变更 | 临时允许 RC4 回退 + 推动应用升级 |
| 审计策略影响性能 | 调整审计子类别，降低非关键项 |

### GPO 变更管理流程

1. 评估 → 识别需要变更的 GPO 设置
2. 测试 → 在测试 OU 中验证变更影响
3. 审批 → 安全团队 + 运维团队联合审批
4. 灰度 → 在非关键 OU 中逐步推行
5. 推广 → 全域范围应用变更
6. 验证 → 确认变更生效且无副作用
7. 记录 → 更新 GPO 变更日志和文档

### 安全加固优先级路线图

| 优先级 | 加固措施 | 时间 | 依赖 |
|--------|----------|------|------|
| P0 紧急 | krbtgt 密码双重重置 | 第 1 周 | — |
| P0 紧急 | 清除 DCSync 非授权账户 | 第 1 周 | — |
| P0 紧急 | 清除 SYSVOL GPP 密码文件 | 第 1 周 | — |
| P1 高 | 部署 LAPS | 第 2-3 周 | AD 扩展架构 |
| P1 高 | 启用 LSA 保护 + Credential Guard | 第 2-4 周 | 硬件支持 |
| P1 高 | 域管账户分离 + 登录限制 | 第 2-3 周 | 运维流程调整 |
| P2 中 | AES256 Kerberos 加密 | 第 4-6 周 | 应用兼容测试 |
| P2 中 | NTLM 限制策略 | 第 4-8 周 | 应用 NTLM 依赖排查 |
| P2 中 | 完整审计策略部署 | 第 4-6 周 | SIEM 对接 |
| P3 低 | LLMNR/NBT-NS 禁用 | 第 6-8 周 | 应用 DNS 依赖 |
| P3 低 | 约束委派全面审查 | 第 8-12 周 | 应用清单梳理 |
