---
layout: post
title: "ICT network security CTF 2022 walkthrough"
date: 2022-09-30 10:23:43+800
author: Bin4xin
toc: true
categories:
- blog
tags:
- 笔记
- CTF
permalink: /blog/2022/ICT-network-security-CTF-2022-walkthrough/
---

## Misc

### 奇怪的AES

![2022-09-30-10.10.29.png](https://image.yjs2635.xyz/images/2022/09/30/2022-09-30-10.10.29.png)

#### 题目代码

```python
from Crypto.Cipher import AES

def f(x):
    return (x-2)**3

def fd(x):
    return 3*((x-2)**2)

def newtonMethod(n,assum):
    time = n
    x = assum
    a = f(x)
    b = fd(x)
    if f(x) == 0.0:
        return time,x
    else:
        next = x-a/b

    if a - f(next)<1e-6:
        key = str(x)[-16:] * 2
        return key
    else:
        return newtonMethod(n+1,next)

def Fake_CBC(key, plain):
    if len(key) != 32:
        return "error!"
    cipher_txt = b""
    cipher_arr = []
    cipher = AES.new(key, AES.MODE_ECB)
    plain = [plain[i:i + 32] for i in range(0, len(plain), 32)]
    plain_bytes = []
    for i in range(len(plain)):
        plain_bytes.append(bytes(plain[i],encoding="utf-8"))
    cipher_arr.append(cipher.encrypt(plain_bytes[0]))
    cipher_txt += cipher_arr[0]
    for i in range(1, len(plain)):
        cipher = AES.new(cipher_arr[i - 1], AES.MODE_ECB)
        cipher_arr.append(cipher.encrypt(plain_bytes[i]))
        cipher_txt += cipher_arr[i]
    return cipher_txt

key = bytes(newtonMethod(0,X0),encoding = "utf-8")

with open("flag.txt", "r") as ff:
    s = ff.read()
    ff.close()

with open("flag_cipher", "wb") as ff:
    ff.write(Fake_CBC(key, s))
    ff.close()
```

#### exp代码

```python
from Crypto.Cipher import AES

for X0 in range(0,11):
    def f(x):
        return (x-2)**3

    def fd(x):
        return 3*((x-2)**2)

    def newtonMethod(n,assum):
        time = n
        x = assum
        a = f(x)
        b = fd(x)
        if f(x) == 0.0:
            return time,x
        else:
            next = x-a/b

        if a - f(next)<1e-6:
            key = str(x)[-16:] * 2
            return key
        else:
            return newtonMethod(n+1,next)
    print(X0)
    try:
        key = bytes(newtonMethod(0,X0),encoding = "utf-8")
        with open(r'flag_cipher','rb') as f:
            s=f.read()
            cipher = AES.new(key, AES.MODE_ECB)
            aes = AES.new(s[:32], AES.MODE_ECB)
            t = aes.decrypt(s[32:64])
            print(cipher.decrypt(s[:32])+t)
    except Exception as e:
        print(e)
```

- 得到flag

![2022-09-30-10.28.25.png](https://image.yjs2635.xyz/images/2022/09/30/2022-09-30-10.28.25.png)