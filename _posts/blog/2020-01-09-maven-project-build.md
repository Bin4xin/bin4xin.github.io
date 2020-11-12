---
title:      "「搬运工笔记」:Maven构建Java web项目"
author:     "Bin4xin"
catalog: true
article_header:
  type: cover
  image:
    src: img/post-bg/post-java-bg-png
tags:
    - Java web
    - Tomcat
    - 笔记

---

> Maven构建、Gradle构建最近搞得我头痛，天天搬运别人的东西，搬也搬不像。。问题还没有彻底解决，先随手记下。
  
- 持续更新中|updating|2020/01/21以更新


师傅最近让我看freebuf上一篇关于jeeplus代码审计的文章，文章讲的是不错的，自己找了个项目来做，之前没有java开发的基础，所以两眼一抹黑，浪费了不少时间，随笔记。


<a href="https://github.com/MSOpenTech/redis/releases/download/win-3.2.100/Redis-x64-3.2.100.msi">Redis-x64-3.2.100.msi</a>

# 现象描述
## 404
eclipse导入jeeplus项目后，用Maven构建，tomcat部署成功未报错，总是访问不了项目，一直404。
搜索CSDN原答案：
```javascript
解决如下选中“项目"，然后右击选择“properties”Deployment，
然后将webContent项remove掉，还有test相关的文件也可以remove掉，
test是测试相关的文件，add一个folder文件，next->next->src下的main下
的webapp文件，最后击“Finish”，在add一个Java Build Path Entries，next->Maven Dependencies
文件，最后再点击"Finish"；最后再点击"OK";
重新启动tomcat，在浏览器中输入相应的地址：http://localhost:8080/MavenTest/index.jsp ，进行测试web项目是否创建成功。
```
## jar not found
tomcat 没有jar问题
```javascript
如果你是maven项目，tomcat在发布项目的时候没有同时发布maven依赖所添加的jar包，
你需要设置一下eclipse：
项目 -> 属性 -> Deployment Assembly -> Add -> Java Build Path Entries -> 选择Maven Dependencies -> Finish -> OK
把对应的Maven依赖包也发布到tomcat，调试时会自动把那些jar发布到指定目录下，tomcat也能找到那些jar了。

```

结合eclipse
```javascript
mvn eclipse:clean
mvn eclipse:eclipse
##普通Eclipse项目执行 ： 
mvn eclipse:eclipse Eclipse
##web项目执行 ： 
mvn eclipse:eclipse –Dwtpversion=1.0 
```
```javascript
--------------------------------------------------华丽的分割线--------------------------------------------------
```

# 「 更新」

###  「2020年01月21日11:22:26」:Maven构建

小弟之前java学的贼烂，更别说高端的`「Maven」构建`了，研究了将近一个星期，终于使用Maven构建起第一个Java web项目，按耐不住内心的激动心情，记录下<br>

<a href="https://chihou.pro/2020/01/19/maven-build-javapro.html">Maven-Build-Jeeplus记录</a>
