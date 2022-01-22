---
layout: post
toc: true
title: "「笔记」：fortify-error-no-rules-file-found"
author: Bin4xin
categories:
    - blog
tags:
    - Web
    - 漏洞复现
    - 笔记
permalink: /blog/2020/fortify/no-fules-file/found/
---

*	最近在接触代码审计的活儿。碰到了一些问题，随手记录下来。
	错误描述：当fortify开始java代码分析时，报错No rules files found;


# 1.错误描述
谷歌一波：
## 问题引出
stackoverflow原问题：
 ```javascript
 When I run a Fortify analysis against a Java project I receive this error :
 [warning]: No rules files found
 [error]: No rules files found
 Where can I configure the rules file ?
```
原答案：
```javascript
Navigate to the bin folder of your fortify installation
Enter scapostinstall
Enter 2 to select Settings
Enter 2 to select Proxy Server Host
Enter the name of the proxy server
Enter 3 to select Proxy Server Port.
Enter the proxy server's port number.
Exit and run fortifyupdate.cmd
```
原答案的意思就是说需要对fortify进行代理配置，(需科学上网)后进行规则库的下载配置。

# 2.解决问题

## 配置代码
进入fortify安装的目录，对fortify进行代理配置，配置过程代码如下：
```javascript
#进入fortify的安装目录(windows环境)
E:
cd fortify\bin\

E:\fortify\bin>scapostinstall
[1] Migration...
[2] Settings...
[s] Display all settings
[q] Exit
Please select the desired action (1,2,s,q): 2

[1] General...
[2] Fortify Update...
[3] Software Security Center Settings...
[s] Display all settings
[r] Return
[q] Exit
Please select the desired action (1,2,3,s,r,q): 2

[1] Update Server URL
[2] Proxy Server Host
[3] Proxy Server Port
[4] Proxy Server Username
[5] Proxy Server Password
[s] Display all settings
[r] Return
[q] Exit
Please select the desired action (1,2,3,4,5,s,r,q): 2

Proxy Server Host [default: ]: localhost

[1] Update Server URL
[2] Proxy Server Host
[3] Proxy Server Port
[4] Proxy Server Username
[5] Proxy Server Password
[s] Display all settings
[r] Return
[q] Exit
Please select the desired action (1,2,3,4,5,s,r,q): 3

Proxy Server Port [default: ]: 8080

[1] Update Server URL
[2] Proxy Server Host
[3] Proxy Server Port
[4] Proxy Server Username
[5] Proxy Server Password
[s] Display all settings
[r] Return
[q] Exit
Please select the desired action (1,2,3,4,5,s,r,q): q
```
以上fortify客户端配置代理结束，然后直接输入命令进行规则库下载更新：

## 更新文件
输入fortifyupdate更新命令，更新代码如下：
```javascript
E:\fortify\bin>fortifyupdate.cmd
Using proxy server: localhost:8080
Storing Updated Security Content ...
E:\fortify\Core\config\rules
Fortify Secure Coding Rules, Core, Annotations v2015.2.0.0008
Fortify Secure Coding Rules, Extended, JSP v2015.2.0.0008
Fortify Secure Coding Rules, Core, Classic ASP, VBScript, and VB6 v2015.2.0.0008
Fortify Secure Coding Rules, Core, ActionScript 3.0 v2015.2.0.0008
Fortify Secure Coding Rules, Core, C/C++ v2015.2.0.0008
Fortify Secure Coding Rules, Extended, Java v2015.2.0.0008
Fortify Secure Coding Rules, Core, Android v2015.2.0.0008
Fortify Secure Coding Rules, Core, COBOL v2015.2.0.0008
Fortify Secure Coding Rules, Extended, C/C++ v2015.2.0.0008
Fortify Secure Coding Rules, Core, .NET v2015.2.0.0008
Fortify Secure Coding Rules, Core Preview, ABAP v2014.4.0.0008
Fortify Secure Coding Rules, Extended, Configuration v2015.2.0.0008
Fortify Secure Coding Rules, Extended, Content v2015.2.0.0008
Fortify Secure Coding Rules, Core, Objective-C v2015.2.0.0008
Fortify Secure Coding Rules, Core, PHP v2015.2.0.0008
Fortify Secure Coding Rules, Core, ABAP v2015.2.0.0008
Fortify Secure Coding Rules, Extended, SQL v2015.2.0.0008
Fortify Secure Coding Rules, Core, JavaScript v2015.2.0.0008
Fortify Secure Coding Rules, Core, SQL v2015.2.0.0008
Fortify Secure Coding Rules, Extended, .NET v2015.2.0.0008
Fortify Secure Coding Rules, Core, Java v2015.2.0.0008
Fortify Secure Coding Rules, Core, Ruby v2015.2.0.0008
Fortify Secure Coding Rules, Core, ColdFusion v2015.2.0.0008
Fortify Secure Coding Rules, Core, Python v2015.2.0.0008
Removing Old Metadata Files ...
E:\fortify\Core\config\ExternalMetadata
Main External List Mappings v2019.1.0.0007
Storing Updated Metadata Files ...
E:\fortify\Core\config\ExternalMetadata
Main External List Mappings v2015.2.0.0008
```

# 结果

配置完就可以愉快地使用fortify进行机器扫描分析代码了。

`敬上。感谢您的阅读`<br>


参考：<br>
<a href="https://stackoverflow.com/questions/18209159/fortify-error-no-rules-file-found"> Fortify Error : “No rules file found”</a>

