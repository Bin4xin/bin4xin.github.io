---
layout: post
title: 快速开始/Jekyll Sentinel Skill
toc: true
categories: [blog,wiki,skill]
author: Bin4xin
date: 2021-07-07
wrench: 2026-09-03
permalink: /usage/
---

<link rel="stylesheet" href="/assets/css/all.min.css">

> Jekyll 博客维护与远程开发技能手册。覆盖文章编写规范、栏目路由、组件使用、远程开发环境、Git 工作流、GitHub Actions 部署与常见问题排查。

## 适用场景

- 在 Jekyll 站点中新建/编辑博客文章（`layout: post`）
- 在 Jekyll 站点中新建/编辑分类文档（`layout: document`）
- 使用 `common-index` 提示框组件嵌入文章
- 通过 VMware Ubuntu + VS Code Remote-SSH 进行远程开发
- 配置 SSH 密钥免密登录
- 排查 Ruby / Jekyll / Git 相关问题

---

## 零、快速开始（5 分钟上手）

> 从零到本地预览的最短路径。详细配置见后续章节。

{% capture _tips %}在使用本教程前，强烈建议先阅读 <a href="https://github.com/Bin4xin/bin4xin.github.io/wiki/%E6%9E%84%E5%BB%BA-Jekyll-Quick-Start">《构建 Jekyll Quick Start》</a>，在本地克隆仓库并通过 <code>jekyll server</code> 启动服务，基本了解 Jekyll 相关知识后再尝试本教程。您也可以跳过前置阅读，但请严格按照教程步骤操作；如有问题请提 <a href="https://github.com/Bin4xin/bin4xin.github.io/issues/new">Issues</a>。{% endcapture %}
{% include common-index/index-preset.html level="info" msg=_tips %}

### 0.1 克隆仓库

```bash
git clone git@github.com:Bin4xin/bin4xin.github.io.git
cd bin4xin.github.io
```

### 0.2 安装依赖

```bash
# 确认 Ruby 版本
ruby -v

# 安装 Gem 依赖
bundle install
```

{% include common-index/index-preset.html level="info" msg="如果 <code>bundle install</code> 报 nokogiri 编译错误，先执行 <code>sudo apt install -y libxml2-dev libxslt1-dev</code> 安装系统库后重试。" %}

### 0.3 本地预览

```bash
bundle exec jekyll serve --host 0.0.0.0 -P 4000
```

浏览器访问 `http://localhost:4000`，修改文章后自动增量构建、热刷新。

### 0.4 新建文章

```bash
# 博客文章（按日期命名）
touch _posts/blog/2026-09-03-my-new-post.md

# 分类文档
touch _docs/my-new-doc.md
```

编辑文件，填写 Front Matter 和正文，保存后浏览器自动刷新即可看到。

### 0.5 提交发布

```bash
git add .
git commit -m "[`date +%Y/%m/%d/%T`]<添加::my-new-post.md>: commit by $(git config user.name)"
git push origin main
```

GitHub Pages 会自动触发构建，通常 1-3 分钟后生效。

{% include common-index/index-preset.html level="warn" msg="<code>git push</code> 前务必本地预览确认无误。GitHub Pages 构建失败不会回滚，坏文章会持续影响站点直到修复。" %}

---

## 一、布局类型与适用场景

本站提供两种内容布局，根据内容性质选择：

{: .table}
| 布局 | 适用场景 | 典型内容 |
|------|----------|----------|
| `post` | 博客文章、技术随笔、教程 | 单篇独立的技术分享、踩坑记录、操作指南 |
| `document` | 分类文档、知识汇编、参考手册 | 多题型题库、知识点速查表、系统性参考文档 |

### 选择原则

- **单篇叙述、有时间属性**（如「Jekyll 部署踩坑记」）→ `post`
- **结构化参考、按主题/章节组织**（如「数据安全知识点汇编」）→ `document`
- `document` 会在文档导航栏中出现，适合长期维护的知识库内容
- `post` 会在博客列表中按时间倒序排列

---

## 二、栏目分类与目录结构

### 2.1 栏目一览

仓库博文分为以下几个栏目，所有 Markdown 文件应放置在对应目录下：

