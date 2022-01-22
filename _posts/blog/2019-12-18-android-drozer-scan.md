---
layout: post
toc: true
title: "「安卓渗透」:Amazing drozer Scanning frame"
author: Bin4xin
categories:
    - blog
tags:
    - 笔记
    - Android Reverse
    - 渗透
permalink: /blog/2019/Drozer/Scan/in/android/
---


* 直接上链接，不多bb。有空写实战：） 
  - 参考文档：[安卓渗透框架－Drozer架构浅析--架构组成和自定义模块](https://segmentfault.com/a/1190000003756601)


## 一、drozer运行概述
跟Frida-Hook框架运行模式差不多，均为C/S模式。
- 1）移动端：drozer-agent启动pc-drozer框架前需打开drozer-agent进行端口转发
- 2）pc端：主要控制CLI端。渗透测试命令全部在这里输入执行；

### 1.1 drozer环境
- windows/linux-debian
- python2.7
- drozer&drozer-angent	

### 1.2 前期准备
<a href="https://github.com/mwrlabs/drozer/releases/download/2.4.4/drozer-2.4.4.win32.msi">windows-drozer-2.4.4.msi下载</a><br>
<a href="https://github.com/mwrlabs/drozer/releases/download/2.4.4/drozer_2.4.4.deb">debian-linux-drozer-2.4.4.deb下载</a><br>
<a href="https://github.com/mwrlabs/drozer/releases/download/2.3.4/drozer-agent-2.3.4.apk">android-drozer-2.3.4.apk下载</a><br>
```
多提一句：
msi后缀为windows可执行文件，双击安装即可。
deb：dpkg -i <deb包>
apk是安卓包，下载到本地<adb install apk包>
```




## 二、drozer实战
```
C:\Users\本阿信>drozer console connect
Selecting 7ad839637216ad27 (OPPO OPPO R11 Plus 5.1.1)

            ..                    ..:.
           ..o..                  .r..
            ..a..  . ....... .  ..nd
              ro..idsnemesisand..pr
              .otectorandroidsneme.
           .,sisandprotectorandroids+.
         ..nemesisandprotectorandroidsn:.
        .emesisandprotectorandroidsnemes..
      ..isandp,..,rotectorandro,..,idsnem.
      .isisandp..rotectorandroid..snemisis.
      ,andprotectorandroidsnemisisandprotec.
     .torandroidsnemesisandprotectorandroid.
     .snemisisandprotectorandroidsnemesisan:
     .dprotectorandroidsnemesisandprotector.

drozer Console (v2.4.4)
dz>
```

<h3>updating～</h3>

