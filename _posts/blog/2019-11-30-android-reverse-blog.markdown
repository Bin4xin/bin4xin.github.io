---
layout: post
toc: true
title: "「安卓渗透」：总览"
wrench: 2019-12-15
author: Bin4xin
categories:
    - blog
    - 笔记
    - 渗透
    - Android Reverse
permalink: /blog/2019/android/reversr/blog/
---

> 最近在学安卓渗透，遂记录下相关知识点和一些没有弄明白的知识点。持续更新。

## 前言

接触了一些安卓渗透的项目，根据不同安全公司内部的要求，规定对于安卓渗透技术的基本原则、工作方式；且使用不同的、对外的商业渗透测试。综述包括如下：

1. 代码、程序安全
2. 验证码机制安全
3. 越权检测
4. 服务器WEB漏洞

## 一、代码/程序安全

### 1. 源码反编译

保证源码安全，保证源码不被反编译，防止不法分子阅读源码了解运行逻辑。

常用反编译工具：

```bash
# apktool：反编译资源文件和AndroidManifest.xml
apktool d target.apk -o output_dir

# dex2jar：将dex转换为jar
d2j-dex2jar target.apk

# jadx：直接将APK反编译为Java源码（推荐）
jadx -d output_dir target.apk

# jd-gui：查看jar中的Java源码
jd-gui target-dex2jar.jar
```

### 2. 代码混淆安全

对程序代码进行混淆加密，防止不法分子读懂源码。

ProGuard混淆配置示例：

```bash
# proguard-rules.pro
-keep class com.example.app.MainActivity { *; }
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
```

混淆后类名和方法名会被替换为无意义的字符，增加逆向难度。

### 3. 二次打包安全

防止不法分子对安装包进行篡改操作。

分析smali代码进行二次打包的典型操作：

```java
// 在关键位置插入弹窗代码
AlertDialog.Builder builder = new Builder(MainActivity.this);
builder.setTitle("test alert");
builder.setMessage("test by bin4xin");
builder.setPositiveButton("yes", null);
builder.show();

// 在关键位置插入Toast提示
btnToast1.setOnClickListener(new View.OnClickListener() {
    @Override
    public void onClick(View v) {
        Toast toast = Toast.makeText(MainActivity.this, "Toast Message", Toast.LENGTH_SHORT);
        toast.setGravity(Gravity.CENTER, 0, 0);
        toast.show();
    }
});

// 在关键位置插入调试日志
public static int d(String tag, String msg) {
    Log.d("DEBUG", "This is a debug");
}
```

二次打包流程：

```bash
# 1. 反编译
apktool d target.apk -o unpack

# 2. 修改smali代码
vi unpack/smali/com/example/app/MainActivity.smali

# 3. 重新打包
apktool b unpack -o modified.apk

# 4. 签名
keytool -genkey -v -keystore my-release-key.keystore -alias alias_name -keyalg RSA -keysize 2048 -validity 10000
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.keystore modified.apk alias_name

# 或使用apksigner
apksigner sign --ks my-release-key.keystore modified.apk
```

### 4. 签名校验安全

防止不法分子篡改源码、二次打包后传播安装包。

```bash
# 查看APK签名信息
keytool -printcert -jarfile target.apk

# 使用apksigner查看
apksigner verify --print-certs target.apk
```

常见签名校验绕过方式：

```javascript
// Frida绕过签名校验
Java.perform(function() {
    var PackageManager = Java.use("android.app.ApplicationPackageManager");
    PackageManager.getPackageInfo.overload("java.lang.String", "int").implementation = function(name, flags) {
        var info = this.getPackageInfo(name, flags);
        if (flags === 64) { // GET_SIGNATURES
            console.log("[*] Signature check bypassed for: " + name);
        }
        return info;
    };
});
```

### 5. SO文件安全

SO库（Shared Object）是C/C++编译的动态链接库，相比Java层更难逆向：

