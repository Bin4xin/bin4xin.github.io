---
layout: about
category: about
Researchname: 微信小程序逆向II
toc: true
author: Bin4xin
permalink: /about/wechat-miniapp-reverse-intermediate-frida-hook/
desc: 「移动攻防」
---

# 微信小程序逆向进阶：抓包 + Frida Hook 打印加密明文（2026超详细版）

上一期我们拿到了源码，这一期重点解决“源码有了，但加密函数看不懂、key藏在哪里”的问题。通过抓包 + 动态 Hook，我们可以直接在运行时打印出明文参数、key、iv 等核心信息。

## 目标读者 & 前置技能

- 已完成第一次解包并导入开发者工具
- 能看懂最基础的 JavaScript
- 愿意花 30 分钟搭建 Frida 环境

## 工具准备（2026 推荐配置）

工具 | 用途 | 安装 / 下载方式 | 备注
---|---|---|---
HttpCanary | 安卓抓包 | Google Play / apkpure | 真机首选
PC Fiddler / Charles | PC 微信抓包 | 官网 | 需证书信任
mitmproxy | 命令行抓包 | pip install mitmproxy | 高级
Frida | 动态 Hook | pip install frida-tools | 核心
frida-server | 手机端 | github releases | 架构需匹配
r0capture | 内存明文 | github | 兜底方案

### Frida 环境搭建（安卓）

1. 下载对应架构的 frida-server  
2. adb push 到 `/data/local/tmp/`  
3. `chmod 755 frida-server && ./frida-server &`  
4. PC 端 `frida-ps -U` 验证  

---

## 高频 Hook 脚本合集（hook.js）

```javascript
console.log("[*] Hook WeChat MiniApp");

Java.perform(function () {
  // AES
  var Cipher = Java.use("javax.crypto.Cipher");
  Cipher.doFinal.overload('[B').implementation = function (input) {
    console.log("[AES 明文]", Java.use("java.lang.String").$new(input));
    return this.doFinal(input);
  };

  // MD5 / SHA
  var MessageDigest = Java.use("java.security.MessageDigest");
  MessageDigest.update.overload('[B').implementation = function (b) {
    console.log("[Digest 输入]", b);
    return this.update(b);
  };
});
```

启动：

```bash
frida -U -f com.tencent.mm -l hook.js --no-pause
```

---

## 实战案例：打印登录接口 AES 参数

操作流程：

1. 启动 Frida
2. 打开目标小程序
3. 触发登录 / 下单等接口

示例输出：

```text
[AES 明文] {"phone":"13800000000","code":"123456"}
[AES key ] 0123456789abcdef0123456789abcdef
[AES iv  ] fedcba9876543210
```

---

## 常见问题 & 绕过

问题 | 原因 | 解决方案
---|---|---
Frida 闪退 | server 不匹配 | 换版本
无输出 | Hook 点不对 | Hook JSON / String
证书抓不到 | Pinning | JustTrustMe
被检测 Root | 反调试 | Magisk + Shamiko

---

## 实战闭环：从 Frida 明文到 HTTPS 接口复现 ✅

### 你已经掌握的关键信息

- 算法：AES-CBC
- key / iv
- 明文结构
- 接口 URL

### Python 本地解密验证

```python
from Crypto.Cipher import AES
import base64, json

key = b'0123456789abcdef0123456789abcdef'
iv  = b'fedcba9876543210'

cipher = AES.new(key, AES.MODE_CBC, iv)
plain = cipher.decrypt(base64.b64decode("U2FsdGVkX1+..."))

print(plain)
```

### 本地加密并重放接口

```python
import requests

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

### 本篇你真正获得的能力 ✅

- 能在运行时无视 HTTPS
- 能稳定拿到 key / iv
- 能复现真实业务接口

---

下一篇：  
👉 **高级工具链 & 自动化解密流水线**