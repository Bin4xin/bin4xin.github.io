---
layout: about
category: about
Researchname: ModSec & CloudFlare WAF Initial Research
permalink: /about/WAF-developed-by-Grayscale-forwarding/
toc: true
---

# [持续更新] *ModSec & CloudFlare WAF Initial Research*

## 零：*CloudFlare WAF*

最近在研究web防火墙，看到CloudFlare有现成的云WAF供使用，于是就研究了研究，自定义了一些自己需要的web拦截规则。

所需：

- 域名
- 域名对应解析IP开放WEB Server
- CloudFlare帐号注册即可


一般步骤为：

假设您的域名购买服务商为阿里云；

- 1.登录阿里云域名面板设置解析IP；
- 2.阿里云域名面板DNS Server修改为：`diva.ns.cloudflare.com`、`nitin.ns.cloudflare.com`；
- 3.进入[CloudFlare](https://www.cloudflare.com/zh-cn/)，添加站点，添加CloudFlare指定认证页面添加到Web root目录下；
- 4.配置WAF。

#### # 0x01 解析IP
- [云解析DNS - 阿里云](https://about.aliyun.com/document_detail/29716.html)

#### # 0x02 自定义DNS Server
把DNS解析服务器解析成步骤2即可；步骤3同样根据页面引导操作即可，此处不做演示。

#### # 0x03 CloudFlare WAF config

进入CloudFlare主页，点击域名`{domain.info}` -> 防火墙 -> 添加筛选器

firewall:`https://dash.cloudflare.com/{random-token-value}/{domain.value}/firewall`

在配置过滤器时，我针对个人需求和当前攻击行为进行了一些思考：

- 对一个静态站点来说，很明显我们对外提供WEB服务只用到GET请求，没有其他请求，所以我就**把POST添加到了黑名单内**：

	- `(http.request.method eq "POST")`

	![截屏2021-07-09 下午5.01.03.png](https://i.loli.net/2021/07/23/8KmS1WMqGQEniO2.png)

**值得一提的是：您需要注意如果您添加的是根域名`a.com`DNS服务器为CloudFlare，那么firewall将会作用于所有可识别的域名如`1.a.com & 2.a.com` etc...**

- **针对文件读取payload的黑名单：**

	- `(http.request.uri.path contains "etc/passwd")`
    - 
        ```
        ➜ bin4xin src curl https://about.sentrylab.cn/etc/passwd -I
        HTTP/2 403
        date: Fri, 23 Jul 2021 02:05:34 GMT
        content-type: text/plain; charset=UTF-8
        content-length: 16
        x-frame-options: SAMEORIGIN
        cache-control: private, max-age=0, no-store, no-cache, must-revalidate, post-check=0, pre-check=0
        expires: Thu, 01 Jan 1970 00:00:01 GMT
        cf-request-id: 0b72b571c10000ead3f0a9d000000001
        expect-ct: max-age=604800, report-uri="https://report-uri.cloudflare.com/cdn-cgi/beacon/expect-ct"
        report-to: {"endpoints":[{"url":"https:\/\/a.nel.cloudflare.com\/report\/v3?s=M5QRiSM6AQIHABiTpenP95FWMk%2FHuRnQpjqIQ9WDX0d%2FM9fI6nr0TpYUtThWUa64GPpRP%2Baubtxi4kHZ7UYNvA%2BXuhkeX73zKJLD6JtsWWRb96yS3KbdotjjJMqBX6%2F9DFUFfQU%3D"}],"group":"cf-nel","max_age":604800}
        nel: {"report_to":"cf-nel","max_age":604800}
        server: cloudflare
        cf-ray: 6731582f792aead3-LAX
        alt-svc: h3-27=":443"; ma=86400, h3-28=":443"; ma=86400, h3-29=":443"; ma=86400, h3=":443"; ma=86400
        ```

- **目录遍历payload黑名单：**

	- `(http.request.uri.path contains ".") or (http.request.uri.path contains "%2e") or (http.request.uri.path contains "%252e")`


**在此处您需要注意访问url中的特殊字符如`/`、`&`，否则会导致WAF误报**

当然规则库还支持传入请求匹配：Cookie、国家/地区、URI查询字符、URI路径、爬虫机器人等，可根据需求进行自定义。

#### # 0x04 带有攻击性的流量

![截屏2021-07-09 下午5.10.44.png](https://i.loli.net/2021/07/23/lEu1WSvmd5LXGjU.png)

## 一：*Local WAF - JXWAF*

- 1.手动安装 - [1x01 至 1x03](#-1x01-lua%E6%8E%A5%E5%85%A5%E6%B5%8B%E8%AF%95)
- 2.自动安装 - [JXWAF - README.MD](https://github.com/jx-sec/jxwaf/blob/master/README.md#%E7%AE%A1%E7%90%86%E4%B8%AD%E5%BF%83%E9%83%A8%E7%BD%B2){:target="_blank"}

- 参考
	- [centos.org](http://isoredirect.centos.org/centos/8/isos/x86_64/){:target="_blank"}

	- [VMware安装Centos7系统](https://blog.csdn.net/renfeigui0/article/details/102499358){:target="_blank"}


> *Tips:
> 
> 新安装的Centos须修改：
> `/etc/sysconfig/network-scripts/ifcfg-{interface} 中的onboot选项为yes` ->
>
> `ifconfig -l` -> `lo0 eth0` ->  {interface} = eth0
> 

#### # 1x01 Lua接入测试

- openresty install

```bash
$ yum install -y readline-devel pcre pcre-devel openssl openssl-devel gcc curl GeoIP-devel wget perl
$ wget https://openresty.org/download/openresty-1.15.8.3.tar.gz 
$ tar -xvf openresty-1.15.8.3.tar.gz 
$ cd openresty-1.15.8.3 
$ ./configure -j2 
$ make -j2 
$ sudo make install
```
- Lua debug

```bash
$ vi HelloWorld.lua
print("Hello World!")
$ lua HelloWorld.lua
Hello World!
```
- openresty conf

```bash
[bin4xin@ingeek openresty]$ pwd
/usr/local/openresty
$ vi nginx/conf/nginx.conf
#nginx.conf
worker_processes  1;
events {
    worker_connections  1024;
}
http {
lua_code_cache off;
    server {
        location /test {
           default_type 'text/plain';
           content_by_lua_file '/opt/lua/test.lua';
        }
    }
}

$ sudo bin/openresty -t
nginx: [alert] lua_code_cache is off; this will hurt performance in /usr/local/openresty/nginx/conf/nginx.conf:39
nginx: the configuration file /usr/local/openresty/nginx/conf/nginx.conf syntax is ok
$ ps -ef|grep open
root      17903      1  0 23:17 ?        00:00:00 nginx: master process bin/openresty
$ cat /opt/lua/test.lua
#test.lua
local name =  "Anonymous"
ngx.say("Hello, ", name, "!")
ngx.say("test")
```
至此规则关联完毕，测试：
```bash
$ curl localhost/test
Hello, Anonymous!
test
```

#### # 1x02 openresty接入JXWAF

接入可以参考：[JXWAF - README.MD](https://github.com/jx-sec/jxwaf/blob/master/README.md#%E7%AE%A1%E7%90%86%E4%B8%AD%E5%BF%83%E9%83%A8%E7%BD%B2){:target="_blank"}


#### # 1x03 接入效果

- 实现基本的web http应用协议恶意流量包的拦截
- 自定义403等页面
- 自定义规则库
