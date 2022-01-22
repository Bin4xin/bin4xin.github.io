---
layout: post
toc: true
title: "「排错」：Docker启动vulnhub报错排错"
date: 2020-09-11
author: Bin4xin
categories:
    - blog
tags:
    - docker
    - 技巧
    - Vulnhub
    - 笔记
permalink: /blog/2020/docker/vuln/problems/
---

最近在做靶场漏洞复现的时候发现了一个由web虚拟机和db虚拟机一起跑起来的联动靶场环境，下载完镜像后总是报错，思前想后都没办法，于是只能自己来解决问题，虽然结果令人大失所望，但是过程还是挺让人有成就感的，就记录了一下。

## #docker启服务
进入相对应的靶场环境文件夹下起靶场：
```bash
bin4xin@bin4xin's MacbookPro CVE-2020-9402 % docker-compose up -d
Creating network "cve-2020-9402_default" with the default driver
Creating cve-2020-9402_db_1 ... done
Creating cve-2020-9402_web_1 ... done
bin4xin@bin4xin's MacbookPro CVE-2020-9402 % docker-compose ps
       Name                      Command               State              Ports            
-------------------------------------------------------------------------------------------
cve-2020-9402_db_1    /entrypoint.sh                   Up      1521/tcp, 5500/tcp, 8080/tcp
cve-2020-9402_web_1   /docker-entrypoint.sh pyth ...   Up      0.0.0.0:8000->8000/tcp 
```
我们可以看到对应web服务的端口监听状态：`0.0.0.0:8000->8000/tcp`，所以我们直接访问试试看：
```bash
bin4xin@bin4xin's MacbookPro CVE-2020-9402 % curl localhost:8000
curl: (52) Empty reply from server
bin4xin@bin4xin's MacbookPro CVE-2020-9402 % docker-compose ps  
       Name                      Command               State              Ports            
-------------------------------------------------------------------------------------------
cve-2020-9402_db_1    /entrypoint.sh                   Up      1521/tcp, 5500/tcp, 8080/tcp
cve-2020-9402_web_1   /docker-entrypoint.sh pyth ...   Up      0.0.0.0:8000->8000/tcp 


bin4xin@bin4xin's MacbookPro CVE-2020-9402 % curl 127.0.0.1:8000/vuln
curl: (52) Empty reply from server
bin4xin@bin4xin's MacbookPro CVE-2020-9402 % docker-compose ps       
       Name                      Command               State              Ports            
-------------------------------------------------------------------------------------------
cve-2020-9402_db_1    /entrypoint.sh                   Up      1521/tcp, 5500/tcp, 8080/tcp
cve-2020-9402_web_1   /docker-entrypoint.sh pyth ...   Up      0.0.0.0:8000->8000/tcp 
```
在上面的bash终端代码我们可以看到，我们访问8000端口服务，都是返回`Empty reply from server`，我就很郁闷了，明明docker显示状态是`Up`状态，怎么访问时服务返回空呢。

## #排错

### #这是一个有脾气的容器
还是不甘心，看了一下本地的ip地址，再次访问看看：
```bash
bin4xin@bin4xin's MacbookPro shiro % ifconfig|grep inet                                                  
	inet 127.0.0.1 netmask 0xff000000 
	inet6 ::1 prefixlen 128 
	inet6 fe80::1%lo0 prefixlen 64 scopeid 0x1 
	inet6 fe80::aede:48ff:fe00:1122%en5 prefixlen 64 scopeid 0x7 
	inet6 fe80::146d:ed67:817a:e134%en0 prefixlen 64 secured scopeid 0x9 
	inet 114.97.221.67 netmask 0xfffffe00 broadcast 114.97.221.255
	inet6 fe80::24e6:3dff:fe1c:7c55%awdl0 prefixlen 64 scopeid 0x10 
	inet6 fe80::24e6:3dff:fe1c:7c55%llw0 prefixlen 64 scopeid 0x11 
	inet6 fe80::9a9a:9906:8f8d:5e0%utun0 prefixlen 64 scopeid 0x12 
	inet6 fe80::8ef2:d44b:f2b0:f37e%utun1 prefixlen 64 scopeid 0x13 

en0: flags=8863<UP,BROADCAST,SMART,RUNNING,SIMPLEX,MULTICAST> mtu 1500
	inet 114.97.221.67

bin4xin@bin4xin's MacbookPro shiro % curl http://114.97.221.67:8000/vuln
curl: (7) Failed to connect to 114.97.221.67 port 8000: Connection refused

bin4xin@bin4xin's MacbookPro shiro % docker-compose ps                  
       Name                      Command                 State                 Ports            
------------------------------------------------------------------------------------------------
cve-2020-9402_db_1    /entrypoint.sh                   Up           1521/tcp, 5500/tcp, 8080/tcp
cve-2020-9402_web_1   /docker-entrypoint.sh pyth ...   Restarting 
```
好家伙，这次直接web服务重启了，有脾气。没办法，直接把整个环境down掉重启。

