---
layout: post
toc: true
title: "「安卓」:Android开发环境配置与常见问题解决"
author: Bin4xin
categories:
    - blog
tags:
    - 笔记
    - Android Reverse
    - 开发环境
---

## Android开发环境概述

Android开发环境的搭建是进行Android逆向分析的基础，包括Android SDK、NDK、各种构建工具以及模拟器的配置。本文将详细介绍环境搭建过程中的常见问题及解决方案。

## 一、Android SDK配置

### 1.1 SDK安装与配置
```bash
# 下载Android SDK Command Line Tools
wget https://dl.google.com/android/repository/commandlinetools-linux-8512546_latest.zip

# 解压到指定目录
unzip commandlinetools-linux-8512546_latest.zip -d ~/android-sdk
cd ~/android-sdk
mkdir cmdline-tools
mv tools cmdline-tools/latest

# 设置环境变量
export ANDROID_HOME=~/android-sdk
export ANDROID_SDK_ROOT=$ANDROID_HOME
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/emulator
```

### 1.2 SDK组件安装
```bash
# 查看可用的SDK包
sdkmanager --list

# 安装必要组件
sdkmanager "platform-tools" "platforms;android-30" "build-tools;30.0.3"
sdkmanager "system-images;android-30;google_apis;x86_64"
sdkmanager "emulator" "tools"

# 接受许可协议
sdkmanager --licenses
```

### 1.3 常见SDK问题解决
```bash
# 问题1：SDK location not found
# 解决方案：在项目根目录创建local.properties文件
echo "sdk.dir=$ANDROID_HOME" > local.properties

# 问题2：ANDROID_HOME环境变量未设置
# 解决方案：在~/.bashrc或~/.zshrc中添加环境变量
echo 'export ANDROID_HOME=~/android-sdk' >> ~/.bashrc
echo 'export PATH=$PATH:$ANDROID_HOME/platform-tools' >> ~/.bashrc
source ~/.bashrc

# 问题3：sdkmanager命令找不到
# 解决方案：检查cmdline-tools目录结构
ls -la $ANDROID_HOME/cmdline-tools/
# 确保目录结构为：cmdline-tools/latest/bin/sdkmanager
```

## 二、Gradle构建系统配置

### 2.1 Gradle安装配置
```bash
# 下载Gradle
wget https://services.gradle.org/distributions/gradle-7.4.2-bin.zip

# 解压安装
unzip gradle-7.4.2-bin.zip -d ~/gradle
export GRADLE_HOME=~/gradle/gradle-7.4.2
export PATH=$PATH:$GRADLE_HOME/bin

# 验证安装
gradle --version
```

### 2.2 Gradle项目配置
```gradle
// build.gradle (Project level)
buildscript {
    ext.kotlin_version = "1.6.21"
    repositories {
        google()
        mavenCentral()
        jcenter() // 已废弃，建议移除
    }
    dependencies {
        classpath "com.android.tools.build:gradle:7.1.3"
        classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlin_version"
    }
}

allprojects {
    repositories {
        google()
        mavenCentral()
        maven { url 'https://jitpack.io' }
    }
}

// build.gradle (App level)
android {
    compileSdkVersion 31
    buildToolsVersion "31.0.0"
    
    defaultConfig {
        applicationId "com.example.myapp"
        minSdkVersion 21
        targetSdkVersion 31
        versionCode 1
        versionName "1.0"
        
        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }
    
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
        debug {
            debuggable true
            applicationIdSuffix ".debug"
        }
    }
    
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_1_8
        targetCompatibility JavaVersion.VERSION_1_8
    }
}
```

### 2.3 Gradle常见问题解决
```bash
# 问题1：Gradle构建失败 - 网络问题
# 解决方案：配置国内镜像源
mkdir -p ~/.gradle
cat > ~/.gradle/init.gradle << EOF
allprojects {
    repositories {
        maven { url 'https://maven.aliyun.com/repository/google' }
        maven { url 'https://maven.aliyun.com/repository/central' }
        maven { url 'https://maven.aliyun.com/repository/gradle-plugin' }
        maven { url 'https://maven.aliyun.com/repository/public' }
    }
}
EOF

# 问题2：Gradle Daemon启动失败
# 解决方案：清理Gradle缓存
rm -rf ~/.gradle/caches/
rm -rf ~/.gradle/daemon/

# 问题3：内存不足错误
# 解决方案：配置Gradle JVM参数
echo "org.gradle.jvmargs=-Xmx4096m -XX:MaxPermSize=512m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8" >> ~/.gradle/gradle.properties
echo "org.gradle.parallel=true" >> ~/.gradle/gradle.properties
echo "org.gradle.configureondemand=true" >> ~/.gradle/gradle.properties
```

## 三、Android NDK配置

### 3.1 NDK安装
```bash
# 通过sdkmanager安装NDK
sdkmanager "ndk;23.1.7779620"

# 或手动下载安装
wget https://dl.google.com/android/repository/android-ndk-r23c-linux.zip
unzip android-ndk-r23c-linux.zip -d ~/android-ndk
export ANDROID_NDK_HOME=~/android-ndk/android-ndk-r23c
export PATH=$PATH:$ANDROID_NDK_HOME
```

