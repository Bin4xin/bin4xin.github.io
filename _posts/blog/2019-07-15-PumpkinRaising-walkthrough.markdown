---
layout: post
toc: true
title: "「渗透」:PumpkinRaising-密码学的奥义"
date: 2019-07-15
author: Bin4xin
categories:
    - blog
    - Web
    - 漏洞复现
    - 渗透
    - vulnhub
permalink: /blog/2019/vulnhub/PumpkinRaising/
---

# 序言
hello,各位看官。最近忙里偷闲花了两天时间测试入侵了一个linux靶机，遂记录下。这个靶机我觉得挺适合刚入门的有一些基础的白帽子，对就是你！，大部分flag都是利用一些工具来获得。大佬看客笑看便是（手动狗头）。
整篇记录的都是小弟的思路，看官们跟着小弟的思路看就是了，会有些乱。见笑。
## 一、靶机
靶机来自vulnhub，下载地址如下：
```applescript
PumpkinRaising:
Download (Mirror): https://download.vulnhub.com/missionpumpkin/PumpkinRaising.ova
Download (Torrent): https://download.vulnhub.com/missionpumpkin/PumpkinRaising.ova.torrent
```
## 二、实战
##### 2.1 端口扫描
江湖规矩，神器开路：首先先用Nmap扫描确定靶机地址。发现开放的靶机ip。
![](https://p0.ssl.qhimg.com/t010c1840c959e8134a.png)

扫描一波（-O -A狗头）：

![](https://p3.ssl.qhimg.com/t01ff194e901205f336.png)

咱们发现没有多余的端口开放，中规中矩，22,80端口。附带扫出80端口下的robots.txt。小弟一个激灵，这么多？心里美滋滋一个一个打开看，不急，这次怕是十拿九稳（狗头）。22端口先不管他，小弟看到这么多内容的robots文件夹，如获至宝赶紧打开，我的乖，目录图片文件路径，先看看文件选项有没有什么线索。<br>
![](https://p3.ssl.qhimg.com/t01baf77d7e52ab7671.png)![](https://p2.ssl.qhimg.com/t01592ff5c4fb16339d.png)
#### 2.2 端口“踩点”——顺藤摸瓜
小弟试下来后发现文件只有如下能够访问：
 1）underconstruction.html：
（页面名意还在建设的页面）提示我们说图片下面有猫腻。咱们先把这个uc.gif图片下载下来试试水。
![](https://p5.ssl.qhimg.com/t0187d8d32b5c34eab1.png)<br>
正好小弟最近在研究图片隐写，丢到Stegsolve查看一波。跟普通图片差不多Alpha P 1-7都是空白
![](https://p2.ssl.qhimg.com/t01deeefa1b992646e8.png)
翻了又翻觉得RedP6、7有点异常，打开数据抽取查看源码没有收获（原谅小弟，小弟是noob~）；尝试了GRB各种组合，各种低0位，也尝试了提取bin都未提取出有用的信息。
![](https://p4.ssl.qhimg.com/t0119028a6f161c523b.png)<br>
忽然想到这个图片是gif，会不会有偏移呢？赶紧Stereogram Slover尝试偏移，不出所料也失败了，就这样在这张图片上浪费了不少时间。
![](https://p4.ssl.qhimg.com/t0121b77613838ce873.png)
<br>既然找不到有用的信息，那么这张图片先放一放。。不急，先往后面看。继续通过robots文件的内容查看。

 2）hidden目录的note文本
hidden目录下的note文本文件，显示了一些貌似账号密码的文本，难道是ssh的账号信息？不会这么简单吧，虽然嘴上说着不会，身体却很诚实去试了试，不行。。但是我们到现在还没有发现类似登陆页面的东西，也先放一放。<br>
![](https://p1.ssl.qhimg.com/t013f3a0f87bf8a5db2.png)<br>
 3） /seeds/seed.txt.gpg
访问后直接下载下来了，gpg？下载下来打开乱码，谷歌一哈搜到几个工具，我这里用的是kali的gpg（没用过可以自行百度有教程安装，几百K）<br>
![](https://p2.ssl.qhimg.com/t0141c9da199cb4f8b7.png)<br>
花了点时间摸索了一下发现了线索
![](https://p2.ssl.qhimg.com/t0140326759f7867d7e.png)<br>
看着像摩斯密码，丢到摩斯解密工具里解密，就这样小弟居然得到了第一个flag（id）：**69507**
![](https://p2.ssl.qhimg.com/t016ccf5c2ddccde9b6.png)<br>
#### 2.3 言归正传——80端口
咱们再来看看主页有些啥。80端口下静态页面~
![](https://p3.ssl.qhimg.com/t0151ecbad4d6538b86.png)
查看源码，得到两个有用的信息：
一段看上去像base64的密文，赶紧丢到解密工具解密，没有什么有用的信息：`This is just to remaind you that it's Level 2 of Mission-Pumpkin! ;)`
![](https://p0.ssl.qhimg.com/t01ceac35471f870459.png)
继续，一个url，转向pumpkin.html
![](https://p0.ssl.qhimg.com/t01dcbb84eaf2f983cb.png)
又是一串注释掉的密文字符串，丢base64解不出，试试base32解。
![](https://p4.ssl.qhimg.com/t013cdaaebc0abb1e13.png)<br>
解密为：/scripts/spy.pacp，访问一哈，下载下来一个tcp包文件，wireshark打开，随意点一个带有push字的包
![](https://p4.ssl.qhimg.com/t01a547d231be61f95d.png)<br>
发现明文传输，毫不犹豫追踪TCP流，发现ID：**50609**~lucky，不错哟
![](https://p0.ssl.qhimg.com/t01bdb3bf118ca2bfe9.png)<br>
**重点**来了：别忘了上面pumpkin.html右边的滑块，拉到底发现被注释掉的十六进制的数组，用网站工具解密，找到Seeds ID: **96454**（本人习惯比较差，不喜欢f12，所以这个点真的后知后觉才发现，小声bb）
![](https://p1.ssl.qhimg.com/t019011a2365ec4ab70.png)<br>
终于功夫不负有心人，已经解出三个id，根据作者靶机下载页面的提示一共有四个id。总结一下，还有一张gif图片藏着一个id，解密出来再加上已经解密出的三个id，就大功告成了。（这么自信？）
既然Stegsolve试了不行咱们就换一个，使用stegosuite解密，试了一下需要密码，忽然想到之前hidden目录下奇怪的字符，赶紧复制下来一个一个试，还是不行，提示密码错误。难受~难道是图片错了？果然，在小弟的坚持不懈的努力下，发现了猫腻。猫腻不在于图片下的隐写，而在于哪张图片。。。最后隐写图片是那张jackolatantern.gif。（靶机作者已经被我吐槽一万遍）
![](https://p0.ssl.qhimg.com/t01b84499f6fcadf696.png)<br>
提取文本，得到id：**86568**
![](https://p1.ssl.qhimg.com/t012f800923d47719dd.png)<br>
#### 2.4 id已齐，LetsGo
就这样，一共找到四个seeds id： 69507 96454 50609 86568
接着小弟看着这个四个id，猜测用户名jack并且陷入了深深的沉思，到底是用msf跑呢，还是海德拉~没错小弟就是这么纠结- -(脚本是python的内建函数写的文尾附上)
![](https://p5.ssl.qhimg.com/t01055293e5c3e16d1c.png)

## 三、组合拳——ssh,提权
最后还是用了最爱的msf跑出来密码（先用脚本组合四个id的不同组合即可），如图跑出来了。下一步ssh连吧。
![](https://p4.ssl.qhimg.com/t01902662105a1a24ca.png)<br>
ssh -l jack pass
![](https://p0.ssl.qhimg.com/t016216995943e58194.png)<br>
继续行云流水，sudo su。不行？最后参考资料提到权限。省去exp提权~
![](https://p4.ssl.qhimg.com/t01a3327fffc5a4be59.png)<br>

## 四、总结
总结下来，此次这个靶机的入侵过程虽然有些曲折，本菜也被误导到不少坑里~但是总体来说都不是很难，没有让我们来挖洞找页面漏洞来弹webshell，所以小弟认为比较适合一些有渗透基础的玩家~（对，就是我没错）。<br>

#### 参考资料
> https://www.360zhijia.com/anquan/413205.html
随机组合脚本:
```applescript
#a,b,c,d代替即可，别忘了python严格的缩进~
import itertools
	for i in itertools.permutations([a,b,c,d],4):
	print(i)
```
> have fun！guys.why not do it yourself?



