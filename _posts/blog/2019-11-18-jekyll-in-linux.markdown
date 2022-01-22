---
layout: post
toc: true
title: "「笔记」：Jekyll for linux.服务器部署历程"
author: Bin4xin
categories:
    - blog
tags:
    - 笔记
    - 软件移植
permalink: /blog/2019/jekyll/in/linux/
---

* 申明：背景图来自微博@胡歌，侵删～不过胡歌这么可爱应该不会介意的

第一个问题：这玩意儿是什么？通俗的来讲：<br>
`Jekyll = web server + static blog + front end UI`<br>
如果你想拥有一个自己的博客但是苦于数据库没学好，你可以来试试看；再如果想学前端，你也可以试试看～

做配置前请默念三遍四者之间的关系，保证倒背如流在进行下一步：
```bash
1.Ruby 是语言。
2.gem 是一组 Ruby 程序，类似于「包」的概念。
3.RubyGems 是 Ruby 的包管理器，用来管理和安装 gems 的。
4.bundle是用来管理gems的项目，确保能够正确地安装项目依赖，确保能够运行正确的包。
```

## 1. RVM 安装
```bash
gpg --keyserver hkp://keys.gnupg.net --recv-keys 409B6B1796C275462A1703113804BB82D39DC0E3
curl -sSL https://get.rvm.io | bash -s stable
##如果上面秘钥导入失败会提示command建议，直接复制下来，实在不行找不到使用下面这个链接下载。
curl -L https://raw.githubusercontent.com/wayneeseguin/rvm/master/binscripts/rvm-installer | bash -s stable
source /usr/local/rvm/scripts/rvm  ##配置一次性变量，这里terminal暂时使用一下。熟悉的朋友可以直接配进bashrc自启
```
期间会安装各种依赖包，等待一段时间后出现complete字样即成功安装。
## 2. ruby 安装
### 2.1 切换rvm源 
接着就是换源，老外网真的慢- -没办法,跟linux换源是一个道理
```bash
#echo "ruby_url=https://cache.ruby-china.org/pub/ruby" > ~/.rvm/user/db
#此处本菜机子的是.rvmrc，直接把url导入：
#echo "ruby_url=https://cache.ruby-china.org/pub/ruby" > /root/.rvmrc
```
```bash

========================2020-03-31更新：换源文件=================================
+==============================================================================+
|echo "ruby_url=https://cache.ruby-china.com/pub/ruby" > /usr/local/rvm/user/db|
+==============================================================================+
```
找不到更新rvm源的文件，如果是按照上面方法，基本是在上面这个文件下。

```bash
[root@iZ2ze9ebgot9gy5c2mi5ecZ user]# echo "ruby_url=https://cache.ruby-china.com/pub/ruby" > /usr/local/rvm/user/db
[root@iZ2ze9ebgot9gy5c2mi5ecZ user]# cat db
ruby_url=https://cache.ruby-china.com/pub/ruby

[root@iZ2ze9ebgot9gy5c2mi5ecZ user]# rvm install "ruby-2.5.7"
Searching for binary rubies, this might take some time.
No binary rubies available for: centos/7/x86_64/ruby-2.5.7.
Continuing with compilation. Please read 'rvm help mount' to get more information on binary rubies.
Checking requirements for centos.
Requirements installation successful.
Installing Ruby from source to: /usr/local/rvm/rubies/ruby-2.5.7, this may take a while depending on your cpu(s)...
ruby-2.5.7 - #downloading ruby-2.5.7, this may take a while depending on your connection...
** Resuming transfer from byte position 323584
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100 12.8M  100 12.8M    0     0  6097k      0  0:00:02  0:00:02 --:--:-- 6095k
ruby-2.5.7 - #extracting ruby-2.5.7 to /usr/local/rvm/src/ruby-2.5.7.....
ruby-2.5.7 - #configuring...................................................................
ruby-2.5.7 - #post-configuration..
ruby-2.5.7 - #compiling..................................................................................
ruby-2.5.7 - #installing..............................
ruby-2.5.7 - #making binaries executable..
ruby-2.5.7 - #downloading rubygems-3.0.8
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
 25  867k   25  223k    0     0  15138      0  0:00:58  0:00:15  0:00:43 16300

ruby-2.5.7 - #adjusting #shebangs for (gem irb erb ri rdoc testrb rake).
Install of ruby-2.5.7 - #complete
Ruby was built without documentation, to build it run: rvm docs generate-ri
```
基本上看到上面的complete就安装完了

