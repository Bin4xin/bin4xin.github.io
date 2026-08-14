---
layout: post
title: 快速开始
toc: true
categories: [blog,wiki]
author: Bin4xin
date: 2021-07-07
wrench: 2026-08-14
permalink: /usage/
---

本文主要介绍 {{ site.title }}{{ site.brand }} 相关主题源码的路由规则与配置方法。

{% capture _tips %}在使用本教程前，强烈建议先阅读 <a href="https://github.com/Bin4xin/bin4xin.github.io/wiki/%E6%9E%84%E5%BB%BA-Jekyll-Quick-Start">《构建 Jekyll Quick Start》</a>，在本地克隆仓库并通过 <code>jekyll server</code> 启动服务，基本了解 Jekyll 相关知识后再尝试本教程。您也可以跳过前置阅读，但请严格按照教程步骤操作；如有问题请提 <a href="https://github.com/Bin4xin/bin4xin.github.io/issues/new">Issues</a>。{% endcapture %}
{% include common-index/index-preset.html level="info" msg=_tips %}

## 一、文章编写规范

### 1.1 文件命名规范

以《虚函数表》一文为例，文件名采用如下格式：

```
年-月-日-时-间-中英文-均可-空格-用横杠代替.md
```

示例：`2022-01-09-Learning-process-about-virtual-function-table.md`

### 1.2 栏目分类

仓库博文分为以下几个栏目，所有 Markdown 文件应放置在对应目录下：

