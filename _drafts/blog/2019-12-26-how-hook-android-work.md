---
layout: post
title: "「安卓渗透」:HOOK-Frida原理详解"
author: Bin4xin
categories:
    - blog
    - 笔记
    - Android Reverse
permalink: /blog/2019/HOOK/BY/FRIDA/
---


## HOOK详解

hook技术是指在android上进行的跨进程操作，包括
一、native层hook，即：jni，本地调用java native interface，称之为本层hook；
二、java本地接口
三、java层hook


* 实际上，Android本身进行且维护着一套事件分发机制，而应用程序则包括`应用触发事件`和`后台逻辑处理`

	- 壹.应用触发事件：比如app中，一个按钮对应一个url，点击则跳转默认浏览器访问url，称之为应用触发事件；

	- 贰.后台逻辑处理：我们所看不到的后台处理逻辑程序;
<br>
比如上个栗子中：一个url按钮，我们点击后用户所看到的现象为：
按钮点击->跳转默认浏览器->浏览器地址栏填充为按钮url->访问；而对于后台来说，那么可能就没有那么简单了，当我们学会去看log日志的时候，我们会发现，后台代码程序所做的工作多得多得多。