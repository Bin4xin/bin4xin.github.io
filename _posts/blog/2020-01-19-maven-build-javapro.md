---
layout: post
toc: true
title: "Maven构建项目相关一揽子知识"
author: Bin4xin
wrench: 2021-08-26
categories:
    - blog
tags:
    - 笔记
    - Maven
    - Web
permalink: /blog/2020/maven/build/mavaProject/
---

- 2020/01/21更新；
- Thu, 26 Aug 2021 14:50:02 +0800再次更新；

# 序

**本文主要是对于在漏洞复现犹其是`Maven poc`项目代码的部分个人总结**

师傅最近让我看freebuf上一篇关于jeeplus代码审计的文章，文章讲的是不错的，自己找了个项目来做，之前没有java开发的基础，所以两眼一抹黑，浪费了不少时间，随笔记。

<!--<a href="https://github.com/MSOpenTech/redis/releases/download/win-3.2.100/Redis-x64-3.2.100.msi">Redis-x64-3.2.100.msi</a>-->

## 零：各种Maven现象
####  *# 0x01 404 not found*
eclipse导入jeeplus项目后，用Maven构建，tomcat部署成功未报错，总是访问不了项目，一直404，以下为CSDN搜索原答案：

> 解决如下选中“项目"，然后右击选择
>
> “properties” —> Deployment，然后将webContent项remove掉，还有test相关的文件也可以remove掉，test是测试相关的文件，
>
> add一个folder文件，next->next->src下的main下的webapp文件，最后击“Finish”，在add一个Java Build Path Entries，next->Maven Dependencies
> 
> 最后再点击"Finish"；最后再点击"OK";
> 重新启动tomcat，在浏览器中输入相应的地址：http://localhost:8080/MavenTest/index.jsp ，进行测试web项目是否创建成功。

总结：

- 若是IDEA部署出现了404的问题，那么就着重检查`Project Structure`窗口下`Project Settings: Modules/Libraries/Artifacts/Facets`子栏下的配置是否有问题：
    - 如Maven项目须在Modules下新建Maven的模版，Web项目`Artifacts`要添加`Web Application`等等
- 若是Terminal终端进行Maven编译后，那么须检查`target`目录下是否有`war/jar`文件，随即`war:部署到Tomcat WebApps | jar:java启动`即可。

####  *# 0x02 tomcat jar not found*

> 如果你是maven项目，tomcat在发布项目的时候没有同时发布maven依赖所添加的jar包，你需要设置一下eclipse：
>
> 项目 -> 属性 -> Deployment Assembly -> Add -> Java Build Path Entries -> 选择Maven Dependencies -> Finish -> OK
>
> 把对应的Maven依赖包也发布到tomcat，调试时会自动把那些jar发布到指定目录下，tomcat也能找到那些jar了。

结合eclipse：
```bash
> mvn eclipse:clean
> mvn eclipse:eclipse
> mvn eclipse:eclipse Eclipse
> mvn eclipse:eclipse –Dwtpversion=1.0 
```

####  *# 0x03 jar中没有主清单属性*

- 1)**META-INF/MANIFEST.MF**
    - 1.1) `file –> project structure`弹框后选中`Atifacts —> + -> jar -> from module with dependenceis`
    - 1.2) 选择`Main Class`，然后指定`META-INF/MANIFEST.MF`的路径为`src`下（注意不要放到main/java目录下，否则打成的jar中META-INF/MANIFEST.MF不含有Main-Class信息）

或者：

- 2)**pom.xml**
    - [原Github项目kafka-deserialization-bug](https://github.com/shiyueqi/kafka-deserialization-bug){:target="_blank"} 无法构建成功；
        - 2.1) 原`pom plugin`标签
        
```xml
<plugins>
    <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-dependency-plugin</artifactId>
        <executions>
            <execution>
                <id>copy-dependencies</id>
                <phase>prepare-package</phase>
                <goals>
                    <goal>copy-dependencies</goal>
                </goals>
                <configuration>
                    <outputDirectory>${project.build.directory}/lib</outputDirectory>
                </configuration>
            </execution>
        </executions>
    </plugin>
</plugins>
```
修改后：
```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-dependency-plugin</artifactId>
            <executions>
                <execution>
                    <id>copy-dependencies</id>
                    <phase>prepare-package</phase>
                    <goals>
                        <goal>copy-dependencies</goal>
                    </goals>
                    <configuration>
                        <outputDirectory>${project.build.directory}/lib</outputDirectory>
                    </configuration>
                </execution>
            </executions>
        </plugin>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-shade-plugin</artifactId>
            <version>1.2.1</version>
            <executions>
                <execution>
                    <phase>package</phase>
                    <goals>
                        <goal>shade</goal>
                    </goals>
                    <configuration>
                        <transformers>
                            <transformer implementation="org.apache.maven.plugins.shade.resource.ManifestResourceTransformer">
                                <mainClass>com.unionpay.kafka.test.OfficialPocMain</mainClass>
                            </transformer>
                        </transformers>
                    </configuration>
                </execution>
            </executions>
        </plugin>
    </plugins>
</build>
```