### #进容器
这次我想到的办法是直接进容器里面去看看服务到底发生了什么：
```bash
docker ps

a66976bc6d2b        cve-2020-9402_web      "/docker-entrypoint.…"   4 seconds ago       Up 3 seconds        0.0.0.0:8000->8000/tcp         cve-2020-9402_web_1
fc99758ce428        vulhub/oracle:12c-ee   "/entrypoint.sh"         5 seconds ago       Up 3 seconds        1521/tcp, 5500/tcp, 8080/tcp   cve-2020-9402_db_1
```
我们可以通过`docker ps`来查看docker镜像`cve-2020-9402_web`对应的`CONTAINER ID`，通过这个id值进入容器；
```bash
bin4xin@bin4xin's MacbookPro CVE-2020-9402 % sudo docker exec -it a66976bc6d2b /bin/bash
root@a66976bc6d2b:/usr/src# 
root@a66976bc6d2b:/usr/src# ps -ef
UID        PID  PPID  C STIME TTY          TIME CMD
root         1     0  0 06:44 ?        00:00:00 /bin/bash /docker-entrypoint.sh python manage.py runserver 0.0.0.0:8000
root         7     1  0 06:44 ?        00:00:00 bash /usr/local/bin/wait-for-it.sh -t 0 db:1521 -- echo oracle is up
root        56     0  0 06:45 pts/0    00:00:00 /bin/bash
root        73     7  0 06:45 ?        00:00:00 sleep 1
root        74    56  0 06:45 pts/0    00:00:00 ps -ef
```
看了一下，没什么大问题啊，服务该照常启动的都启动了，难道是db服务的问题？就在我疑惑的时候，果然：容器又重启了，我的shell直接掉了，查看一下状态，可不咋地，又restart了，心里苦阿。
```bash
bin4xin@bin4xin's MacbookPro CVE-2020-9402 % docker ps

CONTAINER ID        IMAGE                  COMMAND                  CREATED             STATUS                         PORTS                          NAMES
a66976bc6d2b        cve-2020-9402_web      "/docker-entrypoint.…"   2 minutes ago       Restarting (1) 2 seconds ago
```

