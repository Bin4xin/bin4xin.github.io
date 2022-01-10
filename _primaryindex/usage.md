---
layout: post
title: 快速开始
toc: true
categories: [blog,wiki]
author: Bin4xin
date: 2021-07-07
wrench: 2022-01-10
permalink: /usage/
---

> [2021/11/09/15:08:59] :本文主要介绍{{site.title}}{{site.brand}}相关主题源码的路由、相关配置等

> *TIPS:*
>
> 在使用本教程前，强烈建议先阅读[《构建-Jekyll-Quick-Start》](https://github.com/Bin4xin/bin4xin.github.io/wiki/%E6%9E%84%E5%BB%BA-Jekyll-Quick-Start)
> 本地克隆仓库代码后进行本地编译然后`jekyll server`启动服务，基本了解Jekyll的相关知识后，再尝试本教程。
>
> 当然，您也可以跳过`《构建-Jekyll-Quick-Start》`，那么请严格按照教程步骤操作；
>
> 有问题请提[issues](https://github.com/Bin4xin/bin4xin.github.io/issues/new)；


### # 以《虚函数表》为例

- 文件名称`年-月-日-时-间-中英文-均可-空格-用横杠代替.md`
  - `2022-01-09-Learning-process-about-virtual-function-table.md`
- 仓库博文分为几个栏目：
  - [BLOG](https://www.sentrylab.cn/blog/) - 相关技术博客对应仓库文件位置[`_posts/blog`](https://github.com/Bin4xin/bin4xin.github.io/tree/main/_posts/blog)，下面不赘述，以此类推；
  - [TOPS](https://www.sentrylab.cn/tops/) - 相关博客置顶
  - [DAILY](https://www.sentrylab.cn/daily/) - 相关日常闲谈文章
  - [ABOUT](https://www.sentrylab.cn/about/) - 个人研究文章
- 所以所有MD格式文件都应按照的仓库POST文件格式添加上文件头：

```bash
---
layout: post
#分类布局，blog栏目文章=post，Tops栏目文章=top，不确定可以查看对应文件夹下文件值
title: "关于虚函数表的学习过程"
#文章标题，简单概括关于文章的内容
date: 2022-01-09
#上传仓库时间
#wrench: 2022-01-06
#如文章有修改，则填上修改时间，也可以直接删除改行，需要在加上
author: codecat
#作者
toc: true
#文章目录，若不为True则文章没有目录
categories: [blog, 笔记]
#分类，可以提取文章相关关键词
permalink: /blog/2022/Learning-process-about-virtual-function-table/
#访问链接，一般为$root-url/$permalink
---
```

- 由于本仓库内title为全局定义`ctitle`属性，默认为`HTML h3`大小，所以建议MD文件内容所有标题前均加上`两个#`

比如，一级标题`# 虚函数表`新增为三级标题`### 虚函数表`，那么大小较为平均美观；否则会出现如下所示的现象，布局较为混乱：

![QQ图片20220109160635.png](https://s2.loli.net/2022/01/09/b1yYzColZqBPO7N.png)

图片可以使用[sm.ms](https://sm.ms/)公共图床进行图片展示，图片上传完成后页面会给出相关格式的链接供使用：

![QQ图片20220109160907.png](https://s2.loli.net/2022/01/09/O69qn1yIWGphVvE.png)

- 而提交的信息可以按照这个格式参考：`[2022/01/09/16:13:13]<添加::Learning-process-about-virtual-function-table.md>commit by sentryCyberSec.`
  - 更多可以参考：[Git操作-Git-push](https://github.com/Bin4xin/bin4xin.github.io/wiki/Git%E6%93%8D%E4%BD%9C-Git-push)
  - `[时间]<操作::相关文件>commit by someone.`

- 上传完成后就可以访问文章：
  - [关于虚函数表的学习过程](https://www.sentrylab.cn/blog/2022/Learning-process-about-virtual-function-table/)
  - [2022-01-09-Learning-process-about-virtual-function-table.md](https://github.com/sentryCyberSec/sentryCyberSec.github.io/blob/main/_posts/blog/2022-01-09-Learning-process-about-virtual-function-table.md)

### # 路由问题

源码下载下来后，基本的文件形式供参考：

![截屏2021-07-13 下午3.03.46.png](https://i.loli.net/2021/07/13/o4gb1veWBlfyx8T.png)

> 文章内容往后更新，此处主要测试图床功能

* 实操下来发现路由结构如下：
- 新闻-公告窗口相互绑定`/news`，`readmore`功能同样跳转	;
- 帮助-个人希望实现对于近期的一些研究，如`struts2,shiro`;但是部分功能路由和json文件对应的`site.url/help`路由暂时无法得知如何代码。

***
* 2020-11-08更新：
发现路由信息：
- `_data/options.yml`配置文件可以选择配置`force_redirect_help`功能，即强制路由跳转至`help/*{redirect_url}`
-	可以选择配置`unlist`选项、`new`显示等。

* 2021-2-1更新：
发现头部样式关联：
- `category`配置与`layout`配置
- `layout`布局选项配置，如选择配置`help`那么则可以在近期研究中左侧导航栏中发现

### # Git

#### Build

- [Jekyll Demo：本站使用 `Jekyll`编写，并使用 `babel` 编译](#Jekyll-Demo)
- [Git后续常见操作](#常规Git-Push操作)
- [其他Git操作](#Git全局禁止一些文件上传到仓库)

#### Jekyll Demo

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

#### 常规Git Push操作

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

#### Git全局禁止一些文件上传到仓库

- 如`.DS_Store`

1. 将 `.DS_Store` 加入全局的 `.gitignore` 文件，执行命令：

```bash
echo .DS_Store >> ~/.gitignore_global
```

2. 将这个全局的 `.gitignore` 文件加入Git的全局config文件中，执行命令：

```bash
git config --global core.excludesfile ~/.gitignore_global
```

### # Action + Jekyll

[yml文件](https://github.com/Bin4xin/bin4xin.github.io/blob/main/.github/workflows/deploy.yml)
