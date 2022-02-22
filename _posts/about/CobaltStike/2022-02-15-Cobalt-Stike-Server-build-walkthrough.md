---
layout: about
category: about
wrench: 2022-02-22
toc: true
Researchname: I. Cobalt Stike服务器搭建历程
desc: 「Cobalt Stike」
author: Bin4xin
permalink: /about/Cobalt-Stike-Server-build-walkthrough/
---

# Cobalt Stike备忘录

## 启动

```bash
nohup ./teamserver <vps_ip> <connect_password> &
```

## 消除CS特征

CS服务器默认监听在50050端口，可以在启动前编辑`teamserver`文件更改监听端口：

```bash
sed -i 's/50050/10080/g' teamserver 
chmod +x teamserver
nohup ./teamserver host pass &
```

可以看到日志：

`[+] Team server is up on 0.0.0.0:10080`

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
sed -i 's!-alias cobaltstrike -dname "CN=Major Cobalt Strike, OU=AdvancedPenTesting, O=cobaltstrike, L=Somewhere, S=Cyberspace, C=Earth"!-alias isisy.com -dname "CN=isisy Windows, OU=MOPR, O=Sentrylab Inc, L=Redmond, ST=HEFEI, C=CN"!g' teamserver
```

nmap扫描/消除特征效果：

```bash
PORT      STATE SERVICE     VERSION
10080/tcp open  ssl/unknown
| ssl-cert: Subject: commonName=isisy Windows/organizationName=Sentrylab Inc/stateOrProvinceName=HEFEI/countryName=CN
| Issuer: commonName=isisy Windows/organizationName=Sentrylab Inc/stateOrProvinceName=HEFEI/countryName=CN
| Public Key type: rsa
| Public Key bits: 2048
| Signature Algorithm: sha256WithRSAEncryption
| Not valid before: 2022-02-17T09:06:25
| Not valid after:  2022-05-18T09:06:25
| MD5:   2d0b efaa d942 3336 f561 bb5d 9e0b 9751
|_SHA-1: ee50 0484 7d73 d8c4 fe5d 3ef0 80fe 390c a3ed 5bcc
|_ssl-date: TLS randomness does not represent time
```

