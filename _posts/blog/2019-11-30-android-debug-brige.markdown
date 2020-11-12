---
title:      "「安卓渗透」：天之骄子ADB"
author:     "Bin4xin"

article_header:
  type: cover
  image:
    src: img/android/post-android-bg.jpg
catalog: true
tags:
  - 笔记
  - Android Reverse
  - 渗透
---
## adb简介
adb（Android Debug Bridge）Android调试桥是一种功能多样的命令行工具，可让设备之间（PC端和移动端）进行通信。
adb 命令便于执行各种设备操作（例如安装和调试应用），并提供对 Unix Shell（可用来在设备上运行各种命令）的访问权限。
它是一种客户端-服务器程序。

## 一、adb连接
本菜使用的是模拟器，不同模拟器端口不一样。比如谷歌模拟器端口则默认为5555;
```
$ adb connect 127.0.0.1:21503
adb server is out of date.  killing...
* daemon started successfully *
connected to 127.0.0.1:21503
$ adb devices
List of devices attached
127.0.0.1:21503 device
```

## 二、adb常使用命令
Linux下的命令就不多说了;直接看adb的常用命令(在pc端控制台查看、使用)
Android Debug Bridge version 1.0.32
device commands:
#### 1.adb push
> 顾名思义，push，推送：
```
在pc端控制台将pc端的文件(夹)push到移动端，用法实例：
$ adb push inject /data/local
1606 KB/s (17936 bytes in 0.010s)
进入安卓手机验证:
root@SM-G9350:/data/local # ls
gdb
inject
tmp
```
如上所示inject文件被push到安卓机中。

#### 2.adb pull
> 与push相反
```
在pc端控制台将移动端的文件(夹)pull到pc端。
$ adb pull /data/local/inject C:\Users\本阿信
2507 KB/s (17936 bytes in 0.006s)
在pull文件夹控制台验证:
$ dir
 驱动器 C 中的卷是 root
 卷的序列号是 0009-A6D5
 C:\Users\本阿信 的目录（此下DIR为尖括号，会将文本格式闭合，所以换成括号）
2019/11/30  22:25    （DIR）          .
2019/11/30  22:25    （DIR）         ..
2019/11/28  17:15    （DIR）         .android
2019/11/28  17:44    （DIR）         .idlerc
2019/11/30  22:03    （DIR）         .MemuHyperv
2019/10/16  22:05    （DIR）         .ssh
2019/11/30  22:25            17,936 inject
```
如上所示inject文件已经被pull到pc端了。

#### 3.adb shell
>打开进入已连接安卓机的shell;
adb提示已经连接上了安卓手机，直接进入系统。
```
$ adb shell
root@SM-G9350:/ # whoami
root
root@SM-G9350:/ # pwd
/
root@SM-G9350:/ # uname -a
Linux localhost 4.0.9 #661 SMP PREEMPT Mon Nov 4 13:15:47 CST 2019 i686 GNU/Linux
```
可以发现有熟悉的Linux系统的影子~

#### 4.adb shell 
>后缀加入`command`,不同于3
 run remote shell command
  远程运行shell命令。控制台不进入Andriod Shell;
```
$ adb shell uname -a
Linux localhost 4.0.9 #661 SMP PREEMPT Mon Nov 4 13:15:47 CST 2019 i686 GNU/Linux
如上，控制台回显信息，但此时还是在pc端控制台，并没有进入安卓控制台。
```

#### 5.adb logcat 
> [<filter-spec>] - View device log
查看设备日志:
```
查看所有日志：
$ adb logcat
--------- beginning of main
I/Netd    (    0): Netd 1.0 starting
E/Netd    (    0): Failed to open /proc/sys/net/ipv6/conf/default/accept_ra_rt_table: No such file or directory
E/Netd    (    0): Failed to open /proc/sys/net/ipv6/conf/eth0/accept_ra_rt_table: No such file or directory
E/Netd    (    0): Failed to open /proc/sys/net/ipv6/conf/ifb0/accept_ra_rt_table: No such file or directory
E/Netd    (    0): Failed to open /proc/sys/net/ipv6/conf/ifb1/accept_ra_rt_table: No such file or directory
E/Netd    (    0): Failed to open /proc/sys/net/ipv6/conf/lo/accept_ra_rt_table: No such file or directory
E/Netd    (    0): Failed to open /proc/sys/net/ipv6/conf/sit0/accept_ra_rt_table: No such file or directory
I/installd(    0): installd firing up
I/        (    0): debuggerd: Apr  4 2019 17:10:30
```
过滤日志:
```
$ adb logcat E/WifiStateMachine
E/WifiStateMachine(  509): WifiStateMachine CMD_START_SCAN source -2 txSuccessRate=-0.00 rxSuccessRate=-0.00 targetRoamBSSID=any RSSI=-55
E/WifiStateMachine(  509): WifiStateMachine CMD_START_SCAN source -2 txSuccessRate=-0.00 rxSuccessRate=-0.00 targetRoamBSSID=any RSSI=-55
E/WifiStateMachine(  509): WifiStateMachine CMD_START_SCAN source -2 txSuccessRate=-0.00 rxSuccessRate=-0.00 targetRoamBSSID=any RSSI=-55
E/WifiStateMachine(  509): WifiStateMachine shouldSwitchNetwork  txSuccessRate=-0.00 rxSuccessRate=-0.00 delta 999 -> 999
E/WifiStateMachine(  509): CMD_AUTO_ROAM sup state CompletedState my state ConnectedState nid=0 config "lgrut25642"NONE roam=1 to any targetRoamBSSID any
E/WifiStateMachine(  509): AUTO_ROAM nothing to do
E/WifiStateMachine(  509): WifiStateMachine CMD_START_SCAN source -2 txSuccessRate=-0.00 rxSuccessRate=-0.00 targetRoamBSSID=any RSSI=-55
```  

#### 6.adb install 
> [-lrtsd] <file>
```
安装1.apk命令（在pc端，且1.apk为绝对路径）
$ adb install 1.apk
3480 KB/s (54687952 bytes in 15.344s)
        pkg: /data/local/tmp/1.apk
Success
```

#### 7.adb uninstall 
> [-k] <package> - remove this app package from the device
> ('-k' means keep the data and cache directories)
```
$ adb uninstall [-k] com.com.pack
  	Success
  	-k参数值保存安装数据和缓存。
```

#### 8.adb help                     
	- show this help message;显示帮助信息

#### 9.adb version                  
	- show version num;显示版本号

## ————————华丽分割线——————————
<br>
<strong>以上,记录。</strong>
