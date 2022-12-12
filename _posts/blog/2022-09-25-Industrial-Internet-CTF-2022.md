---
layout: post
title: "Industrial Internet CTF 2022 walkthrough"
date: 2022-09-25
author: Bin4xin
toc: true
categories:
- blog
tags:
- 笔记
- CTF
permalink: /blog/2022/Industrial-Internet-CTF-2022-walkthrough/
---

> 2022 工业互联网 CTF 一道WEB；

## # 0x01、考点

- `file_get_content` fuzzing内容文件读取；
- `$_GET`型`include_once`本地文件包含。

## # 1x01、绕过

给出的url主页面有一个链接指向到`read.php?Book=ZGRsLnR4dA==`，是`ddl.txt`Base64编码，尝试了一些Linux下的绝对路径文件`Base64 payload`

页面提示回显`book/Base64 payload`不存在

- 根据提示`read.php`应该读取的是book目录下文件，查看了一下book目录，发现中间件开启了`auto_index`，只有一个文本文件；
- 尝试`目录穿越payload`，具体提示忘了，即猜测对`../`做了一些操作。

于是尝试了：`../`url编码、双写绕过，发现双写绕过`/read.php?Book=Li4uLy4vcmVhZC5waHA=`可以读取：

![IMG_2042.png]({{site.PicturesLinks_Domain}}/images/2022/09/25/IMG_2042.png)

我们可以看到操作代码：

```php
str_replace(array("../", "..\""), "", $file)
```

## # 2x01、hint

进一步使用组合爆破：Base64（`..././..././..././` + `文件路径`）发现：`.bash_history`文件：

```bash
cd /var/www/ctf/
ls
cd V72J1dn23wjFrq
cat *.php
```

我们可以看到文件中的hint，而且根据1x01章节我们直接访问url`http://eci-2zeblmhade5fptwofhr8.cloudeci1.ichunqiu.com/V72J1dn23wjFrq/`可以直接看到`demo.php`文件

直接读取：

```php
<?php
error_reporting(0);
$file= $_GET['ops'];
$file = str_replace(array("../", "..\""), "", $file);
include_once($file);	
?>
```

## # 3x01、文件包含

基本步骤：

1. `ops=file:///etc/passwd`读取相关文件，找到日志路径；
2. 日志文件写入webshell
3. 过程2可以参考文件[1]

不过当时时间较为紧张，暂未完成这一步，有些遗憾。

## 参考

- [1].[VulnHub – DC-5](https://henkel-security.com/2020/08/vulnhub-dc-5/){:target="_blank"}