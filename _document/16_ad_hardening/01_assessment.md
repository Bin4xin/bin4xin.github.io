---
layout: document
title: "域环境安全评估"
short_title: "安全评估"
order: 1
icon: "fas fa-network-wired"
status: "stable"
tags: [ActiveDirectory, 组策略, 域安全, 凭据保护, 横向移动]
author: sentryCyberSec
version: "3.0"
description: "Windows Active Directory 域环境安全加固技战法，涵盖域环境安全评估、组策略安全加固实施和攻击面验证与持续优化三个阶段。"
---
## 场景 2 — 阶段一：域环境安全评估

### 评估维度总览

| 维度 | 评估项数 | 说明 |
|------|---------|------|
| 域控制器安全 | 15 | DC 硬件/软件/补丁/服务配置 |
| 账户与权限 | 22 | 特权账户、服务账户、密码策略 |
| Kerberos 配置 | 12 | 加密类型、委派配置、票据策略 |
| NTLM 配置 | 8 | NTLM 版本限制、中继防护 |
| 组策略配置 | 18 | GPO 安全基线、权限配置 |
| 信任关系 | 6 | 林/域信任、SID 过滤 |
| DNS 安全 | 8 | AD 集成 DNS、安全动态更新 |
| 审计与日志 | 12 | 关键事件审计、日志集中 |

**总计：101 项评估检查点**

### 特权账户评估

| 评估项 | 风险等级 | 检查内容 |
|--------|----------|----------|
| Domain Admins 成员数 | 高 | 应 ≤ 5 个，且使用独立管理账户 |
| Enterprise Admins 成员数 | 高 | 应 ≤ 3 个，默认仅 Administrator |
| Schema Admins 成员数 | 高 | 应为空，需要时临时加入 |
| krbtgt 账户密码年龄 | 高 | 应 ≤ 180 天，定期重置 |
| 服务账户密码强度 | 高 | SPN 关联账户应使用 ≥ 25 位随机密码 |
| 域管账户登录限制 | 高 | 仅允许登录域控，禁止登录普通服务器 |
| 本地管理员密码统一 | 中 | 应部署 LAPS 统一管理 |
| AdminCount=1 账户 | 中 | 检查受保护组成员的合理性 |

### BloodHound 攻击路径分析

BloodHound 关键查询：

```cypher
MATCH p=shortestPath((u:User {highvalue:false})-[*1..]->(g:Group {highvalue:true})) RETURN p
```

发现的典型攻击路径：

- 普通用户 → HelpDesk组 → OU管理权限 → 域管
- 普通用户 → SQL服务账户(弱密码) → 域管组成员
- 外部VPN用户 → 服务器本地管理员 → 域管Token

### 评估工具矩阵

| 工具 | 用途 | 说明 |
|------|------|------|
| BloodHound | 攻击路径分析 | 可视化域对象关系和攻击路径 |
| PingCastle | AD 安全评分 | 一键扫描 + 风险评分 + 修复建议 |
| Purple Knight | AD 安全评估 | Semperis 免费工具，50+ 检查项 |
| ADRecon | 配置采集 | 自动化采集 AD 配置信息 |
| Testimo | GPO 审计 | PowerShell 模块，GPO 配置审计 |
| SharpHound | 数据采集 | BloodHound 数据采集器 |

### 评估输出

| 输出物 | 说明 |
|--------|------|
| 安全评分报告 | PingCastle 评分 + 行业对标 |
| 攻击路径图 | BloodHound 关键攻击路径 Top 10 |
| 风险清单 | 按高/中/低分类的配置缺陷清单 |
| 加固建议 | 按优先级排序的加固措施建议 |
| 基线差距分析 | 当前配置 vs 安全基线的差距 |
