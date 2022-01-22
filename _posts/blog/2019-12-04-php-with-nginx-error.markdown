---
layout: post
toc: true
title: "「排错」：php-fpm解析404-not found"
author: Bin4xin
categories:
    - blog
tags:
    - Web
    - 笔记
    - 技巧
    - 排错
permalink: /blog/2019/nginx/with/php/404error/
---

* php+nginx解析错误，报错404-Not Found

## 前言
容器内是自己写的个人博客，处于安全考虑用的是静态页面博客。但是由于公网维护博客较为困难，加上之前用的开源存储云服务项目，那么就需要`php`来解析，所以打算试一试能不能`「nginx+php」`的方式方便个人维护博客。
<br>
所以本菜最终想完成的是这样的：

- static html：web blog + dynamic php：store server 
- 静态博客页面 + 动态php页面传输markdown文件


## 报错现象
nginx容器能够启动，HTML页面能够正常回显，但是解析php页面会报错：404-NOT-FOUND；
```
vi index.php
<?php
phpinfo();
?>
```
看到比我头还大的404头就疼；确定各种php的配置都没错。
```
server {
location ~ \.php{
	    index  indx.php index.html;
	    include snippets/fastcgi-php.conf;
	    fastcgi_pass unix:/var/run/php/php7.2-fpm.sock;
		}
}
```
就各种上网搜php-404，问人。都没答案。

## 排错过程

#### 幡然悔悟
正好最近薅了一个华为云服务器，反手就是nginx+php存储项目往上安装方便传输文件，配nginx的时候看到这么一行配置：
```
##
# Virtual Host Configs
##
	include /etc/nginx/conf.d/*.conf;
	include /etc/nginx/sites-enabled/*;
```
直拍大腿，当初配博客服务器的时候，嫌麻烦，直接把`/etc/nginx/sites-enabled/`这行配置注释掉了，自己在http区块配了php-location-server。赶紧重新配置php-fpm：

> 传送门：[「移植」ubuntu with arm.公网存储容器搭建记录](/blog/2019/Ubuntu/with/arm/)

#### 茅塞顿开

重新软链接完php-fpm，迫不及待访问php文件，又报错：
<center><strong>502：Bad-Gateway</strong></center>
舒了一口气，总算不是该死的404了。502报错基本上就是php-fpm的配置问题了，一般都是fpm在解析时出错。反手查看一波php运行日志：
```
cat /var/log/php7.2-fpm.log
[04-Dec-2019 17:58:14] NOTICE: ready to handle connections
[04-Dec-2019 17:58:14] NOTICE: systemd monitor interval set to 10000ms
```

果然，php-fpm解析超时了导致报错，直接搜索解决答案；

#### 迎刃而解

在php-fpm配置文件下加入fpm运行参数:
```
vi /etc/php/7.2/fpm/php-fpm.conf
;;;;;;;;;;;;;;;;;;
; Global Options ;
;;;;;;;;;;;;;;;;;;
pm.max_children = 50
pm.start_servers = 15
pm.min_spare_servers = 10
pm.max_spare_servers = 40 
systemctl reload php-fpm
```


同时对nginx增加配置：

```
vi /etc/nginx/nginx.conf
http {

fastcgi_connect_timeout 300;
fastcgi_send_timeout 300;
fastcgi_read_timeout 300;

} 
nginx -t
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
测试无误
```

访问index.php，终于看到了熟悉的`phpinfo`页面，至此排错、配置结束。

---

2020-02-20更新：

在linux下配置好nginx和php-fpm后，访问web页面不能显示，查看nginx访问日志，日志显示返回200，访问成功。
html静态页面没问题，但是php页面总是空白页也没有任何报错，经过查找，发现需要在nginx中加入一句话
```
fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
```
安装完nginx后默认的fastcgi_params配置文件中没有上面这句话。

在nginx.conf中的
```bash
location ~ .php$ {
root html;
fastcgi_pass 127.0.0.1:9000;
fastcgi_index index.php;
#fastcgi_param SCRIPT_FILENAME /scripts$fastcgi_script_name;
fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
include fastcgi_params;
}
```
或者在fastcgi_params配置文件中加入
```bash
# PHP only, required if PHP was built with –enable-force-cgi-redirect
fastcgi_param REDIRECT_STATUS 200;
fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
```
然后重启nginx就可以显示出页面了。

[nginx下运行php文件时返回200访问空白页](https://blog.csdn.net/xkweiguang/article/details/52795166)

---
##### # 502badgateway:

apt自动化安装：
```bash
配置/etc/php/7.3/fpm/pool.d/www.conf文件：
php-fpm.conf: listen = 127.0.0.1:9000
nginx.conf: fastcgi_pass 127.0.0.1:9000;
```

[php 502 bad gateway 解决方法：](https://blog.csdn.net/ucmir183/article/details/80240112)

以上。