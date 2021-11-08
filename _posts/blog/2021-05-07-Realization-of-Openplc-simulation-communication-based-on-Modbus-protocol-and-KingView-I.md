---
layout: post
title: "基于Modbus协议与KingView实现Openplc仿真通讯（1）- 仿真通讯靶场搭建"
date: 2021-05-07
author: Bin4xin
toc: true
categories:
    - blog
    - 漏洞复现
    - 笔记
permalink: /blog/2021/Realization-of-Openplc-simulation-communication-based-on-Modbus-protocol-and-KingView-I/
---

- 基于Modbus协议与KingView实现Openplc仿真通讯 - 通讯靶场网络示意图如下

![assets-network-show.png](/assets/img/blog/2021//assets-network-show.png)

#### # *OpenPLC on Linux*

- *OpenPLC*环境搭建
	- [*点击以了解OpenPLC*](https://github.com/thiagoralves/OpenPLC_v3)

```
$ mkdir ICWR && cd ICWR
$ git clone https://github.com/thiagoralves/OpenPLC_v3.git
$ cd OpenPLC_v3
$ ./install.sh linux
···
···
···
Compiling for Linux
Generating object files...
Generating glueVars...
Compiling main program...
Compilation finished successfully!
```

运行：`nohup ./start_openplc.sh &`

- *OpenPLC_Editor on Linux*

**作用为本地PLC程序调试使用，无需求可跳过**

```
$ git clone https://github.com/thiagoralves/OpenPLC_Editor.git
$ cd OpenPLC_Editor
$ ./install.sh
$ ./openplc_editor.sh
```

#### # *OpenPLC Programs*

```
$ curl -o openplc_test.st https://raw.githubusercontent.com/sxd0216/openplc_test.st/master/openplc_test.st
```

![](/assets/img/blog/2021/OpenPLC_TODO1.png)


#### # *Kingview on Windows*

- 设备驱动 -> PLC -> 莫迪康 -> ModBUS TCP -> TCP -> 下一步：

![KingView_OPENPLC_TODO](/assets/img/blog/2021/KingView_OPENPLC_TODO.png)

- 文件 -> 画面 添加组件（可参考动图添加组件）

- 数据库 -> 数据字典 -> 新建...
	- ![](/assets/img/blog/2021/KingView_OPENPLC_TODO2.png)

选中自定义画面 -> make -> view （GIF动画有点大，loading...）：

![success.gif](/assets/img/blog/2021/KingView_OPENPLC_success.gif)