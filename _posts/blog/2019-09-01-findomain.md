---
layout: post
title: "跨平台子域名搜集工具findomain"
date: 2019-09-01
author: Bin4xin
categories:
    - blog
    - 安全工具
    - 笔记
permalink: /blog/2019/findomain/
---

摘要:之前在暑假里申请注册了个云先知平台账号，平时没事闲（mo）着（yang）的（gong）时候当当土拨鼠挖挖洞。挖过的都懂，是一个类似于渗透测试的中心化平台。乙方公司有这个需求，通过这个平台发放任务，通过不同的漏洞等级【严重】-【高危】-【中危】-【低危】，严重就是危及到服务器权限，能够get web shell、root甚至横向渗透，依次类推每一项，危及程度依次类推，有兴趣的朋友自行搜索体会（你们可以猜猜xss在哪个位置）。

以上背景，每份任务都会规定好一些任务域名，指定好。其他的域名没有备案不允许碰。如：

![](https://bbs-img-cbc-cn.obs.cn-north-1.myhuaweicloud.com/data/attachment/forum/201909/14/2338011n3xy9n7wtdbjk36.png)

重点就来了，前面的*,是需要我们自己去测试的，也就是说，不同的 * 会有别样的惊喜。


那么这就推出咱们的主角：`findomain`，跨平台的子域名搜集工具。

## 1.下载安装
```
    $ git clone https://github.com/Edu4rdSHL/findomain.git

    $ cd findomain

    $ apt-get install cargo

    $ cargo build --release

    $ sudo cp target/release/findomain  /usr/bin

    $ findomain
```
## 2.语法介绍

```
1、进行简单的子域名搜索，并输出信息：
  findomain -t example.com

2、使用所有的API进行子域名搜索，并输出信息：
findomain -t example.com –a

3、搜索子域名，并将输出导出为CSV文件格式：
findomain -t example.com -o csv

4、使用所有的API进行子域名搜索，并将输出导出为CSV文件格式：
findomain -t example.com -a -o csv
```

## 3.实际使用

```
  $ findomain -t a****un.com -o csv

   $ Target ==> a****un.com

    Searching in the CertSpotter API...
    Searching in the Bufferover API...
    Searching in the Crtsh database...
    Searching in the Virustotal API...
    Searching in the Sublist3r API...
    Searching in the Facebook API...
    Searching in the Threadcrowd API...
    Searching in the Spyse API...
    An error ❌ has occurred while parsing the JSON obtained from the Threadcrowd API. Error description: JSON error.

    An error ❌ has occurred while parsing the JSON obtained from the Bufferover API. Error description: JSON error.

    An error ❌ has occurred while parsing the JSON obtained from the Sublist3r API. Error description: JSON error.

    A timeout ⏳ error has occurred while processing the request in the Facebook API. Error description: timed out


    A total of `153` subdomains were found for ==>  a***un.com

    Good luck Hax0r !

    >>  Filename for the target aliyun.com was saved in: ./a*****n.com_1680.csv
```

可以看到 A total of 153 subdomains.所以使用findomain工具一共搜集到了153个子域名。最后，goodluck。
且输出的csv文件就输出在运行工具的当前文件夹下。推荐大家可以试试看,搜集信息还是很好用的，`么么哒`