#安装ruby
rvm list know            #查询已知rvm软件列表
rvm install "ruby-2.5.5"   #安装ruby
rvm use 2.5.5          #指定使用的ruby版本号

## 3. 配置ruby-gems环境
```
#配置前确认：
rvm -v
rvm 1.29.9 (latest) by Michal Papis, Piotr Kuczynski, Wayne E. Seguin [https://rvm.io]
gem -v
3.0.6
ruby -v
ruby -v
ruby 2.5.5p157 (2019-03-15 revision 67260) [x86_64-linux]
gem source -l
gem sources --remove https://rubygems.org/
gem sources -a https://gems.ruby-china.com  ##换源 换源 换源
gem update --system
gem install bundler
```

## 4. 安装jekyll

`gem install jekyll`
安装jekyll工具，保证jekyll能顺畅运行。此处跟每个人下载的模板不一样所需要的工具不一样，我这里把基本的一些工具贴上，后期模板不一样看一下环境要求根据要求即可。
```bash
gem install bundler      #打包用工具
gem install jekyll-paginate #分页设置工具 重要 一定要安装
gem install minima      #默认主题
gem install jekyll-feed #订阅用的工具
```
## bundle?

```bash
% sudo bundle exec rake production:export
/System/Library/Frameworks/Ruby.framework/Versions/2.6/usr/lib/ruby/2.6.0/universal-darwin19/rbconfig.rb:229: warning: Insecure world writable dir /usr/local/sbin in PATH, mode 040777
fatal: 不是一个 git 仓库（或者任何父目录）：.git
Could not find rake-10.5.0 in any of the sources
Run `bundle install` to install missing gems.
```
到你所在的博客目录下，`git init`：
```bash
bin4xin@bin4xin's MacbookPro text-theme % pwd
/Users/bin4xin/blog/text-theme
bin4xin@bin4xin's MacbookPro text-theme % git init
已初始化空的 Git 仓库于 /Users/bin4xin/blog/text-theme/.git/
```

```bash
% bundle config mirror.https://rubygems.org https://gems.ruby-china.com
/System/Library/Frameworks/Ruby.framework/Versions/2.6/usr/lib/ruby/2.6.0/universal-darwin19/rbconfig.rb:229: warning: Insecure world writable dir /usr/local/sbin in PATH, mode 040777
bin4xin@bin4xin's MacbookPro text-theme % sudo bundle install                                                  
/System/Library/Frameworks/Ruby.framework/Versions/2.6/usr/lib/ruby/2.6.0/universal-darwin19/rbconfig.rb:229: warning: Insecure world writable dir /usr/local/sbin in PATH, mode 040777
Don't run Bundler as root. Bundler can ask for sudo if it is needed, and installing your bundle as root will break this application for all
non-root users on this machine.
Fetching gem metadata from https://gems.ruby-china.com/...........
Fetching rake 10.5.0
Installing rake 10.5.0
Fetching concurrent-ruby 1.1.5
Installing concurrent-ruby 1.1.5
Fetching i18n 1.7.0
Installing i18n 1.7.0
··省略
··
··
Fetching sassc 2.2.1
Installing sassc 2.2.1 with native extensions

Bundle complete! 3 Gemfile dependencies, 42 gems now installed.
```
## 5. 启动服务
一般你们都是直接下载了模板，模板解压后进入文件夹即可。比如我这里模板文件夹叫blog
```bash
unzip blog.zip
cd blog/
git init #如果你有多个模板，记得先用这个命令，把当前文件夹当做根目录；同理使用其他模板第一步输入这个命令
jekyll serve -P 80   #自动构建并运行jekyll服务
```
## 6. jekyll报错
```
Could not find gem 'X' in any of the gem sources listed in your Gemfile.(Bundler::GemNotFound)
gem install X
安装即可
```

- 1.jekyll-paginate使用失败 即使是安装了jekyll-paginate，也会报错。
	- gem list --local | grep jekyll-paginate #查看本地gem安装插件
确认安装上，在博客根目录下编辑Gemfile，添加：gem 'jekyll-paginate', group: :jekyll_plugins

- 2.cannot load such file -- kramdown-parser-gfm (LoadError)
	- 安装即可。安装 kramdown-parser-gfm ，不要分开一个一个安装。

现在jekyll服务启动后，web的服务是使用WEBrick服务器，会有以下让我觉得不舒服的地方：<br>
1）目录遍历<br>
2）无法隐藏服务器版本号
（也许是能够这样操作但是我没有发现），所以试了下发现nginx也是可以的<br>

[传送门](/blog/2019/nginx/with/jekyll-site/)

以上。
