---
layout: post
title: "网站搭建备忘录"
date: 2021-10-26
wrench: 2021-11-09
author: Bin4xin
toc: true
categories: [blog, 笔记, Github Action]
permalink: /blog/2021/memorandum-todo/
---


### 博客的自动化同步问题

> [2021/10/26/21:04:22]: [部分问题总结]

当前重中之重在与对于博客的自动化同步问题的解决，那么自然需要对当下博客同步进行分析；

### 当下同步流程问题

- [B4xinSynchronize]({{site.githubAccess}}/B4xinSynchronize)同步对应仓库
	- `bin4xin.github.io  =>git push> www.sentrylab.cn`
	- `bin4xin.gitee.io   =>git push> about.sentrylab.cn`
	- `sentrylab-www-cn   =>scp> $vps/nginx_web/sentrylab/www   =>git-checkout> www.sentrylab.cn`
	- `sentrylab-about-cn =>scp> $vps/nginx_web/sentrylab/about =>git-checkout> about.sentrylab.cn`

#### 如何解决？

可以看出，本地仓库太过于冗余，我需要在本地构建完成后将两个JEKYLL（Home与About）项目下的`_site`拷贝到对应仓库下，然后`git push`，这也是后来为什么有了[B4xinSynchronize]({{site.githubAccess}}/B4xinSynchronize)，我嫌push太繁琐了，甚至还喊出了*Let your git only yes or no*的口号(汗)

实际上，使用Action进行构建后就解决了部分本地仓库如[bin4xin.github.io]({{site.githubAccess}}/bin4xin.github.io)的同步问题，可以直接在Action构建后push到分支上显示；代码和部分博客参考如下：

- [Action踩坑文章在此](/event/2021/Jekyll-site-routers-and-config/)
    - [Github Actions总结](https://jasonkayzk.github.io/2020/08/28/Github-Actions%E6%80%BB%E7%BB%93/)
        - [github action-cache使用实例](https://raw.githubusercontent.com/ustclug/website/master/.github/workflows/build.yml)
    - [改变github-page分支](https://stackoverflow.com/questions/14040754/deleting-remote-master-branch-refused-due-to-being-the-current-branch)

### 访问速度的问题

而为了所谓的访问速度，妥协了一些优雅性，所以这也是当下我需要去解决的问题；因为一些诸如网站备案等原因，我个人不得不把博客搭建在国外的服务器上，而导致的问题就是：

解析、访问速度变得慢了很多，我想这也是很多人所困扰的问题之一；于是我就一直在思考，是否能够针对这个问题来从技术上做一些改变呢：

#### 如何解决？

- cloudflare
- cname?


### 下一步

- [ ] About主页访问路由改变；
    - 当下设计的是[Home主页]({{site.githubIO}}) && [About主页]({{site.giteeIO}})，未来应是[国外镜像]({{site.githubIO}}/about) && [国内镜像]({{site.giteeIO}}/about)
- [ ] *CNAME是否能够对应不同的镜像跳转？DNS解析中是否能够解决地域跳转问题？*
- [ ] About构建问题；
    - 若需解决上面的问题，那么亟需修改的就是对于About的源码构建的问题
    - *是否能够仓库2 Action构建的源码推送的仓库1的分支上？*
- [ ] github 与 gitee仓库同步问题；
- [ ] 页面添加自行点击：博客国内镜像 && 国外镜像跳转；
- [ ] 响应式折叠footer相关简介；
- [ ] ...

我第一个想到的就是针对不同的访问区ip源进行不同地域跳转

```xml
static u_char ngx_http_server_string[] = "Server: COMMUNIST REGIME POWER SUPREME" CRLF;
```

