---
layout: post
toc: true
title: "「搬运工笔记」:Maven构建Java Web项目实操"
wrench: 2020-01-19
author: Bin4xin
categories:
    - blog
    - 笔记
    - Maven
    - 代码审计
    - Web
permalink: /blog/2020/maven/build/mavaProject/
---

> 前面写了一篇关于[Maven构建项目相关一揽子知识](/blog/2020/maven/build/javapro/)，侧重于各种常见报错的排查和pom.xml的配置。本文作为补充，从实操角度记录一次完整的Maven Web项目构建过程。

## 环境准备

```bash
# JDK版本确认
java -version
# openjdk version "1.8.0_231"

# Maven版本确认
mvn -version
# Apache Maven 3.6.3

# Tomcat版本
# Apache Tomcat 8.5.50
```

### Maven换源

国内环境建议配置阿里云镜像源，避免依赖下载超时：

```xml
<!-- ~/.m2/settings.xml 或 Maven安装目录/conf/settings.xml -->
<mirrors>
    <mirror>
        <id>alimaven</id>
        <name>aliyun maven</name>
        <url>http://maven.aliyun.com/nexus/content/groups/public/</url>
        <mirrorOf>central</mirrorOf>
    </mirror>
</mirrors>
```

## 项目构建流程

### 1x01 导入项目

以IDEA为例，打开Maven项目时选择`pom.xml`文件导入：

```
File -> Open -> 选择 pom.xml -> Open as Project
```

IDEA会自动解析`pom.xml`中的依赖配置并下载jar包到本地仓库`~/.m2/repository/`。

### 1x02 常见构建命令

```bash
# 仅编译
mvn compile

# 运行单元测试
mvn test

# 打包（跳过测试）
mvn clean package -DskipTests

# 安装到本地仓库
mvn install -DskipTests

# 查看依赖树
mvn dependency:tree

# 查看Effective POM（包含继承、插值后的完整pom）
mvn help:effective-pom
```

### 1x03 部署到Tomcat

```bash
# 打包后获取war文件
mvn clean package -DskipTests
# target/xxx.war

# 复制到Tomcat webapps目录
cp target/xxx.war /path/to/tomcat/webapps/

# 启动Tomcat
cd /path/to/tomcat/bin
./startup.sh    # Linux/macOS
.\startup.bat   # Windows

# 验证部署
curl -I http://localhost:8080/xxx/
```

## 依赖冲突排查

Maven项目最常见的问题就是依赖冲突，尤其是安全工具场景下引用多个POC项目时：

```bash
# 查看依赖树，过滤冲突
mvn dependency:tree -Dverbose -Dincludes=commons-collections

# 常见冲突解决方式：排除冲突依赖
<dependency>
    <groupId>com.example</groupId>
    <artifactId>example-lib</artifactId>
    <version>1.0.0</version>
    <exclusions>
        <exclusion>
            <groupId>commons-collections</groupId>
            <artifactId>commons-collections</artifactId>
        </exclusion>
    </exclusions>
</dependency>
```

## 本地jar包安装到仓库

在安全研究中经常需要将本地编译的jar安装到Maven仓库：

```bash
# 安装本地jar到本地仓库
mvn install:install-file \
    -Dfile=/path/to/target.jar \
    -DgroupId=com.example \
    -DartifactId=target \
    -Dversion=1.0.0 \
    -Dpackaging=jar

# pom.xml中引用
<dependency>
    <groupId>com.example</groupId>
    <artifactId>target</artifactId>
    <version>1.0.0</version>
</dependency>
```

## FAQ

### 依赖下载失败

```bash
# 强制更新依赖
mvn clean install -U

# 跳过校验
mvn clean install -DskipTests -Dmaven.javadoc.skip=true
```

### IDEA构建后找不到war包

检查`Project Structure -> Artifacts`是否正确配置了Web Application Archive。

### 编码问题

```xml
<!-- pom.xml中指定编码 -->
<properties>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    <maven.compiler.encoding>UTF-8</maven.compiler.encoding>
</properties>
```

> 更多报错场景和解决方案，详见：[Maven构建项目相关一揽子知识](/blog/2020/maven/build/javapro/)

以上。