---
layout: about
category: about
Researchname: 微信小程序逆向IV
toc: true
author: Bin4xin
permalink: /about/wechat-miniapp-reverse-expert-vm-bypass/
desc: 「移动攻防」
---

# 微信小程序逆向专家篇：字节码虚拟机、内存dump & 加固对抗（2026）

当小程序使用了字节码保护（V8/QuickJS bytecode）、多层wrapper、自校验、花指令后，常规解包工具基本失效。这时需要转向内存级逆向。

## 当前最难的三类防护（2026现状）

防护类型              | 特征关键词                          | 难度 | 主流绕过成功率
----------------------|-------------------------------------|------|----------------
V8/QuickJS字节码      | V8Snapshot、BytecodeArray           | ★★★★★| 70–85%
多层wrapper + 自校验  | wrapper、checksum、setInterval校验  | ★★★★ | 80–90%
行为/环境指纹检测     | canvas、WebGL、touch、navigator     | ★★★★ | 75–95%

## 终极突破思路总结

核心原则：**“无论多少层加密，最终明文都会在内存中组装好发出去——找到那块内存就赢了。”**

## 推荐工具 & 技术栈

工具/技术          | 用途                        | 难度 | 成功率
-------------------|-----------------------------|------|--------
Frida Memory.scan | 搜索明文特征（手机号、token）| ★★★★ | ★★★★★
r0capture         | 自动抓取所有网络明文流量    | ★★★  | ★★★★★
Frida Hook fetch / XMLHttpRequest | 拦截最终请求体      | ★★★★ | ★★★★☆
bytenode / v8-decompile | 字节码 → JS 尝试还原   | ★★★★★| ★★★☆
Ghidra / IDA Pro  | 分析小程序壳native层        | ★★★★★| ★★☆

## 实战三板斧（几乎万能组合）

1. **Memory.scan 搜明文**
```javascript
var pattern = Memory.scanSync(
  Process.getModuleByName("libwechat.so"),
  '13812345678',
  { json: true }
);
console.log("找到地址: " + pattern[0].address);
```

2. **Hook 最终网络发送点**  
Hook wx.request、XMLHttpRequest.send、fetch

3. **Dump 所有 TypedArray / ArrayBuffer**

```javascript
Interceptor.attach(Module.findExportByName(null, "send"), {
  onEnter: function(args) {
    console.log(
      "准备发送的数据缓冲区:",
      args[1].readByteArray(512)
    );
  }
});
```

## 真实案例：绕过某支付小程序字节码保护

- 常规解包 → app-service.js 是乱码字节码  
- Frida 附加 → Memory.scan 搜索订单号 `20260125`  
- 找到地址 → 读前后 1000 字节 → 发现明文 JSON  
- 定位加密函数 → Hook Cipher.doFinal → 拿到 key  
- 后续流量全部可解  

高手进阶方向：熟练 r0capture + frida-trace + 自定义内存搜索脚本。

---

## 终极对抗：VM 之下，HTTPS 与业务加密的最终归宿 ⚔️

> **这一节是整个五篇的“终点”**  
> 看到这里，你应该彻底放弃“靠加密本身防逆向”的幻想

### VM 到底防住了什么？又没防住什么？

✅ VM 防住的是：
- 静态阅读源码
- 批量解包
- 新手脚本

❌ VM 永远防不住：
- 明文在运行时存在于内存

### VM 场景下 HTTPS + AES 的真实路径

```text
JS Bytecode
 → VM 执行
 → 构造明文对象
 → AES.encrypt()
 → ArrayBuffer
 → HTTPS send
```

### 终极打法一：Hook 明文汇聚点

```javascript
Java.perform(function () {
  var JSONObject = Java.use("org.json.JSONObject");
  JSONObject.toString.implementation = function () {
    var ret = this.toString();
    console.log("[VM 明文]", ret);
    return ret;
  };
});
```

### 终极打法二：内存扫描捞明文

```javascript
Memory.scan(
  Process.getModuleByName("libwechat.so"),
  "13800000000",
  {
    onMatch(addr) {
      console.log(addr.readByteArray(512));
    }
  }
);
```

### 防守方的物理极限

你无法做到：
- 不在内存中存在明文
- 不构造请求体
- 不在运行时生成 key

### 现实防守建议

- VM + Native
- Native 生成 key
- 行为指纹 + 服务端校验
- 目标是**拖垮规模化攻击**

---

### 五篇最终结论

```text
HTTPS 解决网络问题
加密解决静态分析
VM 解决批量逆向

内存，解决一切防护
```

**至此，小程序 HTTPS 加解密攻防体系完整闭环。**
