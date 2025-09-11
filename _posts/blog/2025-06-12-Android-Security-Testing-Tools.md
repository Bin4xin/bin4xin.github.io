---
layout: post
toc: true
title: "「安卓」:Android安全测试工具集与实战应用"
author: Bin4xin
categories:
    - blog
tags:
    - 笔记
    - Android Reverse
    - 安全测试
---

## Android安全测试工具概述

Android安全测试涉及多个层面，包括静态分析、动态分析、网络流量分析、以及各种绕过技术。本文将介绍常用的Android安全测试工具及其配置使用方法。

## 一、静态分析工具

### 1.1 APKTool - APK反编译工具
```bash
# 安装APKTool
wget https://raw.githubusercontent.com/iBotPeaches/Apktool/master/scripts/linux/apktool
wget https://bitbucket.org/iBotPeaches/apktool/downloads/apktool_2.7.0.jar
chmod +x apktool
sudo mv apktool /usr/local/bin/
sudo mv apktool_2.7.0.jar /usr/local/bin/apktool.jar

# 反编译APK
apktool d app.apk -o app_decompiled

# 重新打包APK
apktool b app_decompiled -o app_modified.apk

# 签名修改后的APK
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore debug.keystore app_modified.apk androiddebugkey
```

### 1.2 dex2jar - DEX转JAR工具
```bash
# 下载安装dex2jar
wget https://github.com/pxb1988/dex2jar/releases/download/v2.2/dex-tools-2.2.zip
unzip dex-tools-2.2.zip
export PATH=$PATH:$(pwd)/dex-tools-2.2

# 转换APK为JAR
d2j-dex2jar.sh app.apk

# 使用JD-GUI查看源码
java -jar jd-gui-1.6.6.jar app-dex2jar.jar
```

### 1.3 JADX - 现代化反编译工具
```bash
# 安装JADX
wget https://github.com/skylot/jadx/releases/download/v1.4.7/jadx-1.4.7.zip
unzip jadx-1.4.7.zip -d jadx
export PATH=$PATH:$(pwd)/jadx/bin

# 反编译APK
jadx app.apk -d output_directory

# 使用GUI版本
jadx-gui app.apk
```

### 1.4 常见静态分析问题解决
```bash
# 问题1：反编译失败 - 资源解析错误
# 解决方案：跳过资源文件反编译
apktool d app.apk -r -o app_decompiled

# 问题2：重打包后安装失败
# 解决方案：对齐APK文件
zipalign -v 4 app_modified.apk app_aligned.apk

# 问题3：混淆代码难以分析
# 解决方案：使用多种工具交叉验证
jadx app.apk -d jadx_output
d2j-dex2jar.sh app.apk
```

## 二、动态分析工具

### 2.1 Frida - 动态插桩框架
```bash
# 安装Frida
pip3 install frida-tools

# 下载frida-server
wget https://github.com/frida/frida/releases/download/16.0.19/frida-server-16.0.19-android-arm64.xz
unxz frida-server-16.0.19-android-arm64.xz

# 推送到设备并启动
adb push frida-server-16.0.19-android-arm64 /data/local/tmp/frida-server
adb shell "chmod 755 /data/local/tmp/frida-server"
adb shell "/data/local/tmp/frida-server &"

# 验证Frida连接
frida-ps -U
```

### 2.2 Frida脚本示例
```javascript
// hook_example.js - SSL Pinning绕过
Java.perform(function() {
    // Hook OkHttp3 CertificatePinner
    var CertificatePinner = Java.use("okhttp3.CertificatePinner");
    CertificatePinner.check.overload("java.lang.String", "java.util.List").implementation = function(hostname, peerCertificates) {
        console.log("[+] SSL Pinning bypassed for: " + hostname);
        return;
    };
    
    // Hook HttpsURLConnection
    var HttpsURLConnection = Java.use("javax.net.ssl.HttpsURLConnection");
    HttpsURLConnection.setDefaultHostnameVerifier.implementation = function(hostnameVerifier) {
        console.log("[+] Default hostname verifier bypassed");
        return;
    };
    
    // Hook TrustManager
    var X509TrustManager = Java.use("javax.net.ssl.X509TrustManager");
    var TrustManager = Java.registerClass({
        name: "com.example.TrustManager",
        implements: [X509TrustManager],
        methods: {
            checkClientTrusted: function(chain, authType) {},
            checkServerTrusted: function(chain, authType) {},
            getAcceptedIssuers: function() { return []; }
        }
    });
});
```

