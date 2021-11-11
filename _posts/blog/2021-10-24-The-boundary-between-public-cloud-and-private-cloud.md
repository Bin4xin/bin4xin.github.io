---
layout: post
title: "浅谈实际生产业务中公有云和私有云的边界"
date: 2021-10-24
wrench: 2021-11-11
author: Bin4xin
toc: true
categories: [blog, Cloud]
permalink: /blog/2021/The-boundary-between-public-cloud-and-private-cloud/
---

### 前言

我在WEB渗透的工作中常常会碰到这样的现象：很多企业单位在对自身的资产梳理往往都存在或多或少的问题，如：

<table class="table">
  <thead>
    <tr>
      <th style="text-align: left">问题</th>
      <th style="text-align: left">为什么产生？</th>
      <th style="text-align: left">解决？</th>
      <th style="text-align: left">备注</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="text-align: left">资产梳理有遗漏</td>
      <td style="text-align: left"><ul><li>企业单位部分边缘业务外包导致；</li><li>业务生命周期逻辑存在缺陷导致无法闭环；</li><li>技术人员技术理解参差不齐；</li></ul></td>
      <td style="text-align: left">…</td>
      <td style="text-align: left">-</td>
    </tr>
    <tr>
      <td style="text-align: left">公网暴露面过多</td>
      <td style="text-align: left"><ul><li>部分员工安全能力薄弱或对此不以为然；</li><li>技术人员技术理解参差不齐；</li></ul></td>
      <td style="text-align: left">危害展示</td>
      <td style="text-align: left"><a href="#部署私有云">技术角度看</a></td>
    </tr>
    <tr>
      <td style="text-align: left">商用与开源系统、组件版本过低</td>
      <td style="text-align: left"><ul><li>对技术人员的工作、团队默契要求较高；</li><li>工作是工作、生活是生活。:D</li></ul></td>
      <td style="text-align: left">…</td>
      <td style="text-align: left">-</td>
    </tr>
    <tr>
      <td style="text-align: left">等等</td>
      <td style="text-align: left">&nbsp;</td>
      <td style="text-align: left">&nbsp;</td>
      <td style="text-align: left">&nbsp;</td>
    </tr>
  </tbody>
</table>

<div class="hline"></div>

- 什么是公有云？

> 公有云是最常见的云计算部署类型。
> 
> 公有云资源（例如服务器和存储空间）由第三方云服务提供商拥有和运营，这些资源通过 Internet 提供。
>
> 在公有云中，所有硬件、软件和其他支持性基础结构均为云提供商所拥有和管理。

