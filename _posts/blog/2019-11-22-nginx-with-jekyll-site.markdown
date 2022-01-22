---
layout: post
toc: true
title: "多子域：JEKYLL优雅地部署于NGINX"
author: Bin4xin
wrench: 2021-06-27
categories:
    - blog
tags:
    - Web
    - 技巧
permalink: /blog/2019/nginx/with/jekyll-site/
---

---

本文主要介绍服务端的Jekyll站点部署方法，以及相关的一揽子问题及解决方案；

于 *2021年 6月27日 星期日 20时19分07秒 CST*修改，个人建议

<i class="fa fa-quote-left"></i>优雅地使用：<i class="fa fa-quote-right"></i>

- 阐述Jekyll的工作问题；
- 解决多子域问题：nginx配置文件，使得nginx文件配置更加容易移植、运维....
- 解决Web代码更新问题：[Git](https://git-scm.com/)  [X](/#) [B4xinSynchronize](https://github.com/Bin4xin/B4xinSynchronize)<i class="fa fa-github"></i>

---

使用nginx作为jekyll博客的服务启动容器介绍：

## 零：Jekyll如何工作

首先先从用户角度解释一下我理解中的jekyll服务的运行原理

`1.编写markdown文档 -> 2.markdown解析 -> 3.jekyll运行生成web站点文件`

所以我们直接去找站点文件夹，把web站点文件夹复制到nginx的根目录下就好了
```bash
$ cd /your-jekyll-web/
$ ls
$ cd _post/
$ vi 2019-01-01-your-article-title.markdown
$ cp _site/ /var/www/html/ -r
$ nginx -t
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
systemctl start nginx
$ curl localhost
```
测试nginx完毕没有问题，既可以直接启动nginx。然后看一下本地页面，如果出现本地页面就是调试完成了。

## 一：配置Nginx-Server

Nginx的使用自不必多说；这里想要传达出的是一些关于如何优雅的来配置Nginx：

- A子域：`$ vi /{path/to/nginx/dir}/sites-enabled/A`

```bash
server {
    #listen 80 default_server;
    #listen [::]:80 default_server;
    location / {
    root /{path/to/your/www/dir}/about;
    index  index.html index.htm;
    try_files $uri $uri/ =404;
    }

    error_page  404 403 500 502 503 504  /404.html;

    location = /404.html {
        root   /{path/to/your/www/dir}/about;
    }

    listen  443;
    ssl on; 
    server_name A.domain.com;
        
    ssl_certificate      /etc/nginx/{path/to/your/cert}/.crt;
    ssl_certificate_key  /etc/nginx/{path/to/your/key}/.key;
    ssl_session_cache    shared:SSL:1m;
    ssl_session_timeout  5m;
    ssl_ciphers  ECDHE-RSA-AES128-GCM-SHA256:ECDHE:ECDH:AES:HIGH:!NULL:!aNULL:!MD5:!ADH:!RC4;
    ssl_prefer_server_ciphers  on;
    ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
}
```

- B子域 `$ vi /{path/to/nginx/dir}/sites-enabled/B` 后，同样配置就好

同样测试一下，没问题就可以了，希望你们自己也能动手试试看。以上

## 二：代码更新 - *B4xinSync*

### # 2x01 什么是*B4xinSynchronize*

- 功能
    - 基于双端**代码同步**脚本，让您的git仅是或否
    - *Let your git only yes or no*
- 适用场景
    - 将本地调试完成的代码拷贝到工作目录（如jekyll、github）；
    - 将工作目录的代码push至github仓库或服务端；
    - 服务端自动更新git上传代码。


### # 2x02 解决方案


修改 `B4xinSynchronize/bash/config/user_config.sh`，注意事项：

- `options_project_{i}`的值连接符为下划线，{i}自定义
- dw模式目录需加入`gitPath、buildPath`，否则会报`Invalid`，sw模式同理

```bash
##project : $your_repo_name
options_$your_repo_name_{i}="your_repo_name"
_${run_mode}_$your_repo_name_gitPath="/path/to/your/repo/name"
_${run_mode}_$your_repo_name_buildPath"/path/to/your/build/project/"

##example:

## dw mode project 0: bin4xin_github_io options
options_project_0="bin4xin_github_io"
_dw_bin4xin_github_io_gitPath="/Users/bin4xin/blog/github-code/bin4xin.github.io"
_dw_bin4xin_github_io_buildPath="/Users/bin4xin/blog/SENTRYLAB-WWW-WEB/_site"
# sw mode project 4: B4xinSynchronize options
options_project_4="B4xinSynchronize"
_sw_B4xinSynchronize_gitPath="/Users/bin4xin/blog/github-code/B4xinSynchronize"
```

- bash终端命令
    - client端

    ```
    $ brew install gawk
    $ git clone https://github.com/Bin4xin/B4xinSynchronize.git
    $ cd B4xinSynchronize/bash
    $ bash Sclient.sh [dw/sw]
    ● [Info] Are you sure?(y/n): 
    ● [Info] Running mode is: sw mode now
    looks you have var files now!
    ● [Info] Detected [Repo 0]: bin4xin_github_io
    ● [Info] Detected [Repo 1]: bin4xin_gitee_io
    ● [Info] Detected [Repo 2]: sentrylab_tokyo_www
    ● [Info] Detected [Repo 3]: sentrylab_tokyo_about
    ● [Info] Detected [Repo 4]: B4xinSynchronize
    ● [Info] Detected [Repo 5]: sweet_ysoserial
    ● [Info] Detected [Repo 6]: Bin4xin
    ● [Info] Detected [Repo 7]: bigger_than_bigger
    ● [Info] Detected [Repo 8]: Industrial_Control_Wiki_Record
    Choose your Repos option (default option: 0)[0/1/..] : 4
    This is a valid git repository 
    (but the current working directory may not be the top level.  Check the output of the git rev-parse command if you care)
    ● [Info] Directly jumping to Synchronize update...
    /Users/bin4xin/blog/github-code/B4xinSynchronize
    ● [Info] Synchronize update is running in /Users/bin4xin/blog/github-code/B4xinSynchronize
    ● [Info] Synchronize update is running... 
    [master bb5fdd0] Tue, 18 May 2021 23:39:57 +0800 commit by B4xinSynchronize.
     2 files changed, 8 insertions(+), 8 deletions(-)
    Enumerating objects: 9, done.
    Counting objects: 100% (9/9), done.
    Delta compression using up to 8 threads
    Compressing objects: 100% (5/5), done.
    Writing objects: 100% (5/5), 573 bytes | 573.00 KiB/s, done.
    Total 5 (delta 4), reused 0 (delta 0), pack-reused 0
    remote: Resolving deltas: 100% (4/4), completed with 4 local objects.
    To https://github.com/Bin4xin/B4xinSynchronize.git
       21314fc..bb5fdd0  master -> master
    ```
    - server端

    ```
    $ bash Sserver.sh [/path/to/git/workspace/]
     ● 运行中... 
    任务进行中: [Crontab定时计划备份] [写入Crontab定时计划] [执行Crontab定时计划]
    备份您的当前的Crontab计划
    执行添加最新的Crontab计划：
    [==================================================>]    
    [备份计划] >> [crontab -l > config/golbal_var.sh.]...
     ● [Info]任务1: [Crontab定时计划备份] ----------> DONE..... 
    [写入计划] >> [config/golbal_var.sh]...
     ● [Info]任务2: [写入Crontab定时计划] ----------> DONE..... 
    [执行计划] << [config/golbal_var.sh]...
     ● [Info]任务3: [执行Crontab定时计划] ----------> DONE..... 

    当前最新Crontab计划表为：
    ╔═══════════════════════════════╗
    ║   * * * * * git checkout -f   ║
    ╚═══════════════════════════════╝
    ALL DONE...
    ```


### # 2x03 其他

其他相关介绍可以参考[B4xinSynchronize 仓库介绍](https://github.com/Bin4xin/B4xinSynchronize)<i class="fa fa-github"></i>

