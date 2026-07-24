---
layout: about
category: about
Researchname: 「poseidon3」：系统配置信息泄露
toc: true
author: Bin4xin
permalink: /about/poseidon3-system-config-information-disclosure/
desc: 「poseidon3」
---

{% include common-index/index-preset.html level="error" msg="本文所述漏洞仅用于安全研究与合规审计目的，任何未授权的渗透测试或恶意利用行为均违反相关法律法规，后果由使用者自行承担。<br>本文所涉及漏洞信息仅供授权安全研究与合规审计使用，任何未经授权的测试或恶意利用均属违法行为。" %}

# 系统配置信息泄露

{: .table}
| 字段 | 内容 |
|------|------|
| **报告编号** | VULN-OMS-2026-003 |
| **漏洞等级** | <span style="color:#bc6f00;font-weight:bold">🟠 中危</span> |
| **漏洞类型** | 信息泄露 (Information Disclosure) |
| **目标系统** | example-poseidon3.*****.com (Poseidon3企业应用平台) |
| **发现日期** | 2026-07-07 |
| **影响服务** | platform-server（平台主服务） |

---

## 1. 漏洞概述

Poseidon3企业应用平台的登录配置接口 `/member/desk/getLoginSwitch` 无需任何身份认证即可访问，返回内容包含大量系统内部敏感配置信息，如RSA公钥、内网CAS单点登录服务器地址、双因素认证开关状态、验证码策略等。攻击者可利用这些信息构造针对性攻击。该漏洞属于OWASP Top 10中 `A01:2021 - Broken Access Control` 和 `A05:2021 - Security Misconfiguration` 类别。

{% include common-index/index-preset.html level="warn" msg="登录配置接口无需认证即可访问，泄露RSA公钥、内网CAS服务器地址、验证码策略、2FA开关状态等关键安全配置信息，可直接辅助暴力破解和内网渗透攻击。" %}

---

## 2. 漏洞位置

### 2.1 接口地址

```
GET https://example-poseidon3.*****.com/platform-server/member/desk/getLoginSwitch
```

### 2.2 服务归属

该接口由 `platform-server`（平台主服务）承载。该服务未被CAS SSO保护，且接口未设置任何认证校验。

{% include common-index/index-preset.html level="info" msg="提示：platform-server 是平台主服务，承载用户登录、系统配置等核心功能。该服务的接口暴露可能为其他漏洞（如暴力破解、内网渗透）提供关键信息支撑。" %}

---

## 3. 泄露内容分析

### 3.1 响应数据示例

{% details 👉 响应数据示例（JSON） %}

```json
{
  "sendSMSCooldown": 60,
  "checkPwdEncrypt": "1",
  "enable.2fa": "false",
  "checkVerifyCode": "0",
  "publicKey": "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDK/ublstF...",
  "casServerLoginURL": "http://172.**.**.**:7070/eunomia-cas/login",
  "deskTitle": "Poseidon3企业应用平台"
}
```

{% enddetails %}

### 3.2 敏感字段解读

{: .table}
| 字段 | 泄露内容 | 风险等级 | 攻击利用价值 |
|------|----------|----------|-------------|
| `publicKey` | RSA公钥明文 | <span style="color:#bc6f00;font-weight:bold">🟠 中</span> | 可用于构造加密后的登录密码payload，绕过前端加密保护 |
| `casServerLoginURL` | 内网CAS服务器地址 `http://172.**.**.**:7070` | <span style="color:#cf222e;font-weight:bold">🔴 高</span> | 暴露内网IP地址和端口，可用于SSRF攻击或内网横向渗透 |
| `enable.2fa` | 双因素认证状态：`false` | <span style="color:#bc6f00;font-weight:bold">🟠 中</span> | 攻击者确认系统未启用2FA，仅需密码即可完成认证 |
| `checkVerifyCode` | 验证码校验策略：`0`（未启用） | <span style="color:#bc6f00;font-weight:bold">🟠 中</span> | 攻击者确认可进行无验证码的暴力破解攻击 |
| `checkPwdEncrypt` | 密码加密策略：`1`（RSA加密） | <span style="color:#1f7bdf">🔵 低</span> | 攻击者了解密码传输加密方式 |
| `sendSMSCooldown` | 短信发送冷却时间：60秒 | <span style="color:#1f7bdf">🔵 低</span> | 攻击者了解短信接口限频策略 |
| `deskTitle` | 平台名称 | <span style="color:#1f7bdf">🔵 低</span> | 确认目标系统为Poseidon3平台 |

{% include common-index/index-preset.html level="error" msg="警告：泄露的内网CAS服务器地址和RSA公钥可直接用于构造暴力破解攻击和内网渗透，属于高价值情报信息。" %}

---

## 4. 漏洞验证

### 4.1 验证请求

{% details 👉 curl 验证请求 %}

```bash
curl -sk "https://example-poseidon3.*****.com/platform-server/member/desk/getLoginSwitch"
```

{% enddetails %}

### 4.2 验证要点

- 请求未携带任何认证Cookie、Session Token或JWT
- 服务端返回HTTP 200状态码，响应体包含完整系统配置
- 未返回401/403等认证失败状态码

{% include common-index/index-preset.html level="warn" msg="注意：验证过程应在授权范围内进行，获取的敏感配置信息（如内网IP、RSA公钥）不应被用于未授权的攻击活动。" %}

