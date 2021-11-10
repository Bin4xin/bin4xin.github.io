![Jekyll Build & Deploy](https://github.com/tuna/tuna.moe/workflows/Jekyll%20Build%20&%20Deploy/badge.svg)

### 网站构建历程

| 时间 | *Project Log* | 备注 |
| :--- | :--- | :--- |
| 2021/5/10/10:01:01 CST | `_inculde/footer.html`新增访客统计 | - |
| 2021/11/10/11:39:40 CST | 修改页头页尾部分内容 | [添加国内外镜像地址](https://bin4xin.github.io/) |
|  | 添加[`_config.yml`](https://github.com/Bin4xin/bin4xin.github.io/blob/main/_config.yml)添加了一些prof方便调用 | - |
|  | 使用Action进行构建 | 尝试使用两个分支进行构建部署对应文件夹成功，但单个分支对应项目构建资产存在路由访问问题，所以暂时先放下 |
|  | <em>代码和部分博客参考</em> | <ul><li>[Action踩坑文章在此](https://bin4xin.github.io/event/2021/Jekyll-site-routers-and-config/)</li> <li> [Github Actions总结](https://jasonkayzk.github.io/2020/08/28/Github-Actions%E6%80%BB%E7%BB%93/)</li> <li>[github action-cache使用实例](https://raw.githubusercontent.com/ustclug/website/master/.github/workflows/build.yml)</li> <li>[改变github-page分支](https://stackoverflow.com/questions/14040754/deleting-remote-master-branch-refused-due-to-being-the-current-branch)</li></ul> |
| ... | ... | ... |
|  |  |  |

<details>
<summary><em>点击以查看如何运行Demo</em></summary>

### 直接编译

本站使用 Jekyll 编写，并使用 babel 编译 ECMAScript6，因此必须安装 ruby >= 2.0 和 nodejs.

### For Centos
1.安装 nodejs
```
yum install nodejs
```
2.安装 ruby 2.2.4 and rubygems

Step 1: Install Required Packages
```
yum install gcc-c++ patch readline readline-devel zlib zlib-devel
yum install libyaml-devel libffi-devel openssl-devel make
yum install bzip2 autoconf automake libtool bison iconv-devel sqlite-devel
```
Step 2: Compile ruby 2.2.4 source code
```
wget -c https://cache.ruby-lang.org/pub/ruby/2.2/ruby-2.2.4.tar.gz
```
Step 3: Install rubygems
```
wget -c https://rubygems.org/rubygems/rubygems-2.4.8.tgz
ruby setup.rb
```
3. 安装 bundle 和 build
```
gem install bundle
gem install build
```
4. Fork mirrors source code

```
bundle install
jekyll build
```
</details>

其余LINUX发行版和MACOS差不多大同小异，参考链接：

[「笔记」：Jekyll for linux.服务器部署历程](https://www.sentrylab.cn/blog/2019/jekyll/in/linux/)

本人在MacOS BigSur v11.2下测试无任何问题。

之后在博客文件夹根目录下`jekyll serve -P 80` 或`bundle exec jekyll server -P 80`即可运行 demo.


### 食用方法

参考：

[# SentryLab「markdown」语法介绍&批注](https://about.sentrylab.cn/news/sentry-lab-markdown-usage/)
仅此一篇即可编写出漂亮的一篇博客

---
以上。
