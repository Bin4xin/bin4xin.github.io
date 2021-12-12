# Build

- [Jekyll Demo：本站使用 `Jekyll`编写，并使用 `babel` 编译](#Jekyll-Demo)
- [Git后续常见操作](#常规Git-Push操作)
- [其他Git操作](#Git全局禁止一些文件上传到仓库)

## Jekyll Demo

直接编译，ECMAScript6，因此必须安装 ruby >= 2.0 和 nodejs.

- 1.安装 nodejs `yum install nodejs`
- 2.安装 ruby 2.2.4 and rubygems 
  - Step 1: Install Required Packages
  - Step 2: Compile ruby 2.2.4 source code
  - Step 3: Install rubygems
```bash
yum install gcc-c++ patch readline readline-devel zlib zlib-devel
yum install libyaml-devel libffi-devel openssl-devel make
yum install bzip2 autoconf automake libtool bison iconv-devel sqlite-devel

wget -c https://cache.ruby-lang.org/pub/ruby/2.2/ruby-2.2.4.tar.gz

wget -c https://rubygems.org/rubygems/rubygems-2.4.8.tgz
ruby setup.rb
```
3. 安装 bundle 和 build
```bash
gem install bundle
gem install build
```
4. Fork mirrors source code
```bash
bundle install
jekyll build
```

在MacOS BigSur v11.2下测试无任何问题，之后在博客文件夹根目录下`jekyll serve -P 80` 或`bundle exec jekyll server -P 80`即可运行demo，可参考：
- [#markdown语法介绍与批注](https://about.sentrylab.cn/news/sentry-lab-markdown-usage/)
- [Jekyll for linux.服务器部署历程](https://www.sentrylab.cn/blog/2019/jekyll/in/linux/)

## 常规Git Push操作

- 命令行：
```bash
git add .
git commit -m "[`date +%Y/%m/%d/%T`]<移除::.DS_Store>: commit by `git config --global --list|grep user.name|awk -F"=" '{print $2}'`"
#Linux
#[`date +%Y/%m/%d/%T`]Linux时间戳；
#<移除::.DS_Store> 需要修改的；思路为：<[操作:移除/修复/更新/etc..]::本次上传修改的文件/.DS_Store>
#commit by `git config --global --list|grep user.name|awk -F"=" '{print $2}'` 取出操作人

#Windows
> (windows Git Bash) git commit -m "[`date +%Y/%m/%d/%T`]<测试::GitBash on MSWin>: commit by `git config --global --list|grep user.name|awk -F"=" '{print $2}'`"
#[SCS-1.0-dev bfc8df8] [2021/12/07/13:59:59]<测试::GitBash on MSWin>: commit by sentryCyberSec
git push -u origin main
```

- Git on IDEA
  - Git在IDEA中似乎不能包裹命令提交、推送；
  - 添加模版加上时间戳；
  - [参考链接](https://blog.csdn.net/Q748893892/article/details/102460868)

全新的仓库若希望修改默认的master分支可以：`git branch -M main`修改分支名称master为main。

## Git全局禁止一些文件上传到仓库

- 如`.DS_Store`

1. 将 `.DS_Store` 加入全局的 `.gitignore` 文件，执行命令：
```bash
echo .DS_Store >> ~/.gitignore_global
```

2. 将这个全局的 `.gitignore` 文件加入Git的全局config文件中，执行命令：
```bash
git config --global core.excludesfile ~/.gitignore_global
```