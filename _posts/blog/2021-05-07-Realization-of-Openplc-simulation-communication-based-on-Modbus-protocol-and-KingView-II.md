---
layout: post
title: "基于Modbus协议与KingView实现Openplc仿真通讯（2）- 靶场攻击流量分析"
date: 2021-05-07
wrench: 2021-07-30
author: Bin4xin
toc: true
categories: [blog, 漏洞复现, 笔记]
permalink: /blog/2021/Realization-of-Openplc-simulation-communication-based-on-Modbus-protocol-and-KingView-II/
---

#### # *WireShark*流量分析

网上已经有大佬上传wireshark流量文件，就不重复造轮子去流量了，直接下载下来对照poc代码分析看看：

- [点击下载：*sxd0216/attack-packets*](https://github.com/sxd0216/attack-packets)
	- 14、16帧为client向server请求流量，具体如下图：
	- 15、17帧为server返回给client确认流量，具体流量可自行下载分析

![](/assets/img/blog/2021/wireshark_tcp_show.png)


#### # 模拟攻击启停

![](/assets/img/blog/2021/OpenPLC_attack_success.gif)

