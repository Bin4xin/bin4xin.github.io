---
layout: about
category: about
wrench: 2021-12-03
toc: true
Researchname: BurpSuite验证码插件实验
author: Bin4xin
permalink: /about/CAPTCHA-BYPASS-WALKTHROUGH/
---

## 开卷(juǎn)

> 可能是卷了吧，以前的我看到登录页面是不愿`Intruder Attack`的，心想：爆破这样的低效率工作，狗都不干；
>
> 现在看着页面上的验证码，心里总不是滋味，它似乎态度十分强硬：不准过！说着什么图灵测试、机器学习之类的胡话。
> 
> 想来，其他人估计也跟我一样，不然网上的技术帖子怎么愈来愈多且高深了呢；
>
> 大抵这次，我们真的要站在巨人的肩膀上看这世界了吧？

免费的验证码爆破接口，参上：[smxiazi/NEW_xp_CAPTCHA](https://github.com/smxiazi/NEW_xp_CAPTCHA)

```bash
$ git clone https://github.com/smxiazi/NEW_xp_CAPTCHA.git
$ cd NEW_xp_CAPTCHA
$ python3 -m pip install muggle_ocr
$ python3 server.py
Starting server, listen at: 0.0.0.0:8899
```

添加拓展：`Extender -> Extentions -> [ADD] -> Type: python. -> ${path/to/xp_CAPTCHA.py}`

一般来说，是爆破密码和验证码，故`Intruder Attack`配置如下：

![截屏2021-12-03 上午11.08.04.png](https://i.loli.net/2021/12/03/7MsrhjizV1kCc59.png)

> 值得注意的是：
> 
> - 添加的请求包Header`xiapao: http://url/index.php?s=/Admin/Public/verify.html`为验证码生成链接；
> 
> - 提示运行Python拓展需安装[Jpython Jar](https://www.jython.org/download.html)；*下载2.7.1版本及以上的。*

在开始爆破前，还需做的一件事，是把验证码payload的生成工作交给xp_CAPTCHA；

`Intruder -> Payloads -> {验证码}{PayloadSet} -> PayloadType: Extension-generated. -> PayloadOptions: Select Generator: xp_CAPTCHA`

设置单线程（Number of threads = 1）；

Start Attack！

不过在实际渗透中来看，但凡验证码加一些混淆字符识别率就十分低下：

$$P_success=\frac{18}{1795} * 100\% = 0.01\%$$
