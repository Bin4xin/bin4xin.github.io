---
layout: post
toc: true
title: "NGINX笔记：http升级https协议"
author: Bin4xin
categories:
    - blog
tags:
    - Web
    - 排错
    - 笔记
permalink: /blog/2019/how-nginx/http2https/
---


<strong>窈窕HTTPS，正是TCP的好逑；</strong>

*how to used http to https with nginx? Is's sounds fantastic!*

> 其实证书早就颁发下来了，一直配置配不成功（小声bb）。纪念一下，2019-12-13号，站点升级为https协议。嘿嘿

## 1.安装libssl库
```
sudo apt-get install libssl-dev
apt-get install libpcre3 libpcre3-dev
```

## 2.ssl编译

```
cd nginx/ 
./configure --prefix=/usr/local/nginx --with-http_stub_status_module --with-http_ssl_module --with-file-aio --with-http_realip_module
make 
如果安装了nginx，到这里结束。
反之再加
make install
cd #你解压nginx的目录/sbin/
./nginx -V
nginx -V #注意是大v，看到下面有--with-http_ssl_module模块即可
nginx version: nginx/1.16.1
built with OpenSSL 1.1.1d  10 Sep 2019
TLS SNI support enabled
configure arguments: --with-cc-opt='-g -O2 --with-http_ssl_module 
cp nginx /usr/sbin
复制到快速启动目录即可
```

## 3.认证配置

证书申请下来后把证书传到服务器上就行了，配置nginx的https区块即可。

```
http{
server {
    listen 443;
    server_name XXX;
    ssl on;
    ssl_certificate    /usr/local/nginx/conf/cert/214.pem;#你自己的证书地址
    ssl_certificate_key   /usr/local/nginx/conf/cert/21.key;
    ssl_session_timeout 5m;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE:ECDH:AES:HIGH:!NULL:!aNULL:!MD5:!ADH:!RC4;
    ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
    ssl_prefer_server_ciphers on;    
    
    location / { 
        
	    }      
	}
}

nginx -t 
systemctl reload nginx
```

## AMAZING:it's failed
配置完美滋滋去验证网站，畏（zhi）畏（gao）缩（qi）缩（ang）的输入站点https协议地址，结果傻了眼，还是http的协议提示，好气。<br>
![](/assets/img/post-bg/post-unsafe-http.png)

赶紧趁着ssh还没断开赶紧查看配置哪里出了问题。
思路：因为配置了ssl，监听了443端口。所以服务器肯定在监听了443端口，先查查看：
```
netstatus -tunlp |grep 443#发现没有回显，那看看所有监听服务器
netstatus -tunlp#（仅仅展示一部分）发现服务器并未监听443
Active Internet connections (only servers)
Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name    
tcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN      861/nginx: master p 
tcp        0      0 127.0.0.53:53           0.0.0.0:*               LISTEN      319/systemd-resolve 
tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN      6029/sshd           
```
如上代码，nginx配置了监听443,，实际上linux却没有监听，问题肯定就出在这上面<br>
首先排除：nginx配置问题，因为nginx配置是能够通过的，所以暂时排除。<br>
第二就是防火墙的问题，先登上控制台确认443端口开放，没问题。然后登上服务器查看服务器防火墙状态，因为是ubuntu服务器所有查看ufw状态：
```
systemctl status ufw
● ufw.service - Uncomplicated firewall
   Loaded: loaded (/lib/systemd/system/ufw.service; enabled; vendor preset: enabled)
   Active: active (exited) since Fri 2019-12-13 10:46:00 CST; 1h 54min ago
     Docs: man:ufw(8)
  Process: 31826 ExecStop=/lib/ufw/ufw-init stop (code=exited, status=0/SUCCESS)
  Process: 31967 ExecStart=/lib/ufw/ufw-init start quiet (code=exited, status=0/SUCCESS)
 Main PID: 31967 (code=exited, status=0/SUCCESS)

Dec 13 10:46:00 iZj6cgn7odv59wmjjhe6zwZ systemd[1]: Starting Uncomplicated firewall...
Dec 13 10:46:00 iZj6cgn7odv59wmjjhe6zwZ systemd[1]: Started Uncomplicated firewall.

```
看到服务器防火墙是active状态，但是接下来却让我`目瞪口呆`：
```
ufw status verbose
Status: inactive
ufw status numbered
Status: inactive
```
不管怎么写命令，他都是提示incative，我瞬间就崩溃了，我甚至还尝试了`systemctl status verbose ufw`这样的蠢命令- -|||
后来各种查命令，因为我坚信服务器上还有第二个防火墙～<br>理由：控制台开放了443，而我进行验证却验证失败：
`telnegt $IP 443`反馈：`telnet: Unable to connect to remote host: Connection refused`，所以我就一直钻到`防火墙`的牛角尖出不来了。
兜兜转转，圈圈圆圆。所以就一直拖到了今天TAT


## It can be solved.
后来证实其实问题不是在防火墙上，今天偶然网上冲浪，看到个帖子:<br>
<div class='default'><a href="https://www.cnblogs.com/lxwphp/p/8031919.html">nginx https配置后无法访问，可能防火墙在捣鬼</a></div>(建议右键新建页面打开～`笔芯`)，引用文章的话:
```
如果无法连接，通常是防火墙，或者nginx为(未)(我真是个天才)启动等可能的因素；
冷静分析问题，查看错误信息，才是解决问题的办法
```
联想到我的问题，难道？是nginx根本没有重启？一语惊醒梦中人。赶紧登上服务器。
既然`systemctl`没用，那直接用nginx配置命令
```
nginx -s reload
```
输入`chihou.pro`-键入`F5`<br>
她居然跳转了`https`页面，我哭了。

<h5>冷静分析问题，查看错误信息，才是解决问题的办法</h5>
<h5>解决问题的办法</h5>
<h5>办法</h5>
<h5>法</h5>
<h5>奥利给～</h5>
<h5>给...</h5>

如果这篇文章帮助到了您，那不如在心里大大喊一声`nice`～

`敬上。感谢您的阅读`


- 参考：

- <a href='https://www.jianshu.com/p/1ca5a62df1a9'>启动Nginx出现Failed to start nginx.service:unit not found</a><br>
- <a href='https://blog.csdn.net/weixin_44846959/article/details/89603328'>Ubuntu编译安装nginx</a><br>
- <a href='https://www.cnblogs.com/zoulixiang/p/10196671.html'>nginx 动态添加ssl模块 </a>