### 2.3 使用Frida进行Hook
```bash
# 启动应用并注入脚本
frida -U -f com.example.app -l hook_example.js --no-pause

# Hook运行中的应用
frida -U com.example.app -l hook_example.js

# 交互式Hook
frida -U com.example.app
```

## 三、网络流量分析工具

### 3.1 BurpSuite配置
```bash
# 配置BurpSuite代理
# 1. 启动BurpSuite，设置代理监听端口8080
# 2. 导出CA证书

# 在Android设备上配置代理
adb shell settings put global http_proxy 192.168.1.100:8080

# 安装BurpSuite证书
adb push cacert.der /sdcard/
# 在设备设置中安装证书：设置 -> 安全 -> 安装证书
```

### 3.2 自定义证书生成
```bash
# 生成自签名证书（有效期1年）
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout burp.key -out burp.crt -subj "/C=US/ST=CA/L=SF/O=Test/CN=BurpSuite"

# 转换为PKCS12格式
openssl pkcs12 -export -out burp.p12 -inkey burp.key -in burp.crt -password pass:password

# 在BurpSuite中导入证书
# Proxy -> Options -> Import/export CA certificate -> Import -> Certificate and private key in PKCS#12 format
```

### 3.3 mitmproxy使用
```bash
# 安装mitmproxy
pip3 install mitmproxy

# 启动mitmproxy
mitmproxy -p 8080

# 启动mitmdump（命令行模式）
mitmdump -p 8080 -s script.py

# 获取mitmproxy证书
curl -x http://localhost:8080 http://mitm.it/cert/pem > mitmproxy-ca-cert.pem
```

## 四、Root检测绕过工具

### 4.1 RootCloak Plus配置
```bash
# 安装RootCloak Plus（需要Xposed框架）
# 1. 下载RootCloak Plus APK
# 2. 在Xposed Installer中激活模块
# 3. 重启设备

# 配置隐藏应用列表
# 在RootCloak Plus中添加需要隐藏Root的应用包名
```

### 4.2 Magisk Hide配置
```bash
# 启用Magisk Hide
magiskhide enable

# 添加应用到隐藏列表
magiskhide add com.example.bankapp
magiskhide add com.google.android.gms.safetynet

# 查看隐藏状态
magiskhide status

# 随机化Magisk包名
magisk --random-package-name
```

### 4.3 自定义Root隐藏脚本
```javascript
// root_hide.js - Frida Root隐藏脚本
Java.perform(function() {
    // Hook su命令执行
    var Runtime = Java.use("java.lang.Runtime");
    Runtime.exec.overload("java.lang.String").implementation = function(command) {
        if (command.indexOf("su") !== -1) {
            console.log("[+] Blocked su command: " + command);
            throw new Error("Command not found");
        }
        return this.exec(command);
    };
    
    // Hook文件存在性检查
    var File = Java.use("java.io.File");
    File.exists.implementation = function() {
        var path = this.getAbsolutePath();
        var rootPaths = ["/system/bin/su", "/system/xbin/su", "/sbin/su"];
        
        if (rootPaths.indexOf(path) !== -1) {
            console.log("[+] Hiding root file: " + path);
            return false;
        }
        return this.exists();
    };
    
    // Hook Build属性
    var Build = Java.use("android.os.Build");
    Build.TAGS.value = "release-keys";
    Build.TYPE.value = "user";
});
```

## 五、自动化测试工具

### 5.1 MobSF - 移动安全框架
```bash
# 安装MobSF
git clone https://github.com/MobSF/Mobile-Security-Framework-MobSF.git
cd Mobile-Security-Framework-MobSF

# 使用Docker运行
docker build -t mobsf .
docker run -it -p 8000:8000 mobsf

# 或直接安装
pip3 install -r requirements.txt
python3 manage.py runserver 0.0.0.0:8000
```

### 5.2 QARK - 快速Android审查工具
```bash
# 安装QARK
pip3 install qark

# 分析APK文件
qark --apk app.apk

# 分析源码目录
qark --java /path/to/source/code
```

