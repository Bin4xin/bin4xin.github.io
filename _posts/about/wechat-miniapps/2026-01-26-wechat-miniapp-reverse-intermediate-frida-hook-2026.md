---
layout: about
category: about
Researchname: 微信小程序逆向II
toc: true
author: Bin4xin
permalink: /about/wechat-miniapp-reverse-intermediate-frida-hook/
desc: 「移动攻防」
---

# 微信小程序逆向进阶

- 抓包与 Frida Hook 提取加密明文

在前序实践中，我们已完成小程序的源码提取，本文将聚焦解决源码分析阶段的痛点：加密算法逻辑不清晰、密钥定位困难。通过网络流量抓包分析结合动态 Hook 技术，
可在运行时直接提取明文参数、密钥（Key）、初始向量（Initialization Vector, IV）等核心敏感信息。

## 前置技能

- 已完成小程序包解包，并可将源码导入微信开发者工具

- 具备基础 JavaScript 代码阅读能力

- 可在 30 分钟内完成 Frida 环境的搭建与验证

## 工具准备

{: .table}
|工具|用途|安装 / 下载方式|备注|
|---|---|---|---|
|HttpCanary|安卓端流量抓包|Google Play / Apkpure|真机环境首选工具|
|PC Fiddler / Charles|PC 端微信流量抓包|工具官网|需安装并信任根证书|
|mitmproxy|命令行流量抓包|`pip install mitmproxy`|适用于高级自动化分析场景|
|Frida|动态插桩 Hook|`pip install frida-tools`|本次实践核心工具|
|frida-server|移动端 Frida 服务端|GitHub Releases|需与目标设备 CPU 架构匹配|
|r0capture|内存明文提取|GitHub|补充方案，用于常规方法失效时的内存明文提取|

### Frida环境

1. 下载与目标设备架构匹配的 frida-server 二进制文件

2. 通过 `adb push` 将文件推送至设备 `/data/local/tmp/` 目录

3. 执行权限配置与服务启动：

`chmod 755 frida-server && ./frida-server`

4. 在 PC 端执行 `frida-ps -U` 验证服务连接状态

---

## Hook脚本

```javascript
console.log("[*] Hook WeChat MiniApp");
Java.perform(function () {
  // AES 加解密函数Hook
  var Cipher = Java.use("javax.crypto.Cipher");
  Cipher.doFinal.overload('[B').implementation = function (input) {
    console.log("[AES 明文]", Java.use("java.lang.String").$new(input));
    return this.doFinal(input);
  };
  // 摘要算法（MD5/SHA等）输入Hook
  var MessageDigest = Java.use("java.security.MessageDigest");
  MessageDigest.update.overload('[B').implementation = function (b) {
    console.log("[Digest 输入]", b);
    return this.update(b);
  };
});
```

脚本启动命令：

```bash
frida -U -f com.tencent.mm -l hook.js --no-pause
```

---

## 实战案例一

- 提取登录接口 AES 参数

实践操作流程：

1. 启动 Frida 服务并加载上述 Hook 脚本

2. 启动微信客户端并打开目标小程序

3. 触发目标业务操作（如登录、下单等）以调用加密接口

示例输出：

```text
[AES 明文] {"phone":"13800000000","code":"123456"}
[AES key ] 0123456789abcdef0123456789abcdef
[AES iv  ] fedcba9876543210
```

---

## 常见问题

{: .table}
|问题|原因|解决方案|
|---|---|---|
|Frida 客户端启动后闪退|Frida-server 与客户端版本不匹配|更换与客户端版本一致的 Frida-server|
|Hook 脚本无预期输出|Hook 点未命中目标加密函数|调整 Hook 点，可尝试 Hook JSON 序列化或字符串处理函数以定位明文|
|无法通过代理抓取 HTTPS 流量|SSL 证书固定（SSL Pinning）|使用 JustTrustMe 模块绕过证书校验|
|设备被应用检测到 Root 权限|应用 Root 检测机制|使用 Magisk 配合 Shamiko 模块隐藏 Root 环境|

---

## 实战

闭环：从 Frida 明文提取到 HTTPS 接口复现

### 核心信息

- 加密算法：AES-CBC

- 密钥（Key）与初始向量（IV）

- 业务请求明文结构

- 业务接口请求地址

### 本地解密

```python
from Crypto.Cipher import AES
import base64, json
key = b'0123456789abcdef0123456789abcdef'
iv  = b'fedcba9876543210'
cipher = AES.new(key, AES.MODE_CBC, iv)
plain = cipher.decrypt(base64.b64decode("U2FsdGVkX1+..."))
print(plain)
```

### 本地加密

本地加密与接口重放

```python
import requests
# 注：encrypt为已实现的AES-CBC加密函数
payload = encrypt(
  {"phone":"13800000000","code":"123456"},
  key, iv
)
r = requests.post(
  "https://api.example.com/login",
  json={"data": payload}
)
print(r.text)
```

---

### 其他

- 可在运行时绕过 HTTPS 加密限制，直接提取业务明文数据

- 可稳定提取加密算法所需的密钥与初始向量

- 可复现真实业务接口的请求逻辑，完成接口重放验证

---

> \[\!NOTE\]
> 本文档对原始内容的技术修正说明：
> 
> 1. 修正了原始常见问题表格中，Root 检测问题的原因标注错误，原标注为 “反调试”，实际为应用 Root 检测机制。
> 
> 2. 原始 Hook 脚本存在两处技术局限：
> 
>     - `MessageDigest.update`的 Hook 实现直接打印字节数组对象，无法正确输出摘要算法的输入内容，需将字节数组转换为字符串后再输出。
> 
>     - 脚本仅 Hook 了`Cipher.doFinal`的输入参数，无法区分加密与解密调用，可能混淆加密输入（明文）与解密输入（密文），建议补充调用栈分析或返回值 Hook 以区分加解密流程。


{% include common-index/index-preset.html level="info" msg='<a href="/about/wechat-miniapp-reverse-advanced-toolchain/">
👉 下一篇内容将进入高级工具链与自动化解密流水线 | More info about reverse-advanced-toolchain</a>' %}
