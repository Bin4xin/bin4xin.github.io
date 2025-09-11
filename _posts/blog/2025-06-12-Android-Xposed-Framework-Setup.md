---
layout: post
toc: true
title: "「安卓」:Xposed框架安装与模块开发"
author: Bin4xin
categories:
    - blog
tags:
    - 笔记
    - Android Reverse
    - Xposed
---

## Xposed框架简介

Xposed框架是Android平台上最强大的Hook框架之一，它允许在不修改APK的情况下影响程序运行，通过替换/system/bin/app_process程序控制zygote进程，使得app_process在启动过程中会加载XposedBridge.jar这个jar包，从而完成对Zygote进程及其创建的Dalvik虚拟机的劫持。

## 一、Xposed框架安装

### 1.1 环境要求
- Root权限的Android设备
- 解锁Bootloader
- 自定义Recovery（TWRP推荐）

### 1.2 安装步骤

#### 方法一：通过Xposed Installer安装
```bash
# 下载Xposed Installer APK
wget https://repo.xposed.info/module/de.robv.android.xposed.installer
adb install XposedInstaller_3.1.5.apk

# 在应用中选择对应架构的框架包进行安装
# 支持架构：arm, arm64, x86, x86_64
```

#### 方法二：通过Recovery刷入
```bash
# 下载对应架构的框架包
# 例如：xposed-v90-sdk25-arm64.zip

# 进入Recovery模式
adb reboot recovery

# 在TWRP中选择Install，刷入框架包
# 重启设备完成安装
```

### 1.3 安装验证
```bash
# 检查Xposed是否正常运行
adb shell
su
ls -la /system/bin/app_process*

# 查看Xposed日志
logcat | grep -i xposed
```

## 二、Xposed模块开发

### 2.1 开发环境配置

#### 创建Android项目
```gradle
// app/build.gradle
android {
    compileSdkVersion 30
    
    defaultConfig {
        applicationId "com.example.xposedmodule"
        minSdkVersion 21
        targetSdkVersion 30
        versionCode 1
        versionName "1.0"
    }
}

dependencies {
    compileOnly 'de.robv.android.xposed:api:82'
    compileOnly 'de.robv.android.xposed:api:82:sources'
}
```

#### 配置模块信息
```xml
<!-- AndroidManifest.xml -->
<application>
    <meta-data
        android:name="xposedmodule"
        android:value="true" />
    <meta-data
        android:name="xposeddescription"
        android:value="Root权限隐藏模块" />
    <meta-data
        android:name="xposedminversion"
        android:value="54" />
</application>
```

### 2.2 Hook实现示例

#### 主Hook类
```java
public class MainHook implements IXposedHookLoadPackage {
    
    @Override
    public void handleLoadPackage(XC_LoadPackage.LoadPackageParam lpparam) throws Throwable {
        
        // Hook Root检测相关方法
        if (lpparam.packageName.equals("com.target.app")) {
            hookRootDetection(lpparam);
        }
    }
    
    private void hookRootDetection(XC_LoadPackage.LoadPackageParam lpparam) {
        
        // Hook su命令检测
        XposedHelpers.findAndHookMethod("java.lang.Runtime", lpparam.classLoader,
                "exec", String.class, new XC_MethodHook() {
                    @Override
                    protected void beforeHookedMethod(MethodHookParam param) throws Throwable {
                        String command = (String) param.args[0];
                        if (command.contains("su") || command.contains("which su")) {
                            param.setResult(null);
                        }
                    }
                });
        
        // Hook文件存在性检测
        XposedHelpers.findAndHookMethod("java.io.File", lpparam.classLoader,
                "exists", new XC_MethodHook() {
                    @Override
                    protected void beforeHookedMethod(MethodHookParam param) throws Throwable {
                        File file = (File) param.thisObject;
                        String path = file.getAbsolutePath();
                        
                        // 隐藏常见Root文件
                        if (isRootPath(path)) {
                            param.setResult(false);
                        }
                    }
                });
    }
    
    private boolean isRootPath(String path) {
        String[] rootPaths = {
            "/system/bin/su",
            "/system/xbin/su", 
            "/sbin/su",
            "/system/app/Superuser.apk",
            "/system/app/SuperSU.apk"
        };
        
        for (String rootPath : rootPaths) {
            if (path.equals(rootPath)) {
                return true;
            }
        }
        return false;
    }
}
```

### 2.3 模块入口配置
```
# assets/xposed_init
com.example.xposedmodule.MainHook
```

## 三、常见问题解决

### 3.1 框架安装失败
```bash
# 检查设备架构
adb shell getprop ro.product.cpu.abi

# 确保下载正确架构的框架包
# arm64-v8a -> arm64
# armeabi-v7a -> arm
```

### 3.2 模块不生效
```bash
# 检查模块是否被Xposed识别
adb shell
su
ls /data/data/de.robv.android.xposed.installer/conf/modules.list

# 查看Xposed日志
logcat -s Xposed
```

### 3.3 系统启动异常
```bash
# 进入Recovery模式
# 删除Xposed框架文件
mount /system
rm /system/bin/app_process32_xposed
rm /system/bin/app_process64_xposed
mv /system/bin/app_process32_original /system/bin/app_process32
mv /system/bin/app_process64_original /system/bin/app_process64
```

## 四、高级技巧

### 4.1 动态Hook
```java
// 运行时Hook方法
public void dynamicHook(String className, String methodName) {
    Class<?> clazz = XposedHelpers.findClass(className, lpparam.classLoader);
    XposedBridge.hookAllMethods(clazz, methodName, new XC_MethodHook() {
        @Override
        protected void afterHookedMethod(MethodHookParam param) throws Throwable {
            // Hook逻辑
        }
    });
}
```

### 4.2 资源Hook
```java
@Override
public void handleInitPackageResources(XC_InitPackageResources.InitPackageResourcesParam resparam) throws Throwable {
    if (!resparam.packageName.equals("com.target.app"))
        return;
        
    // Hook字符串资源
    resparam.res.setReplacement("com.target.app", "string", "app_name", "Modified App");
}
```

## 参考资料

- [Xposed Framework官方文档](https://github.com/rovo89/Xposed)
- [Xposed模块开发教程](https://github.com/rovo89/XposedBridge/wiki/Development-tutorial)
- [Android Hook技术详解](https://blog.csdn.net/coder_ken/article/details/50853927)