{: .table}
| 栏目 | 路径 | 说明 |
|------|------|------|
| [BLOG](/blog/) | [`_posts/blog`](https://github.com/Bin4xin/bin4xin.github.io/tree/main/_posts/blog) | 技术博客 |
| [TOPS](/top/) | `_posts/top` | 置顶文章 |
| [DAILY](/daily/) | `_posts/daily` | 日常闲谈 |
| [ABOUT](/about/) | `_posts/about` | 个人研究 |

### 1.3 Front Matter 配置

所有 Markdown 文件都必须按照仓库 Post 文件格式添加文件头：

```yaml
---
layout: post
# 分类布局：blog 栏目文章=post，Tops 栏目文章=top，不确定可参考对应文件夹下文件值
title: "关于虚函数表的学习过程"
# 文章标题，简要概括文章内容
date: 2022-01-09
# 上传仓库时间
# wrench: 2022-01-06
# 如文章有修改则填写修改时间，也可直接删除该行，需要时再加回
author: codecat
# 作者
toc: true
# 文章目录，不为 true 则不显示目录
categories: [blog, 笔记]
# 分类，可提取文章相关关键词
permalink: /blog/2022/Learning-process-about-virtual-function-table/
# 访问链接，一般为 $root-url/$permalink
---
```

### 1.4 标题层级建议

{% include common-index/index-preset.html level="warn" msg="本仓库内 title 为全局定义 ctitle 属性，默认为 HTML h3 大小，建议 Markdown 内容中所有标题前均加上两个 #，否则会出现布局混乱。" %}

例如，一级标题 `# 虚函数表` 应写为三级标题 `### 虚函数表`，这样整体大小较为平均美观：

![标题层级对比](https://s2.loli.net/2022/01/09/b1yYzColZqBPO7N.png)

### 1.5 图片与图床

图片可使用 [sm.ms](https://sm.ms/) 公共图床进行托管。图片上传完成后，页面会提供相关格式的链接供使用：

![sm.ms 图床使用示例](https://s2.loli.net/2022/01/09/O69qn1yIWGphVvE.png)

### 1.6 Commit 信息规范

提交信息可参考以下格式：

```
[2022/01/09/16:13:13]<添加::Learning-process-about-virtual-function-table.md>commit by sentryCyberSec.
```

格式说明：`[时间]<操作::相关文件>commit by someone.`

更多可参考 [Git 操作 - Git push](https://github.com/Bin4xin/bin4xin.github.io/wiki/Git%E6%93%8D%E4%BD%9C-Git-push)。

### 1.7 文章发布与访问

上传完成后即可通过以下方式访问文章：

- [关于虚函数表的学习过程（源码）](https://github.com/sentryCyberSec/sentryCyberSec.github.io/blob/main/_posts/blog/2022-01-09-Learning-process-about-virtual-function-table.md)

---

## 二、路由配置说明

源码下载后的基本文件结构供参考：

![文件结构截图](https://i.loli.net/2021/07/13/o4gb1veWBlfyx8T.png)

{% include common-index/index-preset.html level="info" msg="文章内容往后更新，此处主要测试图床功能。" %}

实操下来发现路由结构如下：

- **新闻-公告**窗口相互绑定 `/news`，`readmore` 功能同样跳转；
- **帮助-个人**栏目希望实现对近期研究（如 `struts2`、`shiro`）的展示。

{% include common-index/index-preset.html level="warn" msg="部分功能路由和 JSON 文件对应的 site.url/help 路由暂时无法得知如何配置。" %}

### 2.1 路由更新记录

**2020-11-08 更新：**

发现路由信息：

- `_data/options.yml` 配置文件可选择配置 `force_redirect_help` 功能，即强制路由跳转至 `help/*{redirect_url}`；
- 可选择配置 `unlist` 选项、`new` 显示等。

**2021-02-01 更新：**

发现头部样式关联：

- `category` 配置与 `layout` 配置；
- `layout` 布局选项配置，如选择配置 `help`，则可以在近期研究中左侧导航栏中发现。

---

## 三、环境搭建与构建

### 3.1 依赖安装

本站使用 `Jekyll` 编写，并使用 `babel` 编译，采用 ECMAScript 6，因此必须安装 `ruby >= 2.0` 和 `nodejs`。

**Step 1：安装 nodejs**

```bash
yum install nodejs
```

**Step 2：安装 ruby 2.2.4 和 rubygems**

```bash
# 安装编译依赖
yum install gcc-c++ patch readline readline-devel zlib zlib-devel
yum install libyaml-devel libffi-devel openssl-devel make
yum install bzip2 autoconf automake libtool bison iconv-devel sqlite-devel

# 下载并编译 ruby 2.2.4
wget -c https://cache.ruby-lang.org/pub/ruby/2.2/ruby-2.2.4.tar.gz

# 下载并安装 rubygems
wget -c https://rubygems.org/rubygems/rubygems-2.4.8.tgz
ruby setup.rb
```

**Step 3：安装 bundle 和 build**

```bash
gem install bundle
gem install build
```

### 3.2 本地构建与运行

Fork 并克隆源码后，在博客文件夹根目录下执行：

```bash
bundle install
jekyll build
```

启动本地服务：

```bash
jekyll serve -P 80
# 或
bundle exec jekyll server -P 80
```

{% include common-index/index-preset.html level="success" msg="在 macOS Big Sur v11.2 下测试无任何问题。" %}

参考文章：

- [Markdown 语法介绍与批注](/news/sentry-lab-markdown-usage/)
- [Jekyll for Linux 服务器部署历程](/blog/2019/jekyll/in/linux/)

---

## 四、Git 操作指南

### 4.1 常规 Push 操作

**命令行方式：**

```bash
git add .
git commit -m "[`date +%Y/%m/%d/%T`]<移除::.DS_Store>: commit by `git config --global --list | grep user.name | awk -F"=" '{print $2}'`"
git push -u origin main
```

格式说明：

- `[`date +%Y/%m/%d/%T`]` — Linux 时间戳；
- `<移除::.DS_Store>` — 需要修改的内容，格式为 `<[操作:移除/修复/更新/等]::本次上传修改的文件>`；
- `commit by ...` — 取出操作人。

**Windows（Git Bash）示例：**

```bash
git commit -m "[`date +%Y/%m/%d/%T`]<测试::GitBash on MSWin>: commit by `git config --global --list | grep user.name | awk -F"=" '{print $2}'`"
```

输出示例：

```
[SCS-1.0-dev bfc8df8] [2021/12/07/13:59:59]<测试::GitBash on MSWin>: commit by sentryCyberSec
```

{% include common-index/index-preset.html level="info" msg="全新的仓库若希望修改默认的 master 分支，可执行 git branch -M main 将分支名称改为 main。" %}

### 4.2 IDEA 中使用 Git

- Git 在 IDEA 中似乎不能包裹命令提交、推送；
- 可添加模版加上时间戳；
- 参考链接：[CSDN - IDEA 中 Git 的使用](https://blog.csdn.net/Q748893892/article/details/102460868)

### 4.3 全局忽略文件配置

以 `.DS_Store` 为例，配置 Git 全局禁止某些文件上传到仓库：

**Step 1：** 将 `.DS_Store` 加入全局 `.gitignore` 文件

```bash
echo .DS_Store >> ~/.gitignore_global
```

**Step 2：** 将全局 `.gitignore` 文件加入 Git 全局配置

```bash
git config --global core.excludesfile ~/.gitignore_global
```

{% include common-index/index-preset.html level="success" msg="配置完成后，.DS_Store 等文件将不会再被提交到仓库。" %}

---

## 五、GitHub Actions 自动部署

自动部署工作流配置文件：

- [deploy.yml](https://github.com/Bin4xin/bin4xin.github.io/blob/main/.github/workflows/deploy.yml)

{% capture _success_msg %}写于 <strong>{{ page.date | date: "%Y-%m-%d" }}</strong>，最后更新于 <strong>{{ page.wrench | date: "%Y-%m-%d" }}</strong>{% endcapture %}
{% include common-index/index-preset.html level="success" msg=_success_msg %}
