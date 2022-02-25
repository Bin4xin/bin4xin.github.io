---
layout: about
category: about
wrench: 2022-02-25
toc: true
Researchname: Cobalt Stike服务器搭建历程
desc: 「Cobalt Stike」
author: Bin4xin
permalink: /about/Cobalt-Stike-Server-build-walkthrough/
---

# Cobalt Stike备忘录 I

本章阐述重点在于如何搭建起一个C2服务器并且如何隐藏CS相关特征

## 搭建

```bash
#client
scp Cobalt-Stike.tar.gz username@<vps_ip>:~

#server
tar -zxvf Cobalt-Stike.tar.gz
```

### 0x01 no profile

```bash
#server
nohup ./teamserver <vps_ip> <connect_password> &

#client
java -XX:ParallelGCThreads=4 -XX:+AggressiveHeap -XX:+UseParallelGC -jar cobaltstrike.jar
#输入<vps_ip> <connect_password>
#名字任意填入
```

### 0x02 profile

## 消除特征

### 1x01 修改默认端口

CS服务器默认监听在50050端口，可以在启动前编辑`teamserver`文件更改监听端口：

```bash
sed -i 's/50050/10080/g' teamserver 
chmod +x teamserver
nohup ./teamserver <vps_ip> <connect_password> &
```

可以看到日志：

`[+] Team server is up on 0.0.0.0:10080`

### 1x02 伪造证书

删除默认的证书

```bash
rm ./cobaltstrike.store
```

查看`teamserver`代码中原证书

```bash
keytool -list -v -storepass 123456 -keystore cobaltstrike.store
```

并重签一个伪造证书

```bash
rm ./cobaltstrike.store
sed -i 's!-alias cobaltstrike -dname "CN=Major Cobalt Strike, OU=AdvancedPenTesting, O=cobaltstrike, L=Somewhere, S=Cyberspace, C=Earth"!-alias common-domain.com -dname "CN=common-domain Windows, OU=MOPR, O=Sentrylab Inc, L=Redmond, ST=HEFEI, C=CN"!g' teamserver
```

nmap扫描/消除特征效果：

```bash
PORT      STATE SERVICE     VERSION
10080/tcp open  ssl/unknown
| ssl-cert: Subject: commonName=common-domain Windows/organizationName=Sentrylab Inc/stateOrProvinceName=HEFEI/countryName=CN
| Issuer: commonName=common-domain Windows/organizationName=Sentrylab Inc/stateOrProvinceName=HEFEI/countryName=CN
| Public Key type: rsa
| Public Key bits: 2048
| Signature Algorithm: sha256WithRSAEncryption
| Not valid before: 2022-02-17T09:06:25
| Not valid after:  2022-05-18T09:06:25
| MD5:   2d0b efaa d942 3336 f561 bb5d 9e0b 9751
|_SHA-1: ee50 0484 7d73 d8c4 fe5d 3ef0 80fe 390c a3ed 5bcc
|_ssl-date: TLS randomness does not represent time
```

### 1x03 重签自有证书

Cloudflare导航栏 -> SSL/TLS -> 源服务器 -> 创建证书

```bash
#生成p12文件
openssl pkcs12 -export -in public.pem -inkey private.key -out domain-test.p12 -name domain-test.com -passout pass:123456
#生成store文件
keytool -importkeystore -deststorepass 123456 -destkeypass 123456 -destkeystore domain-test.store -srckeystore domain-test.p12 -srcstoretype PKCS12 -srcstorepass 123456 -alias domain-test.com
#生成的文件名字可以随意，域名需对应上；
```
完成后修改`teamserver`中对应的store文件然后启动，证书就是Cloudflare签发的了；

> 以上是几个常见搭建的隐匿思路，不过在网络测绘平台的无差别测绘面前仍然可以寻出蛛丝马迹，参阅以下文章：

### 1x04 修改shellcode加密密钥 - Mark

在[Cobalt Strike特征隐藏](https://www.cnblogs.com/Xy--1/p/14396744.html)一文中提到：

> 在cobalt strike的`c2 malleable`配置文件中没有自定义http-stager的uri，默认情况下，通过访问默认的uri，就能获取到cs的shellcode。
> 
> 加密shellcode的密钥又是固定的(3.x 0x69，4.x 0x2e)，所以能从shellcode中解出c2域名等配置信息


[点击以查看更多与「C2服务器隐匿」](/about/Cobalt-Stike-hidden-true-ip/)相关的文章


### 参考

- [*Cobalt Strike*特征隐藏与流量分析](https://www.ol4three.com/2021/10/28/%E5%86%85%E7%BD%91%E6%B8%97%E9%80%8F/CobaltStrike/Cobalt-Strike%E7%89%B9%E5%BE%81%E9%9A%90%E8%97%8F%E4%B8%8E%E6%B5%81%E9%87%8F%E5%88%86%E6%9E%90/){:target="_blank"}
- [*Cobalt Strike*特征隐藏](https://www.cnblogs.com/Xy--1/p/14396744.html){:target="_blank"}
- [*PDFS*](https://blog.ateam.qianxin.com/CobaltStrike4.0%E7%94%A8%E6%88%B7%E6%89%8B%E5%86%8C_%E4%B8%AD%E6%96%87%E7%BF%BB%E8%AF%91.pdf){:target="_blank"}
- [*Github Bypass cobaltstrike beacon config scan*](https://github.com/qigpig/bypass-beacon-config-scan/){:target="_blank"}
- [*Bypass cobaltstrike beacon config scan*](https://mp.weixin.qq.com/s/fhcTTWV4Ddz4h9KxHVRcnw){:target="_blank"}