---

## 5. 攻击场景

### 5.1 辅助暴力破解攻击

{% details 👉 辅助暴力破解攻击步骤 %}

```
1. 通过 getLoginSwitch 确认 checkVerifyCode=0（验证码未启用）
2. 确认 enable.2fa=false（双因素认证未启用）
3. 获取RSA公钥，构造加密后的密码payload
4. 利用 /portal/member/login/j_spring_security_check 接口进行暴力破解
5. 无需绕过验证码或2FA，攻击成本极低
```

{% enddetails %}

### 5.2 内网渗透攻击

{% details 👉 内网渗透攻击步骤 %}

```
1. 通过 getLoginSwitch 获取CAS服务器内网地址：172.**.**.**:7070
2. 若攻击者已获得内网访问权限（如通过VPN或受控终端）
3. 直接访问CAS服务器，利用已知CAS漏洞进行攻击
4. 获取CAS管理员权限，控制所有关联的SSO系统
```

{% enddetails %}

### 5.3 RSA公钥利用

{% details 👉 RSA公钥利用步骤 %}

```
1. 获取RSA公钥
2. 分析前端代码中RSA加密逻辑
3. 构造加密后的恶意密码payload
4. 结合暴力破解接口进行自动化攻击
```

{% enddetails %}

> **情报价值：** 该接口泄露的信息是整个攻击链的起点，为后续暴力破解、内网渗透提供了关键情报支撑。

{% include common-index/index-preset.html level="warn" msg="攻击链说明：系统配置信息泄露为后续攻击（暴力破解、内网渗透）提供关键情报，建议结合同系列漏洞报告一并修复。" %}

---

## 6. 根因分析

{: .table}
| 层级 | 问题 |
|------|------|
| **架构层** | platform-server 未被CAS SSO保护 |
| **设计层** | 接口设计时将过多系统配置信息暴露给前端 |
| **代码层** | 接口未做认证检查，返回数据未做最小化处理 |
| **配置层** | Spring Security 未将 `/member/desk/getLoginSwitch` 纳入认证保护 |

{% include common-index/index-preset.html level="info" msg="提示：根因在于接口返回数据未做最小化处理，将大量内部安全配置信息暴露给未认证用户。建议遵循「最小化返回」原则，仅返回前端渲染必需的最少配置信息。" %}

---

## 7. 影响评估

{: .table}
| 维度 | 影响 |
|------|------|
| **机密性** | <span style="color:#cf222e;font-weight:bold">🔴 高</span> — 泄露系统内部架构和安全策略 |
| **完整性** | <span style="color:#1f7bdf">🔵 低</span> — 不直接导致数据篡改 |
| **可用性** | <span style="color:#1f7bdf">🔵 低</span> — 不直接影响系统可用性 |
| **业务影响** | <span style="color:#bc6f00;font-weight:bold">🟠 中</span> — 为后续攻击提供关键情报 |

---

## 8. 修复建议

### 8.1 紧急修复（P0）

{% include common-index/index-preset.html level="error" msg="紧急：登录配置接口泄露RSA公钥和内网CAS服务器地址，可直接辅助暴力破解和内网渗透攻击，建议在发现漏洞后 24 小时内完成 P0 级修复。" %}

1. **添加接口认证**：将 `/member/desk/getLoginSwitch` 纳入认证保护范围，未认证请求返回403。
2. **最小化返回数据**：移除所有非前端必需的敏感字段，仅返回前端渲染必需的最少配置信息。

### 8.2 短期修复（P1）

1. **移除内网地址**：`casServerLoginURL` 不应在前端返回内网IP地址，改为返回外部可达的代理地址或移除该字段。
2. **移除RSA公钥**：RSA公钥不应通过未认证接口返回，改为在登录页面初始化时通过认证通道获取。
3. **启用验证码**：将 `checkVerifyCode` 设置为1，启用图形验证码。
4. **启用双因素认证**：将 `enable.2fa` 设置为true，启用2FA。

{% include common-index/index-preset.html level="info" msg="提示：P1 级修复建议在漏洞发现后 7 个工作日内完成，并在修复完成后进行回归测试，确认登录流程功能正常且不泄露敏感配置信息。" %}

### 8.3 长期加固（P2）

1. **配置信息分级**：将系统配置信息分为公开级、内部级和机密级，不同级别通过不同认证通道返回。
2. **API响应审查**：建立API响应数据审查机制，定期检查接口返回数据是否包含敏感信息。
3. **安全网关**：通过API网关统一管理接口访问控制，拦截未认证请求。

---

## 9. 参考标准

- [OWASP Top 10 2021: A01 - Broken Access Control](https://owasp.org/Top10/A01_2021-Broken_Access_Control/){:target="_blank"}
- [OWASP Top 10 2021: A05 - Security Misconfiguration](https://owasp.org/Top10/A05_2021-Security_Misconfiguration/){:target="_blank"}
- [CWE-200: Exposure of Sensitive Information to an Unauthorized Actor](https://cwe.mitre.org/data/definitions/200.html){:target="_blank"}
- [CWE-306: Missing Authentication for Critical Function](https://cwe.mitre.org/data/definitions/306.html){:target="_blank"}
- GB/T 22239-2019 信息安全技术 网络安全等级保护基本要求

---

**报告日期：** 2026-07-07