## 一：Maven构建

小弟之前java学的贼烂，更别说高端的`「Maven」构建`了，研究了将近一个星期，终于使用Maven构建起第一个Java web项目，按耐不住内心的激动心情，遂记录下

第一步获取Maven构建的项目，只有用Maven构建的java项目，我们才能够Maven进行构建部署；下面这个是我用来练手的项目。当然也可以到github上找到。
此处Maven环境配置略过，多提一句，这里包括Maven的本地环境变量的配置和本地仓库的配置，自行问`度娘`。

```bash
PS C:\Users\本阿信> cd G:\yj-work\java-code\jeeplus-open
PS G:\yj-work\java-code\jeeplus-open> ls


    目录: G:\yj-work\java-code\jeeplus-open


Mode                LastWriteTime         Length Name
----                -------------         ------ ----
d-----        2020/1/10     16:26                .idea
d-----         2020/1/9     11:03                .settings
d-----         2020/1/9     11:03                src
d-----         2020/1/9     11:03                target
-a----         2020/1/9     11:03           1350 .classpath
-a----         2020/1/9     11:03           1444 .project
-a----         2016/9/4      9:11          10252 LICENSE
-a----         2016/9/4      9:11          23054 pom.xml
-a----         2016/9/4      9:11            371 README.md
```

#### *# 1x01 Maven：effective-pom构建*

如上，关键pom属性；上面可以看到maven构建的pom.xml文件，输入命令`mvn help:effective-pom`Maven 将会开始处理并显示 `effective-pom`。如下：

```bash
PS G:\yj-work\java-code\jeeplus-open> mvn help:effective-pom
[INFO] Scanning for projects...
[WARNING]
[WARNING] Some problems were encountered while building the effective model for jeeplus:jeeplus:war:1.0.0-SNAPSHOT
[WARNING] 'dependencies.dependency.(groupId:artifactId:type:classifier)' must be unique: javax.servlet.jsp:jsp-api:jar -> version 2.1 vs 2.2 @ line 278, column 21
[WARNING]
[WARNING] It is highly recommended to fix these problems because they threaten the stability of your build.
[WARNING]
[WARNING] For this reason, future Maven versions might no longer support building such malformed projects.
[WARNING]
[INFO]
[INFO] --------------------------< jeeplus:jeeplus >---------------------------
[INFO] Building jeeplusx 1.0.0-SNAPSHOT
[INFO] --------------------------------[ war ]---------------------------------
[INFO]
[INFO] --- maven-help-plugin:3.2.0:effective-pom (default-cli) @ jeeplus ---
Downloading from alimaven: http://maven.aliyun.com/nexus/content/groups/public/org/apache/maven/maven-model/3.6.1/maven-model-3.6.1.pom
Downloaded from alimaven: http://maven.aliyun.com/nexus/content/groups/public/org/apache/maven/maven-model/3.6.1/maven-model-3.6.1.pom (4.0 kB at 4.1 kB/s)
Downloading from alimaven: http://maven.aliyun.com/nexus/content/groups/public/org/apache/maven/maven/3.6.1/maven-3.6.1.pom
Downloaded from alimaven: http://maven.aliyun.com/nexus/content/groups/public/org/apache/maven/maven/3.6.1/maven-3.6.1.pom (24 kB at 95 kB/s)

###################################################
################中间具体下载过程略:>##################
###################################################
```

**我把这下面的部分，特意区分出来，方便看的更清楚，当我们对项目进行构建时，我们可以看到项目相关的一些元素。有的时候，当我们还是新手的时候，这样的控制台输出真的会令人激动！@-@**
如下，maven回显出有关于jeeplus项目的`Effective POMs`：

