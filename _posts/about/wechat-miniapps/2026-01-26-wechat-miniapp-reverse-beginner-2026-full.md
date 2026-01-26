---
layout: about
category: about
Researchname: 微信小程序逆向I
toc: true
author: Bin4xin
permalink: /about/wechat-miniapp-reverse-beginner/
desc: 「移动攻防」
---

# 微信小程序逆向入门（2026超详细新手版）——从找到包到成功导入开发者工具

微信小程序逆向的核心目标通常是：拿到源码 → 看懂页面结构 → 找到网络请求逻辑 → 分析加密/签名算法。本文针对零基础读者，从最基础的操作开始，一步一步带你完成第一次完整逆向。

**重要声明**：本文内容仅供学习研究、合法安全测试使用。任何用于商业竞争、黑产、侵犯用户隐私的行为均属违法，请严格遵守法律法规。

## 1. 为什么2026年逆向小程序仍然有意义？

- UI/交互/动效设计参考（很多小程序前端体验远超H5）
- 接口参数构造学习（尤其是加密参数的生成逻辑）
- 安全评估（是否存在明文传输敏感信息、弱签名等问题）
- 协议模拟/抓包补环境（爬虫、自动化测试场景）
- 个人兴趣/技术钻研

## 2. 环境准备（强烈建议PC微信路线，无需Root）

（原内容保持不变）

## 6. 第一次逆向后的下一步行动清单

（原内容保持不变）

---

## 7. 新手必做实战：识别 HTTPS 下的业务加密请求

> **关键认知升级**：  
> HTTPS ≠ 参数不可逆  
> 你现在要学会的是：**识别“业务层加密”，而不是去解 HTTPS**

---

### 7.1 抓包时你会看到什么？

使用 Charles / Proxyman 抓包后，新手通常会看到两种情况：

✅ **情况 A：明文 JSON（低安全）**

```json
{
  "phone": "138****8888",
  "code": "123456"
}
```

✅ **情况 B：明显的业务加密（高频）**

```json
{
  "data": "U2FsdGVkX1+9X6l0d7Y8W...",
  "sign": "a8f1c3e9..."
}
```

👉 **看到长 Base64 / Hex 字符串，99% 是 AES / DES / SM4**

---

### 7.2 在源码中快速定位“加密入口”

打开 `app-service.js`，按顺序搜索：

```text
encrypt
AES
CryptoJS
md5
sha1
sha256
sign
```

新手最常见的加密函数长这样：

```js
function encryptData(data) {
  const key = getKey()
  return CryptoJS.AES.encrypt(
    JSON.stringify(data),
    key,
    { mode: CryptoJS.mode.CBC }
  ).toString()
}
```

✅ **判断要点**：

- 是否在 `wx.request` 前调用
- 是否对整个 payload 加密
- key 是否来自 storage / 全局变量

---

### 7.3 为什么“看得见代码 = 理论上可解”

哪怕你暂时不会 Hook，也可以先**验证算法正确性**。

#### ✅ 用 Node.js 复现 AES（验证你理解没错）

```js
const CryptoJS = require('crypto-js')

const cipher = 'U2FsdGVkX1+9X6l0...'
const key = 'testkey12345678'

const bytes = CryptoJS.AES.decrypt(cipher, key)
console.log(bytes.toString(CryptoJS.enc.Utf8))
```

如果能还原 JSON，说明：

✅ 算法确认  
✅ 模式确认  
✅ 参数结构确认  

**剩下的只是“key 从哪里来”**

---

### 7.4 新手阶段你不需要做的事（很重要）

❌ 不需要 Root  
❌ 不需要 Frida  
❌ 不需要 Hook HTTPS  
❌ 不需要破解 TLS  

你现在的目标只有一个：

> **能看懂：哪些参数是业务加密，哪些函数负责加密**

---

### 7.5 本阶段达成的能力清单 ✅

- ✅ 能区分 HTTPS 与业务层加密
- ✅ 能在源码中定位加密函数
- ✅ 能判断 AES / 签名 / 混合加密
- ✅ 能用脚本验证算法正确性

---

下一篇文章我们将进入 **Frida Hook 阶段**，  
你将第一次在真机上看到：

> 👉 **“加密前的明文，是如何被直接打印出来的”**