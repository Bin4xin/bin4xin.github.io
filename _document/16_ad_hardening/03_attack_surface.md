---
layout: document
title: "攻击面验证与持续优化"
short_title: "攻击验证"
order: 3
icon: "fas fa-network-wired"
status: "stable"
tags: [ActiveDirectory, 组策略, 域安全, 凭据保护, 横向移动]
author: sentryCyberSec
version: "3.0"
description: "Windows Active Directory 域环境安全加固技战法，涵盖域环境安全评估、组策略安全加固实施和攻击面验证与持续优化三个阶段。"
---
## 场景 4 — 阶段三：攻击面验证与持续优化

### 验证测试矩阵

| 测试类型 | 工具 | 说明 |
|----------|------|------|
| Kerberoast 验证 | Rubeus / Impacket | 测试 SPN 账户密码强度 |
| PtH 验证 | Mimikatz / CrackMapExec | 验证 NTLM 限制和凭据保护 |
| DCSync 验证 | Mimikatz / Impacket | 测试非授权 DCSync 权限 |
| Golden Ticket | Mimikatz | 验证 krbtgt 密码更新效果 |
| NTLM Relay | Responder + ntlmrelayx | 验证 EPA/SPN 防护 |
| BloodHound 更新 | SharpHound | 重新评估攻击路径 |
| 密码策略验证 | 自定义脚本 | 验证密码复杂度和锁定策略 |
| 审计完整性 | 事件日志检查 | 验证关键审计事件生成 |

### 加固效果验证

| 攻击技术 | 加固前风险 | 加固措施 | 加固后状态 |
|----------|-----------|----------|-----------|
| Kerberoasting | 高 | AES256 + 强密码 gMSA | 风险大幅降低 |
| Pass-the-Hash | 高 | Credential Guard + NTLM 限制 | 基本阻断 |
| DCSync | 高 | 收紧复制权限 + 审计 | 仅允许 DC |
| Golden Ticket | 高 | krbtgt 双重重置 + PAC 验证 | 时效极短 |
| NTLM Relay | 中 | EPA + SPN 验证 + 签名 | 阻断中继 |
| GPP 密码 | 中 | 清除历史 GPP + 密码存管 | 已消除 |
| BloodHound | 高 | 收紧组权限 + 清理攻击路径 | 路径大幅减少 |
| LLMNR/NBT-NS | 中 | 禁用 LLMNR + NBT-NS | 消除投毒 |

### krbtgt 密码重置流程

krbtgt 密码重置（必须双重重置）：

```powershell
# 第一次重置：立即生效，但旧密码的票据仍可用（最长 10 小时）
Reset-ADAccountPassword krbtgt

# 等待 > 10 小时（最大票据生存时间）

# 第二次重置：此时所有旧密码生成的票据全部失效
Reset-ADAccountPassword krbtgt

# 验证
Get-ADUser krbtgt -Property PasswordLastSet
```

### 持续优化机制

| 机制 | 频率 | 说明 |
|------|------|------|
| BloodHound 扫描 | 每周 | 重新采集数据，评估攻击路径变化 |
| PingCastle 评估 | 每月 | 评分对比，识别新增风险 |
| krbtgt 密码重置 | 每 180 天 | 双重重置流程 |
| 特权账户审计 | 每周 | Domain Admins / EA / SA 成员变更 |
| SPN 账户审计 | 每月 | 检查 Kerberoastable 账户 |
| GPO 变更审计 | 实时 | 监控组策略变更事件 (Event 5136) |
| NTLM 使用审计 | 每月 | 评估 NTLM 使用占比，逐步淘汰 |
| 安全基线更新 | 每季度 | 跟踪微软安全基线更新 |

### 度量指标

| 指标 | 基线 | 目标 |
|------|------|------|
| PingCastle 评分 | 65 分 | ≥ 85 分 |
| 高危攻击路径数 | 12 | ≤ 2 |
| Domain Admins 成员数 | 15 | ≤ 5 |
| Kerberoastable 账户 | 8 | 0 |
| NTLM 使用占比 | 40% | ≤ 5% |
| krbtgt 密码年龄 | 2 年 | ≤ 180 天 |
| 审计覆盖率 | 50% | 100% |
| DCSync 权限账户 | 8 | 3 (仅 DC) |
