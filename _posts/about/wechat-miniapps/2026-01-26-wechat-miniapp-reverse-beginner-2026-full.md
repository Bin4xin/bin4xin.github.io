---
layout: about
category: about
Researchname: 微信小程序逆向I
toc: true
author: Bin4xin
permalink: /about/wechat-miniapp-reverse-beginner/
desc: 「移动攻防」
---

# 微信小程序逆向入门

微信小程序逆向的核心目标通常为：提取小程序源码、分析页面结构、定位网络请求逻辑、解析加密与签名算法。本文面向零基础读者，从基础操作开始，逐步引导完成首次完整的小程序逆向分析实践。

## 1. 实践价值

为什么 2026 年小程序逆向仍有实践价值？

- UI、交互与动效设计参考：小程序的前端体验通常优于普通 H5，可作为设计参考

- 接口参数构造学习：重点学习加密参数的生成逻辑

- 安全评估：检测应用是否存在明文传输敏感信息、弱签名等安全问题

- 协议模拟与环境补全：适用于爬虫、自动化测试等场景

- 个人技术研究与兴趣探索

## 2. 环境准备

推荐 PC 微信方案，无需 Root 权限

2.1 所需工具清单

本方案利用 PC 版微信运行小程序时产生的本地缓存包文件，通过解密和提取，获得前端源码。无需 Root 手机或使用复杂抓包工具，是最简单快捷的入门方法。

{: .table}
|工具|作用|获取方式|
|---|---|---|
|PC 版微信|运行目标小程序，产生缓存文件|微信官网下载|
|解密工具|解密微信的缓存包文件|如`UnpackMiniApp`, `wechatAppDecrypt`等（GitHub 可搜到）|
|Node.js 环境|运行解密脚本|Node.js 官网|
|微信开发者工具|加载、解包并调试得到的小程序源码|微信开放平台下载|

2.2 操作步骤

定位小程序缓存目录：在 PC 微信中运行一次目标小程序。缓存路径通常为：`C:\Users[你的用户名]\Documents\WeChat Files\Applet`。

在该目录下，有一系列以 wx开头的文件夹（如 `wx1234567890abcdef`），每个文件夹对应一个小程序。通过修改时间可以找到刚刚运行的。

提取缓存包文件：
进入对应小程序的文件夹，找到一个较大的 `.wxapkg`文件（通常名称可能是`一串数字`或 `__APP__.wxapkg`），这就是小程序的包文件。

解密与解包：

将从 GitHub 获取的解密工具（通常是一个 Node.js 脚本）放置于方便操作的目录。根据该工具的 README说明，在命令行中执行解密命令。基本命令格式通常类似：

`node unpack.js [.wxapkg文件路径] [输出目录]`

执行成功后，会在输出目录得到解包后的源码文件，主要包括 

- `.wxss`(样式)
- `.wxml`(结构)
- `.js`(逻辑)
- `.json`(配置) 等。

导入开发者工具：
- 打开微信开发者工具，选择 “导入项目”。
- 项目目录选择上一步的输出目录。
- 填写一个唯一的 AppID（可以在开发者工具中点击“测试号”快速获取）。
- 点击“导入”，即可在模拟器中看到小程序界面，并在左侧文件树中浏览、修改和调试所有源码。

常见问题：如果导入后报错（如 `app.json`未找到），请检查解包输出目录的结构，确保 `app.json`在根目录下，有时需要调整导入的路径。

## 3. 后续行动清单

成功将小程序源码导入开发者工具，只是逆向分析的第一步。接下来，你可以按以下清单开展深入分析：
- 3.1 代码结构与业务逻辑梳理：
入口分析：阅读 app.js和 app.json，了解小程序的全局配置、生命周期和公共逻辑。

页面路由：查看 app.json中的 pages字段，理清所有页面路径。

核心页面分析：定位到关键业务页面（如登录页 login、主页 index），逐一分析其 .js文件中的网络请求函数、事件处理函数。

- 3.2 静态分析加密/签名位置：

在开发者工具的源代码中，全局搜索（Ctrl+Shift+F）关键词，如：`encrypt`、`decode`、`sign`、`md5`、`sha`、`AES`、`CryptoJS`、`wx.request`、`uni.request`等。
找到疑似加密参数的生成函数，初步阅读其代码逻辑。

- 3.3 网络请求接口定位：

在开发者工具中打开 “Network” （网络） 面板。在模拟器中操作小程序，触发网络请求。

在网络面板中查看请求的 `URL`、`Method`、`Headers` 和 `Payload`，并与源码中搜索到的请求代码进行对照，建立关联。

