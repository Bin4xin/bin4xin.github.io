---
layout: post
toc: true
title: "「scrcpy」:Linux中优秀的投屏软件～"
author: Bin4xin
categories:
    - blog
tags:
    - 笔记
permalink: /blog/2019/scrcpy/
---

```bash
# apt install snapd
正在读取软件包列表... 完成
正在分析软件包的依赖关系树       
正在读取状态信息... 完成       
snapd 已经是最新版 (2.42.1-1)。
升级了 0 个软件包，新安装了 0 个软件包，要卸载 0 个软件包，有 26 个软件包未被升级
sudo snap install scrcpy.snap --dangerous
```

由于直接设置 http_proxy 环境变量无法设置上, 作者在 snapd 中直接设置proxy, 方法如下:
```bash
# 前置操作, 修改  systemctl edit 使用的编辑器为 VIM, 如果不介意 Nano 可以跳过这一步
$ sudo tee -a /etc/profile <<-'EOF' 
export SYSTEMD_EDITOR="/bin/vim"
EOF
$ source /etc/profile

# 开始设置代理
$ sudo systemctl edit snapd
加上：
[Service]
Environment="http_proxy=http://127.0.0.1:port"
Environment="https_proxy=http://127.0.0.1:port"
```
```bash
$ sudo systemctl daemon-reload
$ sudo systemctl restart snapd
```
实测相当有效
```bash
root@kali:/usr/local/scrcpy-test/scrcpy# sudo snap install scrcpy
2019-12-31T11:28:41+08:00 INFO Waiting for restart...
Download snap "core18" (1288) from channel "stable"             11% 14.7kB/s 57.7m^C^C^Z
[2]+  已停止               sudo snap install scrcpy
```
如上下所示，速度快了十倍～十倍的快乐～
```bash
root@kali:/usr/local/scrcpy-test/scrcpy# sudo snap install scrcpy
2019-12-31T11:36:30+08:00 INFO Waiting for restart...
Download snap "scrcpy" (199) from channel "stable"               7%  129kB/s 9m51s
Warning: /snap/bin was not found in your $PATH. If you've not restarted your session since you
         installed snapd, try doing that. Please see https://forum.snapcraft.io/t/9469 for more
         details.

scrcpy v1.12 from sisco311 installed
```
scrcpy投屏需要usb调试权限；
具体步骤为[开发者模式]-[打开usb调试]
否则会报错：
```bash
root@kali:~# scrcpy
INFO: scrcpy 1.12 <https://github.com/Genymobile/scrcpy>
adb: error: failed to get feature set: no devices/emulators found
ERROR: "adb push" returned with value 1
```



报错如下：
```bash
root@kali:/snap/bin# ./scrcpy
cannot change profile for the next exec call: No such file or directory
snap-update-ns failed with code 1: No such file or directory
查看版本：
root@kali:~# snap version
snap    2.42.5
snapd   2.42.5
series  16
kali    2019.4
kernel  5.3.0-kali3-amd64
root@kali:~# snap version
snap    2.42.5
snapd   2.42.5
series  16
kali    2019.4
kernel  5.3.0-kali3-amd64
```
解决：
```bash
root@kali:/var/lib/snapd/apparmor/profiles# apparmor_parser -r /var/lib/snapd/apparmor/profiles/
```



参考<br>

<a href="https://kuricat.com/gist/snap-install-too-slow-zmbjy">
snapInstall.md;snap安装过慢解决方案</a>

<a href="https://forum.snapcraft.io/t/snap-update-ns-failing-cannot-launch-snaps/11956">
Snap-update-ns failing, cannot launch snaps;linux重启后启动scrcpy，snap报错</a>