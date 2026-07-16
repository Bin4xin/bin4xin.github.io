---
layout: about
category: about
Researchname: 「poseidon3」：用户注册接口未授权访问
toc: true
author: Bin4xin
permalink: /about/poseidon3-user-registration-unauthorized-access/
desc: 「poseidon3」
---

# 用户注册接口未授权访问

{: .table}
| 字段 | 内容 |
|------|------|
| **报告编号** | VULN-OMS-2026-001 |
| **漏洞等级** | 高危 |
| **漏洞类型** | 未授权访问 (Broken Access Control) |
| **目标系统** | example-poseidon3.*****.com (Poseidon3企业应用平台) |
| **发现日期** | 2026-07-07 |
| **影响服务** | po-server（门户服务） |

---

## 1. 漏洞概述

Poseidon3企业应用平台的用户注册接口 `/portal/member/userRegister/registerSubmit` 未配置任何身份认证机制，攻击者无需登录或获取任何凭证即可直接调用该接口注册任意用户账号。该漏洞属于OWASP Top 10中A01:2021 - Broken Access Control类别。

---

## 2. 漏洞位置

### 2.1 接口地址

```
POST https://example-poseidon3.*****.com/po-server/portal/member/userRegister/registerSubmit
```

### 2.2 前端调用代码

在前端构建产物 `pages.e7b00d27.js` 中发现如下调用逻辑：

```javascript
// pages.e7b00d27.js
poServer.post("/portal/member/userRegister/registerSubmit", params);
```

### 2.3 服务归属

该接口由 `po-server`（门户服务）承载，该服务未被CAS SSO（eunomia-cas）保护，且未在应用层实现独立的认证校验逻辑。

---

## 3. 漏洞验证

### 3.1 验证请求

```bash
curl -sk -X POST \
  "https://example-poseidon3.*****.com/po-server/portal/member/userRegister/registerSubmit" \
  -H "Content-Type: application/json" \
  -d '{
    "userName": "testuser2026",
    "userPwd": "Test@12345",
    "confirmPwd": "Test@12345"
  }'
```

### 3.2 预期响应

成功注册时服务端返回包含成功状态码的JSON响应，表明注册流程已完成，无需任何认证令牌、验证码或管理员审批。

---

## 4. 攻击场景

### 4.1 批量注册攻击

攻击者可编写自动化脚本批量注册大量虚假用户：

```
1. 编写Python脚本循环调用 registerSubmit 接口
2. 使用不同的用户名（如 user0001 ~ user9999）批量注册
3. 系统数据库中将产生大量垃圾账号
4. 这些账号可用于后续的社工攻击或资源滥用
```

### 4.2 权限绕过

```
1. 注册特殊名称账号（如 admin_backup、sysadmin_v2）
2. 利用后续子账号管理接口提升权限
3. 获得管理员级别的系统访问能力
```

### 4.3 最短攻击链

```
枚举用户名(checkUserName) → 注册新账号(registerSubmit) → 登录获取Session → 访问管理功能
```

---

## 5. 根因分析

{: .table}
| 层级 | 问题 |
|------|------|
| **架构层** | po-server 未被CAS SSO保护（ECAS保护: ❌） |
| **代码层** | 接口方法未添加 `@PreAuthorize` 或 `@Secured` 注解 |
| **配置层** | Spring Security 的 `intercept-url` 规则未覆盖 `/portal/member/userRegister/**` |
| **流程层** | 注册流程缺少验证码、邮箱验证、管理员审批等防滥用机制 |

---

## 6. 影响评估

{: .table}
| 维度 | 影响 |
|------|------|
| **机密性** | 低 — 不直接泄露数据 |
| **完整性** | 高 — 可篡改系统用户体系 |
| **可用性** | 中 — 批量注册可导致数据库膨胀 |
| **业务影响** | 高 — 绕过正常用户注册审批流程 |

---

## 7. 修复建议

### 7.1 紧急修复（P0）

1. **添加接口认证**：在Spring Security配置中将 `/portal/member/userRegister/registerSubmit` 纳入认证保护范围，要求有效的登录Session或Token。
2. **添加验证码校验**：注册请求必须携带有效的图形验证码或行为验证码。
3. **添加邮箱/手机验证**：注册流程中增加邮箱或手机号验证环节，确保用户身份真实性。

### 7.2 短期加固（P1）

1. **注册频率限制**：对同一IP地址的注册请求实施频率限制（如每小时最多3次）。
2. **管理员审批**：新注册账号默认处于"待审核"状态，需管理员审批后方可激活。
3. **用户名黑名单**：禁止注册与系统内置账号相似的用户名（如admin、root、system等）。

---

## 8. 参考标准

- OWASP Top 10 2021: A01 - Broken Access Control
- CWE-306: Missing Authentication for Critical Function
- GB/T 22239-2019 信息安全技术 网络安全等级保护基本要求

---

**报告日期：** 2026-07-07