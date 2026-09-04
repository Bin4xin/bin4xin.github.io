---
layout: document
title: "Windows AD域环境安全加固技战法"
short_title: "概述"
order: 0
icon: "fas fa-network-wired"
status: "stable"
tags: [ActiveDirectory, 组策略, 域安全, 凭据保护, 横向移动]
author: sentryCyberSec
version: "3.0"
description: "Windows Active Directory 域环境安全加固技战法，涵盖域环境安全评估、组策略安全加固实施和攻击面验证与持续优化三个阶段。"
---
## 技战法概述

Windows Active Directory（AD）域环境是企业 IT 管理中最广泛使用的集中身份管理和访问控制平台。然而，AD 域环境的复杂性和其核心地位使其成为攻击者的首要目标。一旦攻击者攻破域控制器（Domain Controller），即可获取整个域内所有用户的身份凭证和所有资源的访问权限，实现"一失全失"的灾难性后果。

### 常见 AD 攻击手段

| 攻击技术 | MITRE ATT&CK | 说明 |
|----------|---------------|------|
| Pass-the-Hash (PtH) | T1550.002 | 利用 NTLM 哈希直接认证，无需明文密码 |
| Kerberoasting | T1558.003 | 请求服务票据后离线破解 SPN 关联账户密码 |
| DCSync | T1003.006 | 模拟域控复制协议，获取任意用户哈希 |
| Golden Ticket | T1558.001 | 利用 krbtgt 哈希伪造任意用户 TGT 票据 |
| Silver Ticket | T1558.002 | 伪造特定服务的 Kerberos 服务票据 |
| GPP 密码提取 | T1552.006 | 提取组策略首选项中存储的加密密码 |
| BloodHound 侦察 | T1087 | 自动化分析域信任关系和攻击路径 |
| NTLM Relay | T1557 | 中继 NTLM 认证到目标服务 |
| Skeleton Key | T1556 | 在域控内存中注入万能密码后门 |
| AdminSDHolder 滥用 | T1078 | 利用 AdminSDHolder 权限传播机制提权 |

### 三阶段技战法

| 阶段 | 名称 | 关键目标 |
|------|------|----------|
| 阶段一 | 域环境安全评估 | 对现有域环境的安全配置进行全面评估，识别配置缺陷和安全风险 |
| 阶段二 | 组策略安全加固实施 | 通过组策略配置，对域环境进行系统化的安全加固 |
| 阶段三 | 攻击面验证与持续优化 | 通过模拟攻击验证加固效果，持续优化安全配置 |

### AD 安全现状数据

| 指标 | 典型值 | 说明 |
|------|--------|------|
| 使用默认 GPO 的企业 | 72% | 未对默认域策略做安全加固 |
| 存在 Kerberoastable 账户 | 65% | 存在弱密码的 SPN 服务账户 |
| NTLMv1 仍启用 | 48% | 未禁用旧版 NTLM 认证协议 |
| 未配置 LAPS | 58% | 本地管理员密码统一管理缺失 |
| 具有 DCSync 权限的账户 | 平均 8 个 | 远超必要的复制权限账户数 |
