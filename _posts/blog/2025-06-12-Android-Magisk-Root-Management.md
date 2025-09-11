---
layout: post
toc: true
title: "「安卓」:Magisk Root管理与模块系统"
author: Bin4xin
categories:
    - blog
tags:
    - 笔记
    - Android Reverse
    - Magisk
---

## Magisk简介

Magisk是一套开源的Android自定义工具，支持Android 5.0以上版本。它提供了root权限管理、boot镜像修改、以及模块系统等功能。与传统的SuperSU不同，Magisk采用了"Systemless"的方式，不直接修改系统分区，而是通过修改boot镜像来实现root功能。

## 一、Magisk安装配置

### 1.1 环境准备
```bash
# 检查设备信息
adb shell getprop ro.build.version.release
adb shell getprop ro.product.cpu.abi
adb shell getprop ro.build.version.sdk

# 确保设备已解锁Bootloader
fastboot oem device-info
fastboot getvar unlocked
```

### 1.2 获取boot镜像
```bash
# 方法一：从官方固件包提取
# 下载对应版本的官方固件包，解压获取boot.img

# 方法二：从设备直接提取
adb shell
su
dd if=/dev/block/bootdevice/by-name/boot of=/sdcard/boot.img
adb pull /sdcard/boot.img
```

### 1.3 安装Magisk Manager
```bash
# 下载最新版本Magisk Manager APK
wget https://github.com/topjohnwu/Magisk/releases/latest/download/Magisk-v25.2.apk
adb install Magisk-v25.2.apk
```

### 1.4 修补boot镜像
```bash
# 将boot.img推送到设备
adb push boot.img /sdcard/

# 在Magisk Manager中选择"安装" -> "选择并修补一个文件"
# 选择/sdcard/boot.img进行修补
# 修补完成后会生成magisk_patched-*.img文件

# 拉取修补后的镜像
adb pull /sdcard/Download/magisk_patched-25200_xxxxx.img
```

### 1.5 刷入修补镜像
```bash
# 重启到fastboot模式
adb reboot bootloader

# 刷入修补后的boot镜像
fastboot flash boot magisk_patched-25200_xxxxx.img

# 重启设备
fastboot reboot
```

## 二、Magisk Hide配置

### 2.1 启用Magisk Hide
```bash
# 在Magisk Manager中启用Magisk Hide功能
# 设置 -> Magisk Hide -> 启用

# 命令行方式启用
adb shell
su
magiskhide enable
```

### 2.2 配置隐藏应用列表
```bash
# 查看可隐藏的应用列表
magiskhide ls

# 添加应用到隐藏列表
magiskhide add com.example.bankapp
magiskhide add com.google.android.gms

# 移除应用从隐藏列表
magiskhide rm com.example.app

# 查看当前隐藏列表
magiskhide status
```

### 2.3 高级隐藏配置
```bash
# 隐藏Magisk Manager本身
# 在Magisk Manager中选择"设置" -> "隐藏Magisk Manager"
# 输入新的包名和应用名

# 随机化包名
magisk --random-package-name

# 检查隐藏状态
getprop ro.magisk.hide
```

## 三、Magisk模块开发

### 3.1 模块结构
```
module_root/
├── META-INF/
│   └── com/
│       └── google/
│           └── android/
│               ├── update-binary
│               └── updater-script
├── module.prop
├── service.sh
├── post-fs-data.sh
├── uninstall.sh
└── system/
    └── (模块文件)
```

### 3.2 模块配置文件
```bash
# module.prop
id=example_module
name=Example Module
version=v1.0
versionCode=1
author=Bin4xin
description=This is an example module for Magisk
```

### 3.3 脚本文件说明
```bash
# service.sh - 在late_start服务阶段执行
#!/system/bin/sh
# 在这里添加需要在系统启动后执行的命令

# post-fs-data.sh - 在post-fs-data阶段执行
#!/system/bin/sh
# 在这里添加需要在文件系统挂载后执行的命令

# uninstall.sh - 模块卸载时执行
#!/system/bin/sh
# 在这里添加模块卸载时需要执行的清理命令
```

### 3.4 实际模块示例
```bash
# 创建Root隐藏模块
mkdir -p /sdcard/root_hide_module/META-INF/com/google/android
mkdir -p /sdcard/root_hide_module/system/bin

# 创建module.prop
cat > /sdcard/root_hide_module/module.prop << EOF
id=root_hide_advanced
name=Advanced Root Hide
version=v2.0
versionCode=2
author=Bin4xin
description=Advanced root detection bypass module
EOF

# 创建service.sh
cat > /sdcard/root_hide_module/service.sh << EOF
#!/system/bin/sh
# 修改build.prop属性
resetprop ro.debuggable 0
resetprop ro.secure 1
resetprop ro.build.type user
resetprop ro.build.tags release-keys
EOF
```

## 四、常见问题解决

### 4.1 安装失败问题
```bash
# 检查Magisk版本兼容性
adb shell getprop ro.build.version.sdk

# 清除Magisk数据重新安装
adb shell
pm clear com.topjohnwu.magisk

# 检查boot镜像完整性
fastboot getvar partition-size:boot
```

### 4.2 模块冲突问题
```bash
# 进入安全模式禁用所有模块
# 音量减键 + 电源键启动

# 手动删除问题模块
adb shell
su
rm -rf /data/adb/modules/problem_module

# 重启设备
reboot
```

### 4.3 Magisk Hide失效
```bash
# 重置Magisk Hide数据库
magiskhide disable
rm /data/adb/magisk.db
magiskhide enable

# 检查Zygisk状态
magisk --denylist status

# 更新Magisk Hide列表
magiskhide add com.target.app
```

## 五、高级应用技巧

### 5.1 自定义SELinux规则
```bash
# 在模块中添加SELinux规则
mkdir -p /data/adb/modules/custom_sepolicy/
echo "allow untrusted_app system_file file read" > /data/adb/modules/custom_sepolicy/sepolicy.rule
```

### 5.2 系统属性修改
```bash
# 使用resetprop修改系统属性
resetprop ro.build.fingerprint "google/sdk_gphone64_arm64/generic_arm64:11/RSR1.201013.001/6903271:user/release-keys"
resetprop ro.build.model "Pixel 4"
```

### 5.3 文件系统挂载
```bash
# 在post-fs-data.sh中挂载自定义文件
mount -o bind /data/adb/modules/custom_module/system/lib/libcustom.so /system/lib/libcustom.so
```

## 参考资料

- [Magisk官方文档](https://topjohnwu.github.io/Magisk/)
- [Magisk模块开发指南](https://github.com/topjohnwu/Magisk/blob/master/docs/guides.md)
- [Android Root检测绕过技术](https://blog.csdn.net/coder_ken/article/details/50853927)
