---
layout: post
toc: true
title: "Docker环境下T-pot蜜罐部署记录"
author: Bin4xin
categories:
    - blog
tags:
    - 安全工具
    - 主动防御
permalink: /blog/2019/docker/t/pot/
---

* 摘要:最近在网上冲浪看到一个开源蜜罐项目，看到是基于web的蜜罐项目，web页面是真好看。突发奇想正好手头有个公网ip，最近也在为论文数据来源发愁，索性来试试看。
	- 先说结论，安装失败。本篇持续更新～（滑稽）
	- 看介绍项目的帖子说，最新版T-pot 18是基于ubuntu server 18.04 TLS进行部署。果断使用docker试试～

## 1.docker安装使用

#### 1.1使用apt-get进行安装

安装必要的一些系统工具
```
sudo apt-get update
sudo apt-get -y install apt-transport-https ca-certificates curl software-properties-common
```
安装GPG证书
```
curl -fsSL http://mirrors.aliyun.com/docker-ce/linux/ubuntu/gpg | sudo apt-key add -
写入软件源信息
sudo add-apt-repository "deb [arch=amd64] http://mirrors.aliyun.com/docker-ce/linux/ubuntu $(lsb_release -cs) stable"
```
更新并安装 Docker-CE
```
sudo apt-get -y update
sudo apt-get -y install docker-ce
```

## 2.docker使用语法
```
#查看当前环境下docker拥有的镜像
docker images 
#使用宿主机80端口映射且运行ubuntu镜像，镜像使用bash执行
docker run -it -p 80:80 ubuntu /bin/bash
#保存指令，由于docker不会进行容器修改的保存，所以需要手动保存
docker commit -a "runoob.com" -m "my apache" a404c6c174a2  mymysql:v1
#运行保存的容器
docker run -it -p 80:80 ubuntu:v1 
```

## 3.docker中netselect-apt报错.

#### 3.1 安装netselect-apt依赖的netselect包

安装netselect之前无法安装netselect-apt，会报错。即netselect是必须依赖项
```
安装netselect_0.3.ds1-28+b1_amd64.deb
wget http://ftp.cn.debian.org/debian/pool/main/n/netselect/netselect_0.3.ds1-28+b1_amd64.deb
dpkg -i netselect_0.3.ds1-28+b1_amd64.deb
```

#### 3.2 netselect包安装报错
以下两个是本菜docker安装时出现的依赖项，贴出来，基本上就是缺什么装什么就行了。
```
解决"Can't locate Term/ReadLine.pm" 
安装:apt install libterm-readkey-perl -y
解决"No usable dialog-like program is installed" 
安装:apt install dialog
```
#### 3.3 安装netselect-apt包

```
wget http://ftp.cn.debian.org/debian/pool/main/n/netselect/netselect-apt_0.3.ds1-28_all.deb
dpkg -i netselect-apt_0.3.ds1-28_all.deb
```
安装结束应无任何报错，即代表成功；也可以通过输入两个包进行验证。

## 4.安装T-POT蜜罐

```
cd tpotce/iso/install
./install.sh --type=auto --conf=tpot.conf #自动编译配置，配置文件为tpot.conf
cp tpot.conf.dist tpot.conf #生成配置文件
```
报错 Aborting:debian bionic is not support.看样子是系统版本的问题，无法解决。～搞了一下午，脑阔疼。
