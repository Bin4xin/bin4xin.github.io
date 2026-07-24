---
layout: about
category: about
Researchname: 「poseidon3」：文件上传接口未授权访问
toc: true
author: Bin4xin
permalink: /about/poseidon3-file-upload-unauthorized-access/
desc: 「poseidon3」
---

{% include common-index/index-preset.html level="error" msg="本文所述漏洞仅用于安全研究与合规审计目的，任何未授权的渗透测试或恶意利用行为均违反相关法律法规，后果由使用者自行承担。<br>本文所涉及漏洞信息仅供授权安全研究与合规审计使用，任何未经授权的测试或恶意利用均属违法行为。" %}

# 文件上传接口未授权访问

{: .table}
| 字段 | 内容 |
|------|------|
| **报告编号** | VULN-OMS-2026-002 |
| **漏洞等级** | <span style="color:#cf222e;font-weight:bold">🔴 高危</span> |
| **漏洞类型** | 未授权文件上传 (Unrestricted File Upload) |
| **目标系统** | example-poseidon3.*****.com (Poseidon3企业应用平台) |
| **发现日期** | 2026-07-07 |
| **影响服务** | po-server（门户服务）、pr-server（报审服务） |

---

## 1. 漏洞概述

Poseidon3企业应用平台存在两个未授权文件上传接口，分别位于门户服务（po-server）和报审服务（pr-server）。攻击者无需任何身份认证即可向服务器上传任意文件，若服务端未对文件类型、内容和存储路径进行严格校验，可能导致Webshell上传，进而获取服务器控制权限。该漏洞属于OWASP Top 10中 `A04:2021 - Insecure Design` 及 `A01:2021 - Broken Access Control` 类别。

{% include common-index/index-preset.html level="warn" msg="两个文件上传接口均可未授权访问，若服务端未严格校验文件类型和内容，攻击者可直接上传Webshell获取服务器控制权限（RCE）。" %}

---

## 2. 漏洞位置

### 2.1 接口地址

**接口一：门户服务用户注册文件上传**

```
POST https://example-poseidon3.*****.com/po-server/portal/member/userRegister/uploadFile
```

**接口二：报审服务审批报表文件上传**

```
POST https://example-poseidon3.*****.com/pr-server/dispatch/apprReportDoor/fileUpload
```

### 2.2 前端调用代码

在前端构建产物 `pages.e7b00d27.js` 中发现如下调用逻辑：

```javascript
// pages.e7b00d27.js — 门户服务
poServer.post("/portal/member/userRegister/uploadFile", params, {
  headers: { "Content-Type": "multipart/form-data" }
});

// pages.e7b00d27.js — 报审服务
prServer.post("/dispatch/apprReportDoor/fileUpload", params);
```

### 2.3 服务归属

{: .table}
| 接口 | 服务 | ECAS保护 | 应用层认证 |
|------|------|----------|-----------|
| uploadFile | po-server | <span style="color:#cf222e">❌</span> | <span style="color:#cf222e">❌</span> |
| fileUpload | pr-server | <span style="color:#cf222e">❌</span> | <span style="color:#cf222e">❌</span> |

两个服务均未被CAS SSO保护，且接口层面无独立认证机制。

{% include common-index/index-preset.html level="error" msg="警告：po-server 和 pr-server 两个服务的文件上传接口均无任何认证保护，攻击者可直接上传任意文件。" %}

---

## 3. 漏洞验证

### 3.1 验证请求 — 门户服务

{% details 👉 curl 验证请求 — 门户服务 %}

```bash
curl -sk -X POST \
  "https://example-poseidon3.*****.com/po-server/portal/member/userRegister/uploadFile" \
  -F "file=@test.txt"
```

{% enddetails %}

### 3.2 验证请求 — 报审服务

{% details 👉 curl 验证请求 — 报审服务 %}

```bash
curl -sk -X POST \
  "https://example-poseidon3.*****.com/pr-server/dispatch/apprReportDoor/fileUpload" \
  -F "file=@test.txt"
```

{% enddetails %}

### 3.3 验证要点

- 请求未携带任何认证Cookie、Session Token或JWT
- 服务端未返回401/403状态码，表明无认证拦截
- 需进一步验证服务端对文件扩展名、MIME类型和文件内容的校验强度

{% include common-index/index-preset.html level="warn" msg="注意：验证过程应在授权范围内进行，请勿上传恶意文件（如Webshell），测试完成后应及时清理上传的测试文件。" %}

---

## 4. 攻击场景

### 4.1 Webshell上传攻击

{% details 👉 Webshell上传攻击步骤 %}

```
1. 攻击者构造恶意JSP/PHP文件（如 shell.jsp）
2. 通过 uploadFile 接口上传至服务器
3. 若服务端未校验文件扩展名或将其存储在Web可访问目录
4. 攻击者通过URL直接访问上传的Webshell
5. 获得远程命令执行权限（RCE）
```

{% enddetails %}

### 4.2 存储型XSS攻击

{% details 👉 存储型XSS攻击步骤 %}

```
1. 上传包含恶意JavaScript的HTML文件或SVG文件
2. 其他用户下载或预览该文件时触发XSS
3. 窃取用户Session Token或执行钓鱼操作
```

{% enddetails %}

### 4.3 恶意文件分发

{% details 👉 恶意文件分发步骤 %}

