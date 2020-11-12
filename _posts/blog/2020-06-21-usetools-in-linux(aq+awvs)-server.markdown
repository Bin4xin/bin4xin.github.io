---
title:      "「安全工具」:A-Web_Vuln_Scan和aq域名爆破工具"
author:     "Bin4xin"
catalog: true

article_header:
  type: cover
tags:
    - 笔记
    - 安全工具
    - 信息搜集

---

## aq域名工具

此处仅仅对于aq工具的报错进行部分记录，若存在无法解决的问题可以自行查询其他师傅的文章。

* gem换源
gem安装软件之前一定要换源；

```bash
gem sources --add https://gems.ruby-china.com/ --remove https://rubygems.org/
npm config set registry https://registry.npm.taobao.org
```

* 依赖报错

```bash
gem install aquatone && npm install electron && npm install nightmare
Building native extensions. This could take a while...
ERROR:  Error installing aquatone:
        ERROR: Failed to build gem native extension.

    current directory: /var/lib/gems/2.7.0/gems/ffi-1.13.1/ext/ffi_c
/usr/bin/ruby2.7 -I /usr/lib/ruby/2.7.0 -r ./siteconf20200713-12887-ohoa28.rb extconf.rb
mkmf.rb can't find header files for ruby at /usr/lib/ruby/include/ruby.h

You might have to install separate package for the ruby development
environment, ruby-dev or ruby-devel for example.

```
报什么依赖的错就安装上什么依赖，上面报的错单独拿下来，看到如下得报错。

* You might have to install separate package for the ruby development environment, ruby-dev or ruby-devel for example.

```bash
$ sudo apt install ruby-devel
把依赖安装上就可以了
```
然后重新执行：
```bash
Building native extensions. This could take a while...
Successfully installed ffi-1.13.1
Successfully installed childprocess-0.7.1
Successfully installed multi_xml-0.6.0
When you HTTParty, you must party hard!
Successfully installed httparty-0.14.0
Successfully installed aquatone-0.5.0
Parsing documentation for ffi-1.13.1
Installing ri documentation for ffi-1.13.1
Parsing documentation for childprocess-0.7.1
Installing ri documentation for childprocess-0.7.1
Parsing documentation for multi_xml-0.6.0
Installing ri documentation for multi_xml-0.6.0
Parsing documentation for httparty-0.14.0
Installing ri documentation for httparty-0.14.0
Parsing documentation for aquatone-0.5.0
Installing ri documentation for aquatone-0.5.0
Done installing documentation for ffi, childprocess, multi_xml, httparty, aquatone after 6 seconds
```
？
```bash
+———————————————+
|export LC_ALL=C|
+———————————————+
```

* npm换源
同gem:-)

```bash
npm install -g electron --registry=https://registry.npm.taobao.org

DEBUG=nightmare xvfb-run aquatone-gather -d ksyun.com --threads 10

npm install --save nightmare --unsafe-perm=true --allow-root --registry=https://registry.npm.taobao.org
https://gh0st.cn/archives/2018-09-02/1
```

#### 问题

* aq-gather的执行问题，报错有关于`nightmare`

同时这里aq存在一个问题，如果执行`aq-gather`报错那么就执行如下，就是下载一个shell脚本输出到bin文件夹下执行。

`wget "https://gist.githubusercontent.com/random-robbie/beae1991e9ad139c6168c385d8a31f7d/raw/aq.sh" -O /bin/aq && chmod 777 /bin/aq`
然后直接aq执行就可以。

* aq报错:issue running aquatone:issue running aquatone

```bash
goroutine 6807 [running]:
runtime.throw(0x14dee2a, 0x21)
```
指定参数threads和time：降低线程数和增大超时时间，这里可以自行查看一下线程数的指定参数和timeout的指定格式。


## awvs-linux安装
* awvs13还是很香的。

为了保护原始license不失效，这里尽快执行如下的命令，不然license会被修改然后就无法破解成功。

```bash
root@kali:~# chattr +i /home/acunetix/.acunetix_trial/data/license/license_info.json
root@kali:~# rm -fr /home/acunetix/.acunetix_trial/data/license/wa_data.dat
root@kali:~# touch /home/acunetix/.acunetix_trial/data/license/wa_data.dat
root@kali:~# chattr +i /home/acunetix/.acunetix_trial/data/license/wa_data.dat
```

* 个人强烈推荐：docker版本。

docker镜像下载的命令可以参考国光师傅的博客。
