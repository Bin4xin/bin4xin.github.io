---
layout: post
toc: true
title: "Mod-Security：有关「WAF」的爱恨情仇"
author: Bin4xin
categories:
    - blog
    - 笔记
    - Web
    - WAF
permalink: /blog/2019/ABOUT/Modsec/waf/
---

目录
------
- ["朝花夕拾"](#%E6%9C%9D%E8%8A%B1%E5%A4%95%E6%8B%BE)
- [1.运行环境](#1%E8%BF%90%E8%A1%8C%E7%8E%AF%E5%A2%83)
- [2.安装配置](#2%E5%AE%89%E8%A3%85%E9%85%8D%E7%BD%AE)
- [3.规则库配置](#3%E8%A7%84%E5%88%99%E5%BA%93%E9%85%8D%E7%BD%AE)
- [4.总结](#4%E6%80%BB%E7%BB%93)

**添加于2021/02/05**

## "朝花夕拾"

这篇与WAF相关"技术"博客其实没有多少技术含量，只是当时刚刚接触到WAF，感觉非常的新鲜然后有了这篇博客，其实当时连LINUX基础常识都还不是非常的了解，
年少轻狂的来配置WAF肯定无法成功；现在回头来看当时的文笔还是较为稚嫩，通篇都是一些"转述"的代码块，没有自己的相关思想，是很糟糕的一篇博客。


刚好年底总结博客，总结到WAF这一块，正好把这一篇的文章给补上，整理文章可以查看，较于下面这篇文章，主要增加了自定义规则库的配置和相关验证，可通过上方目录链接直接跳转：

- [「分享」ModsecWAF：老牌开源waf的绕过历程](https://about.sentrylab.cn/help/Mod-Waf-Bypass-Walkthrough/)

正好把这篇文章收个尾，我的有些文章写到一半，写不下去了就放着了。这个习惯不是很好。


---
**记一次waf配置经历。忙里偷闲，正好有闲置的服务器，自己动动手配置看看。**
 
## 1.运行环境
- ~~nginx-1.14.0（apt自动化安装）~~
- 经过实际操作验证，这里建议各位使用nginx1.13.8版本；源码包下载链接`wget http://nginx.org/download/nginx-1.13.8.tar.gz`

- ubuntu 18.04

## 2.安装配置

安装的过程大致是这样的一个过程：

- 1、**ModWAF编译安装**
    - ```js
git clone https://github.com/SpiderLabs/ModSecurity
      ```
    - nginx版本，教程中推荐的1.9版本实际操作下来无法成功在UBUNTU18下编译安装，这里推荐`nginx/1.13.8`或者更高，极力推荐**nginx/1.18.0**
        * `wget http://nginx.org/download/nginx-1.13.8.tar.gz`
    - 环境lib库安装：
        * `sudo apt-get install openssl libssl-dev libpcre3 libpcre3-dev zlib1g-dev autoconf automake libtool gcc g++ make`
- 2、**编译安装NGINX**
    - 注意编译安装时添加nginx连接器：
        *  ```bash
        git clone https://github.com/SpiderLabs/ModSecurity-nginx.git modsecurity-nginx
        ./configure --add-module=/path/to/modsecurity-nginx
        ```
    - NGINX WEB SERVER块配置：
        * ```js
            server {
            
            listen 8077;
            
            location / {
            
                default_type text/plain;
            
                return 200 "Thank you for requesting ${request_uri}\n";
            
                }
            
            }
            ```
 
    - 效果图：
        * ![NGINX-WAF-TEST-PAGES](/assets/img/blog/2019/NGINX-WAF-TEST-PAGES.PNG)


- 3、防护规则自写并测试：
    - 下载ModSecurity配置文件，我的NGINX目录在`/usr/local/nginx`下，所以我的命令如下；
        * ```js
          cd /usr/local/nginx && mkdir modsec && cd modsec
          wget https://raw.githubusercontent.com/SpiderLabs/ModSecurity/v3/master/modsecurity.conf-recommended
          mv modsecurity.conf-recommended modsecurity.conf
          vim modsecurity.conf
          修改SecRuleEngine DetectionOnly为SecRuleEngine On
          
          同样，添加配置：
          vim main.conf
          内容为：
          Include /usr/local/nginx/modsec/modsecurity.conf
          SecRule ARGS:url "@contains admin" "id:2234,deny,log,status:403"
          //在访问url内传输给url这个参数中存在admin字样进行拦截，并记录。    
          ```
    - 报错：
        * ```js
        报错解决：[emerg] "modsecurity_rules_file" directive Rules error.
        vim /etc/nginx/modsec/modsecurity.conf
        注释掉下面配置语句
        #SecUnicodeMapFile unicode.mapping 20127
        ```
    - 配置成功SERVER区块：
        * ```js
            server {
                    listen       8077;
                    server_name  localhost;
            	    modsecurity on;
                    modsecurity_rules_file /usr/local/nginx/modsec/main.conf;
                    #charset koi8-r;
            
                    #access_log  logs/host.access.log  main;
            
                    location / {
                        root   html;
                        default_type text/plain;
                        return 200 "Thank you for requesting ${request_uri}\n";
                        #index  index.html index.htm;
                        proxy_set_header Host $host;
                    }
            
                    error_page  404 403 405              /403.html;
            	    location = /403.html {
            	        root /usr/local/nginx/html/403 ;
            	}

          ```
    - WAF防护效果图（这里当时环境的图搞丢了，随便找了一张意思一下）：
        * ![WAF-DENY-TEST](/assets/img/blog/2019/WAF-DENY-TEST.PNG)
          
如无法测试成功可参考以下链接：
> [《手把手带你搭建企业级WEB防火墙ModSecurity3.0+Nginx》](https://zhuanlan.zhihu.com/p/80866123)
>
> [《ModSecurity：一款优秀的开源WAF》](https://www.freebuf.com/sectool/211354.html)


**添加于2021/02/05**

## 3.规则库配置

我们从上面得到：

- main.conf配置文件自写规则库：
    - 测试：
        * ```js
            Include /usr/local/nginx/modsec/modsecurity.conf
            SecRule ARGS:url "@contains admin" "id:2234,deny,log,status:403"
            //在访问url内传输给url这个参数中存在admin字样进行拦截，并记录。
            ```
    - 当然也可以发散思维，禁止参数传入/etc/passwd等，此处权当抛砖引玉

我们在安全开发的过程中若需要自写规则库进行WEB防御，可参考：

{: .table}
| 自写规则库定义一览 |
---------- | ---------------- | --------------------------------- | --------
REQUEST_LINE | 代表整个请求行 | `SecRule REQUEST_LINE "!(^((?:(?:POS|GE)T|HEAD))|HTTP/(0\.9|1\.0|1\.1)$)" "phase:1,id:49,log,block,t:none"` |#该规则表示，仅允许请求方式为POST，GET以及HEAD，同时请求协议也仅允许为HTTP0.9/1.0/1.1
REQUEST_METHOD | 代表请求方式 | `SecRule REQUEST_METHOD "^(?:PUT|CONNECT|TRACE|DELETE)$" "phase:1,id:49,log,block,t:none"` |#该规则表示，如果请求方式是PUT、CONNECT、TRACE、DELETE的任意一种方式，则拦截此次访问
REQUEST_PROTOCOL | 代表请求协议&版本 | `SecRule REQUEST_PROTOCOL "!^HTTP/(0\.9|1\.0|1\.1)$" "phase:1,id:50,log,block,t:none"` |#该规则表示，如果访问协议不是HTTP，同时协议版本也不是0.9/1.0/1.1的话，拦截此次访问
REQUEST_URI | 代表包含查询字符串数据在内的完整请求URL |`SecRule REQUEST_URI "attack" "phase:1,id:52,t:none,t:urlDecode,t:lowercase,t:normalizePath"`|#该规则表示，如果请求URL中包含attack字符串，则拦截此次访问
REQUEST_FILENAME | 代表不包含查询字符串数据在内的相对请求URL |`SecRule REQUEST_FILENAME "/etc/passwd" "phase:1,id:53,log,block,t:none"`|#该规则表示，如果请求URL(不含传入参数)包含etc/passwd字符串，则拦截此次访问
REQUEST_HEADERS | 代表所有请求头的集合，也可以用于检查所指定的请求头内容（通过使用REQUEST_HEADERS:Header-Name语法）|`SecRule REQUEST_HEADERS:Host "^[\d\.]+$" "deny,id:47,log,status:403"`|#该规则表示，如果请求头中的HOST字段的内容为IP地址的话，则使用deny动作拒绝此次访问，同时向客户端返回403错误

效果图：

![WAF-PASSWD-DENY](/assets/img/blog/2019/WAF-PASSWD-DENY.PNG)

参考：

>[ModSecurity中文手册](http://www.modsecurity.cn/chm/Variables.html)

## 4.总结

原文大量篇幅写的是代码的配置问题，后期修改后删除了大部分，有兴趣的可以看上面的第二个链接；

这一块，其实跟着原教程走了一个弯，这里原作者在教程中应用的是反向代理，我们可以通过以上成功的SERVER配置块了解到其实直接链接WAF让规则库生效即可。

---

以上。

