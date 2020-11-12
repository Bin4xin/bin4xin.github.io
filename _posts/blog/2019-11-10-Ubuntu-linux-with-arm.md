---
title: 「移植」Ubuntu With Arm公网存储容器搭建记录
author:     "Bin4xin"

tags:
    - Debian Linux
    - 软件移植
    - ARM
article_header:
  type: cover
  image:
    src: img/post-bg/ubuntu-bg.jpg
catalog: true

    
---
> 声明：本文章首发于华为云鲲鹏社区，同步于作者个人博客:)

鲲鹏云服务器`Ubuntu 18.04 64bit` with `ARM`

`PHP`+`NGINX`软链接演示

> 摘要：华为云社区的活动好多～最近领了个ARM云服务器。打算用服务器搭建一个云存储服务容器方便自己上传论文，说干就干，于是就是在网上找了个开源的项目。下载压缩包下来完事，发现没有php环境，得自己配置。行吧，自己配。

<p>
    <br/>
</p>

## 1.安装nginx网站服务器


### 1.1 换源

<p>
    安装web前记得先把源换一下，ubuntu的官方源我也测试了，确实有点慢。注意换源要换成ARM的版本。这个本菜换的源供大家参考。
</p>
```
##ubuntu-ports里面有arm64的源
#切记换掉源～
vi /etc/apt/sources.list
deb http://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports/ xenial main multiverse restricted universe
deb http://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports/ xenial-security main multiverse restricted universe
deb http://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports/ xenial-updates main multiverse restricted universe
deb http://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports/ xenial-backports main multiverse restricted universe
deb-src http://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports/ xenial main multiverse restricted universe
deb-src http://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports/ xenial-security main multiverse restricted universe
deb-src http://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports/ xenial-updates main multiverse restricted universe
deb-src http://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports/ xenial-backports main multiverse restricted universe
sudo apt update
#等待apt更新完成即可，列表更新完成就可以tab补全啦～
```
### 1.2 安装

```
sudo apt install nginx
ps -ef |grep nginx #查看进程
curl localhost       #本地调试出现welcome页面即本地调试成功
```
<p>
    <img src="https://bbs-img.huaweicloud.com/blogs/img/1573702475503227.png" title="1573702475503227.png" class="localImage" alt="1573702475503227.png" width="699" height="246"/>
</p>
<p>
    如果想要公网访问ip需开放入方向安全规则80端口。找到控制台-入方向规则-添加规则<br/>
</p>
<p>
    <img src="https://bbs-img.huaweicloud.com/blogs/img/1573702674499363.png" title="1573702674499363.png" class="localImage" alt="1573702674499363.png" width="754" height="338"/>
</p>
<p>
    访问公网ip即可。
</p>

## 2.安装php、配置nginx解析

### 2.1 php安装
```
sudo apt install php-fpm  ##这里注意查看一下php-fpm的管理器版本，后面配置软链接如果版本不一致会报错
# cd /var/run/php/
# ls
php7.0-fpm.pid  php7.0-fpm.sock  ##可以看到此处本菜的版本是7.0
```

### 2.2 最重要的nginx软链接解析<br/>

进入`/etc/nginx/sites-available` 目录下新建`webserver`，配置php解析文件。

### 2.3 在server区块中配置基本服务

```
server {
        listen 80;            ##网站监听端口，这里设置为80，即浏览器默认的HTTP端口号。
        root /var/www/html;   ##网站根目录
        index index.php index.html index.htm index.nginx-debian.html;  ##配置web默认页
        server_name ip##你的公网ip;

        location / {
                try_files $uri $uri/ =404;                                                    
        }

        location ~ \.php$ {         ##如果url输入为php后缀文件则传给php-fpm进行处理。
                include snippets/fastcgi-php.conf;
                fastcgi_pass unix:/var/run/php/php7.0-fpm.sock;  ##注意此处的解析目录的更改
        }

        location ~ /\.ht {
                deny all;               ##该区块禁止.htaccess的访问。
        }
}
```

### 2.4 配置nginx软链接

如果报错无法找到webserver(此处每人不同，如果未修改则是default)，进入/etc/nginx/sites-enabled目录下查看软链接配置，删除多余配置，留下default和webserver软链接文件

```
sudo ln -s /etc/nginx/sites-available/webserver /etc/nginx/sites-enabled/ 
sudo nginx -t                  #nginx测试，无报错进入下一步
sudo systemctl reload nginx    #重启服务，载入最新配置
```
报错解决:
```
/etc/nginx/sites-enabled# ll
total 8
drwxr-xr-x 2 root root 4096 Nov 12 11:03 ./
drwxr-xr-x 6 root root 4096 Nov 12 11:34 ../
lrwxrwxrwx 1 root root   34 Nov 12 10:51 default -&gt; /etc/nginx/sites-available/default
lrwxrwxrwx 1 root root   34 Nov 12 11:02 webserver -&gt; /etc/nginx/sites-available/webserver
rm -rf webserver
sudo ln -s /etc/nginx/sites-available/webserver /etc/nginx/sites-enabled/ 
```
## 3.测试

<p>
    在web服务目录下创建php文件测试。<br/>
</p>
```
sudo vi test.php
&lt;?phpphpinfo();?>
```
使用浏览器输入:`$_公网ip/test.php`；测试成功：
<p>
    <img src="https://bbs-img.huaweicloud.com/blogs/img/1573709110895993.png" title="1573709110895993.png" class="localImage" alt="1573709110895993.png"/>
</p>

## 4.部署存储容器

<p>
    别忘了我们的最终目的，是部署云服务器容器。将web文件夹解压至web根目录下。访问即可。
    <span style="background-color:rgb(240,124,130);">由于此处使用的是第三方开源容器项目，所以安全性无法保障，不保证后门等情况不会发生，所以介意者可以自行搭建（代码托管平台也有）。为了避免麻烦这里把所有的与项目有关的信息码一下，见谅。</span>
</p>
<p>
    <img src="https://bbs-img.huaweicloud.com/blogs/img/1573709423926504.png" title="1573709423926504.png" class="localImage" alt="1573709423926504.png" width="677" height="433"/>
</p>
<p>
    <img src="https://bbs-img.huaweicloud.com/blogs/img/1573709541736321.png" title="1573709541736321.png" class="localImage" alt="1573709541736321.png" width="930" height="416"/>
</p>
<p>
    <br/>
</p>
<p>
    <img src="https://bbs-img.huaweicloud.com/blogs/img/1573709994134345.png" title="1573709994134345.png" class="localImage" alt="1573709994134345.png"/>
</p>

好了。基本上一个自己使用的云存储容器就可以投入使用了。手机端、PC端都可以使用。建议大家可以自己尝试一下。<br><span style="background-color:rgb(240,124,130);">么么哒</span>