```bash
# IDA Pro分析SO文件
# 使用readelf查看SO导出函数
readelf -sW libtarget.so

# 使用objdump查看
objdump -T libtarget.so

# ltrace跟踪库函数调用
ltrace -l libtarget.so ./target
```

### 6. H5代码安全

H5代码在Android工程中通常通过WebView加载，存在以下风险：

```java
// 危险：启用JavaScript接口
webView.addJavascriptInterface(new JSBridge(), "Android");
webView.setJavaScriptEnabled(true);
```

如果addJavascriptInterface暴露了敏感方法，可被注入的JS代码调用：

```javascript
// 利用JavascriptInterface执行命令
Android.getClass().forName("java.lang.Runtime")
    .getMethod("getRuntime", null)
    .invoke(null, null)
    .exec("id");
```

### 7. APK升级机制

防止升级APK为不法分子的二次打包的APK：

- 升级通道必须使用HTTPS
- 下载的APK需校验签名和哈希值
- 不要将升级逻辑放在可被Hook的Java层

## 二、调试安全

### 8. Debug属性安全

防止发行版APK可以被调试：

```xml
<!-- AndroidManifest.xml -->
<!-- 删除debuggable属性或设置为false -->
<application
    android:debuggable="false"
    ...>
```

绕过方式：修改`AndroidManifest.xml`中的`debuggable`属性为`true`后重新打包。

### 9. 反调试检测

常见反调试手段及绕过：

```bash
# 检测是否被调试
# 方式1：检查TracerPid
cat /proc/self/status | grep TracerPid

# 方式2：检查调试端口
cat /proc/net/tcp

# 方式3：检查常用调试工具进程
ps | grep -E "frida|gdb|ida"
```

Frida绕过反调试：

```javascript
Java.perform(function() {
    // 绕过Debug检测
    var Debug = Java.use("android.os.Debug");
    Debug.isDebuggerConnected.implementation = function() {
        return false;
    };
});
```

## 三、通信安全

### 10. HTTPS证书校验

App是否对HTTPS证书进行严格校验：

```bash
# 使用Burp Suite代理测试
# 1. 设置手机代理指向Burp
# 2. 安装Burp CA证书到手机
# 3. 观察App是否能正常通信

# 如果App仍然拒绝连接，说明存在SSL Pinning
# 需要使用Frida绕过
```

### 11. 数据传输加密

- 检查API请求是否明文传输敏感信息
- 检查是否使用自定义加密算法
- 分析加密密钥是否硬编码在客户端

```bash
# 使用objection快速分析
objection -g com.example.app explore

# 查看SharedPreferences
android hooking list activities

# 查看HTTP请求
android sslpinning disable
```

## 四、存储安全

### 12. 本地数据存储

```bash
# 检查SharedPreferences
adb shell run-as com.example.app cat /data/data/com.example.app/shared_prefs/*.xml

# 检查SQLite数据库
adb shell run-as com.example.app sqlite3 databases/target.db ".tables" ".dump"

# 检查文件存储
adb shell run-as com.example.app ls -la files/
```

## 五、常用工具汇总

{:.table}
| 工具 | 用途 | 链接 |
|------|------|------|
| jadx | APK反编译 | [GitHub](https://github.com/skylot/jadx){:target="_blank"} |
| apktool | APK打包/解包 | [官网](https://ibotpeaches.github.io/Apktool/){:target="_blank"} |
| Frida | 动态Hook | [官网](https://frida.re/){:target="_blank"} |
| objection | 自动化分析 | [GitHub](https://github.com/sensepost/objection){:target="_blank"} |
| Burp Suite | 抓包代理 | [PortSwigger](https://portswigger.net/burp){:target="_blank"} |
| Drozer | Android安全评估 | [GitHub](https://github.com/WithSecureLabs/drozer){:target="_blank"} |
| IDA Pro | SO逆向分析 | 商业工具 |
| MobSF | 自动化安全扫描 | [GitHub](https://github.com/MobSF/Mobile-Security-Framework-MobSF){:target="_blank"} |

以上。