- [什么是私有云、混合云？](https://azure.microsoft.com/zh-cn/overview/what-are-private-public-hybrid-clouds/?cdn=disable#private-cloud){:target="_blank"}

啰嗦了这么多，介绍公有云是因为要从技术角度来看问题就需要实际应用，而实验条件有限，只能通过公有云环境下来研究公私云边界，步入主题；

### 环境假设

现阶段能够模拟的公有云环境如下：

{: .table}
| 业务 | 监听地址 | 监听端口 | 备注 |
| :--- | :--- | :--- | :--- |
| `nginx`主站 | 缺省/::: | 443 | - |
| API接口 | 缺省/::: | 7000 | frps |
| 后端管理组件 | 缺省/::: | 7500 | frps |
| `nginx`负载均衡 | 缺省/::: | 8001 | proxy_pass |

我们知道，1、2两个业务是需要通过公网访问的，当然API也可以部署内网，但前提是对应API请求代码也需要有所改动，所以暂时先不动；那么着重来看3和4。

### 部署"私有"云

实际上，`frp`是拥有管理面板页面的，具体管理地址是`0.0.0.0:7500`，那么我们如何让她本地监听从而达到"私有访问"的目的呢？
在默认情况下给出的配置无法进行本地监听配置，查看其对应[服务端文档配置](https://gofrp.org/docs/reference/server-configures/#dashboard-%E7%9B%91%E6%8E%A7){:target="_blank"}如下：

```ini
[common]
bind_port = 7000

# 授权码，请改成更复杂的
token = {your_token_value}

# frp管理面板监听地址和端口，请按自己需求更改
dashboard_addr = 127.0.0.1
dashboard_port = 7500
# frp管理后台用户名和密码，请改成自己的
dashboard_user = {your_dashboard_user_value}
dashboard_pwd = {your_dashboard_pwd_value}
enable_prometheus = true

# frp日志配置
log_file = /var/log/frps.log
log_level = info
log_max_days = 3
```
加上`dashboard_addr = 127.0.0.1`一行配置即可；

```bash
# netstat -antup|grep frp
tcp        0      0 :::7500          0.0.0.0:*               LISTEN      5557/./frps
# 配置前

# netstat -antup|grep frp
tcp        0      0 127.0.0.1:7500          0.0.0.0:*               LISTEN      5557/./frps
# 配置后
```

而nginx同理，修改`sever`区块监听即可

```bash
server {
  listen       localhost:8001;
}
```

> 值得注意的是：当nginx在处于运行中，配置本地监听后`nginx -s reload`是无法生效的，正确操作应该是`nginx -s stop`在启动。

### 服务私有

我们对公有云上的应用进行私有化后，假设现在需要访问应用，要怎么做呢？答：VPN代理（以下简称proxy）

- 第一步：准备proxy连接文件（这里同样以frp为例）frpc-proxy.ini

```ini
[common]
server_addr = {proxy_server_addr}
server_port = {proxy_server_port}
token= {your_token_value}

[{some_word_descr_clien}]
type = tcp
remote_port = {proxy_traffic_port}
plugin = socks5
plugin_user = {proxy_server_username}
plugin_passwd = {proxy_server_pwd}
...
```

- 第二步：proxy_server端进行proxy启动，`nohup frps -c frps.ini &`
- 第三步：proxy_client连接启动，`nohup frps -c frpc-proxy.ini &`
- 第四步：测试。

下面附上常见proxy软件：

{: .table}
| 全局proxy | 终端proxy | 浏览器proxy | 备注 |
| :--- | :--- | :--- | :--- |
| `Proxifier` | `proxychains4` | 很多 | - |

![截屏2021-11-02 上午12.24.39.png](https://i.loli.net/2021/11/10/Q59vnIEbstcTMLD.png)

如上，我们就可以通过proxy的形式访问到私网应用；终端proxy连接ssh命令可以：`proxychains4 ssh root@{your_inside_ip}`，同时不要忘记登录ECS控制台阻止`ssh 22 0.0.0.0/0`即可，若proxy失效可以控制台连接私网地址或者重新放行公网ssh端口流量。

```bash
$ proxychains4 ssh root@{your_inside_ip}
···
Welcome to Alibaba Cloud Elastic Compute Service !

No mail.
Last login: Thu Nov 11 11:49:01 2021 from {your_inside_ip}
root@bin4xin:~#
```

proxychains4配置：`/etc/proxychains.conf || /usr/local/etc/proxychains.conf => socks5 {proxy_server_addr} {proxy_traffic_port} {proxy_server_username} {proxy_server_pwd}`，mac终端记得要[SIP关闭才可以使用pc4](https://sspai.com/post/55066)。

### 总结

实际上渗透测试就是模拟黑客的方法对系统和网络进行攻击性测试，目的是侵入系统，通过工具结合安全工程师的技术手段，发现应用系统在逻辑方面的安全风险隐患；

而工作中常以黑、灰盒为主的渗透测试，公网居多，若能减少公网暴露面，在某种程度上来说是也是在公有私有云的边界处设置了一道阻碍，无形中给一些恶意利用者增加了攻击难度；当然这里只是简单介绍了一些常见的应用部署，能通过技术改变的还有很多，当然我们也可以发散思维来做到更多很酷的事情。