- 3.4基础修改与调试尝试：

在开发者工具中，你可以直接修改`.js`文件并保存，实时查看效果。

例如，在请求函数中插入 `console.log`，打印出加密前的原始参数。利用开发者工具的Sources（源代码） 面板，在关键函数处打上断点，单步执行，观察变量状态。

- 3.5 制定进阶分析计划：
如果静态分析无法理清加密逻辑（代码被混淆、关键函数在闭包中），这便是下一阶段的工作起点。

{% include common-index/index-preset.html level="info" msg='<a href="/about/wechat-miniapp-reverse-intermediate-frida-hook/">
附录：【文档内容】微信小程序逆向：抓包 + `Frida Hook` 打印加密明文，开始搭建动态分析环境，通过 Hook 技术捕获运行时的明文、密钥等信息，完成对完整业务逻辑的破解。</a>' %}
---

## 4. 识别

识别 HTTPS 下的业务加密请求

> 核心认知：HTTPS 仅保障传输层安全，不代表业务参数不可逆。本阶段的核心目标是识别业务层加密，而非破解 HTTPS。
> 
> 

---

### 4.1 典型案例

使用 Charles/Proxyman 完成抓包后，新手通常会遇到两种典型场景：

- **场景 A：明文 JSON（低安全防护）**

```json
{
  "phone": "138****8888",
  "code": "123456"
}
```

- **场景 B：业务层加密（高频场景）**

```json
{
  "data": "U2FsdGVkX1+9X6l0d7Y8W...",
  "sign": "a8f1c3e9..."
}
```

> 若抓包到长 Base64 或 Hex 字符串，大概率为 AES、DES 或 SM4 类对称加密的输出。
> 
> 

---

### 4.2 快速定位

在源码中快速定位加密入口

打开解包后的`app-service.js`文件，可按以下关键词顺序搜索，快速定位加密函数：

```text
encrypt
AES
CryptoJS
md5
sha1
sha256
sign
```

新手最常见的加密函数实现如下：

```javascript
function encryptData(data) {
  const key = getKey()
  return CryptoJS.AES.encrypt(
    JSON.stringify(data),
    key,
    { mode: CryptoJS.mode.CBC }
  ).toString()
}
```

定位到函数后，可通过以下要点确认是否为目标加密函数：

- 该函数是否在`wx.request`调用前被执行

- 该函数是否对整个请求 payload 进行加密处理

- 加密密钥是否来自本地存储或全局变量

---

### 4.3 源码分析

源码的意义：理论上所有加密均可还原

即使暂未掌握动态 Hook 技术，也可先通过静态分析完成算法正确性验证。

- 基于 Node.js 的 AES 算法验证

```javascript
const CryptoJS = require('crypto-js')
const cipher = 'U2FsdGVkX1+9X6l0...'
const key = 'testkey12345678'
const bytes = CryptoJS.AES.decrypt(cipher, key)
console.log(bytes.toString(CryptoJS.enc.Utf8))
```

如果成功还原出明文 JSON，即可确认：

- 加密算法类型

- 加密模式配置

- 加密参数的结构
剩余的分析目标仅为定位加密密钥的来源。

---

### 4.4 其他

本阶段无需进行以下复杂操作，避免增加不必要的分析成本：

- 无需获取设备 Root 权限

- 无需使用 Frida 进行动态 Hook

- 无需 Hook HTTPS 相关逻辑

- 无需破解 TLS 加密

本阶段的核心目标为：识别业务层加密参数，定位负责加密的业务函数。

---

完成本阶段实践后，可掌握以下能力：

- 可区分 HTTPS 传输层加密与业务层加密

- 可在源码中快速定位业务加密函数

- 可识别 AES、签名或混合加密的场景

- 可通过脚本完成加密算法的正确性验证

---
> \[\!NOTE\]
> 本文档对原始内容的格式与逻辑修正说明：
> 
> 1. 修正了原始文档的章节号跳跃问题，将原文档中错误的 6、7 章节号调整为连续的 3、4 章节，避免读者误解为内容缺失。
> 
> 2. 调整了部分绝对化表述，将原文档中 “99% 是 AES/DES/SM4” 调整为 “大概率为 AES、DES 或 SM4 类对称加密”，提升表述的严谨性。

{% include common-index/index-preset.html level="info" msg='<a href="/about/wechat-miniapp-reverse-intermediate-frida-hook/">
👉 下一篇内容将进入 Frida Hook 阶段| More info about Frida Hook</a>' %}