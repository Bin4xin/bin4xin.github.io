---
layout: post
toc: true
title: "「安卓渗透」： Let's hook APK with frida～"
author: Bin4xin
categories:
    - blog
    - 笔记
    - Android Reverse
    - 渗透
permalink: /blog/2019/Android/hook/
---

* 忙里偷闲，本文是记录Hook-Frida框架，如何使用Frida注入代码，做到对安卓apk进行代码hook注入。

## Frida框架准备

1.frida框架安装<br>
frida框架为C/S模式，即客户端、服务端模式：<br>

- 1）一部分是运行在客户端上的命令行交互工具：Frida CLI。<br>
- 2）另一部分是运行在目标机器（服务端，在本文中则是安卓手机）上的代码注入：frida-server。<br>

过程为：你在电脑上进行frida控制，开启目标机器（服务端）上的server端后，我们可以一些自定义操作比如指定hook脚本，这些参数通过客户端发送到服务端，服务端接收参数后来进行操作<br>

2.一个测试apk<br>

3.`hook代码`(此处hook代码不便贴出，见谅)

### 安装Frida

这里Frida支持python3和python2.7，因为确实3和2.7之间还是有不同的地方，本文以python2.7安装Frida为例：<br>
查看pip版本
```
pip --version
pip 18.1 from /usr/lib/python2.7/dist-packages/pip (python 2.7)
##你想在哪个环境下运行Frida，就用哪个命令（pip、pip3）
pip3 --version
pip 18.1 from /usr/lib/python3/dist-packages/pip (python 3.7)
```

确认是在2.7版本环境下安装即可：

```
pip install frida
Collecting frida
    Downloading https://files.pythonhosted.org/packages/38/1b/8a462787cedda36c57227ed0babbd80c4c4cc5bc9c1f9b5aa285ed6aebba/frida-12.8.0.tar.gz
Building wheels for collected packages: frida
  Running setup.py bdist_wheel for frida ... \
  Successfully built frida
Installing collected packages: frida
Successfully installed frida-12.8.0
```
安装完frida，继续安装依赖项：frida-tools：
```
pip install frida-tools
	100% |████████████████████████████████| 348k
```
此处基本frida框架就安装完成了，查看一下frida的版本号
```
frida --version
12.8.0
```

### 安装frida-server
此处安装的是Frida的服务端，在手机端运行。手机端大多为`ARM`架构，但有的小伙伴使用的模拟器，所以先用命令查看一下手机的cpu架构：
```
adb shell
* daemon not running; starting now at tcp:5037
* daemon started successfully
shell@angler:/ $ su
root@angler:/ # getprop ro.product.cpu.abi
arm64-v8a
```
如果回显是`arm`就下载arm版本，回显`x86`就下载x86版本。
<a href=" https://github.com/frida/frida/releases">frida-server下载</a><br>
这里记住千万不要下载错了，进去页面直接`CTRL+F`搜索server。下载完毕，重命名为frida-server<br>
把frida-server传输到手机，（注意：pc端frida版本号与移动端一致）：
```
##PC端
adb devices
adb push frida-server /data/local/tmp
adb forward tcp:27042 tcp:27042
adb forward tcp:27043 tcp:27043
```
```
##移动端
adb shell
root@angler:/data/local/tmp # cd /data/local/tmp/ 
root@angler:/data/local/tmp #./frida-server
```

## Frida-Hook实战
在启动服务端frida-server后，在客户端进行操作：
```
##指定好pack包和js文件路径
frida -U -f <package-name> -l <hook.js-path>
##提示<package-name>Spawned成功后，输入%resume重启app后使app-hook注入
```
![](/assets/img/post-pic/post-frida-pic2.png) <br>
如下图，app重启后检测到hook框架代码弹出提示，此时js代码注入成功。<br>
![](/assets/img/post-pic/post-frida-pic3.png)

<h2>以上为敬。</h2>

参考文档：
<a href="https://www.jianshu.com/p/c349471bdef7">Frida详细安装教程</a>