```bash
[INFO]
Effective POMs, after inheritance, interpolation, and profiles are applied:

<?xml version="1.0" encoding="GBK"?>
<!-- ====================================================================== -->
<!--                                                                        -->
<!-- Generated by Maven Help Plugin on 2020-01-19T15:52:57+08:00            -->
<!-- See: http://maven.apache.org/plugins/maven-help-plugin/                -->
<!--                                                                        -->
<!-- ====================================================================== -->
<!-- ====================================================================== -->
<!--                                                                        -->
<!-- Effective POM for project 'jeeplus:jeeplus:war:1.0.0-SNAPSHOT'         -->
<!--                                                                        -->
<!-- ====================================================================== -->

###################################################
######中间具体groupid、artifactid等配置略:>###########
###################################################

[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  12.235 s
[INFO] Finished at: 2020-01-19T15:53:00+08:00
[INFO] ------------------------------------------------------------------------
```
在上面的`pom.xml`中可以看到 `Maven` 在执行目标时需要用到的默认工程源码目录结构、输出目录、需要的插件、仓库和报表目录。Maven 的 pom.xml 文件也不需要手工编写。Maven 提供了大量的原型插件来创建工程，包括工程结构和`pom.xml`。

- 顺便提一下关于web中的properties文件配置

进入jeeplus项目，根据自己电脑的不同环境，对properties文件进行配置，而此处本地的项目自定义配置数据库配置文件则是`\src\main\resources\jeeplus.properties`；我单单把mysql数据库的配置代码贴出来，如下：

```bash
jdbc.type=mysql
jdbc.driver=com.mysql.jdbc.Driver
jdbc.url=jdbc:mysql://localhost:3306/jeeplus_schema?useUnicode=true&characterEncoding=utf-8
jdbc.username=root
jdbc.password=root
```

把mysql数据库的账号密码设置成本地的数据库账号密码就好，比如我本地的mysql账号密码均为`root`,填上正确即可，不然会报错。然后运行`mysql`，下一步就进行maven构建。

#### *# 1x02 Maven：test*

输入`mvn test`，查看maven构建java项目是否存在报错：
```bash
PS G:\yj-work\java-code\jeeplus-open> mvn test
[INFO] Scanning for projects...
[WARNING]
[WARNING] Some problems were encountered while building the effective model for jeeplus:jeeplus:war:1.0.0-SNAPSHOT
[WARNING] 'dependencies.dependency.(groupId:artifactId:type:classifier)' must be unique: javax.servlet.jsp:jsp-api:jar -> version 2.1 vs 2.2 @ line 278, column 21
[WARNING]
[WARNING] It is highly recommended to fix these problems because they threaten the stability of your build.
[WARNING]
[WARNING] For this reason, future Maven versions might no longer support building such malformed projects.
[WARNING]
[INFO]
[INFO] --------------------------< jeeplus:jeeplus >---------------------------
[INFO] Building jeeplusx 1.0.0-SNAPSHOT
[INFO] --------------------------------[ war ]---------------------------------
[INFO]
[INFO] --- maven-resources-plugin:2.6:resources (default-resources) @ jeeplus ---
[INFO] Using 'UTF-8' encoding to copy filtered resources.
[INFO] Copying 65 resources
[INFO]
[INFO] --- maven-compiler-plugin:3.3:compile (default-compile) @ jeeplus ---
[INFO] Changes detected - recompiling the module!
[INFO] Compiling 258 source files to G:\yj-work\java-code\jeeplus-open\target\classes
[INFO] /G:/yj-work/java-code/jeeplus-open/src/main/java/com/jeeplus/modules/tools/utils/HttpPostTest.java: 某些输入文件使用或覆盖了已过时的 API。
[INFO] /G:/yj-work/java-code/jeeplus-open/src/main/java/com/jeeplus/modules/tools/utils/HttpPostTest.java: 有关详细信息, 请使用 -Xlint:deprecation 重新编译。
[INFO] /G:/yj-work/java-code/jeeplus-open/src/main/java/com/jeeplus/common/json/AjaxJson.java: 某些输入文件使用了未经检查或不安全的操作。
[INFO] /G:/yj-work/java-code/jeeplus-open/src/main/java/com/jeeplus/common/json/AjaxJson.java: 有关详细信息, 请使用 -Xlint:unchecked 重新编译。
[INFO]
[INFO] --- maven-resources-plugin:2.6:testResources (default-testResources) @ jeeplus ---
[INFO] Using 'UTF-8' encoding to copy filtered resources.
[INFO] skip non existing resourceDirectory G:\yj-work\java-code\jeeplus-open\src\test\resources
[INFO]
[INFO] --- maven-compiler-plugin:3.3:testCompile (default-testCompile) @ jeeplus ---
[INFO] No sources to compile
[INFO]
[INFO] --- maven-surefire-plugin:2.12.4:test (default-test) @ jeeplus ---
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  10.063 s
[INFO] Finished at: 2020-01-19T16:46:53+08:00
[INFO] ------------------------------------------------------------------------
```

