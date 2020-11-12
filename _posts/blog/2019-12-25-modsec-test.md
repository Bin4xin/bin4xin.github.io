---
title:      "Mod-Security：有关「WAF」的爱恨情仇"
author:     "Bin4xin"
date:       2019-12-25
article_header:
  type: cover
  image:
    src: img/post-bg/post-cf-waf-bg1.png
catalog: true
tags:
    - Debian Linux
    - Web
    - 笔记
    - WAF
---
> 记一次waf配置经历。忙里偷闲，正好有闲置的服务器，自己动动手配置看看。
 
# 1.运行环境
- nginx-1.14.0（apt自动化安装）
- ubuntu 18.04



# 2.安装配置
## 2.1 mod-security安装

首先下载github下的Mod-Security项目：

```
git clone --depth 1 -b v3/master --single-branch https://github.com/SpiderLabs/ModSecurity
cd ModSecurity
git submodule init
git submodule update
./build.sh
./configure
make
make install
```
最后提示```fatal: No names found, cannot describe anything```，教程提示为正常现象，先不管跳过。

## 2.2 mod-security-Nginx连接
下载用于ModSecurity的NGINX连接器，下载好就不用管了，放在能记住的位置，到时候直接连接就行了：
```
git clone --depth 1 https://github.com/SpiderLabs/ModSecurity-nginx.git
```

查看Nginx版本，方便加载ModSecurity模块:
```
root@VM-0-11-ubuntu:/usr/local/ModSecurity# nginx -v
nginx version: nginx/1.14.0 (Ubuntu)
```
下载安装版本对应的源代码：
```
wget http://nginx.org/download/nginx-1.14.0.tar.gz
tar zxvf nginx-1.14.0.tar.gz
cd nginx-1.14.0/
./configure --with-compat --add-dynamic-module=../ModSecurity-nginx
make modules
cp objs/ngx_http_modsecurity_module.so /etc/nginx/modules/
```

查看一下nginx是否编译成功ModSecurity链接：
```
nginx -V
nginx version: nginx/1.14.0 (Ubuntu)
built with OpenSSL 1.1.1  11 Sep 2018
TLS SNI support enabled
configure arguments: --with-http_xslt_module=dynamic --with-stream=dynamic 
--with-stream_ssl_module --with-mail=dynamic --with-mail_ssl_module
```
## 2.3 加载Mod-security模块规则库
加载modsecurity模块。
```
将以下load_module指令添加到/etc/nginx/nginx.conf的main中：
load_module modules/ngx_http_modsecurity_module.so;
```
这里多说一句，每个人的服务器情况不一样，nginx的安装方式也不一样，有的人是apt安装，有的是编译安装，所以导致module路径不一样，我这里写下自己的加载方式：
```
root@VM-0-11-ubuntu:/usr/local/nginx-1.14.0# find / -name modules
/usr/lib/ruby/2.5.0/rubygems/resolver/molinillo/lib/molinillo/modules
##省略一部分后看到nginx-modules文件夹处于/usr/share/目录下：
/usr/share/ubuntu-advantage-tools/modules
/usr/share/initramfs-tools/modules
/usr/share/nginx/modules
##继续验证，我们可以看到所有的so文件链接都在这里：
root@VM-0-11-ubuntu:/usr/share/nginx/modules# ls
ngx_http_geoip_module.so         ngx_http_modsecurity_module.so  ngx_mail_module.so
ngx_http_image_filter_module.so  ngx_http_xslt_filter_module.so  ngx_stream_module.so
```
上面是我自己已经配置完毕的，所以会存在modsecurity的so配置文件，我们先把so文件复制到该目录下，然后进入上层目录下的modules-available/目录下新建一个mod-ngx-http-modsecurity.conf配置文件
```
root@VM-0-11-ubuntu:/usr/share/nginx/modules-available# ls
mod-http-geoip.conf  mod-http-image-filter.conf  mod-http-xslt-filter.conf  mod-mail.conf  mod-stream.conf

root@VM-0-11-ubuntu:/usr/share/nginx/modules-available#  cat mod-ngx-http-modsecurity.conf 
load_module ngx_http_modsecurity_module.so;
```
完成后就测试一下：
```
nginx -t
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
nginx -s reload
```
没问题直接下一步，把规则库连接到url-server上，让mod-security进行工作。
## 2.4 匹配特征库
### 配置nginx
配置nginx监听端口和匹配返回值
```
server {
listen 8085;

location / {
    default_type text/plain;
    return 200 "Thank you for requesting ${request_uri}\n";
    }
}
```
查看8085端口监听状态，发现nginx已经开始监听8085端口：
```
root@VM-0-11-ubuntu:/usr/local/ModSecurity# netstat -tunlp |grep 8085
tcp        0      0 0.0.0.0:8085            0.0.0.0:*               LISTEN      11167/nginx: worker 
```
重新加载nginx:```nginx -s reload```
确认nginx正常工作:
```
curl -D - http://localhost
root@VM-0-11-ubuntu:/etc/nginx# curl -D - http://localhost
HTTP/1.1 200 OK
Server: nginx/1.14.0 (Ubuntu)
Date: Wed, 25 Dec 2019 09:54:29 GMT
Content-Type: text/html
Content-Length: 31
Last-Modified: Wed, 25 Dec 2019 09:54:27 GMT
Connection: keep-alive
ETag: "5e0331d3-1f"
Accept-Ranges: bytes

test:how modsecurity-waf work.
```
确认无误，就直接上modsecurity的规则库：
```
mkdir /etc/nginx/modsec
#下载推荐的ModSecurity配置文件
wget https://raw.githubusercontent.com/SpiderLabs/ModSecurity/v3/master/modsecurity.conf-recommended
mv modsecurity.conf-recommended modsecurity.conf
```
配置modsecurity文件：
```
SecRuleEngine DetectionOnly
SecRuleEngine On

创建ModSecurity的主配置文件

vim /etc/nginx/modsec/main.conf
Include /etc/nginx/modsec/modsecurity.conf
SecRule ARGS:testparam "@contains test" "id:1234,deny,log,status:403"

```
### 配置nginx反向代理
```
vim /etc/nginx/nginx.conf
include /etc/nginx/conf.d/*.conf; #把这一行注释掉，不然80端口会有冲突
添加如下规则：
server {

    listen 80;

    modsecurity on;

    modsecurity_rules_file /etc/nginx/modsec/main.conf;

    location / {

    proxy_pass [http://0.0.0.0:8085;](http://0.0.0.0:8085/)

    proxy_set_header Host $host;

    }
}
nginx -s reload    #重新加载nginx

curl -D - http://localhost/foo?testparam=123    
#能正常返回“Thank you for requesting /foo?testparam=123”
curl -D - http://localhost/foo?testparam=test    
#则返回"403 Forbidden"，说明前面配置的那条modsecuriy规则生效了，并阻拦了testparam参数中带test的请求
```
# 3.测试
到这里，全部配置完，但是mod-security拦截规则并不起作用，我觉得应该是nginx反向代理这一块配置出了问题。
<h2>updating</h2>

参考：
<a href="https://www.freebuf.com/sectool/211354.html">waf配置简介</a>
