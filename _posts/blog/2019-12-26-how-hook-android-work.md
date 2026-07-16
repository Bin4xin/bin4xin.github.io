---
layout: post
toc: true
title: "「安卓渗透」:HOOK-Frida原理详解"
author: Bin4xin
categories:
    - blog
    - 笔记
    - Android Reverse
    - HOOK
    - Frida
permalink: /blog/2019/HOOK/BY/FRIDA/
---

> 在安卓安全测试中，Hook技术是最核心的动态分析手段。本文梳理Hook技术的基本原理，重点介绍Frida框架的使用方式。

## 0x00 Hook技术概述

Hook技术是指在Android上进行的跨进程操作，主要分为三个层次：

1. **Native层Hook**：针对JNI（Java Native Interface）本地调用的Hook
2. **Java层Hook**：针对Java方法的Hook
3. **框架层Hook**：针对Android Framework层的Hook

```
┌─────────────────────────────────────┐
│           Android App               │
├─────────────────────────────────────┤
│   Java层  ←── Java Hook (Frida/Xposed) │
├─────────────────────────────────────┤
│   JNI桥  ←── JNI Hook                │
├─────────────────────────────────────┤
│  Native层 ←── Native Hook (Substrate/Inline) │
├─────────────────────────────────────┤
│   Linux Kernel                       │
└─────────────────────────────────────┘
```

## 0x01 事件分发机制

Android本身维护着一套事件分发机制，应用程序包括**应用触发事件**和**后台逻辑处理**两部分：

- **应用触发事件**：比如App中一个按钮对应一个URL，点击则跳转浏览器访问该URL
- **后台逻辑处理**：用户看不到的后台处理逻辑

以一个URL按钮为例，用户点击后看到的流程是：

```
按钮点击 → 跳转默认浏览器 → 地址栏填充URL → 访问
```

但对于后台来说，处理过程要复杂得多——查看log日志可以发现，后台代码所做的工作远比我们看到的多。

## 0x02 Frida简介