```
1. 上传携带木马的文档文件（如 .docx、.pdf）
2. 利用系统公告/审批流程将恶意文件分发给内部用户
3. 用户下载并打开后感染终端设备
```

{% enddetails %}

### 4.4 攻击链

```
获取系统配置(getLoginSwitch) → 上传Webshell(uploadFile) → 访问Webshell获取RCE → 提权控制服务器
```

> **影响后果：** 若Webshell上传成功，攻击者可获得服务器完全控制权，可读取/修改/删除任意文件，甚至横向渗透内网。

{% include common-index/index-preset.html level="warn" msg="攻击链说明：文件上传漏洞可直接导致远程命令执行（RCE），CVSS 3.1 基础分高达 9.8（Critical），建议结合同系列漏洞报告一并修复。" %}

---

## 5. 根因分析

{: .table}
| 层级 | 问题 |
|------|------|
| **架构层** | po-server 和 pr-server 均未被ECAS保护 |
| **代码层** | 文件上传方法缺少 `@PreAuthorize` 或 `@Secured` 注解 |
| **配置层** | Spring Security 的 URL 拦截规则未覆盖上传接口 |
| **安全设计层** | 文件上传功能缺少以下防护措施：<br>— 文件扩展名白名单校验<br>— 文件MIME类型校验<br>— 文件内容魔数（Magic Number）校验<br>— 文件存储路径与Web根目录隔离<br>— 上传文件重命名策略 |

{% include common-index/index-preset.html level="info" msg="提示：根因在于文件上传功能缺少「认证 + 文件校验 + 存储隔离」的三重防护。仅添加认证而忽略文件内容校验，仍可能存在已登录用户上传恶意文件的风险。" %}

---

## 6. 影响评估

{: .table}
| 维度 | 影响 |
|------|------|
| **机密性** | <span style="color:#cf222e;font-weight:bold">🔴 高</span> — RCE可读取服务器任意文件 |
| **完整性** | <span style="color:#cf222e;font-weight:bold">🔴 高</span> — RCE可修改服务器任意文件 |
| **可用性** | <span style="color:#cf222e;font-weight:bold">🔴 高</span> — RCE可删除数据或停止服务 |
| **业务影响** | <span style="color:#cf222e;font-weight:bold">🔴 严重</span> — 可能导致整个服务器被控制 |

**CVSS 3.1 评估：**

{: .table}
| 指标 | 值 | 说明 |
|------|------|------|
| Attack Vector | Network | 远程可利用 |
| Attack Complexity | Low | 无需特殊条件 |
| Privileges Required | None | 无需认证 |
| User Interaction | None | 无需用户参与 |
| Scope | Changed | 可影响后端服务器 |
| **基础分** | **<span style="color:#cf222e;font-weight:bold">9.8</span>** | **<span style="color:#cf222e;font-weight:bold">Critical</span>** |

---

## 7. 修复建议

### 7.1 紧急修复（P0）

{% include common-index/index-preset.html level="error" msg="紧急：文件上传漏洞 CVSS 评分 9.8（Critical），可直接导致远程命令执行，建议在发现漏洞后 24 小时内完成 P0 级修复。" %}

1. **添加接口认证**：两个上传接口必须要求有效的登录Session或Token，未认证请求直接返回403。
2. **文件类型白名单**：仅允许业务必需的文件类型（如 .jpg、.png、.pdf、.docx），拒绝一切可执行文件（.jsp、.php、.asp、.exe、.sh等）。
3. **文件内容校验**：通过Magic Number验证文件真实类型，防止通过修改扩展名绕过校验。
4. **存储路径隔离**：上传文件存储在Web根目录之外的独立存储区域，禁止通过URL直接访问。

### 7.2 短期加固（P1）

1. **文件重命名**：上传文件使用UUID或随机字符串重命名，防止文件名注入攻击。
2. **文件大小限制**：设置合理的文件大小上限（如10MB），防止DoS攻击。
3. **病毒扫描**：集成文件病毒扫描引擎，对上传文件进行安全检测。
4. **Content-Disposition头**：文件下载时设置 `Content-Disposition: attachment`，防止浏览器直接渲染。

{% include common-index/index-preset.html level="info" msg="提示：P1 级修复建议在漏洞发现后 7 个工作日内完成，并在修复完成后进行回归测试，确认文件上传功能正常且无法上传恶意文件。" %}

### 7.3 长期加固（P2）

1. **独立文件存储服务**：使用对象存储（如MinIO、OSS）替代本地文件系统存储。
2. **CDN分发**：通过CDN提供文件下载，隐藏源站地址。
3. **文件访问审计**：记录所有文件上传和下载操作日志，便于事后追溯。

---

## 8. 参考标准

- [OWASP Top 10 2021: A04 - Insecure Design](https://owasp.org/Top10/A04_2021-Insecure_Design/){:target="_blank"}
- [OWASP Top 10 2021: A01 - Broken Access Control](https://owasp.org/Top10/A01_2021-Broken_Access_Control/){:target="_blank"}
- [CWE-434: Unrestricted Upload of File with Dangerous Type](https://cwe.mitre.org/data/definitions/434.html){:target="_blank"}
- [CWE-306: Missing Authentication for Critical Function](https://cwe.mitre.org/data/definitions/306.html){:target="_blank"}
- GB/T 22239-2019 信息安全技术 网络安全等级保护基本要求

---

**报告日期：** 2026-07-07