{: .table}
| 栏目 | 路径 | 说明 |
|------|------|------|
| [BLOG](/blog/) | [`_posts/blog`](https://github.com/Bin4xin/bin4xin.github.io/tree/main/_posts/blog) | 技术博客 |
| [TOPS](/top/) | `_posts/top` | 置顶文章 |
| [DAILY](/daily/) | `_posts/daily` | 日常闲谈 |
| [ABOUT](/about/) | `_posts/about` | 个人研究 |

{% include common-index/index-preset.html level="warn" msg="文件必须放在对应栏目的子目录下，不要直接放在 <code>_posts/</code> 根目录。放错目录会导致文章出现在错误的栏目列表中。" %}

### 2.2 文件命名规范

文件名采用如下格式：

```
YYYY-MM-DD-英文标题用横杠连接.md
```

示例：`2022-01-09-Learning-process-about-virtual-function-table.md`

#### 命名规则

- 日期前缀必须是合法日期，Jekyll 按此解析发布时间
- 标题部分使用英文，单词之间用 `-` 连接
- 避免中文文件名（可能导致 URL 编码问题）
- 避免特殊字符：`|`、`/`、`<`、`>`、空格

### 2.3 路由与导航

源码的基本文件结构供参考：

![文件结构截图](https://i.loli.net/2021/07/13/o4gb1veWBlfyx8T.png)

路由关联说明：

- **新闻-公告**窗口相互绑定 `/news`，`readmore` 功能同样跳转
- **帮助-个人**栏目用于展示近期研究（如 `struts2`、`shiro`）
- `_data/options.yml` 可配置 `force_redirect_help`（强制路由跳转）和 `unlist`（隐藏栏目）、`new` 显示等选项

{% include common-index/index-preset.html level="info" msg="<code>category</code> 配置与 <code>layout</code> 布局绑定。例如 <code>layout: help</code> 的文章会出现在「近期研究」左侧导航栏中。" %}

---

## 三、Front Matter 规范

### 3.1 `layout: post`（博客文章）

```yaml
---
layout: post
title: "关于虚函数表的学习过程"
date: 2022-01-09
# wrench: 2022-01-06
# 如文章有修改则填写修改时间，也可直接删除该行，需要时再加回
author: codecat
toc: true
categories: [blog, 笔记]
permalink: /blog/2022/Learning-process-about-virtual-function-table/
---
```

{: .table}
| 字段 | 必填 | 说明 |
|------|------|------|
| `layout` | 是 | 栏目文章=`post`，置顶文章=`top`，不确定可参考对应文件夹下文件值 |
| `title` | 是 | 文章标题，简要概括文章内容 |
| `date` | 是 | 上传仓库时间（发布日期） |
| `wrench` | 否 | 最后修改时间，有修改时填写，否则删除该行 |
| `author` | 是 | 作者 |
| `toc` | 是 | 文章目录，不为 `true` 则不显示目录 |
| `categories` | 是 | 分类，可提取文章相关关键词 |
| `permalink` | 否 | 访问链接，一般为 `$root-url/$permalink` |

{% include common-index/index-preset.html level="info" msg="<strong>date vs wrench</strong>：<code>date</code> 是首次发布时间，不变；<code>wrench</code> 是最后修改时间，每次修改时更新。两者共同决定了文章的时间展示。" %}

### 3.2 `layout: document`（分类文档）

```yaml
---
layout: document
title: "数据安全与AI安全理论赛知识点汇编"
short_title: "知识点汇编"
order: 0
icon: "fas fa-flag-checkered"
status: "stable"
tags: [数据安全, AI安全, 网络安全]
author: sentryCyberSec
version: "3.0"
description: "文档简介，用于列表页和 SEO"
date: "2026-09-03"
---
```

{: .table}
| 字段 | 必填 | 说明 |
|------|------|------|
| `layout` | 是 | 固定为 `document` |
| `title` | 是 | 文档完整标题，显示在页面顶部 |
| `short_title` | 是 | 简短标题，用于侧边栏导航和面包屑，建议 2-6 个字 |
| `order` | 是 | 排序权重，数字越小越靠前，同级文档按此字段排序 |
| `icon` | 否 | Font Awesome 图标类名，显示在导航和标题旁。格式：`fas fa-图标名` |
| `status` | 否 | 文档状态标记，可选值见下方状态表 |
| `tags` | 否 | 标签数组，用于搜索和关联推荐 |
| `author` | 是 | 作者名 |
| `version` | 否 | 文档版本号，方便追踪迭代 |
| `description` | 是 | 文档简介，用于列表页展示和 SEO meta description |
| `date` | 是 | 创建/最后更新日期 |

#### `status` 可选值

{: .table}
| 值 | 显示效果 | 适用场景 |
|----|----------|----------|
| `new` | 🆕 NEW 徽章 | 新发布的文档 |
| `updated` | 🔄 UPDATED 徽章 | 近期有重大更新 |
| `draft` | 不在导航中显示 | 草稿状态，仅作者可见 |
| 留空 | 无徽章 | 正常状态，无需标记 |

#### `icon` 常用图标参考

{: .table}
| 分类 | 推荐图标 | 说明 |
|------|----------|------|
| 安全/CTF | `fas fa-flag-checkered` | 终点旗帜，适合竞赛/知识汇编 |
| 数据库 | `fas fa-database` | 数据相关文档 |
| 网络 | `fas fa-network-wired` | 网络安全/架构文档 |
| 编程 | `fas fa-code` | 编程语言/开发文档 |
| 工具 | `fas fa-tools` | 工具使用手册 |
| 书本/参考 | `fas fa-book` | 通用参考文档 |
| 齿轮/配置 | `fas fa-cog` | 配置指南 |
| 盾牌/安全 | `fas fa-shield-alt` | 安全防护文档 |
| 锁/加密 | `fas fa-lock` | 密码学/加密相关 |
| 机器人/AI | `fas fa-robot` | AI/机器学习文档 |

{% include common-index/index-preset.html level="info" msg="<strong>post 和 document 的核心区别</strong>：post 按时间排列，适合「写完就发布」的博客；document 按 <code>order</code> 排列，适合「持续维护」的知识库。选择错误布局会导致内容出现在错误的位置。" %}

### 3.3 标签命名约定

- 使用英文或技术术语，首字母大写
- 复合词用驼峰或连字符：`VSCode`、`Ruby`、`Jekyll`、`Ubuntu`、`VMware`
- 避免中文标签

{% include common-index/index-preset.html level="warn" msg="document 布局的 <code>tags</code> 字段使用<strong>行内数组</strong>格式 <code>[Tag1, Tag2]</code>，而 post 布局使用<strong>多行列表</strong>格式。两种格式 YAML 都支持，但建议按各自惯例保持一致。" %}

---

## 四、标题层级与排版

### 4.1 标题层级说明

{% include common-index/index-preset.html level="warn" msg="本仓库内 title 为全局定义 ctitle 属性，默认为 HTML h3 大小，建议 Markdown 内容中所有标题前均加上两个 #，否则会出现布局混乱。" %}

例如，一级标题 `# 虚函数表` 应写为三级标题 `### 虚函数表`，这样整体大小较为平均美观：

![标题层级对比](https://s2.loli.net/2022/01/09/b1yYzColZqBPO7N.png)

**层级对应关系：**

{: .table}
| 语义层级 | Markdown 写法 | 实际渲染 |
|----------|--------------|----------|
| 文章大标题 | 由 Front Matter `title` 生成 | h3（ctitle 全局定义） |
| 主要章节 | `### 章节名` | h3 |
| 子章节 | `#### 子章节名` | h4 |
| 细分步骤 | `##### 细分步骤` | h5 |

层级不跳级，保持 TOC 结构清晰。

### 4.2 图片与图床

图片可使用 [sm.ms](https://sm.ms/) 公共图床进行托管。图片上传完成后，页面会提供相关格式的链接供使用：

![sm.ms 图床使用示例](https://s2.loli.net/2022/01/09/O69qn1yIWGphVvE.png)

**Markdown 图片语法：**

```markdown
![替代文字](https://图片URL)
```

### 4.3 行内元素

- 命令、路径、变量、配置项用反引号：`` `bundle exec jekyll serve` ``
- 文件名用反引号：`` `Gemfile` ``、`` `sources.list` ``
- 快捷键用反引号：`` `Ctrl+Shift+P` ``
- IP 地址和端口用反引号：`` `192.168.3.100:4000` ``

### 4.4 代码块

- 使用 fenced code block，标注语言：```` ```bash ````、```` ```yaml ````、```` ```text ````
- 命令按行拆分，不要将多条命令挤在一行
- 长命令用 `\` 换行，缩进对齐：

```bash
sudo apt install -y build-essential git curl \
  zlib1g-dev libssl-dev libreadline-dev \
  libxml2-dev libxslt1-dev
```

### 4.5 列表

- 有序列表用于步骤流程（1. 2. 3.）
- 无序列表用于并列说明、注意事项、参数解释
- 列表项保持平行结构，动词开头或名词开头统一

---

## 五、common-index 提示框组件

### 语法

{% raw %}
```liquid
{% include common-index/index-preset.html level="级别" msg="提示内容" %}
```
{% endraw %}

### 级别列表

{: .table}
| level | 用途 | 典型场景 |
|-------|------|----------|
| `info` | 普通提示 | 补充说明、最佳实践、可选建议 |
| `warn` | 警告 | 操作前注意事项、备份提醒、风险提示 |
| `error` | 错误 | 报错排查方向、严重问题说明 |
| `success` | 成功 | 配置完成确认、服务启动成功 |

### HTML 嵌入（重要）

`msg` 属性**支持直接嵌入 HTML 代码**，用于高亮命令、路径或变量：

{% raw %}
```liquid
{% include common-index/index-preset.html level="warn" msg="替换前请先执行 <code>sudo cp /etc/apt/sources.list /etc/apt/sources.list.bak</code> 备份原文件。" %}
```
{% endraw %}

常用内嵌标签：

- `<code>命令或路径</code>` — 行内代码高亮
- `<strong>重要文字</strong>` — 加粗强调
- `<br>` — 强制换行

### capture 变量写法

当 `msg` 内容较长或包含 Liquid 语法时，可用 `capture` 预存变量：

{% raw %}
```liquid
{% capture _msg %}在使用前请先阅读 <a href="/wiki/quick-start">快速开始</a>，如有问题请提 <a href="/issues">Issues</a>。{% endcapture %}
{% include common-index/index-preset.html level="info" msg=_msg %}
```
{% endraw %}

### 放置原则

- **warn** 放在有风险的操作**之前**（如替换配置文件、执行系统级命令）
- **info** 放在步骤说明**之后**，作为补充建议
- **success** 放在某个阶段完成**之后**，确认结果
- **error** 放在故障排查章节**开头**，给出优先排查方向
- 同一章节不超过 2 个提示框，避免视觉噪音

---

## 六、document 布局可用组件

> 以下内容组件在 `layout: document` 中常用。`layout: post` 同样支持 Markdown 基础语法，但 document 文档更依赖结构化组件。

### 6.1 common-index 提示框（通用）

两种布局都可使用，详见第五章。document 中适合在知识点旁标注「易错」「高频」「补充」等提示。

### 6.2 表格

document 布局中大量使用 Markdown 表格展示结构化数据：

{% raw %}
```markdown
{: .table}
| 列1 | 列2 | 列3 |
|-----|-----|-----|
| 数据 | 数据 | 数据 |
```
{% endraw %}

#### 表格使用规范

- 表头简洁，不超过 8 个字
- 单元格内容精炼，长文本用 `<br>` 换行或拆分为多行
- 对齐方式：默认左对齐，数字列可用右对齐
- 同一章节表格数量不超过 3 个，避免页面过长
- 判断题/选择题用表格整理时，保留「题号 → 关键词 → 答案 → 解析」四列结构

### 6.3 思维导图文本块

用 fenced code block（```text）绘制树状知识结构：

````markdown
```text
考点体系
├── 一级分类
│   ├── 二级分类
│   │   └── 具体知识点
│   └── 二级分类
└── 一级分类
```
````

#### 绘制规范

- 使用 `├──` `└──` `│` 绘制树状结构
- 层级缩进统一用 4 个空格（或 `│   `）
- 叶子节点用一句话概括，不超过 20 个字
- 根节点不超过 5 个一级分支

{% include common-index/index-preset.html level="info" msg="思维导图文本块适合展示<strong>知识体系总览</strong>，放在文档末尾作为全局索引。详细内容用表格展开，大纲用树状图概括。" %}

### 6.4 概念辨析对比表

document 中常用对比表格区分易混淆概念，推荐格式：

{% raw %}
```markdown
{: .table}
| 概念 | 定义 | 关键区别 | 典型考法 |
|------|------|----------|----------|
| 概念A | ... | 与B的区别 | 出题方式 |
| 概念B | ... | 与A的区别 | 出题方式 |
```
{% endraw %}

#### 对比表使用规范

- 每组对比不超过 6 个概念
- 必须包含「关键区别」列，一句话点明差异
- 可搭配 `common-index` 的 `info`/`warn` 提示框做总结

### 6.5 checklist 检查清单

```markdown
- [ ] 待完成项
- [x] 已完成项
```

document 布局中适合用于「复习进度」或「考前自查」。

### 6.6 锚点与内部跳转

document 文档通常较长，可在开头添加目录跳转：

```markdown
## 目录

- [一、判断题](#一判断题1分题)
- [二、单选题](#二单选题1分题)
```

{% include common-index/index-preset.html level="warn" msg="document 布局的 <code>toc: true</code> 字段会自动生成右侧目录。如果同时手写目录，会导致<strong>重复目录</strong>。建议：开了 <code>toc: true</code> 就不要手写目录；手写目录就关闭 <code>toc</code>。" %}

### 6.7 引用块

```markdown
> 引用内容，用于补充说明或引用来源
```

document 中适合用于：文档开头的简介说明、引用法规条文原文、补充背景信息。

---

## 七、远程开发环境

### 架构

```
Windows (宿主机)
  ├── VS Code + Remote-SSH 扩展
  ├── 浏览器访问 http://虚拟机IP:4000
  └── SSH 密钥 (~/.ssh/id_ed25519)
        │ SSH隧道
VMware Ubuntu 22.04 Server
  ├── rbenv + Ruby 3.1.4
  ├── Bundler + Jekyll
  ├── Jekyll serve --host 0.0.0.0 -P 4000
  └── Git 仓库
```

### 虚拟机规格

{: .table}
| 资源 | 最低 | 推荐 |
|------|------|------|
| CPU | 2 核 | 4 核 |
| 内存 | 4GB | 8GB |
| 硬盘 | 20GB | 40GB |
| 网络 | NAT | NAT |

### 软件镜像换源

{% include components/source-panel.html
  title="Linux 软件源切换"
  config="Ubuntu| Centos-7| Fedora| Redhat| suse| Linux"
  distros=site.data.repo-sources
%}

### 基础依赖

```bash
sudo apt install -y build-essential git curl \
  zlib1g-dev libssl-dev libreadline-dev libyaml-dev \
  libxml2-dev libxslt1-dev
```

---

## 八、Ruby 环境配置

### rbenv 安装

```bash
git clone https://github.com/rbenv/rbenv.git ~/.rbenv
echo 'export PATH="$HOME/.rbenv/bin:$PATH"' >> ~/.bashrc
echo 'eval "$(rbenv init -)"' >> ~/.bashrc
source ~/.bashrc

git clone https://github.com/rbenv/ruby-build.git ~/.rbenv/plugins/ruby-build
```

### 国内镜像加速

```bash
echo 'export RUBY_BUILD_MIRROR_URL="https://cache.ruby-china.com/pub/ruby/"' >> ~/.bashrc
source ~/.bashrc
```

### 安装 Ruby

```bash
rbenv install 3.1.4
rbenv global 3.1.4
ruby -v
```

### Bundler 与 Jekyll

```bash
gem install bundler -v '~> 2.4'
cd 你的项目目录
bundle install
bundle exec jekyll serve --host 0.0.0.0 -P 4000
```

{% include common-index/index-preset.html level="warn" msg="永远用 <code>bundle exec jekyll</code> 而不是直接 <code>jekyll</code>。<code>bundle exec</code> 确保使用 Gemfile 中锁定的版本，避免版本不一致导致构建差异。" %}

### CentOS / RHEL 环境（yum）

```bash
# 安装编译依赖
yum install gcc-c++ patch readline readline-devel zlib zlib-devel
yum install libyaml-devel libffi-devel openssl-devel make
yum install bzip2 autoconf automake libtool bison iconv-devel sqlite-devel

# 安装 nodejs
yum install nodejs

# 下载并编译 ruby
wget -c https://cache.ruby-lang.org/pub/ruby/2.2/ruby-2.2.4.tar.gz

# 下载并安装 rubygems
wget -c https://rubygems.org/rubygems/rubygems-2.4.8.tgz
ruby setup.rb

# 安装 bundle 和 build
gem install bundle
gem install build
```

---

## 九、`_config.yml` 关键配置

> Jekyll 站点的核心配置文件，影响构建行为、URL 结构和部署。

### 必须关注的字段

```yaml
# 站点基础信息
title: "你的站点标题"
description: "站点描述"
url: "https://用户名.github.io"
baseurl: "/仓库名"                  # 项目站点必填；用户站点留空 ""

# URL 结构
permalink: /:categories/:year/:month/:day/:title/

# 构建
markdown: kramdown
highlighter: rouge
plugins:
  - jekyll-feed
  - jekyll-sitemap
```

### `baseurl` 与 `url` 的关系

{: .table}
| 部署方式 | `url` | `baseurl` | 访问地址 |
|----------|-------|-----------|----------|
| 用户站点（`用户名.github.io`） | `https://用户名.github.io` | `""`（空） | `https://用户名.github.io/post-title/` |
| 项目站点（`用户名.github.io/仓库名`） | `https://用户名.github.io` | `/仓库名` | `https://用户名.github.io/仓库名/post-title/` |
| 自定义域名 | `https://你的域名.com` | `""`（空） | `https://你的域名.com/post-title/` |

{% include common-index/index-preset.html level="error" msg="本地预览时如果页面空白或样式丢失，90% 是 <code>baseurl</code> 配置问题。本地调试可临时清空：<code>bundle exec jekyll serve --host 0.0.0.0 -P 4000 --baseurl ''</code>" %}

### 主题与远程主题

```yaml
# 方式一：本地主题
remote_theme: null

# 方式二：GitHub 远程主题
remote_theme: pages-themes/cayman@v0.2.0
plugins:
  - jekyll-remote-theme
```

---

## 十、构建与部署

### 本地构建（生成静态文件）

```bash
bundle exec jekyll build
```

构建产物在 `_site/` 目录，可直接部署到任何静态托管服务。

### 构建模式

{: .table}
| 命令 | 用途 | 说明 |
|------|------|------|
| `bundle exec jekyll serve` | 本地开发 | 带增量构建 + 热刷新 + 文件监听 |
| `bundle exec jekyll build` | 生产构建 | 一次性构建，输出到 `_site/` |
| `JEKYLL_ENV=production bundle exec jekyll build` | 生产环境构建 | 启用生产模式插件 |

{% include common-index/index-preset.html level="success" msg="在 macOS Big Sur v11.2 下测试无任何问题。" %}

### GitHub Actions 自动部署

自动部署工作流配置文件：[deploy.yml](https://github.com/Bin4xin/bin4xin.github.io/blob/main/.github/workflows/deploy.yml)

推送到 `main` 分支后，GitHub Actions 自动执行：

1. 拉取代码
2. 运行 `jekyll build`
3. 部署 `_site/` 到 Pages 服务

{% include common-index/index-preset.html level="info" msg="GitHub Pages 使用<strong>固定版本</strong>的 Jekyll 和插件，与本地版本可能不同。如果本地构建成功但 Pages 构建失败，检查 <code>github-pages</code> gem 兼容性。" %}

### 部署前检查清单

- [ ] `bundle exec jekyll build` 无报错
- [ ] `_site/` 目录生成完整
- [ ] 本地 `serve` 预览无样式丢失
- [ ] `baseurl` 配置与部署方式匹配
- [ ] Front Matter 字段完整（见第三章）

---

## 十一、Git 工作流

### 基础配置

```bash
git config --global user.name "你的用户名"
git config --global user.email "你的邮箱@example.com"
```

### 代理配置（如需）

```bash
# HTTP 代理
git config --global http.proxy http://192.168.3.98:7890
git config --global https.proxy http://192.168.3.98:7890

# SOCKS5 代理
git config --global http.proxy socks5://192.168.3.98:7890
```

### 推送方式

**HTTPS + PAT：**

```bash
git config --global credential.helper store
git push   # 输入用户名 + Personal Access Token
```

**SSH（推荐）：**

```bash
git remote set-url origin git@github.com:Bin4xin/bin4xin.github.io.git
git push
```

### Commit 信息规范

本站采用以下格式：

```
[时间]<操作::相关文件>commit by 作者.
```

#### 命令行方式

```bash
# Linux / macOS
git commit -m "[`date +%Y/%m/%d/%T`]<添加::my-new-post.md>: commit by $(git config user.name)"

# Windows Git Bash
git commit -m "[`date +%Y/%m/%d/%T`]<测试::GitBash on MSWin>: commit by $(git config user.name)"
```

输出示例：

```
[SCS-1.0-dev bfc8df8] [2021/12/07/13:59:59]<测试::GitBash on MSWin>: commit by sentryCyberSec
```

#### 操作类型

{: .table}
| 操作 | 含义 | 示例 |
|------|------|------|
| `<添加::文件名>` | 新增文件 | `<添加::2026-09-03-new-post.md>` |
| `<移除::文件名>` | 删除文件 | `<移除::.DS_Store>` |
| `<修复::文件名>` | 修复问题 | `<修复::front-matter-syntax.md>` |
| `<更新::文件名>` | 内容更新 | `<更新::jekyll-sentinel-skill.md>` |

{% include common-index/index-preset.html level="info" msg="全新的仓库若希望修改默认的 master 分支，可执行 <code>git branch -M main</code> 将分支名称改为 main。" %}

### 分支策略

```bash
# 日常写作：直接在 main 分支提交
git add _posts/blog/新文章.md
git commit -m "[`date +%Y/%m/%d/%T`]<添加::新文章.md>: commit by $(git config user.name)"
git push origin main

# 大改动：新建分支，合并前预览
git checkout -b feat/new-theme
# ... 编辑 ...
git commit -am "[`date +%Y/%m/%d/%T`]<更新::theme>: commit by $(git config user.name)"
git push origin feat/new-theme
# 在 GitHub 上创建 PR，检查 Pages 构建状态后合并
```

### 全局忽略文件配置

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

### IDEA 中使用 Git

- Git 在 IDEA 中似乎不能包裹命令提交、推送
- 可添加模版加上时间戳
- 参考链接：[CSDN - IDEA 中 Git 的使用](https://blog.csdn.net/Q748893892/article/details/102460868)

---

## 十二、SSH 密钥配置

### Windows 端生成密钥

```bash
ssh-keygen -t ed25519 -C "你的邮箱@example.com"
```

### 上传公钥到虚拟机

**方式一：ssh-copy-id（Git Bash / WSL）**

```bash
ssh-copy-id -i ~/.ssh/id_ed25519.pub 用户名@虚拟机IP
```

**方式二：手动追加**

```bash
# 虚拟机端
mkdir -p ~/.ssh
chmod 700 ~/.ssh
echo "公钥内容" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### SSH Config 别名

编辑 `~/.ssh/config`（Git Bash / WSL 下路径）：

```text
Host jekyll-vm
    HostName 192.168.3.100
    User bin4xin
    IdentityFile ~/.ssh/id_ed25519
    Port 22
```

{% include common-index/index-preset.html level="info" msg="Windows 用户注意：Git Bash 下 SSH Config 路径为 <code>~/.ssh/config</code>（对应 <code>C:\\Users\\你的用户名\\.ssh\\config</code>）。建议用 Git Bash 统一操作，避免路径混乱。" %}

### 测试

```bash
ssh jekyll-vm
```

---

## 十三、常见问题速查

{% include common-index/index-preset.html level="error" msg="遇到问题时<strong>先看错误信息最后 3 行</strong>，通常包含真正的错误原因。90% 的问题可以用本节方法解决。" %}

### 13.1 环境与权限问题

{: .table}
| 问题 | 原因 | 解决方案 |
|------|------|----------|
| `sudo: bundle: command not found` | sudo 不继承 rbenv 环境变量 | 用 `sudo -E` 或避免 sudo（用高端口 ≥1024） |
| `bundler: command not found: jekyll` | sudo 导致 PATH 丢失 | `sudo -E` / 安装 rbenv-sudo / 使用完整路径 |
| `ruby: command not found` | rbenv 未正确初始化 | 检查 `~/.bashrc` 中是否有 `eval "$(rbenv init -)"`，执行 `source ~/.bashrc` |
| `rbenv: version 'x.x.x' not installed` | 项目要求的 Ruby 版本未安装 | `rbenv install x.x.x`，或检查 `.ruby-version` 文件 |

### 13.2 依赖与构建问题

{: .table}
| 问题 | 原因 | 解决方案 |
|------|------|----------|
| `nokogiri` 编译失败 | 缺少系统库 | `sudo apt install -y libxml2-dev libxslt1-dev`，在 Linux 下编译 |
| Ruby 源码下载慢 | 官方源在国外 | 设置 `RUBY_BUILD_MIRROR_URL` 国内镜像 |
| `bundle install` 报错 | Ruby 版本与 Gemfile 不匹配 | `ruby -v` 检查版本，用 rbenv 切换 |
| `Could not find gem 'jekyll-x.x.x'` | Gemfile.lock 锁定了不可用版本 | `bundle update jekyll` 或删除 `Gemfile.lock` 重新 `bundle install` |
| `Liquid Warning: Liquid syntax error` | Liquid 模板语法错误 | 检查 {% raw %}`{% %}`{% endraw %} 和 {% raw %}`{{ }}`{% endraw %} 是否配对，代码块内用 `raw`/`endraw` 标签包裹 |

### 13.3 预览与部署问题

{: .table}
| 问题 | 原因 | 解决方案 |
|------|------|----------|
| `jekyll serve` 启动后页面空白 | `baseurl` 配置与访问方式不匹配 | 本地调试：`bundle exec jekyll serve --baseurl ''` |
| 样式丢失（CSS 404） | `baseurl` 路径错误 | 检查 `_config.yml` 的 `baseurl`，确保与部署路径一致 |
| `jekyll serve` 后修改不刷新 | 文件监听失败 | 用 `--force_polling` 参数，或检查 inotify 限制 |
| GitHub Pages 构建失败 | 本地与远程 Jekyll 版本不同 | 使用 `github-pages` gem：`gem install github-pages` |
| `404` 页面 | 文章文件名或 Front Matter 格式错误 | 检查文件名是否符合 `YYYY-MM-DD-title.md`，Front Matter 是否有语法错误 |
| document 页面不出现在导航中 | `status: draft` 或 `order` 值过大 | 检查 `status` 字段是否为 `draft`，`order` 值是否合理 |

### 13.4 网络与连接问题

{: .table}
| 问题 | 原因 | 解决方案 |
|------|------|----------|
| Remote-SSH 连接失败 | 网络/SSH 服务/防火墙 | `systemctl status ssh`、`ufw allow 22`、检查 IP |
| Git 无法访问 GitHub | 网络限制 | 配置 HTTP/SOCKS5 代理 |
| `bundle install` 卡住 | RubyGems 源在国外 | `bundle config mirror.https://rubygems.org https://gems.ruby-china.com` |

### 13.5 文章内容问题

{: .table}
| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 文章不出现在首页 | Front Matter 缺失或格式错误 | 确保 `---` 包裹的 YAML 块在文件最开头，无空行 |
| 文章日期显示错误 | 文件名日期格式错误 | 文件名必须是 `YYYY-MM-DD-title.md`，日期与实际不符会排序异常 |
| 代码块内 {% raw %}`{{ }}`{% endraw %} 被 Liquid 解析 | Liquid 引擎优先解析 | 用 `raw`/`endraw` 包裹代码块 |
| 中文文章 URL 过长 | permalink 包含中文标题 | 在 Front Matter 中手动指定 `permalink: /short-url/` |
| document 短标题显示异常 | `short_title` 过长或含特殊字符 | 控制在 2-6 个字，避免使用 `\|`、`/`、`<`、`>` 等字符 |
| document `icon` 不显示 | Font Awesome 类名拼写错误 | 检查格式必须为 `fas fa-图标名`，确认站点引入了 Font Awesome |

---

## 十四、文章质量检查清单

### 通用检查（post + document）

- [ ] Front Matter 字段完整，title 与正文标题一致
- [ ] 代码块均标注语言，命令按行拆分
- [ ] 行内命令/路径/变量均用反引号包裹
- [ ] common-index 提示框级别与内容匹配，msg 中命令用 `<code>` 嵌入
- [ ] 标题层级不跳级（注意 h3 偏移规则），TOC 结构清晰
- [ ] 无 `Copy` / `Download` 等网页复制残留
- [ ] 占位符（如 `你的用户名`、`虚拟机IP`）标注明确，未遗漏

### post 专属检查

- [ ] `categories` 和 `tags` 已填写
- [ ] `date` 为首次发布时间，`wrench` 为最后修改时间（有修改时更新）
- [ ] 文件名符合 `YYYY-MM-DD-英文标题.md` 规范
- [ ] 文件放在对应栏目子目录（`_posts/blog/`、`_posts/daily/` 等）
- [ ] 文章有总结段落，给出适用场景和下一步建议

### document 专属检查

- [ ] `short_title` 简洁（2-6 字），适合侧边栏显示
- [ ] `order` 值合理，与同级文档排序一致
- [ ] `icon` 类名正确，站点已引入 Font Awesome
- [ ] `status` 按需设置（`new` / `updated` / 留空）
- [ ] `version` 已填写，方便追踪迭代
- [ ] `description` 精炼概括文档内容（用于列表页和 SEO）
- [ ] 如有易混淆概念，包含「概念辨析对比表」
- [ ] 如有知识体系，包含「思维导图文本块」
- [ ] `bundle exec jekyll build` 无报错，本地预览正常

---

{% capture _success_msg %}写于 <strong>2021-07-07</strong>，最后更新于 <strong>2026-09-03</strong>{% endcapture %}
{% include common-index/index-preset.html level="success" msg=_success_msg %}