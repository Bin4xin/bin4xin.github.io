---
layout: about
category: about
Researchname:  SpringBoot-Memory-files-heapdump-Analysis
toc: true
permalink: /about/SpringBoot-Memory-files-heapdump-Analysis/
---

# 思路：heapdump文件分析历程

------
**本文通过下面三个问题进行技术分享：**
- **在哪些地方可以发现？关于SpringBoot的一些参考**
    - [Spring Boot框架渗透参考](https://www.sentrylab.cn/blog/2020/Spring-boot/){:target="_blank"}
- **发现了怎么找到她？heapdump文件下载路由**
    - spring boot v1版本：
        * https://url-to-spring-boot-error/heapdump
    - spring boot v2版本：
        * https://url-to-spring-boot-error/actuator/heapdump
    - 实际情况中不同的生产环境有所差异，所以建议针对`actuator`结点作为分割点来进行判别，即标识错误页面出现的路由来进行层级爆破，若没有分割点即springboot v1版本则往前递推一个路由即可。
- **找到了怎么使用？文件分析**
    - 分析工具MAT
    - 分析语法分析
    
---
    
## 零：Spring—Boot框架的渗透过程

上面已经给出相关访问url，文章中的转载地址也详细给出，一般能够识别Spring-Boot的框架特征就行了，不再赘述。本篇文章主要是针对heapdump文件进行分析；
在这里做一下简单的介绍：

- 零：路由和版本
    - 0x01：路由知识
    - 0x02：版本知识
- 一：信息泄露
    - 0x01：路由地址及接口调用详情泄漏
    - 0x02：配置不当而暴露的路由
    - 0x03：获取被星号脱敏的密码的明文
- 二：远程代码执行
    - 0x01：whitelabel error page SpEL RCE
    - 0x02：spring cloud SnakeYAML RCE
    - 0x03：eureka xstream deserialization RCE
    - 0x04：jolokia logback JNDI RCE
    - 0x05：jolokia Realm JNDI RCE
    - 0x06：h2 database query RCE
    - 0x07：h2 database console JNDI RCE
    - 0x08：mysql jdbc deserialization RCE

## 一：历史Spring Boot框架渗透
在简单认识Spring Boot框架后，至少在我看来，我们所需要了解的是框架的路由、特征信息，以方便我们来识别；当然，自己搭建一遍对于框架的认识自不必多说。
而在我看来，仅仅一篇博客的简单描述并不能一言概全，而且由于安全行业的特殊性，我们更需要的是脚踏实地的实践精神，所以在此写下博客的同时，回忆SRC的相关案例；
**权当抛砖引玉**

### 1x01 金融行业某银行系统
由于时间较为久远，细节部分无法详尽贴出，但是不妨碍整体完整性；为了保护SRC平台客户隐私，所有的路由、ip全部都使用可理解的标签代替。见谅。
SRC任务是泛域名，就是`*.src_target.{com}`，基本熟悉的就直接跑域名然后端口对应的服务这样子；

- 子域名发现
    - 子域名整理
    - 端口批量扫描
- 域名端口批量服务发现
    - 过程中发现某银行机构活动登录系统
        - 1、登录数据包为json格式
        - 2、登录系统端口为8080，后端验证系统服务开放端口为8086，路由如下：
            * 登录：http://{Vuln_Address}:8080/user/login?redirect=%2F
            * 验证数据交互：http://{Vuln_Address}:8086/{api_interface_url}/sys/login/
 
访问后端8086开放服务url：`http://{Vuln_Address}:8086/{api_interface_url}/`发现返回404，返回信息如下：
```html
json格式：
{"timestamp":"2021-01-29T07:26:34.085+0000","status":404,"error":"Not Found","message":"No message available","path":"/"}

html格式：
<html><body><h1>Whitelabel Error Page</h1><p>This application has no explicit mapping for /error, so you are seeing this as a fallback.</p><div id='created'>Fri Jan 29 15:25:38 CST 2021</div><div>
There was an unexpected error (type=Not Found, status=404).</div><div>No message available</div></body></html>
```
很明显的SpringBoot框架，连路由都不需要爆破直接找未授权接口：
```
It's A Spring Boot Web APP: http://{Vuln_Address}:8086/
目标站点开启了 env 端点的未授权访问,路径为：http://{Vuln_Address}:8086//actuator/env
目标站点开启了 jolokia 端点的未授权访问,路径为：http://{Vuln_Address}:8086//actuator/jolokia/list
目标站点开启了 jolokia 端点且存在createJNDIRealm方法,可进行JNDI注入RCE测试,路径为：http://{Vuln_Address}:8086//actuator/jolokia/list
目标站点开启了 beans 端点的未授权访问,路径为：http://{Vuln_Address}:8086//actuator/beans
目标站点开启了 configprops 端点的未授权访问,路径为：http://{Vuln_Address}:8086//actuator/configprops
目标站点开启了 health 端点的未授权访问,路径为：http://{Vuln_Address}:8086//actuator/health
目标站点开启了 info 端点的未授权访问,路径为：http://{Vuln_Address}:8086//actuator/info
目标站点开启了 mappings 端点的未授权访问,路径为：http://{Vuln_Address}:8086//actuator/mappings
目标站点开启了 metrics 端点的未授权访问,路径为：http://{Vuln_Address}:8086//actuator/metrics
---
It's A Spring Boot Web APP: http://{Vuln_Address}:8086/{api_interface_url1}/actuator
目标站点开启了 env 端点的未授权访问,路径为：http://{Vuln_Address}:8086/{api_interface_url1}/actuator/env
目标站点开启了 jolokia 端点的未授权访问,路径为：http://{Vuln_Address}:8086/{api_interface_url1}/actuator/jolokia/list
目标站点开启了 jolokia 端点且存在createJNDIRealm方法,可进行JNDI注入RCE测试,路径为：http://{Vuln_Address}:8086/{api_interface_url1}/actuator/jolokia/list
目标站点开启了 beans 端点的未授权访问,路径为：http://{Vuln_Address}:8086/{api_interface_url1}/actuator/beans
目标站点开启了 configprops 端点的未授权访问,路径为：http://{Vuln_Address}:8086/{api_interface_url1}/actuator/configprops
目标站点开启了 health 端点的未授权访问,路径为：http://{Vuln_Address}:8086/{api_interface_url1}/actuator/health
目标站点开启了 info 端点的未授权访问,路径为：http://{Vuln_Address}:8086/{api_interface_url1}/actuator/info
目标站点开启了 mappings 端点的未授权访问,路径为：http://{Vuln_Address}:8086/{api_interface_url1}/actuator/mappings
目标站点开启了 metrics 端点的未授权访问,路径为：http://{Vuln_Address}:8086/{api_interface_url1}/actuator/metrics
---
It's A Spring Boot Web APP: http://{Vuln_Address}:8086/{api_interface_url2}/actuator
目标站点开启了 env 端点的未授权访问,路径为：http://{Vuln_Address}:8086/{api_interface_url2}/actuator/env
目标站点开启了 jolokia 端点的未授权访问,路径为：http://{Vuln_Address}:8086/{api_interface_url2}/actuator/jolokia/list
目标站点开启了 jolokia 端点且存在createJNDIRealm方法,可进行JNDI注入RCE测试,路径为：http://{Vuln_Address}:8086/{api_interface_url2}/actuator/jolokia/list
目标站点开启了 beans 端点的未授权访问,路径为：http://{Vuln_Address}:8086/{api_interface_url2}/actuator/beans
目标站点开启了 configprops 端点的未授权访问,路径为：http://{Vuln_Address}:8086/{api_interface_url2}/actuator/configprops
目标站点开启了 health 端点的未授权访问,路径为：http://{Vuln_Address}:8086/{api_interface_url2}/actuator/health
目标站点开启了 info 端点的未授权访问,路径为：http://{Vuln_Address}:8086/{api_interface_url2}/actuator/info
目标站点开启了 mappings 端点的未授权访问,路径为：http://{Vuln_Address}:8086/{api_interface_url2}/actuator/mappings
目标站点开启了 metrics 端点的未授权访问,路径为：http://{Vuln_Address}:8086/{api_interface_url2}/actuator/metrics
```
而我们从上面信息可知，存在的SpringBoot路由分别为：`根目录/`、`{api_interface_url1}`、`{api_interface_url2}`，所以言归正传，返回到我们的主角：heapdump
下载路径即：
```
http://{Vuln_Address}:8086/actuator/heapdump
http://{Vuln_Address}:8086/{api_interface_url1}/actuator/heapdump
http://{Vuln_Address}:8086/{api_interface_url2}/actuator/heapdump
```
当然，所有的渗透操作都是在此端口上进行；继续往下。

---

## 二：HEAPDUMP文件分析历程
文件信息如下：
```
% file src-1520-heapdump
src-1520-heapdump: Java HPROF dump, created Mon Oct 12 11:14:25 2020
```
File Viewer:

![ALT](/static/web-image/HeapDUMP_file_viewer.png)

### 2x01 分析工具MAT

>OQL是用于查询Java堆的类SQL查询语言。OQL允许过滤/选择从Java堆中获取的信息；
>虽然HAT已经支持预定义的查询，例如“显示类X的所有实例”，但OQL增加了更多的灵活性；
>OQL基于JavaScript表达式语言。

打开MAT选择打开headump文件，打开加载完毕选择OQL执行；
![截图1](/static/web-image/mat-oql-exec.png)

### 2x02 分析语法

```java
select <JavaScript expression to select>
[ from [instanceof] <class name> <identifier>
[ where <JavaScript boolean expression to filter> ] ]
```
部分OQL分析语句实例展示：
- `select * from java.util.LinkedHashMap$Entry x WHERE (toString(x.key).contains("password"))`；
    - 选择寻找hashmap中所有key元素中存在password值并展示出，如下所示自不必多说：
![截图1](/static/web-image/spring-boot-password.png)
- `select * from org.springframework.web.context.support.StandardServletEnvironment`；
    - 选择寻找所有StandardServletEnvironment并展示出，这一项中我们需要关注的是propertySourceList(简称PPSlist)，查找链如下：
    - `PPS-PPSlis-array-org.springframework.core.env.PPS-source-tables`，tables中存储的即为我们所关注的敏感信息，如下所示：
![截图2](/static/web-image/spring-boot-pps-clains.png)
- `select * from java.util.Hashtable$Entry x WHERE (toString(x.key).contains("password"))`；
    - 选择寻找哈希表中所有key元素中存在password值并展示出：
![截图3](/static/web-image/spring-boot-contains-passwd.png)

以上。

---
本文中展示的分析OQL语句实例供参考，实际可是写出的有很多，经过自己理解后可以自行尝试编写实践。

## 参考链接

[JDK1.8源码(九)——java.util.LinkedHashMap类](https://www.cnblogs.com/ysocean/p/9839173.html#_label5){:target="_blank"}

[Map 综述（二）：彻头彻尾理解 LinkedHashMap](https://blog.csdn.net/justloveyou_/article/details/71713781){:target="_blank"}

[MAT 查找 spring heapdump 中的密码明文](https://www.onebug.org/websafe/98955.html){:target="_blank"}


以上
