---
layout: about
category: about
Researchname:  安全与开发之：Maven构建排错
toc: true
permalink: /about/ALL-mvn-build-errors/
---

<h1>安全与开发之：<em>Maven</em>构建排错</h1>
# 谈谈maven:-)

## 零：Ysoserial魔改项目By threedr3am.Maven构建

最近在研究内存马；有幸生于信息爆炸的时代，我们可以通过搜索引擎搜索到需要的资料。

*2021年 3月31日 星期三 10时22分20秒 CST* 在原仓库中：
```
origin  https://github.com/threedr3am/ysoserial.git (fetch)
origin  https://github.com/threedr3am/ysoserial.git (push)
```
克隆下来的项目无法构建成功；经过排错现push仓库上线。

 * 感谢[@threedr3am](https://github.com/threedr3am/){:target="_blank"}师傅开源的代码；
 * _[进一步了解排错步骤](https://about.sentrylab.cn/about/ALL-mvn-build-errors/){:target="_blank"}_ 
 * 吾辈当砥砺前行；_[进一步了解关于内存马的开源项目](https://github.com/Bin4xin/sweet-ysoserial){:target="_blank"}_


### 0x01：[ERROR]错误: 找不到符号

#### # 站在巨人的肩膀上

```
git clone https://github.com/threedr3am/ysoserial.git
cd ysoserial
#根据readme.md提示进行命令构建
#Requires Java 1.7+ and Maven 3.x+
mvn clean package -D skipTests
```

不出意外的话，等下载完pom文件中的所有依赖，就会报错构建失败：

```
[ERROR] COMPILATION ERROR : 
[INFO] -------------------------------------------------------------
[ERROR] /Users/bin4xin/tools/bin4xin/code/tomcat/ysoserial/ysoserial-failed/src/main/java/ysoserial/payloads/FileUpload1.java:[11,35] 错误: 找不到符号
[ERROR]   符号:   类 DeferredFileOutputStream
  位置: 程序包 org.apache.commons.io.output
/Users/bin4xin/tools/bin4xin/code/tomcat/ysoserial/ysoserial-failed/src/main/java/ysoserial/payloads/FileUpload1.java:[12,35] 错误: 找不到符号
```
一般来说，mvn构建项目报错排错流程如下：

- 1、源码调用的依赖库：
    * 我们可以从上面的报错看出报错的文件`src/main/java/ysoserial/payloads/FileUpload1.java`和依赖包名称`org.apache.commons.io.output`，直接定位到该文件位置查看：
![](/static/web-image/all-mvn/mvn-java-code-compared.png)
    
    如上，
    
    <img align="right" src="/static/web-image/all-mvn/mvn-java-code-solved1.png" height="50%" width="50%" />
    
    * 添加依赖；提示报错是在`org.apache.commons.io.output`下的调用包，右边还有源码调用存在问题，看到这样的情况不要慌，IDEA给我们提供了解决方案：
        
        * 快捷键<kbd>shift</kbd>+<kbd>option</kbd>+<kbd>enter</kbd>；
    
        * 或悬浮鼠标在缺失的、爆红的依赖程序包上如`org.apache.commons.io.output`->`Add Maven Dependency`呼出右边功能框「_Maven Artifact Search_」


添加上依赖后就OK了，但是还是无法构建成功；

>当Maven执行一个带有子模块的项目的时候，Maven 首先载入父POM,然后定位所有的子模块 POM。Maven 然后将所有这些项目的POM
>放入到一个称为 Maven 反应堆（Reactor）的东西中，由它负责分析模块之间的依赖关系，以确保相互独立的模块能以适当的顺序被编译和安装

所以继续往下来看POM：

- 2、POM文件依赖：

> - POM( Project Object Model，项目对象模型 ) 是 Maven 工程的基本工作单元，是一个XML文件，包含了项目的基本信息，用于描述项目如何构建，声明项目依赖，等等。
>   执行任务或目标时，Maven 会在当前目录中查找 POM。它读取 POM，获取所需的配置信息，然后执行目标。
>   POM 中可以指定以下配置：
>
>       - 项目依赖
>       - 插件
>       - 执行目标
>       - 项目构建 profile
>       - 项目版本
>       - 项目开发者列表
>       - 相关邮件列表信息

我们定位到项目的pom.xml文件，看看报错pom与成功pom对比：
![](/static/web-image/all-mvn/mvn-build-difference-between-pom.png)
我们也同样可以看到，左边pom文件一片爆红；来尝试解决以下：

- 解决方法：
    * 一般<version>标签爆红的，解决办法都是去maven仓库里去查看对应依赖的版本号，查到对应的maven仓库的版本号修改即可；  
        * _[进入AliMaven search进一步了解](https://maven.aliyun.com/mvn/search){:target="_blank"}_
    * 如果<dependency>标签内整个依赖出现爆红错误，一般是尝试去在IDEA里尝试导入lib库查看是否继续报错，如果无法成功的话需要自己手动导入jar包。
    
    
#### # 再次构建

```
mvn clean -DskipTests
mvn clean package -DskipTests
···
ls -la target
total 119144
drwxr-xr-x  11 bin4xin  staff       352  3 31 09:56 .
drwxrwxr-x@ 18 bin4xin  staff       576  3 31 09:56 ..
drwxr-xr-x   2 bin4xin  staff        64  3 31 09:56 archive-tmp
drwxr-xr-x   3 bin4xin  staff        96  3 31 09:56 classes
drwxr-xr-x   3 bin4xin  staff        96  3 31 09:56 generated-sources
drwxr-xr-x   3 bin4xin  staff        96  3 31 09:56 generated-test-sources
drwxr-xr-x   3 bin4xin  staff        96  3 31 09:56 maven-archiver
drwxr-xr-x   3 bin4xin  staff        96  3 31 09:56 maven-status
drwxr-xr-x   3 bin4xin  staff        96  3 31 09:56 test-classes
-rw-r--r--   1 bin4xin  staff  60497019  3 31 09:56 ysoserial-0.0.6-SNAPSHOT-all.jar
-rw-r--r--   1 bin4xin  staff    193804  3 31 09:56 ysoserial-0.0.6-SNAPSHOT.jar 
```
至此，我们看到已经构建出0.0.6版本的jar包。

### 0x02：总结
#### # 牢骚太盛防肠断，风物长宜放眼量。

- 1、MVN源码构建导入lib库；
- 2、修改POM文件对应的依赖。

以上。