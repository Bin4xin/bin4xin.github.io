---
layout: about
category: about
wrench: 2021-11-19
toc: true
Researchname: CTF - 密码学与杂项
author: Bin4xin
permalink: /about/CTF-Crypto-and-Misc-etc-WalkThrough/
desc: 「CTF」
---

# 零：Crypto

## RSA题型

> *Tips：RSA加解密的算法完全相同，公钥加密体制中，一般用公钥加密，私钥解密，设 c 为明文，m 为密文；公式如下：*

$$ c ≡ m^e mod \quad n\\m ≡ c^d mod \quad n$$

> RSA 的算法涉及三个参数，n、e、d：
>
> n是两个大质数 p、q 的积，n 的二进制表示所占用的位数，就是所谓的密钥长度；
>
> e 和 d 是一对相关的值，e 可以任意取，但要求 e 与(p-1)(q-1)互质，再选择 d；

- 其中，p、q为质数，n、e、d计算如下：

$$n = p * q$$

$$ø(n) = (p - 1) * (q - 1)$$

$$ed ≡ 1\ mod\ ø(n) $$

*（n，e),(n，d)就是密钥对。其中(n，e)为公钥，(n，d)为私钥。*

### # 0x01 公钥加密文

- 题干：给出公钥文件：`.pem/.pub`后缀文件、密文：`.enc`之类后缀的文件；
    - [例题1](https://github.com/Bin4xin/bigger-than-bigger/blob/master/CTF/Crypto/例题1.zip){:target="_blank"}
    - [例题2](https://github.com/Bin4xin/bigger-than-bigger/blob/master/CTF/Crypto/例题2.zip){:target="_blank"}
- 解法：分析`pem/pub`文件恢复私钥，通过私钥对enc文件进行解密得到flag；

例题1文件如下：

```bash
➜ ll
-rw-r--r--@  1 bin4xin  staff   32  4 29  2016 flag.enc
-rw-r--r--@  1 bin4xin  staff  138  4 29  2016 pubkey.pem

➜ file flag.enc
flag.enc: data
➜ file pubkey.pem
pubkey.pem: ASCII text
➜ cat pubkey.pem
-----BEGIN PUBLIC KEY-----
MDwwDQYJKoZIhvcNAQEBBQADKwAwKAIhAMJjauXD2OQ/+5erCQKPGqxsC/bNPXDr
yigb/+l/vjDdAgMBAAE=
-----END PUBLIC KEY-----
```

- 解([3summer/CTF-RSA-tool](https://github.com/3summer/CTF-RSA-tool){:target="_blank"})：

```bash
solve.py --verbose -k pubkey.pem --decrypt flag.enc`
```

![zct5knF6u7BvrES.png](https://image.yjs2635.xyz/images/2022/02/20/zct5knF6u7BvrES.png)

同样的：例题2类似：

```bash
$ rsatools --publickey public.pem  --uncipherfile flag.enc
private argument is not set, the private key will not be displayed, even if recovered.

[*] Testing key public.pem.
[*] Performing pastctfprimes attack on public.pem.
 90%|█████████████████████████████████████████████████████████████████████▌    / 102/113 [00:00<00:00, 1445.70it/s]
[*] Attack success with pastctfprimes method !

Results for public.pem:

Unciphered data :
HEX : 0x61666374667b5235345f7c355f24305f423072696e397d
INT (big endian) : 9329062300443879711046737916988523093598680555377801597
INT (little endian) : 11994109012077315504651226639166102749077267728721733217
utf-8 : afctf{R54_|5_$0_B0rin9}
STR : b'afctf{R54_|5_$0_B0rin9}'
···
```

### # 0x02 文本

赛题给出一段文本，主要考察RSA公式的用法，考虑已知变量，使用什么攻击手法；

题干：
在一次RSA密钥对生成中，假设p=473398607161，q=4511491，e=17，求解出d

直接用后面三个公式：

$$n=pq=473398607161*4511491\\ø(n) = (473398607161 - 1) * (4511491 - 1)\\17*d ≡ 1\ mod\ ø(n)$$

也就是：

$$\frac{17d-1}{ø(n)} = int() = \frac{17d-1}{2135733082216268400}\\d=\frac{2135733082216268401}{17}=125631357777427553$$

同样也可以通过rsatools来解：
```bash
➜ ln -s /{path/to}/CTF-RSA-tool/solve.py /usr/local/bin/rsatools
➜ rsatools --verbose --private -N 2135733555619387051 -e 17 -p 473398607161 -q 4511491
```

![DJtV9CZhLsSq8AY.png](https://image.yjs2635.xyz/images/2022/02/20/DJtV9CZhLsSq8AY.png)

### # 0x03 流量（.pcap）文件

> 有时出题人会给你一个流量包，你需要用wireshark等工具分析，然后根据流量包的通信信息，分析题目考察的攻击方
> 
> 法，你可以提取出所有你解题需要用到的参数，然后进行解密

举例题目暂时没有遇到，有的话会补上[...]

### # 0x04 本地脚本分析

> 题目会给你一个脚本和一段密文，一般为python编写，你需要逆向文件流程，分析脚本的加密过程，写出对应的解密脚本进行解密

```bash
from Crypto.Util.number import *
import binascii
import gmpy2
flag = '*****************************************'
hex_flag=int(flag.encode("hex"),16)

p=getPrime(256)
q=getPrime(256)
n=p*q

e=0x3
c1=pow(hex_flag,e,n)
c2=pow(hex_flag+1,e,n)

print("n=",hex(n))
print("e=",hex(e))
print("c1=",hex(c1))
print("c2=",hex(c2))

#('n=', '0xb28ae8f29f8b90e8b8c5667b2b71e49929446b41f7f7a3e9e45bc52a1e8c45d59c1788be48a9c365d51feee0b2cd3295001cdad1ba5ccf808686b5ce5a269ae5L')
#('e=', '0x3')
#('c1=', '0x7ba5502ecbc3b15ad8c2db8f30a593eb062dde4d7dfacadf0a28291d1a576389a18dfba0607c0243f843f637449089dd2090d47ee9845d4147f02afd4d891f19L')
#('c2=', '0x891ac4f663df41c1f6433ee3513d749c3ba02fe0aacd7f51d791b9bac4f7e5194bd484d78d972c344faf600f7d3aa580485774768efc47ab8ddb67eeeb330fa1L')
```
如上所示，已知n、e、c1、c2和、c2的表达式；我们可以求出`hex_flag`的值：

$$ \left\{

\begin{aligned}

c1 ≡ hexflag^3 & (mod \quad n)\\

c2 ≡ (hexflag+1)^3 & (mod \quad n)\\

\end{aligned}

\right.$$



> *Tips：*这里pow(a,b,c)的意思就是取模，为：
>
> $$pow(a,b,c) = a^b mod \quad c\\eg: 7^1 mod \  3 = 1$$
>
>       >>> a=7
>       >>> b=1
>       >>> c=3
>       >>> n=pow(a,b,c)
>       >>> print n

- 看起来很简单，把`hex_flag`算出来自然flag就出来了，但是实际上我们需要做的是把上面的数学公式输出成代码，因为给出的已知数太大；所以需要公式推导来生成代码：

$$ \because \quad c = pow(mm+padding,e,n)\\

\therefore \quad \left\{

\begin{aligned}

c_1 ≡ (m+padding_1)^e & (mod n)\\

c_2 ≡ (m+padding_2)^e & (mod n)\\

\end{aligned}

\right.\\

令：m_1=m+padding_1 , m_2=m+padding_2; \\

\therefore \quad m_1-m_2 =  padding_1 - padding_2\\

\therefore \quad \left\{

                 \begin{aligned}

                 f(x)=ax+b\\

                 m_1=m_2+(padding_1 + padding_2)\\

                 \end{aligned}

                 \right.\\

\therefore \quad f(m_1) = am_2 + b\\

由 \ c ≡ m^e \ mod \ n ，代入c_1 、c_2 \\ \therefore \quad \left\{

                                                            \begin{aligned}

                                                            c_1 ≡ m_1^e & (mod \ n)\\

                                                            c_2  ≡ m_2^e & (mod \ n)\\

                                                            \end{aligned}

                                                            \right.\\

又 \because \ m_1 = am_2 + b \\ \therefore \quad \left\{

                                                     \begin{aligned}

                                                     c_1 ≡ (am_2 + b)^e & (mod \ n)\\

                                                     c_2  ≡ m_2^e & (mod \ n)\\

                                                     \end{aligned}

                                                     \right.\\

代入e=3 ，展开 \\ \therefore \quad (am_2+b)^3 = a^3m_2^3 + 3b(am_2)^2 + 3am_2b^2 + b^3\\

\therefore \quad c_1 ≡ a^3m_2^3 + 3b(am_2)^2 + 3am_2b^2 + b^3 mod \ n\\

\therefore \quad c_1  ≡ a^3m_2^3 + 3ba^2m_2^2 + 3b^2am_2 + 3b^3 - 2b^3 mod \ n\\

\therefore \quad c_1 - a^3m_2^3 + 2b^3 ≡ 3b(a^2m_2^2 + bam_2 + b^2) mod \ n \\

又\because \quad (am_2)^3 - b^3 ≡ (am_2 - b)(a^2m_2^2 + bam_2 + b^2) \\

\therefore \quad \left\{  \begin{aligned}

         c_1 - a^3m_2^3 + 2b^3 ≡ 3b(a^2m_2^2 + bam_2 + b^2) mod \ n \qquad (1) \\

         (am_2)^3 - b^3 ≡ (am_2 - b)(a^2m_2^2 + bam_2 + b^2) mod \ n  \qquad (2) \\

         c_2 ≡ m_2^3 \ mod \ n \qquad (3)\\ 

         \end{aligned}

         \right.\\

\therefore \quad \left\{  \begin{aligned}

         (am_2-b)(c_1 - a^3m_2^3 + 2b^3) ≡ (am_2-b)[3b(a^2m_2^2 + bam_2 + b^2)] mod \ n\\

         3b[(am_2)^3 - b^3] ≡ 3b(am_2 - b)(a^2m_2^2 + bam_2 + b^2) mod \ n \\

         \end{aligned}

         \right.\\

\therefore \quad (am_2-b)(c_1 - a^3m_2^3 + 2b^3) ≡ 3b[(am_2)^3 - b^3] mod \ n \\

代入：(c_1 - a^3c_2 + 2b^3)(am_2 - b) ≡ 3b(a^3c_2 - b^3) mod \ n \\

\because \quad m = m_2 -padding_2\\

\therefore \quad m ≡ (\frac{3b(a^3c_2-b^3)}{c_1-a^3c_2+2b^3}+b) \ a - padding2 \ mod \ n (求a的逆元)\\

$$

既然推导出了公式，写脚本即可
```python
import gmpy
import binascii

def getM2(a,b,c1,c2,n,e):
	a3 = pow(a,e,n)
	b3 = pow(b,e,n)
	first = c1-a3*c2+2*b3
	print("first:")
	print(first)
	first = first % n
	second = e*b*(a3*c2-b3)
	second = second % n
	third = second*gmpy.invert(first,n)
	third = third % n
	fourth = (third+b)*gmpy.invert(a,n)
	return fourth % n

e=0x3
a=1
b=-1 #padding1-padding2
c1=0x7ba5502ecbc3b15ad8c2db8f30a593eb062dde4d7dfacadf0a28291d1a576389a18dfba0607c0243f843f637449089dd2090d47ee9845d4147f02afd4d891f19
c2=0x891ac4f663df41c1f6433ee3513d749c3ba02fe0aacd7f51d791b9bac4f7e5194bd484d78d972c344faf600f7d3aa580485774768efc47ab8ddb67eeeb330fa1
padding2=1 #padding2
n=0xb28ae8f29f8b90e8b8c5667b2b71e49929446b41f7f7a3e9e45bc52a1e8c45d59c1788be48a9c365d51feee0b2cd3295001cdad1ba5ccf808686b5ce5a269ae5

m = getM2(a,b,c1,c2,n,e)-padding2

#print m
#print hex(m)
#print binascii.unhexlify(hex(m))
print(binascii.unhexlify(hex(m)[2:].strip("L")))
```

> **binascii.unhexlify**：返回由十六进制字符串 hexstr 表示的二进制数据。此函数功能与 b2a_hex() 相反。 hexstr 必须包含偶数个十六进制数
> 字（可以是大写或小写），否则会引发Error 异常。

![czQdGEHUNkomajY.png](https://image.yjs2635.xyz/images/2022/02/20/czQdGEHUNkomajY.png)

## 算法解密

### # 0x05 栅栏算法

> 题目描述：被小鱼一连将了两军，你心里更加不服气了。两个人一起继续往前走， 
> 一路上杂耍卖艺的很多，但是你俩毫无兴趣，直直的就冲着下一个谜题的地方去了。 
> 到了一看，这个谜面看起来就已经有点像答案了样子了，旁边还画着一张画，是一副农家小院的 
> 图画，上面画着一个农妇在`栅栏里面喂5只小鸡`，你嘿嘿一笑对着小鱼说这次可是我先找到答案了。

题干：
- 给出文件字符串`ccehgyaefnpeoobe{lcirg}epriec_ora_g`
- 栅栏里面喂5只小鸡；栅栏算法，5

![FGzs62Pk3TD5cCZ.png](https://image.yjs2635.xyz/images/2022/02/20/FGzs62Pk3TD5cCZ.png)

### # 0x06 凯撒密码

[...]

### # 0x07 摩尔斯电码 · morse

题干1：
- 给出一串数字`11 111 010 000 0 1010 111 100 0 00 000 000 111 00 10 1 0 010 0 000 1 00 10 110`，根据1高位/0低位转换为摩丝码最终转换即可

![kTxuAnpBhWwHMaR.png](https://image.yjs2635.xyz/images/2022/02/20/kTxuAnpBhWwHMaR.png)

**值得注意的是，就如上面的题干一样，有时给出的题目不一定会那么耿直让你一眼看出来或者用工具转换出来，需要做一些其他的转换：**

题干2:

```
--/.-/-.--/..--.-/-..././..--.-/..../.-/...-/./..--.-/.-/-./---/-/...././.-./..--.-/-.././-.-./---/-.././..../..../..../..../.-/.-/.-/.-/.-/-.../.-/.-/-.../-.../-.../.-/.-/-.../-.../.-/.-/.-/.-/.-/.-/.-/.-/-.../.-/.-/-.../.-/-.../.-/.-/.-/.-/.-/.-/.-/-.../-.../.-/-.../.-/.-/.-/-.../-.../.-/.-/.-/-.../-.../.-/.-/-.../.-/.-/.-/.-/-.../.-/-.../.-/.-/-.../.-/.-/.-/-.../-.../.-/-.../.-/.-/.-/-.../.-/.-/.-/-.../.-/.-/-.../.-/-.../-.../.-/.-/-.../-.../-.../.-/-.../.-/.-/.-/-.../.-/-.../.-/-.../-.../.-/.-/.-/-.../-.../.-/-.../.-/.-/.-/-.../.-/.-/-.../.-/.-/-.../.-/.-/.-/.-/-.../-.../.-/-.../-.../.-/.-/-.../-.../.-/.-/-.../.-/.-/-.../.-/.-/.-/-.../.-/.-/-.../.-/.-/-.../.-/.-/-.../.-/-.../.-/.-/-.../-.../.-/-.../.-/.-/.-/.-/-.../-.../.-/-.../.-/.-/-.../-.../.-
```

很明显题1是空格分割，那么题2就是`/`分割，当然也可以把斜杠换成空格在转换，都是一样的；

![cEa31ujitTUCgnW.png](https://image.yjs2635.xyz/images/2022/02/20/cEa31ujitTUCgnW.png)

通过算法转换后给出：
```
MAY_BE_HAVE_ANOTHER_DECODEHHHHAAAAABAABBBAABBAAAAAAAABAABABAAAAAAABBABAAABBAAABBAABAAAABABAABAAABBABAAABAAABAABABBAABBBABAAABABABBAAABBABAAABAABAABAAAABBABBAABBAABAABAAABAABAABAABABAABBABAAAABBABAABBA
```

很明显是2次加密，AB混合的字符串；有Crypto CTF经验的大手子们一眼就能看出来，培根编码：

![PvbsEjXrCF2KfVN.png](https://image.yjs2635.xyz/images/2022/02/20/PvbsEjXrCF2KfVN.png)

小写：

```bash
>>> s="ATTACKANDDEFENCEWORLDISINTERESTING"
>>> print(s.lower())
attackanddefenceworldisinteresting
```

## 参考

- [RSA算法原理（一）](https://www.ruanyifeng.com/blog/2013/06/rsa_algorithm_part_one.html){:target="_blank"}
- [RSA算法原理（二）](https://www.ruanyifeng.com/blog/2013/07/rsa_algorithm_part_two.html){:target="_blank"}
- [CTF中RSA题型解题思路及技巧](https://www.freebuf.com/articles/others-articles/161475.html){:target="_blank"}
- [RSA 加密算法主要公式](https://cloud.tencent.com/developer/article/1686989){:target="_blank"}
- [浅析RSA Padding Attack](https://www.anquanke.com/post/id/158944){:target="_blank"}