---
layout: top
title: "© 哨兵Sentry Security相关技术栈简介"
date: 2021-07-07
author: Bin4xin
categories:
  - top
tags:
  - 笔记
  - wiki
---

> [2021/11/09/15:08:59] :本文主要介绍{{site.title}}{{site.brand}}相关主题源码的路由、相关配置等

### # 路由问题

源码下载下来后，基本的文件形式供参考：

![截屏2021-07-13 下午3.03.46.png](https://i.loli.net/2021/07/13/o4gb1veWBlfyx8T.png)

> 文章内容往后更新，此处主要测试图床功能

* 实操下来发现路由结构如下：
  - 新闻-公告窗口相互绑定`/news`，`readmore`功能同样跳转	;
  - 帮助-个人希望实现对于近期的一些研究，如`struts2,shiro`;但是部分功能路由和json文件对应的`site.url/help`路由暂时无法得知如何代码。

***
* 2020-11-08更新：
发现路由信息：
  - `_data/options.yml`配置文件可以选择配置`force_redirect_help`功能，即强制路由跳转至`help/*{redirect_url}`
  -	可以选择配置`unlist`选项、`new`显示等。

* 2021-2-1更新：
发现头部样式关联：
  - `category`配置与`layout`配置
    - `layout`布局选项配置，如选择配置`help`那么则可以在近期研究中左侧导航栏中发现
 
### # Action + Jekyll

[yml文件](https://github.com/Bin4xin/bin4xin.github.io/blob/main/.github/workflows/deploy.yml)