## #日志排错:-)
排错之前看一下docker的打印日志指南
```bash
% docker logs --help

Usage:  docker logs [OPTIONS] CONTAINER

Fetch the logs of a container

Options:
      --details        Show extra details provided to logs
  -f, --follow         Follow log output
      --since string   Show logs since timestamp (e.g. 2013-01-02T13:23:37) or relative (e.g. 42m for 42 minutes)
      --tail string    Number of lines to show from the end of the logs (default "all")
  -t, --timestamps     Show timestamps
      --until string   Show logs before a timestamp (e.g. 2013-01-02T13:23:37) or relative (e.g. 42m for 42 minutes)
```
我们可以看到，f参数对应的是log查看的容器id，而我的需求是，对应查看某一个时间段之后的db虚拟机的日志，所以生成命令：`docker logs --since 2020-09-11T14:50:00  -f b5731d06d3ea`
web的日志:
```bash
bin4xin@bin4xin's MacbookPro shiro % docker logs --since 2020-09-11T14:40:00  -f ae715c332e7e
+ cd /usr/src
+ wait-for-it.sh -t 0 db:1521 -- echo 'oracle is up'
wait-for-it.sh: waiting for db:1521 without a timeout
wait-for-it.sh: db:1521 is available after 60 seconds
oracle is up
```
我们可以看到没有任何报错；继续，看下面的报错：
```bash
+ python manage.py makemigrations
Traceback (most recent call last):
  File "/usr/local/lib/python3.6/site-packages/django/db/backends/base/base.py", line 220, in ensure_connection
    self.connect()
  File "/usr/local/lib/python3.6/site-packages/django/utils/asyncio.py", line 26, in inner
    return func(*args, **kwargs)
  File "/usr/local/lib/python3.6/site-packages/django/db/backends/base/base.py", line 197, in connect
    self.connection = self.get_new_connection(conn_params)
  File "/usr/local/lib/python3.6/site-packages/django/utils/asyncio.py", line 26, in inner
    return func(*args, **kwargs)
  File "/usr/local/lib/python3.6/site-packages/django/db/backends/oracle/base.py", line 232, in get_new_connection
    **conn_params,
cx_Oracle.DatabaseError: ORA-12505: TNS:listener does not currently know of SID given in connect descriptor


The above exception was the direct cause of the following exception:

Traceback (most recent call last):
  File "manage.py", line 21, in <module>
    main()
·中间部分省略
·中间部分省略
·中间部分省略
    **conn_params,
django.db.utils.DatabaseError: ORA-12505: TNS:listener does not currently know of SID given in connect descriptor
```
查看报错是db的报错，赶紧看看db虚拟机的日志情况`docker logs --since 2020-09-11T14:40:00  -f b32b16e34b6c`
db：
```bash
ls: cannot access /u01/app/oracle/oradata/orcl: No such file or directory
No databases found in /u01/app/oracle/oradata/orcl. About to create a new database instance
Starting database listener

LSNRCTL for Linux: Version 12.1.0.2.0 - Production on 11-SEP-2020 06:54:05

Copyright (c) 1991, 2014, Oracle.  All rights reserved.

Starting /u01/app/oracle/product/12.1.0.2/dbhome_1/bin/tnslsnr: please wait...

TNSLSNR for Linux: Version 12.1.0.2.0 - Production
System parameter file is /u01/app/oracle/product/12.1.0.2/dbhome_1/network/admin/listener.ora
Log messages written to /u01/app/oracle/diag/tnslsnr/b32b16e34b6c/listener/alert/log.xml
Listening on: (DESCRIPTION=(ADDRESS=(PROTOCOL=tcp)(HOST=b32b16e34b6c)(PORT=1521)))

Connecting to (DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=b32b16e34b6c)(PORT=1521)))
STATUS of the LISTENER
------------------------
Alias                     LISTENER
Version                   TNSLSNR for Linux: Version 12.1.0.2.0 - Production
Start Date                11-SEP-2020 06:54:05
Uptime                    0 days 0 hr. 0 min. 0 sec
Trace Level               off
Security                  ON: Local OS Authentication
SNMP                      OFF
Listener Parameter File   /u01/app/oracle/product/12.1.0.2/dbhome_1/network/admin/listener.ora
Listener Log File         /u01/app/oracle/diag/tnslsnr/b32b16e34b6c/listener/alert/log.xml
Listening Endpoints Summary...
  (DESCRIPTION=(ADDRESS=(PROTOCOL=tcp)(HOST=b32b16e34b6c)(PORT=1521)))
The listener supports no services
The command completed successfully
Copying database files
1% complete
3% complete
11% complete
18% complete
```
数据库服务似乎已经启动起来了，但是数据库文件还在复制过程中：`Copying database files`，那就等待文件复制完成试试看是不是复制文件的行为。
```bash
100% complete
Look at the log file "/u01/app/oracle/cfgtoollogs/dbca/orcl/orcl.log" for further details.

LSNRCTL for Linux: Version 12.1.0.2.0 - Production on 11-SEP-2020 07:00:33

Copyright (c) 1991, 2014, Oracle.  All rights reserved.

Connecting to (DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=b32b16e34b6c)(PORT=1521)))
The command completed successfully
Database has been created in /u01/app/oracle/oradata/orcl
SYS and SYSTEM passwords are set to [oracle]
Setting HTTP port to 8080

PL/SQL procedure successfully completed.

Please login to http://<ip_address>:8080/em to use enterprise manager
User: sys; Password oracle; Sysdba: true
Fixing permissions...
Running init scripts...
Init scripts in /oracle.init.d/: Ignoring /oracle.init.d/*

Done with scripts we are ready to go
```
难道是因为db的原因导致web服务报错，而且恰好报错是oracle数据库的错，而又恰好我们看日志时是存在这样的情况的。返回去在看web虚拟机的日志，果然：db虚拟机数据库文件拷贝完成后，这边web虚拟机重启后启动服务就没有报错了，服务跑在8000端口。
```bash
+ cd /usr/src
+ wait-for-it.sh -t 0 db:1521 -- echo 'oracle is up'
wait-for-it.sh: waiting for db:1521 without a timeout
wait-for-it.sh: db:1521 is available after 0 seconds
oracle is up
+ python manage.py makemigrations
Migrations for 'vuln':
  vuln/migrations/0001_initial.py
    - Create model Names
    - Create model Collection
    - Create model Collection2
+ python manage.py migrate
Operations to perform:
  Apply all migrations: admin, auth, contenttypes, sessions, vuln
Running migrations:
  Applying contenttypes.0001_initial... OK
  Applying auth.0001_initial... OK
  Applying admin.0001_initial... OK
  Applying admin.0002_logentry_remove_auto_add... OK
  Applying admin.0003_logentry_add_action_flag_choices... OK
  Applying contenttypes.0002_remove_content_type_name... OK
  Applying auth.0002_alter_permission_name_max_length... OK
  Applying auth.0003_alter_user_email_max_length... OK
  Applying auth.0004_alter_user_username_opts... OK
  Applying auth.0005_alter_user_last_login_null... OK
  Applying auth.0006_require_contenttypes_0002... OK
  Applying auth.0007_alter_validators_add_error_messages... OK
  Applying auth.0008_alter_user_username_max_length... OK
  Applying auth.0009_alter_user_last_name_max_length... OK
  Applying auth.0010_alter_group_name_max_length... OK
  Applying auth.0011_update_proxy_permissions... OK
  Applying sessions.0001_initial... OK
  Applying vuln.0001_initial... OK
+ python manage.py loaddata collection.json
Installed 8 object(s) from 1 fixture(s)
+ python manage.py shell -c 'from django.contrib.auth.models import User; User.objects.create_superuser('\''admin'\'', '\''admin@vulhub.org'\'', '\''admin'\'') if not User.objects.filter(username='\''admin'\'').exists() else 0'
+ exec python manage.py runserver 0.0.0.0:8000
```
## #令人失望的结果
`exec python manage.py runserver 0.0.0.0:8000`看到这个日志打印出来，觉得好像确实没有什么问题了，再来查看一下docker的状态。
```bash
bin4xin@bin4xin's MacbookPro CVE-2020-9402 % docker-compose ps
       Name                      Command               State              Ports            
-------------------------------------------------------------------------------------------
cve-2020-9402_db_1    /entrypoint.sh                   Up      1521/tcp, 5500/tcp, 8080/tcp
cve-2020-9402_web_1   /docker-entrypoint.sh pyth ...   Up      0.0.0.0:8000->8000/tcp    
```
看一眼docker的情况，都是up状态。访问一下8000端口终于也可以访问到web服务了，不再是`Empty reply from server`了。
```bash  
bin4xin@bin4xin's MacbookPro CVE-2020-9402 % curl localhost:8000
<!DOCTYPE html>
<html lang="en">
<head>
  <meta http-equiv="content-type" content="text/html; charset=utf-8">
  <title>Page not found at /</title>
  <meta name="robots" content="NONE,NOARCHIVE">
  <style type="text/css">
    html * { padding:0; margin:0; }
    body * { padding:10px 20px; }
    body * * { padding:0; }
    body { font:small sans-serif; background:#eee; color:#000; }
    body>div { border-bottom:1px solid #ddd; }
    h1 { font-weight:normal; margin-bottom:.4em; }
    h1 span { font-size:60%; color:#666; font-weight:normal; }
    table { border:none; border-collapse: collapse; width:100%; }
    td, th { vertical-align:top; padding:2px 3px; }
    th { width:12em; text-align:right; color:#666; padding-right:.5em; }
    #info { background:#f6f6f6; }
    #info ol { margin: 0.5em 4em; }
    #info ol li { font-family: monospace; }
    #summary { background: #ffc; }
    #explanation { background:#eee; border-bottom: 0px none; }
  </style>
```
web访问日志：
```bash
Watching for file changes with StatReloader
Not Found: /
[11/Sep/2020 07:01:23] "GET / HTTP/1.1" 404 2137

Not Found: /
[11/Sep/2020 07:06:47] "GET / HTTP/1.1" 404 2141
```


```bash
---
Parameter: q (GET)
    Type: boolean-based blind
    Title: Oracle boolean-based blind - Parameter replace
    Payload: q=(SELECT (CASE WHEN (6457=6457) THEN 6457 ELSE CAST(1 AS INT)/(SELECT 0 FROM DUAL) END) FROM DUAL)

    Type: time-based blind
    Title: Oracle time-based blind - Parameter replace (DBMS_PIPE.RECEIVE_MESSAGE)
    Payload: q=(SELECT (CASE WHEN (6135=6135) THEN DBMS_PIPE.RECEIVE_MESSAGE(CHR(83)||CHR(74)||CHR(88)||CHR(115),5) ELSE 6135 END) FROM DUAL)
---
[15:22:11] [INFO] the back-end DBMS is Oracle
back-end DBMS: Oracle
```