### 3.2 NDK项目配置
```gradle
// build.gradle (App level)
android {
    defaultConfig {
        ndk {
            abiFilters 'arm64-v8a', 'armeabi-v7a', 'x86', 'x86_64'
        }
    }
    
    externalNativeBuild {
        cmake {
            path "src/main/cpp/CMakeLists.txt"
            version "3.18.1"
        }
    }
}
```

```cmake
# CMakeLists.txt
cmake_minimum_required(VERSION 3.18.1)
project("native-lib")

add_library(
    native-lib
    SHARED
    native-lib.cpp
)

find_library(
    log-lib
    log
)

target_link_libraries(
    native-lib
    ${log-lib}
)
```

### 3.3 NDK常见问题
```bash
# 问题1：NDK版本不兼容
# 解决方案：在gradle.properties中指定NDK版本
echo "android.ndkVersion=23.1.7779620" >> gradle.properties

# 问题2：CMake找不到
# 解决方案：安装CMake
sdkmanager "cmake;3.18.1"

# 问题3：交叉编译工具链问题
# 解决方案：检查NDK工具链路径
ls $ANDROID_NDK_HOME/toolchains/llvm/prebuilt/linux-x86_64/bin/
```

## 四、模拟器配置

### 4.1 AVD创建与管理
```bash
# 创建AVD
avdmanager create avd -n "Pixel_4_API_30" -k "system-images;android-30;google_apis;x86_64" -d "pixel_4"

# 列出所有AVD
avdmanager list avd

# 启动模拟器
emulator -avd Pixel_4_API_30

# 启动模拟器（无GUI）
emulator -avd Pixel_4_API_30 -no-window -no-audio
```

### 4.2 模拟器性能优化
```bash
# 启用硬件加速
emulator -avd Pixel_4_API_30 -gpu host

# 分配更多内存
emulator -avd Pixel_4_API_30 -memory 4096

# 启用快照功能
emulator -avd Pixel_4_API_30 -snapshot-save

# 配置网络代理
emulator -avd Pixel_4_API_30 -http-proxy http://127.0.0.1:8080
```

### 4.3 模拟器常见问题
```bash
# 问题1：模拟器启动失败 - HAXM问题
# 解决方案：安装Intel HAXM或启用Hyper-V
# Linux用户：确保KVM已启用
sudo apt install qemu-kvm libvirt-daemon-system libvirt-clients bridge-utils
sudo usermod -aG kvm $USER

# 问题2：模拟器运行缓慢
# 解决方案：启用硬件加速和增加内存
emulator -avd Pixel_4_API_30 -gpu host -memory 4096 -cores 4

# 问题3：网络连接问题
# 解决方案：配置DNS和代理
emulator -avd Pixel_4_API_30 -dns-server 8.8.8.8,8.8.4.4
```

## 五、开发工具配置

### 5.1 Android Studio配置
```bash
# 下载Android Studio
wget https://redirector.gvt1.com/edgedl/android/studio/ide-zips/2021.2.1.15/android-studio-2021.2.1.15-linux.tar.gz

# 解压安装
tar -xzf android-studio-2021.2.1.15-linux.tar.gz -C ~/android-studio
~/android-studio/android-studio/bin/studio.sh

# 配置JVM参数
echo "-Xmx4096m" >> ~/android-studio/android-studio/bin/studio64.vmoptions
echo "-XX:ReservedCodeCacheSize=512m" >> ~/android-studio/android-studio/bin/studio64.vmoptions
```

### 5.2 命令行工具配置
```bash
# 安装必要的命令行工具
sudo apt update
sudo apt install openjdk-11-jdk git curl wget unzip

# 配置Java环境
export JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64
export PATH=$PATH:$JAVA_HOME/bin

# 验证Java安装
java -version
javac -version
```

### 5.3 签名工具配置
```bash
# 生成调试签名
keytool -genkey -v -keystore debug.keystore -alias androiddebugkey -keyalg RSA -keysize 2048 -validity 10000

# 查看签名信息
keytool -list -v -keystore debug.keystore

# 使用jarsigner签名APK
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore debug.keystore app-debug.apk androiddebugkey

# 使用apksigner签名APK（推荐）
apksigner sign --ks debug.keystore --ks-key-alias androiddebugkey app-debug.apk
```

## 六、环境验证与测试

### 6.1 环境完整性检查
```bash
# 检查所有环境变量
echo "ANDROID_HOME: $ANDROID_HOME"
echo "ANDROID_SDK_ROOT: $ANDROID_SDK_ROOT"
echo "ANDROID_NDK_HOME: $ANDROID_NDK_HOME"
echo "JAVA_HOME: $JAVA_HOME"
echo "GRADLE_HOME: $GRADLE_HOME"

# 检查工具可用性
adb version
fastboot --version
gradle --version
java -version
```

### 6.2 创建测试项目
```bash
# 创建新的Android项目
mkdir TestProject && cd TestProject

# 初始化Gradle项目
gradle init --type basic

# 创建基本的Android项目结构
mkdir -p src/main/java/com/example/test
mkdir -p src/main/res/layout
mkdir -p src/main/res/values

# 构建项目
./gradlew build
```

## 参考资料

- [Android开发者官方文档](https://developer.android.com/studio/install)
- [Gradle构建工具文档](https://gradle.org/guides/)
- [Android NDK开发指南](https://developer.android.com/ndk/guides)
- [环境配置问题解决](https://blog.csdn.net/coder_ken/article/details/50853927)
