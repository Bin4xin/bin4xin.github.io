---
layout: post
toc: true
title: "「scrcpy」:Linux中优秀的投屏软件～"
author: Bin4xin
wrench: 2022-03-30
categories:
    - blog
tags:
    - 笔记
---

### macOS

---

> 2022/03/30/17:13:08 添加macOS用法

---

用scrcpy主要是因为开源且干净，先上效果图。

![2022-03-30-5.15.11.png]({{site.PicturesLinks_Domain}}/images/2022/03/30/2022-03-30-5.15.11.png)

安装也很简单：

```bash
brew install scrcpy
```

不过当时我一直报错：

```console
Error: python@3.9: the bottle needs the Apple Command Line Tools to be installed.

Error: scrcpy: Failed to download resource "imath"
```
来回的报错，而且brew的cache下载文件夹一直在下载，我就很慌；然后在知乎上找到[@知乎用户](https://www.zhihu.com/question/38722634/answer/1351407129)的回答：

> mac用户使用homebrew安装scrcpy时，请注意如果使用了国内源，则有可能安装不到scrcpy的最新版本（目前是v1.14），如果安装了旧版本，则某些手机可
> 能无法使用scrcpy，报segement error。 所以，请确保能安装到最新版本的scrcpy：

- 1、使用默认源；
- 2、使用地址直接安装特定版本；
- 3、安装完成后，使用 `brew info scrcpy` ，确认一下版本。

豁然开朗；直接修改默认源在下载就好了：

```bash
git -C "$(brew --repo)" remote set-url origin 'https://github.com/Homebrew/brew.git'
git -C "$(brew --repo homebrew/core)" remote set-url origin 'https://github.com/Homebrew/homebrew-core.git'
git -C "$(brew --repo homebrew/cask)" remote set-url origin 'https://github.com/Homebrew/homebrew-cask.git'
brew update
```

info:
```bash
$ brew info scrcpy

scrcpy: stable 1.23 (bottled)
Display and control your Android device
https://github.com/Genymobile/scrcpy
/usr/local/Cellar/scrcpy/1.23 (10 files, 295.9KB) *
  Poured from bottle on 2022-03-30 at 16:51:20
From: https://github.com/Homebrew/homebrew-core/blob/HEAD/Formula/scrcpy.rb
License: Apache-2.0
```

### Linux

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
# 加上：
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

- scrcpy投屏需要usb调试权限； 
  - 具体步骤为[开发者模式]-[打开usb调试]

否则会报错：

```bash
root@kali:~# scrcpy
INFO: scrcpy 1.12 <https://github.com/Genymobile/scrcpy>
adb: error: failed to get feature set: no devices/emulators found
ERROR: "adb push" returned with value 1
```

#### 0x01 其他报错

```bash
root@kali:/snap/bin# ./scrcpy
cannot change profile for the next exec call: No such file or directory
snap-update-ns failed with code 1: No such file or directory
#查看版本：
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

### 参考

- [snapInstall.md;snap安装过慢解决方案](https://kuricat.com/gist/snap-install-too-slow-zmbjy){:target="_blank"}
- [Snap-update-ns failing, cannot launch snaps;linux重启后启动scrcpy，snap报错](https://forum.snapcraft.io/t/snap-update-ns-failing-cannot-launch-snaps/11956){:target="_blank"}
- [@知乎用户](https://www.zhihu.com/question/38722634/answer/1351407129){:target="_blank"}
- [Homebrew查看并修改源配置](https://allanhao.com/2020/07/26/homebrew-source/){:target="_blank"}