#### *# 1x03 Maven：clean package*

紧接着输入`mvn clean package`命令；
```bash
PS G:\yj-work\java-code\jeeplus-open> mvn clean package
[INFO] Scanning for projects...
[WARNING]
[WARNING] Some problems were encountered while building the effective model for jeeplus:jeeplus:war:1.0.0-SNAPSHOT
[WARNING] 'dependencies.dependency.(groupId:artifactId:type:classifier)' must be unique: javax.servlet.jsp:jsp-api:jar -> version 2.1 vs 2.2 @ line 278, column 21
[WARNING]
[WARNING] It is highly recommended to fix these problems because they threaten the stability of your build.
[WARNING]
[WARNING] For this reason, future Maven versions might no longer support building such malformed projects.
[WARNING]
[INFO]
[INFO] --------------------------< jeeplus:jeeplus >---------------------------
[INFO] Building jeeplusx 1.0.0-SNAPSHOT
[INFO] --------------------------------[ war ]---------------------------------
[INFO]
[INFO] --- maven-clean-plugin:2.5:clean (default-clean) @ jeeplus ---
[INFO] Deleting G:\yj-work\java-code\jeeplus-open\target
[INFO]
[INFO] --- maven-resources-plugin:2.6:resources (default-resources) @ jeeplus ---
[INFO] Using 'UTF-8' encoding to copy filtered resources.
[INFO] Copying 65 resources
[INFO]
[INFO] --- maven-compiler-plugin:3.3:compile (default-compile) @ jeeplus ---
[INFO] Changes detected - recompiling the module!
[INFO] Compiling 258 source files to G:\yj-work\java-code\jeeplus-open\target\classes
[INFO] /G:/yj-work/java-code/jeeplus-open/src/main/java/com/jeeplus/modules/tools/utils/HttpPostTest.java: 某些输入文件使用或覆盖了已过时的 API。
[INFO] /G:/yj-work/java-code/jeeplus-open/src/main/java/com/jeeplus/modules/tools/utils/HttpPostTest.java: 有关详细信息, 请使用 -Xlint:deprecation 重新编译。
[INFO] /G:/yj-work/java-code/jeeplus-open/src/main/java/com/jeeplus/common/json/AjaxJson.java: 某些输入文件使用了未经检查或不安全的操作。
[INFO] /G:/yj-work/java-code/jeeplus-open/src/main/java/com/jeeplus/common/json/AjaxJson.java: 有关详细信息, 请使用 -Xlint:unchecked 重新编译。
[INFO]
[INFO] --- maven-resources-plugin:2.6:testResources (default-testResources) @ jeeplus ---
[INFO] Using 'UTF-8' encoding to copy filtered resources.
[INFO] skip non existing resourceDirectory G:\yj-work\java-code\jeeplus-open\src\test\resources
[INFO]
[INFO] --- maven-compiler-plugin:3.3:testCompile (default-testCompile) @ jeeplus ---
[INFO] No sources to compile
[INFO]
[INFO] --- maven-surefire-plugin:2.12.4:test (default-test) @ jeeplus ---
[INFO] No tests to run.
[INFO]
[INFO] --- maven-war-plugin:2.2:war (default-war) @ jeeplus ---
[INFO] Packaging webapp
[INFO] Assembling webapp [jeeplus] in [G:\yj-work\java-code\jeeplus-open\target\jeeplus]
[INFO] Processing war project
[INFO] Copying webapp resources [G:\yj-work\java-code\jeeplus-open\src\main\webapp]
[INFO] Webapp assembled in [19918 msecs]
[INFO] Building war: G:\yj-work\java-code\jeeplus-open\target\jeeplus.war
[INFO] WEB-INF\web.xml already added, skipping
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  38.071 s
[INFO] Finished at: 2020-01-19T16:49:31+08:00
[INFO] ------------------------------------------------------------------------
```
连着`build success`！可真是令人激动；我们可以看到maven已经构建好了tomcat部署所需要的war包：`[INFO] Building war: G:\yj-work\java-code\jeeplus-open\target\jeeplus.war`，直接去对应的绝对路径，把war包`ctrl+c`到tomcat的`webapp`文件夹里就好了。<br>

