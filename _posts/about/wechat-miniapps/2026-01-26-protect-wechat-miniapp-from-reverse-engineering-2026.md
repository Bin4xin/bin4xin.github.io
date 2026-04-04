---
layout: about
category: about
Researchname: 小程序安全加固指南
toc: true
author: Bin4xin
permalink: /about/protect-wechat-miniapp-from-reverse-engineering/
desc: 「移动攻防」
---

# 小程序安全加固指南

逆向成本 = 时间 × 技术难度 × 法律风险

有效的防护并非完全阻止逆向分析，而是将逆向的成本提升至远高于其收益，从而让攻击者放弃攻击。

---

## 性价比加固方案组合

{: .table}
|优先级|加固手段|实现难度|防逆向提升|维护成本|
|---|---|---|---|---|
|1|AES\-256\-CBC \+ RSA\-OAEP 混合加密 \+ 动态密钥|★★★|★★★★☆|低|
|2|WebCrypto API \+ SM2/SM4 国密算法|★★★★|★★★★☆|中|
|3|字节码虚拟机（腾讯 / 字节 / 第三方服务）|★★★★★|★★★★★|高|
|4|多层包装壳 \+ 花指令 \+ 函数自校验|★★★★|★★★★☆|中|
|5|设备 / 行为指纹 \+ RASP \+ 服务端二次校验|★★★★|★★★★☆|中高|
|6|代码分割 \+ 按需加载 \+ 反调试检测|★★★★|★★★★|中|

---

## 案例一

HTTPS 与业务层 AES 加密的防护局限

> 常见防护误区：认为部署 HTTPS 后，请求内容就无法被获取。
> 实际情况：HTTPS 仅能防范传输层的中间人攻击，无法抵御终端侧的逆向分析。
> 
> 

### 常规加密实现

```javascript
import CryptoJS from 'crypto-js'
function encryptPayload(data, key, iv) {
  return CryptoJS.AES.encrypt(
    JSON.stringify(data),
    CryptoJS.enc.Utf8.parse(key),
    {
      iv: CryptoJS.enc.Utf8.parse(iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    }
  ).toString()
}
wx.request({
  url: '/api/order/create',
  data: {
    payload: encryptPayload(
      { skuId: 123, count: 1 },
      sessionKey,
      timestamp.slice(0, 16)
    )
  }
})
```

常规抓包仅能看到加密后的内容：

```json
{
  "payload": "U2FsdGVkX1+9X6l0..."
}
```

---

### 攻击者的突破方式

HTTPS 并不会阻止攻击者执行以下 `Hook` 操作：

```javascript
Java.perform(function () {
  const AES = Java.use('javax.crypto.Cipher')
  AES.doFinal.overload('[B').implementation = function (data) {
    console.log('[AES 明文]', Java.use('java.lang.String').$new(data))
    return this.doFinal(data)
  }
})
```

---

### 防守侧的升级建议

- AES 密钥不应直接暴露在 JS 运行时中

- 密钥需通过 RSA 公钥加密后由服务端下发

- 解密逻辑需拆分到多层包装壳或字节码虚拟机中

---

## 案例二

动态密钥的防护局限：派生逻辑可预测的风险

### 常见的伪动态密钥设计

```javascript
const key = md5(openid + Date.now()).substr(0, 16)
```

### 攻击者的突破视角

攻击者可通过 Hook 篡改时间函数，预测密钥的生成逻辑：

```javascript
Date.now = () => 1700000000000
```

---

### 正确的动态密钥实现

基于 HKDF（密钥派生函数）生成密钥，结合多维度因子：

```text
key = HKDF(
  server_nonce,
  device_fp,
  session_secret
)
```

同时在服务端结合设备与行为指纹完成二次校验。

---

## 加密设计的核心安全原则

1. 密钥不得硬编码在前端代码中

2. AES 密钥需由服务端生成，并通过 RSA 公钥加密后下发

3. 每次请求使用独立的初始向量（IV）

4. 敏感业务字段采用分包加密的方式

5. 设备与行为指纹需参与服务端的请求校验

6. 核心加密函数需添加 toString 校验，防止被 Hook 篡改

7. 上线前需自行完成完整的逆向测试，验证防护有效性

8. 定期轮换加密公钥，并监控异常的解包行为

---

## 攻击者的典型工作流

作为防护方，你需要假设攻击者会执行以下流程：

```text
1. 使用Charles完成流量抓包
2. 使用KillWxapkg完成小程序的自动解包
3. 使用Frida Hook加密相关函数，提取密钥与明文
4. 构建自动化解密脚本，完成协议复现
```

---

## 快速落地方案

针对不同的当前防护状态，可选择对应的升级路径：

- 当前仅使用 MD5 签名：升级为 `AES`\-`CBC` \+ `RSA`\-`OAEP` 的混合加密方案

- 当前使用固定 AES 密钥：升级为基于登录态的动态密钥下发

- 当前无环境校验：添加设备指纹与 `RASP`（运行时应用自我保护）机制

- 当前代码可读性较高：添加字节码混淆与多层包装壳防护

---

### 总结

> 真正有效的防护，是将逆向分析的时间成本提升至超过业务的有效窗口，让攻击者的攻击收益低于其攻击成本。
> 
> 

> \[\!NOTE\]
> 本文档对原始内容的格式与表述修正说明：
> 
> 1. 调整了加固方案表格的格式，统一了星级标识与列对齐，提升可读性。
> 
> 2. 调整了口语化表述，将 “解得心累”“风控同学” 等口语化内容调整为专业的技术表述，统一文档风格。
> 
> 3. 标准化了术语表述，将 “动态 key”“伪动态 key” 调整为 “动态密钥”“伪动态密钥”，统一了技术术语的规范。
> 
> 4. 调整了部分绝对化表述，将 “铁律” 这类绝对化的表述调整为更严谨的安全原则，提升表述的严谨性。
> 
> 