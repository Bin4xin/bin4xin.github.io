---
layout: post
title: "[UPDATING...]用友NC6.5java反序列化"
date: 2021-03-13
author: Bin4xin
toc: true
categories:
    - blog
    - 笔记
permalink: /blog/2021/yonyou-nc6.5-java-underser/
---

## 零：用友nc6.5反序列化依赖jar包

- 部分依赖jar包在安装完nc6.5系统后，一般在`C://yonyou//home//lib//`目录下，前提需要有nc6.5的安装包；或者下载仓库内的依赖包：
    - *[点击以了解yonyou-nc6.5-lib](https://github.com/Bin4xin/bigger-than-bigger/blob/master/yonyou-nc6.5-lib/README.MD)*
        - 本机运行环境
        
        ```
        java version "1.8.0_181"
        Java(TM) SE Runtime Environment (build 1.8.0_181-b13)
        Java HotSpot(TM) 64-Bit Server VM (build 25.181-b13, mixed mode)

        javac 1.8.0_181
        ```
      
- 学习教程[*README*](https://github.com/Bin4xin/bigger-than-bigger/blob/master/yonyou-nc6.5-lib/README.MD)

### 0x01：下载
    
- 单jar包：点击[*ncdepend.jar*](https://github.com/Bin4xin/bigger-than-bigger/blob/master/yonyou-nc6.5-lib/ncdepend.jar)链接 -> Download.
- 整包[*yonyou-NCv6.5-lib.zip*](https://github.com/Bin4xin/bigger-than-bigger/releases/tag/yonyou-ncv6.5)链接 -> 单击链接下载 

```
[anonymous] DEBUG  - Invoke nc.bs.framework.server.RemoteMetaContext.lookup write info to server spend time: 188 
Exception in thread "main" nc.bs.framework.exception.FrameworkIOException: Remote request error
```

