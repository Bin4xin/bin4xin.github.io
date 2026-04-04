---
layout: about
category: about
Researchname: 微信小程序逆向IV
toc: true
author: Bin4xin
permalink: /about/wechat-miniapp-reverse-expert-vm-bypass/
desc: 「移动攻防」
---

# 微信小程序逆向

- 字节码虚拟机、内存转储与加固对抗

当小程序采用字节码保护（V8/QuickJS Bytecode）、多层包装壳（Wrapper）、自校验、花指令等防护机制后，常规静态解包工具将完全失效，此时需转向内存级动态逆向分析。

## 主流防护现状

{: .table}
|防护类型|特征关键词|防护难度|主流绕过成功率|
|---|---|---|---|
|V8/QuickJS 字节码保护|V8Snapshot、BytecodeArray|★★★★★|70–85%|
|多层包装壳与自校验|Wrapper、Checksum、定时校验|★★★★|80–90%|
|行为与环境指纹检测|Canvas、WebGL、Touch、Navigator|★★★★|75–95%|

## 分析原则

核心原则：无论应用采用多少层加密防护，业务明文最终都会在内存中完成组装并准备发送，定位该内存区域即可突破防护。

## 推荐技术栈

{: .table}
|工具 / 技术|用途|实现难度|有效率|
|---|---|---|---|
|Frida Memory.scan|基于特征值搜索内存明文（如手机号、Token）|★★★★|★★★★★|
|r0capture|自动化提取进程内所有网络明文流量|★★★|★★★★★|
|Frida Hook fetch/XMLHttpRequest|拦截最终网络请求的请求体|★★★★|★★★★☆|
|bytenode/v8-decompile|尝试将字节码还原为 JavaScript 源码|★★★★★|★★★☆|
|Ghidra/IDA Pro|分析小程序壳的 Native 层逻辑|★★★★★|★★☆|

## 实战核心方案

### 内存分析策略

1. **基于 `Memory.scan` 的明文特征搜索**

```javascript
var pattern = Memory.scanSync(
  Process.getModuleByName("libwechat.so"),
  '13812345678',
  { json: true }
);
console.log("找到特征地址: " + pattern[0].address);
```

2. **Hook 最终网络请求发送入口**
Hook 微信小程序请求接口`wx.request`、原生`XMLHttpRequest.send`以及`fetch`接口，拦截最终的请求体。

3. **内存转储 `TypedArray` 与 `ArrayBuffer` 缓冲区**

```javascript
Interceptor.attach(Module.findExportByName(null, "send"), {
  onEnter: function(args) {
    console.log(
      "待发送数据缓冲区:",
      args[1].readByteArray(512)
    );
  }
});
```

## 实战案例一

- 绕过某支付小程序字节码保护

1. 静态分析阶段：常规解包后发现`app-service.js`为加密字节码，无法直接阅读

2. 动态附加：使用 Frida 附加到微信进程，通过 `Memory.scan` 搜索业务特征值（如订单号`20260125`）

3. 内存定位：定位到特征值的内存地址后，读取该地址前后 1000 字节的内存数据，提取到完整的明文 JSON

4. 加密函数定位：基于明文定位到对应的 AES 加密函数，Hook`Cipher.doFinal`提取到加密密钥

5. 流量解密：基于提取到的密钥，完成后续所有业务流量的解密分析

进阶优化方向：可结合 r0capture、frida-trace 与自定义内存搜索脚本，实现自动化的明文提取流程。

---

## 终极对抗

字节码 VM 场景下的 HTTPS 与业务加密突破

> 本节为该系列五篇内容的收尾章节，通过本节内容可明确：仅靠加密机制无法完全抵御逆向分析，内存级动态分析可突破绝大多数静态防护。
> 

### 防护边界

字节码 VM 的防护可实现的防护能力：

- 阻止静态源码阅读

- 阻止批量自动化静态解包

- 抵御基础的新手逆向脚本

VM 防护无法突破的技术边界：

- 无法避免业务明文在运行时加载到进程内存中

### 加密请求流程

字节码 VM 场景下的加密请求流程

```text
JavaScript字节码
 → VM解释执行
 → 构造业务明文对象
 → 调用AES.encrypt()完成加密
 → 生成加密后的ArrayBuffer缓冲区
 → 调用HTTPS接口发送数据
```

### 突破方案一

- Hook 明文汇聚点

```javascript
Java.perform(function () {
  var JSONObject = Java.use("org.json.JSONObject");
  JSONObject.toString.implementation = function () {
    var ret = this.toString();
    console.log("[VM层明文]", ret);
    return ret;
  };
});
```

### 突破方案二

- 内存扫描提取明文

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

### 技术边界

从技术原理来看，防护方无法实现以下目标：

- 完全避免业务明文在运行时出现在进程内存中

- 不构造业务请求的明文请求体

- 不在运行时加载加密密钥

### 防护建议

针对此类内存级逆向，防护方可采用以下方案提升攻击成本：

- 结合字节码 VM 与 Native 层加固

- 将密钥生成逻辑放在 Native 层实现

- 结合行为指纹检测与服务端实时校验

- 防护的核心目标是提升攻击成本，拖垮规模化自动化攻击

---

### 结尾

```text
HTTPS 解决网络传输层的窃听风险
静态加密 解决源码静态泄露的风险
字节码VM 解决批量自动化静态逆向的风险
内存级动态分析 可突破绝大多数静态防护体系
```

> \[\!NOTE\]
> 本文档对原始内容的技术修正与补充说明：
> 
> 1. 原始文档中`Interceptor.attach(Module.findExportByName(null, "send"), ...)`的实现存在局限：全局 Hook 系统`send`函数会匹配所有系统调用，可能产生大量无关的误报输出，建议缩小 Hook 范围，针对目标进程的网络发送函数进行精准 Hook。
> 
> 2. 原始文档中 Hook`org.json.JSONObject.toString`的方案仅适用于 Java 层的 JSON 序列化逻辑，无法命中 JS 层的 JSON 对象处理，针对小程序 JS 层的明文提取，建议补充 Hook JS 层的`JSON.stringify`函数以覆盖更多场景。
> 
> 3. 原始文档中内存扫描仅限定在`libwechat.so`模块内，实际上业务明文通常存储在进程堆内存中，建议扩大扫描范围至整个进程的可读写内存区域，以提升明文搜索的命中率。

