---
layout: post
toc: true
title: "「Docker」:use docker elegant:)"
author: Bin4xin
categories:
    - blog
    - vulnhub
    - 漏洞复现
    - 排错
    - 笔记
permalink: /blog/2020/use/Docker/Elegently/
---

网上有很多关于vulhub的docker构建教程，就不重复造轮子了。记录一些日常使用dokcer遇到的问题


# docker常用
## 连接重置
> Burp Suite Professional
> Error Connection reset
> 当前无法使用此页面 当前无法处理此请求。HTTP ERROR 503

之前做一个struts2/s2-057的漏洞复现，因为是自己的服务器就各种造，扫描器什么的一把梭。最后靶场被玩儿坏了。尝试能不能重装镜像解决:(
这里我随便拿了一个镜像举列子


```javascript
docker images
REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
xdebug-rce_php      latest              6026f10530db        3 days ago          393MB
vulhub/php          7.1.12-apache       10fffe5b286c        2 years ago         392MB
vulhub/tomcat       8.5                 66ba03f6c1d8        3 years ago         367MB
vulhub/tomcat       8.0                 458575a05d97        3 years ago         357MB
```
#### 删除本地镜像
```javascript
docker rmi 6026f10530db
Untagged: xdebug-rce_php:latest
Deleted: sha256:6026f10530db39c61d31e0461ccbff4786e8c604c34f8ff8167d7ac89c81446a
Deleted: sha256:4ce36271980f0f494e1a935bdaced37ea38d08fb167d54c50440fc009df315f9
Deleted: sha256:d43d3fbbbb36edd2dbedd5df458789c7c57b5fd366403830bb6ac01b42b743d7
Deleted: sha256:b15d563c13eccd51017c2bfa269f322744cb476c4c62749d5356cd0069d6391d
```
如果报错提示无法删除，大概率情况下是指定删除的镜像docker内在运行，直接停止就行。
```javascript
docker rm 6026f10530db：删除已停止的容器
docker rm -f 6026f10530db：删除正在运行的容器
```

#### 进入容器执行命令
重要的是`CONTAINER ID`值，执行`docker ps`查看就可以：
```bash
sudo docker exec -it 775c7c9ee1e1 /bin/bash
```

* 报错：

```bash
go install: no install location for directory outside GOPATH:
```
参考：
https://stackoverflow.com/questions/26134975/go-install-no-install-location-for-directory-outside-gopath

进入容器后就可以直接执行命令，ifconfig：
```bash
br-4c7c2091db92: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 172.24.0.1  netmask 255.255.0.0  broadcast 172.24.255.255
        inet6 fe80::42:b7ff:feb7:f51d  prefixlen 64  scopeid 0x20<link>
        ether 02:42:b7:b7:f5:1d  txqueuelen 0  (Ethernet)
        RX packets 46  bytes 4538 (4.4 KiB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 65  bytes 4778 (4.6 KiB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

docker0: flags=4099<UP,BROADCAST,MULTICAST>  mtu 1500
        inet 172.18.0.1  netmask 255.255.0.0  broadcast 172.18.255.255
        inet6 fe80::42:94ff:feb9:c3dc  prefixlen 64  scopeid 0x20<link>
        ether 02:42:94:b9:c3:dc  txqueuelen 0  (Ethernet)
        RX packets 1602494  bytes 995390708 (949.2 MiB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 1434833  bytes 872808706 (832.3 MiB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 172.17.185.134  netmask 255.255.240.0  broadcast 172.17.191.255
        inet6 fe80::216:3eff:fe03:a170  prefixlen 64  scopeid 0x20<link>
        ether 00:16:3e:03:a1:70  txqueuelen 1000  (Ethernet)
        RX packets 6405140  bytes 5419609300 (5.0 GiB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 4733596  bytes 1372915223 (1.2 GiB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0
        inet6 ::1  prefixlen 128  scopeid 0x10<host>
        loop  txqueuelen 1000  (Local Loopback)
        RX packets 20372  bytes 1792815 (1.7 MiB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 20372  bytes 1792815 (1.7 MiB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

veth382577a: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet6 fe80::b067:b9ff:fece:612b  prefixlen 64  scopeid 0x20<link>
        ether b2:67:b9:ce:61:2b  txqueuelen 0  (Ethernet)
        RX packets 46  bytes 5182 (5.0 KiB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 83  bytes 6263 (6.1 KiB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
```
iptable：
```bash
iptables -L
# Warning: iptables-legacy tables present, use iptables-legacy to see them
Chain INPUT (policy ACCEPT)
target     prot opt source               destination

Chain FORWARD (policy ACCEPT)
target     prot opt source               destination
DOCKER-USER  all  --  anywhere             anywhere
DOCKER-ISOLATION-STAGE-1  all  --  anywhere             anywhere
ACCEPT     all  --  anywhere             anywhere             ctstate RELATED,ESTABLISHED
DOCKER     all  --  anywhere             anywhere
ACCEPT     all  --  anywhere             anywhere
ACCEPT     all  --  anywhere             anywhere
ACCEPT     all  --  anywhere             anywhere             ctstate RELATED,ESTABLISHED
DOCKER     all  --  anywhere             anywhere
ACCEPT     all  --  anywhere             anywhere
ACCEPT     all  --  anywhere             anywhere

Chain OUTPUT (policy ACCEPT)
target     prot opt source               destination

Chain DOCKER (2 references)
target     prot opt source               destination
ACCEPT     tcp  --  anywhere             172.24.0.2           tcp dpt:http-alt

Chain DOCKER-ISOLATION-STAGE-1 (1 references)
target     prot opt source               destination
DOCKER-ISOLATION-STAGE-2  all  --  anywhere             anywhere
DOCKER-ISOLATION-STAGE-2  all  --  anywhere             anywhere
RETURN     all  --  anywhere             anywhere

Chain DOCKER-USER (1 references)
target     prot opt source               destination
RETURN     all  --  anywhere             anywhere

Chain DOCKER-ISOLATION-STAGE-2 (2 references)
target     prot opt source               destination
DROP       all  --  anywhere             anywhere
DROP       all  --  anywhere             anywhere
RETURN     all  --  anywhere             anywhere
```