[Frida](https://frida.re/) 是一个动态二进制插桩框架，支持在Windows、macOS、Linux、iOS、Android和QNX上运行。其核心优势：

- **动态注入**：无需修改APK即可Hook运行中的进程
- **JavaScript驱动**：用JS编写Hook脚本，实时修改行为
- **跨平台**：同一套工具链支持多个平台
- **双向通信**：支持Python/JS与目标进程的实时数据交互

### 架构

```
┌──────────────┐     USB/TCP      ┌─────────────────┐
│  Host (PC)   │ ◄──────────────► │  Target Device   │
│  frida-cli   │                  │  frida-server    │
│  frida-trace │                  │    ↓ 注入        │
│  Python API  │                  │  目标进程        │
└──────────────┘                  └─────────────────┘
```

## 0x03 环境搭建

### 安装Frida

```bash
# PC端安装
pip3 install frida-tools
pip3 install frida

# 验证安装
frida --version
```

### 设备端部署

```bash
# 下载frida-server，需与PC端版本一致
# https://github.com/frida/frida/releases
wget https://github.com/frida/frida/releases/download/12.8.0/frida-server-12.8.0-android-x86.xz

# 解压并推送到设备
xz -d frida-server-12.8.0-android-x86.xz
adb push frida-server-12.8.0-android-x86 /data/local/tmp/frida-server
adb shell chmod 755 /data/local/tmp/frida-server

# 启动frida-server（需要root权限）
adb shell
su
/data/local/tmp/frida-server &
```

### 验证连接

```bash
# 列出设备上运行的进程
frida-ps -U

# 列出设备上已安装的应用
frida-ps -Ua
```

## 0x04 Frida Hook Java方法

### 基本用法

```javascript
// hook_java.js
Java.perform(function() {
    // 获取类
    var LoginActivity = Java.use("com.example.app.LoginActivity");

    // Hook方法
    LoginActivity.login.implementation = function(username, password) {
        console.log("[*] login() called");
        console.log("[*] username: " + username);
        console.log("[*] password: " + password);

        // 调用原方法
        var result = this.login(username, password);
        console.log("[*] login result: " + result);

        return result;
    };
});
```

```bash
# 注入到目标进程
frida -U -f com.example.app -l hook_java.js --no-pause
```

### Hook重载方法

```javascript
Java.perform(function() {
    var MyClass = Java.use("com.example.app.MyClass");

    // 指定参数类型来区分重载方法
    MyClass.process.overload("java.lang.String").implementation = function(arg) {
        console.log("[*] process(String): " + arg);
        return this.process(arg);
    };

    MyClass.process.overload("int").implementation = function(arg) {
        console.log("[*] process(int): " + arg);
        return this.process(arg);
    };
});
```

### 主动调用方法

```javascript
Java.perform(function() {
    var MyClass = Java.use("com.example.app.MyClass");

    // 主动调用静态方法
    var result = MyClass.generateToken("admin");
    console.log("[*] Token: " + result);

    // 主动调用实例方法（需要先获取实例）
    Java.choose("com.example.app.MyClass", {
        onMatch: function(instance) {
            console.log("[*] Found instance: " + instance);
            var data = instance.getData();
            console.log("[*] Data: " + data);
        },
        onComplete: function() {
            console.log("[*] Search complete");
        }
    });
});
```

## 0x05 Frida Hook Native函数

```javascript
// hook_native.js
// Hook libc的open函数
Interceptor.attach(Module.findExportByName("libc.so", "open"), {
    onEnter: function(args) {
        // 第一个参数是文件路径
        this.path = args[0].readUtf8String();
        console.log("[*] open(" + this.path + ")");
    },
    onLeave: function(retval) {
        console.log("[*] open returned: " + retval);
    }
});
```

## 0x06 Frida绕过SSL Pinning

```javascript
Java.perform(function() {
    // TrustManagerImpl
    var TrustManagerImpl = Java.use("com.android.org.conscrypt.TrustManagerImpl");

    TrustManagerImpl.verifyChain.implementation = function(untrustedChain, trustAnchorChain, host, clientAuth, ocspData, tlsSctData) {
        console.log("[*] SSL Pinning bypassed for: " + host);
        return untrustedChain;
    };

    // OkHttp3 CertificatePinner
    try {
        var CertificatePinner = Java.use("okhttp3.CertificatePinner");
        CertificatePinner.check.overload("java.lang.String", "java.util.List").implementation = function(hostname, peerCertificates) {
            console.log("[*] OkHttp3 CertificatePinner bypassed for: " + hostname);
        };
    } catch(e) {
        console.log("[-] OkHttp3 not found");
    }
});
```

## 0x07 Frida vs Xposed

{:.table}
| 特性 | Frida | Xposed |
|------|-------|--------|
| 运行方式 | 注入式，进程级别 | 系统级，需重启 |
| 脚本语言 | JavaScript | Java |
| 设备要求 | 需要root（或Gadget免root） | 需要root + 刷框架 |
| 适用场景 | 临时调试、渗透测试 | 长期功能修改 |
| 反检测 | 较易被检测 | 可通过改名绕过 |
| 开发效率 | 高（JS即写即用） | 中（需编译模块） |

> Frida更适合安全测试场景，Xposed更适合长期使用的功能模块。

## 0x08 frida-trace快速跟踪

```bash
# 跟踪指定Java类的所有方法
frida-trace -U -f com.example.app -j "*!*login*"

# 跟踪Native函数
frida-trace -U -f com.example.app -i "open" -i "connect"
```

## 参考

- [Frida官方文档](https://frida.re/docs/home/){:target="_blank"}
- [Frida实战指南](https://github.com/0x192/universal-android-debloater){:target="_blank"}
- [Android Hook技术防范漫谈](https://blog.csdn.net/qq_36869808/article/details/88601819){:target="_blank"}

以上。