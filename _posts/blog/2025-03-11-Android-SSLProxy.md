---
layout: post
title: "AndroidSSLProxy配置"
date: 2025-03-11
toc: true
author: Bin4xin
categories:
- blog
tags:
- Android
- SSLProxy
- BurpSuite
---

## Android导入burpsuite证书后拦截https请求显示服务器证书有效期太长

### 1. 说明

在对android手机渗透测试时，会经常使用拦截工具拦截请求报文，其中burpsuite是比较常用的安全工具，针对Android手机配置burpsuite证书操作请参考末尾。

在导入系统级证书后，拦截https报文，小程序会弹框提示连接错误：`NET::ERR_CERT_VALIDITY_TOO_LONG`

在CA/Browser论坛发布的官方指导中有明确规定证书有效期的限定，订阅的证书在签发之后有效期不得超过60个月，在2015年4月1日之后签发的证书有效期不得大于39个月。并且针对SHA-1算法的有效期也做了限定，自2017-1-1起CA中不应该再使用SHA-1算法。


	 9.4 Validity Period
	 9.4.1 Subscriber Certificates   
	 Subscriber Certificates issued after the Effective Date MUST have a Validity Period no greater than 60 months.  
	 Except as provided for below, Subscriber Certificates issued after 1 April 2015 MUST have a Validity Period no
	 greater than 39 months.
	 Beyond 1 April 2015, CAs MAY continue to issue Subscriber Certificates with a Validity Period greater than 39
	 months but not greater than 60 months provided that the CA documents that the Certificate is for a system or
	 software that:
	 (a) was in use prior to the Effective Date;
	 (b) is currently in use by either the Applicant or a substantial number of Relying Parties;
	 (c) fails to operate if the Validity Period is shorter than 60 months;
	 (d) does not contain known security risks to Relying Parties; and
	 (e) is difficult to patch or replace without substantial economic outlay. 
	 Forum Guideline
	 CA / Browser Forum Baseline Requirements, v. 1.2.3 (as of 16 October 2014) 14
	 9.4.2 SHA‐1 Validity Period
	 Effective 1 January 2016, CAs MUST NOT issue any new Subscriber certificates or Subordinate CA certificates
	 using the SHA-1 hash algorithm. CAs MAY continue to sign certificates to verify OCSP responses using SHA1
	 until 1 January 2017. This Section 9.4.2 does not apply to Root CA or CA cross certificates. CAs MAY continue to
	 use their existing SHA-1 Root Certificates. SHA-2 Subscriber certificates SHOULD NOT chain up to a SHA-1
	 Subordinate CA Certificate.
	 Effective 16 January 2015, CAs SHOULD NOT issue Subscriber Certificates utilizing the SHA-1 algorithm with an
	 Expiry Date greater than 1 January 2017 because Application Software Providers are in the process of deprecating
	 and/or removing the SHA-1 algorithm from their software, and they have communicated that CAs and Subscribers
	 using such certificates do so at their own risk.  

Burpsuite的证书有效期已经大于39个月，在Android Chrome内核上会产生上述报错，提示证书有效期过长，如下所示：

![](https://raw.githubusercontent.com/shadow-horse/Learning-resource/master/Android/img/ssl_too_long.png)

### 2. 通过生成自定义证书的方式解决该问题

方法比较简单，就是通过生成自定义的有效期小于39个月证书，然后分别导入Burpsute和Android中。

1. 生成自签名证书，采用自动生成密钥的方式，指定有效期、密钥长度，按照命令提示输入C/N等信息

openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout pk.key -out certificate.crt
2. 生成pkcs12文件，输入密钥

openssl pkcs12 -export -out certificate.p12 -inkey pk.key -certfile certificate.crt -in certificate.crt
3. 导出certificate.p12文件
4. 将certificate.p12证书keystore导入Burpsuite
   ![](https://raw.githubusercontent.com/shadow-horse/Learning-resource/master/Android/img/bp_import_ca.jpg)   
   ![](https://raw.githubusercontent.com/shadow-horse/Learning-resource/master/Android/img/bp_import_ca_1.jpg)

5. 访问http://localhost:8080下载CA证书，cacert.der  
   ![](https://raw.githubusercontent.com/shadow-horse/Learning-resource/master/Android/img/export_ca.jpg)  
   ![](https://raw.githubusercontent.com/shadow-horse/Learning-resource/master/Android/img/ca_info.jpg)
6. 转换生成pem证书，并导入Android /system/etc/security/cacerts目录下（需root权限）

至此问题解决。

### Android手机配置burpsuite证书操作

按该链接的提示进行操作即可：[https://www.jianshu.com/p/521CC119F38C](https://www.jianshu.com/p/521CC119F38C "https://www.jianshu.com/p/521CC119F38C")

## REF

- [shadow-horse/Learning-resource](https://github.com/shadow-horse/Learning-resource/blob/master/Android/Android%E5%AF%BC%E5%85%A5burpsuite%E8%AF%81%E4%B9%A6%E6%98%BE%E7%A4%BA%E6%9C%89%E6%95%88%E6%9C%9F%E5%A4%AA%E9%95%BF.md)
