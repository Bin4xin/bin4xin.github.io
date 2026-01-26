---
layout: about
category: about
Researchname: 小程序安全加固指南
toc: true
author: Bin4xin
permalink: /about/protect-wechat-miniapp-from-reverse-engineering/
desc: 「移动攻防」
---

# 小程序安全加固指南：如何让逆向者“解得心累、收益为负”（2026版）

目标读者：小程序开发者、安全工程师、风控同学。

逆向成本 = 时间 × 技术难度 × 法律风险  
好的加固不是让黑客完全解不开，而是让成本远高于收益。

---

## 2026年性价比最高加固组合（从易到难）

优先级 | 加固手段                               | 实现难度 | 防逆向提升 | 维护成本
-------|----------------------------------------|----------|------------|----------
1      | AES-256-CBC + RSA-OAEP混合 + 动态key   | ★★★      | ★★★★☆      | 低
2      | WebCrypto API + SM2/SM4国密            | ★★★★     | ★★★★☆      | 中
3      | 字节码虚拟机（腾讯/字节/第三方服务）    | ★★★★★    | ★★★★★      | 高
4      | 多层wrapper + 花指令 + 函数自校验      | ★★★★     | ★★★★☆      | 中
5      | 设备/行为指纹 + RASP + 二次校验        | ★★★★     | ★★★★☆      | 中高
6      | 代码分割 + 按需加载 + 反调试检测       | ★★★★     | ★★★★       | 中

---

## 案例一：HTTPS 之上，业务层 AES 加密是如何被解的？

> **误区**：用了 HTTPS，就没人能看到请求内容  
> **现实**：HTTPS 只能防“中间人”，防不了“终端逆向”

### ✅ 小程序端真实加密代码（攻击目标）

```js
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

抓包只能看到：

```json
{
  "payload": "U2FsdGVkX1+9X6l0..."
}
```

---

### ❌ 攻击者真实解法（Frida Hook）

HTTPS 并不会阻止如下 Hook：

```js
Java.perform(function () {
  const AES = Java.use('javax.crypto.Cipher')

  AES.doFinal.overload('[B').implementation = function (data) {
    console.log('[AES 明文]', Java.use('java.lang.String').$new(data))
    return this.doFinal(data)
  }
})
```

---

### ✅ 防守侧升级建议

- AES key 不应直接存在于 JS 运行时
- key 应通过 RSA 公钥加密下发
- 解密逻辑拆散到多个 wrapper / VM 内

---

## 案例二：动态 key ≠ 安全（如果派生方式可预测）

### ❌ 常见“伪动态 key”设计

```js
const key = md5(openid + Date.now()).substr(0, 16)
```

### 攻击者视角

```js
Date.now = () => 1700000000000
```

---

### ✅ 正确做法

```text
key = HKDF(
  server_nonce,
  device_fp,
  session_secret
)
```

并在服务端二次校验设备行为指纹。

---

## 加密设计必须遵守的 8 条铁律（含逆向解释）

1. 密钥永不写死在前端  
2. AES key 必须服务器生成并公钥加密下发  
3. 每次请求使用不同 IV  
4. 敏感字段分包加密  
5. 行为指纹必须参与服务端校验  
6. 核心函数做 toString 校验  
7. 上线前自己完整逆一遍  
8. 定期轮换公钥并监控异常解包

---

## 攻击者真实工作流（你必须假设他们会这样做）

```text
1. Charles 抓包
2. KillWxapkg 解包
3. Frida Hook AES / RSA
4. 自动化解密脚本
```

---

## 快速落地方案（1–2 周）

当前状态                 → 推荐升级路径  
只有 MD5 签名            → AES-CBC + RSA-OAEP  
固定 AES key             → 登录态动态下发  
无环境校验               → 指纹 + RASP  
代码可读性高             → 字节码 + wrapper  

---

一句话总结：

> 真正有效的防护，是让逆向者花一个月才解出接口，而业务窗口只剩三天。