### 5.3 AndroBugs Framework
```bash
# 下载AndroBugs
git clone https://github.com/AndroBugs/AndroBugs_Framework.git
cd AndroBugs_Framework

# 安装依赖
pip3 install -r requirements.txt

# 分析APK
python3 androbugs.py -f app.apk
```

## 六、实战测试流程

### 6.1 完整测试流程
```bash
#!/bin/bash
# android_security_test.sh - 自动化安全测试脚本

APK_FILE=$1
OUTPUT_DIR="security_test_$(date +%Y%m%d_%H%M%S)"

echo "[+] Starting Android Security Test for: $APK_FILE"
mkdir -p $OUTPUT_DIR

# 1. 静态分析
echo "[+] Step 1: Static Analysis"
apktool d $APK_FILE -o $OUTPUT_DIR/apktool_output
jadx $APK_FILE -d $OUTPUT_DIR/jadx_output
d2j-dex2jar.sh $APK_FILE -o $OUTPUT_DIR/app.jar

# 2. 信息收集
echo "[+] Step 2: Information Gathering"
aapt dump badging $APK_FILE > $OUTPUT_DIR/app_info.txt
strings $APK_FILE | grep -E "(http|https|ftp)://" > $OUTPUT_DIR/urls.txt
strings $APK_FILE | grep -E "([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)" > $OUTPUT_DIR/emails.txt

# 3. 证书分析
echo "[+] Step 3: Certificate Analysis"
unzip -p $APK_FILE META-INF/*.RSA | openssl pkcs7 -inform DER -print_certs -text > $OUTPUT_DIR/certificate.txt

# 4. 权限分析
echo "[+] Step 4: Permission Analysis"
aapt dump permissions $APK_FILE > $OUTPUT_DIR/permissions.txt

echo "[+] Security test completed. Results saved in: $OUTPUT_DIR"
```

### 6.2 动态测试脚本
```javascript
// dynamic_test.js - 综合动态测试脚本
Java.perform(function() {
    console.log("[+] Starting dynamic security test");
    
    // 1. 网络请求监控
    var URL = Java.use("java.net.URL");
    URL.$init.overload("java.lang.String").implementation = function(url) {
        console.log("[+] Network request: " + url);
        return this.$init(url);
    };
    
    // 2. 文件操作监控
    var FileOutputStream = Java.use("java.io.FileOutputStream");
    FileOutputStream.$init.overload("java.lang.String").implementation = function(filename) {
        console.log("[+] File write: " + filename);
        return this.$init(filename);
    };
    
    // 3. 数据库操作监控
    var SQLiteDatabase = Java.use("android.database.sqlite.SQLiteDatabase");
    SQLiteDatabase.execSQL.overload("java.lang.String").implementation = function(sql) {
        console.log("[+] SQL execution: " + sql);
        return this.execSQL(sql);
    };
    
    // 4. 加密操作监控
    var Cipher = Java.use("javax.crypto.Cipher");
    Cipher.doFinal.overload("[B").implementation = function(input) {
        console.log("[+] Crypto operation detected");
        return this.doFinal(input);
    };
});
```

## 七、常见问题解决

### 7.1 工具兼容性问题
```bash
# 问题1：APKTool版本不兼容
# 解决方案：使用最新版本或指定版本
wget https://bitbucket.org/iBotPeaches/apktool/downloads/apktool_2.7.0.jar

# 问题2：Frida连接失败
# 解决方案：检查frida-server版本匹配
frida --version
adb shell "/data/local/tmp/frida-server --version"

# 问题3：证书安装失败
# 解决方案：转换证书格式
openssl x509 -inform DER -in cacert.der -out cacert.pem
openssl x509 -inform PEM -outform DER -in cacert.pem -out cacert.crt
```

### 7.2 权限问题解决
```bash
# SELinux权限问题
adb shell setenforce 0

# 文件权限问题
adb shell chmod 755 /data/local/tmp/frida-server

# Root权限获取
adb shell su -c "your_command"
```

## 参考资料

- [OWASP Mobile Security Testing Guide](https://owasp.org/www-project-mobile-security-testing-guide/)
- [Frida官方文档](https://frida.re/docs/)
- [Android安全测试最佳实践](https://blog.csdn.net/coder_ken/article/details/50853927)
- [MobSF使用指南](https://github.com/MobSF/Mobile-Security-Framework-MobSF)
