---
layout: about
category: about
Researchname: 鱼叉攻击策略落地：邮件网关应用
toc: true
author: Bin4xin
wrench: 2022-05-17
permalink: /about/2022-05-17-Harpoon-strategy-attack-EmailGateway-usage/
desc: 「鱼叉攻击策略」
---

> 实现：如何尽可能快的落地邮件网关，并实现具有一定欺骗性的钓鱼邮件。

### 零、快速上场

- 我们这里使用的是[SendCloud](https://www.sendcloud.net/){:target="_blank"}，注册进入后先后顺序：
  - [添加域名DNS验证](https://www.sendcloud.net/sendSetting/domain){:target="_blank"}
    - [如何在DNS平台上配置域名？](https://sendcloud.kf5.com/posts/view/59529){:target="_blank"}
  - [创建API_USER并关联域名](https://www.sendcloud.net/sendSetting/apiuser){:target="_blank"}
    - 得到`apiuser`及`apikey`
  - [添加邮件模版](https://www.sendcloud.net/sendRelative/template){:target="_blank"}
    - 得到`templateInvokeName`
- 不过上面的`SendCloud`平台，免费方案至多只允许每天10封邮件，您可以查看更多解决方案[点击查看这里](https://xz.aliyun.com/t/6325#toc-4)

到此为止我们配置完成，上面有三个值需要我们记下，进入`SendCloud DOC`页面找到发送代码

- [doc/email_v2/code/代码示例](https://www.sendcloud.net/doc/email_v2/code/){:target="_blank"} 
  - [Python::模板发送](https://www.sendcloud.net/doc/email_v2/downloads/python/python_template.py){:target="_blank"}

您也可以自行选择不同语言；下载并把相关的配置参数填入，自定义：

- `fromName`
- `from`
- `subject` 
  
运行即可：

```bash
python3 sendcloud_bin4xin_telecom.py
{"result":true,"statusCode":200,"message":"请求成功","info":{"emailIdList":["1$nd0$bin4xin[at]sentrylab.cn"]}}
```

然后我们就会收到一封有一定具有迷惑性的邮件：

客户端效果：

![2022-05-17-15.51.35.png](https://image.yjs2635.xyz/images/2022/05/17/2022-05-17-15.51.35.png)

手机端效果：

![IMG_1536.png](https://image.yjs2635.xyz/images/2022/05/17/IMG_1536.png)


不过这样是有局限性的，有心的话可以通过web端打开，甚至都不用打开邮件详情看：

```
发件人： 网络和信息安全管理部-终端威胁管理部门 <soc_adminis[at]***lecom.com.cn>    
(由 ce2b1168-d591-1***.com 代发)
```

### 一、链接小细节

- [域名punycode编码](https://www.charset.org/punycode?decoded=chi%E1%B9%87atelecom.com.cn&encode=Normal+text+to+Punycode#results){:target="_blank"}
  - [原理](https://xz.aliyun.com/t/6325#toc-14){:target="_blank"}

- 简单的超链接

```
<a href="http://www.eval.me">www.aliyun.com</a>
```

- ...


### 二、钓鱼内容相关

以下内容写的很贴切，我这里做了[转载:钓鱼邮件的投递和伪造](https://xz.aliyun.com/t/6325#toc-14)

> 钓鱼邮件通常有两大类，一种是链接钓鱼邮件，通常是想各种办法让目标打开网站，输入密码。另一种是附件钓鱼邮件，但不管哪一类，都需要一个好的文案来让目标点击或者下载。
>
> 一封成功的钓鱼邮件，一个好的文案是必须的，一个让人看了后可能会去点的文案，需要具备以下几个要素：
>
> - 重要性
>
> 首先得让体现出来邮件的重要性，来驱使目标去查看邮件。
>
> - 合理性
> 
> 其次文案得基本合理，这个就需要结合目标的身份，日常习惯，所在公司的情况及业务进行综合考量，来编写出一个合理的文案。
>
> - 紧迫性
>
> 最后文案最好有一些紧迫性，来促使目标尽快的去按照文案引导，进行点击、输入等操作。

### 三、参考

- [钓鱼邮件的投递和伪造](https://xz.aliyun.com/t/6325){:target="_blank"}
- [SendCloud API DOCS](https://www.sendcloud.net/doc/){:target="_blank"}
- [punycode](https://www.charset.org/punycode){:target="_blank"}

以上。