至此部署完毕，对项目查看一下，是否已经部署成功。

#### *# 1x04 Maven：POM Failed to read from/to jenkins*

- <strong><code>Failed to read artifact descriptor for ysoserial:ysoserial:jar:0.0.6-SNAPSHOT: Could not transfer artifact ysoserial:ysoserial:pom:0.0.6-SNAPSHOT from/to jenkins (http://repo.jenkins-ci.org/public/)</code></strong>

一般情况为指定的Maven仓库或者本地仓库中都没有pom指定的jar包，所以我们要在本地编译好后放入本地仓库；
pom：
```xml
<dependency>
    <groupId>ysoserial</groupId>
    <artifactId>ysoserial</artifactId>
    <version>0.0.6-SNAPSHOT</version>
</dependency>
```
编译：
```bash
$ git clone git@github.com:frohoff/ysoserial.git
$ cd ysoserial
$ mvn install -DskipTests
$ mvn install:install-file -Dfile=/{path/to}/ysoserial-0.0.6-SNAPSHOT-all.jar -DgroupId=ysoserial -DartifactId=ysoserial -Dversion=0.0.6-SNAPSHOT -Dpackaging=jar
```
最后的一条命令`groupId/artifactId/version`与xml配置文件相互对应即可。

## 二：验证

多说无益，上代码：

进入tomcat/bin/目录，启动tomcat

```bash
PS E:\java\tomcat\apache-tomcat-8.5.50\bin> .\startup.bat
Using CATALINA_BASE:   "E:\java\tomcat\apache-tomcat-8.5.50"
Using CATALINA_HOME:   "E:\java\tomcat\apache-tomcat-8.5.50"
Using CATALINA_TMPDIR: "E:\java\tomcat\apache-tomcat-8.5.50\temp"
Using JRE_HOME:        "C:\Program Files\Java\jdk1.8.0_231\jre"
Using CLASSPATH:       "E:\java\tomcat\apache-tomcat-8.5.50\bin\bootstrap.jar;E:\java\tomcat\apache-tomcat-8.5.50\bin\tomcat-juli.jar"
```

验证是否部署成功：

`> curl localhost/jeeplus`：

```bash
PS E:\java\tomcat\apache-tomcat-8.5.50\bin> curl localhost/jeeplus

StatusCode        : 200
StatusDescription :
Content           :

                    <!DOCTYPE html>
                    <html>

                        <head>
                                <meta name="description" content="User login page" />
                                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                                <script src="/jeeplus...
RawContent        : HTTP/1.1 200
                    Content-Language: zh-CN
                    Content-Length: 19162
                    Content-Type: text/html;charset=UTF-8
                    Date: Sun, 19 Jan 2020 09:23:26 GMT

ParsedHtml        : mshtml.HTMLDocumentClass
RawContentLength  : 19162
```
如上，部署成功。返回状态值200。

## 其他

上面是Maven创建一个标准化的Java项目，举例：即部署一个maven的项目，我们可以通过上面的方式来进行。

更多时候，对于我来说，我高频率使用maven是在对于漏洞的验证和利用阶段，即网上公开的`java poc`代码诸如此类，显而易见我更倾向于使用java的poc代码而非python代码。

而由于python语言本身的优势，纵观网上很多`python poc`在我看来，对于我们理解漏洞原理本身无实际意义，我并不是说python的poc代码不好，而是这门语言太便利了以至于我们可以很方便去复现一个漏洞，这样会导致人们尤其是刚入门的小白很少去思考甚至不思考。

### 参考

- [Maven安装本地jar包到本地仓库](https://www.cnblogs.com/duguangming/p/10955124.html){:target="_blank"}
- [Github · shiyueqi/kafka-deserialization-bug](https://github.com/shiyueqi/kafka-deserialization-bug){:target="_blank"}
- [Kafka反序列化漏洞分析](https://shiyueqi.github.io/2017/09/13/Kafka%E5%8F%8D%E5%BA%8F%E5%88%97%E5%8C%96%E6%BC%8F%E6%B4%9E/){:target="_blank"}
- [idea 打包的jar运行报 “XXX中没有主清单属性”](https://blog.csdn.net/banjing_1993/article/details/83073210){:target="_blank"}

---

以上。
