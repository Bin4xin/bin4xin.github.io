---
layout: post
toc: true
title: "在 VMware Ubuntu 中结合 VS Code 与 Jekyll 进行远程开发"
author: Bin4xin
categories:
    - blog
tags:
    - Jekyll
    - VMware
    - VSCode
    - Ubuntu
    - Ruby
---

## 背景

在 Windows 环境下开发 Jekyll 博客时，经常会遇到 Ruby 原生扩展（如 `nokogiri`）的编译问题。即使通过 MSYS2 配置好编译工具链，仍然可能面临版本兼容性、权限管理和依赖冲突等挑战。

为了解决这些痛点，我选择在 VMware 虚拟机中运行 Ubuntu Server，并利用 VS Code 的 Remote-SSH 功能进行远程编辑和调试，最终实现了流畅的 Jekyll 开发体验。

本文将详细介绍整个搭建过程，包括环境准备、Ruby 安装、Jekyll 运行、VS Code 远程连接以及 Git 配置等关键步骤，并分享一些常见问题的解决方法。

## 环境准备

### ISO 下载

{% include components/download-panel.html
  title="Ubuntu 22.04.5 LTS Server"
  version="22.04.5"
  id="ubuntu-dl"
  note="22.04.5 为当前最新小版本，后续可能有更新，但官方链接长期有效"
  mirrors=site.data.downloads.ubuntu-2204
  verify=site.data.verify.ubuntu-2204
%}

### 安装 VMware 虚拟机

在 VMware 中创建一台 Ubuntu 22.04 LTS Server 虚拟机，建议分配至少 2 个 CPU、4GB 内存和 20GB 硬盘。

安装时注意：

- 选择 **Ubuntu Server**（不要选择 minimized 版本）
- 勾选 **Install OpenSSH server**，方便后续远程连接

{% include common-index/index-preset.html level="info" msg="建议将虚拟机网络模式设为 NAT（共享宿主机 IP），既能通过宿主机代理访问外网，又能避免桥接模式下 IP 频繁变动导致 SSH 连接中断。" %}

### 更换国内软件源

为了加速 `apt` 下载，将软件源更换为阿里云镜像。

{% include common-index/index-preset.html level="warn" msg="替换 sources.list 前请先执行 <code>sudo cp /etc/apt/sources.list /etc/apt/sources.list.bak</code> 备份原文件，若镜像源不可用可随时回滚。" %}

编辑 `/etc/apt/sources.list`，替换为以下内容：

```bash
deb http://mirrors.aliyun.com/ubuntu/ jammy main restricted universe multiverse
deb http://mirrors.aliyun.com/ubuntu/ jammy-updates main restricted universe multiverse
deb http://mirrors.aliyun.com/ubuntu/ jammy-backports main restricted universe multiverse
deb http://mirrors.aliyun.com/ubuntu/ jammy-security main restricted universe multiverse
```

更新软件源和系统：

```bash
sudo apt update
sudo apt upgrade -y
```

### 安装基础依赖

Jekyll 和常用的 Ruby gem 编译需要一些系统库，执行以下命令安装：

```bash
sudo apt install -y build-essential git curl \
  zlib1g-dev libssl-dev libreadline-dev libyaml-dev \
  libxml2-dev libxslt1-dev
```

## 安装 Ruby

使用 `rbenv` 来管理 Ruby 版本，便于安装和切换。首先克隆 `rbenv` 和 `ruby-build`：

```bash
git clone https://github.com/rbenv/rbenv.git ~/.rbenv
echo 'export PATH="$HOME/.rbenv/bin:$PATH"' >> ~/.bashrc
echo 'eval "$(rbenv init -)"' >> ~/.bashrc
source ~/.bashrc

git clone https://github.com/rbenv/ruby-build.git ~/.rbenv/plugins/ruby-build
```

为了加速 Ruby 源码下载，设置国内镜像：

```bash
echo 'export RUBY_BUILD_MIRROR_URL="https://cache.ruby-china.com/pub/ruby/"' >> ~/.bashrc
source ~/.bashrc
```

安装 Ruby 3.1.4（与 GitHub Pages 兼容性较好）：

```bash
rbenv install 3.1.4
rbenv global 3.1.4
<code>ruby -v</code>
```

## 安装 Bundler 和 Jekyll

安装 Bundler（建议使用 2.x 版本）：

```bash
gem install bundler -v '~> 2.4'
```

进入你的 Jekyll 项目目录，执行：

```bash
bundle install
```

如果 `Gemfile` 中包含 `github-pages`，它会自动安装 Jekyll 3.9.5 及其依赖。因为我们已经安装了编译所需的系统库，`nokogiri` 等 gem 应该能顺利编译安装。

## 获取项目代码

可以直接在虚拟机中克隆你的 GitHub 仓库：

```bash
git clone https://github.com/你的用户名/bin4xin.github.io.git
cd bin4xin.github.io
```

如果 Git 访问 GitHub 较慢，可以设置代理（假设宿主机代理为 `192.168.3.98:7890`）：

```bash
git config --global http.proxy http://192.168.3.98:7890
git config --global https.proxy http://192.168.3.98:7890
```

## 启动 Jekyll 预览

在项目目录中运行：

```bash
bundle exec jekyll serve --host 0.0.0.0 -P 4000
```

参数说明：

- `--host 0.0.0.0`：允许外部访问
- `-P 4000`：指定端口（默认 4000，不需要 root 权限）

启动后，在 Windows 浏览器中访问 `http://$INNER-VM-HOST-IP:4000` 即可看到博客。

{% include common-index/index-preset.html level="success" msg="Jekyll 服务已成功启动，后续修改 Markdown 文件后保存即可自动重新生成站点，刷新浏览器查看效果。" %}

## VS Code 远程编辑

### 安装 Remote - SSH 扩展

在 VS Code 中搜索并安装 **Remote - SSH** 扩展（Microsoft 出品）。

### 配置 SSH 密钥登录

每次连接都输入密码既繁琐又不安全，推荐配置 SSH 密钥实现免密登录。

#### 1. 在 Windows 端生成密钥对

打开 PowerShell 或 Git Bash，执行：

```bash
ssh-keygen -t ed25519 -C "你的邮箱@example.com"
```

按回车使用默认路径（`C:\Users\你的用户名\.ssh\id_ed25519`），建议设置一个 passphrase（也可留空）。

生成后会得到两个文件：

- `id_ed25519`：私钥，**绝不能泄露**
- `id_ed25519.pub`：公钥，可以分发到服务器

#### 2. 将公钥上传到虚拟机

**方式一：使用 `ssh-copy-id`（Git Bash 或 WSL）**

```bash
ssh-copy-id -i ~/.ssh/id_ed25519.pub 用户名@$INNER-VM-HOST-IP
```

**方式二：手动复制（PowerShell）**

先查看公钥内容：

```powershell
Get-Content $env:USERPROFILE\.ssh\id_ed25519.pub
```

然后 SSH 登录到虚拟机，将公钥追加到 `authorized_keys`：

```bash
mkdir -p ~/.ssh
chmod 700 ~/.ssh
echo "你的公钥内容" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

#### 3. 配置 SSH Config（可选但推荐）

在 Windows 的 `C:\Users\你的用户名\.ssh\config` 文件中添加：

```text
Host jekyll-vm
    HostName $INNER-VM-HOST-IP
    User bin4xin
    IdentityFile ~/.ssh/id_ed25519
    Port 22
```

这样后续连接只需输入别名 `jekyll-vm`，无需再记 IP 和用户名。

#### 4. 测试免密登录

```bash
ssh jekyll-vm
```

如果直接登录成功且无需输入密码，说明配置完成。

{% include common-index/index-preset.html level="info" msg="配置好密钥后，VS Code Remote-SSH 连接时将自动使用密钥认证，无需每次输入密码，大幅提升开发体验。" %}

### 配置 SSH 连接

使用快捷键 `Ctrl+Shift+P` 打开命令面板，输入 `Remote-SSH: Connect to Host...`，然后输入连接信息：

```text
用户名@$INNER-VM-HOST-IP
```

例如 `bin4xin@$INNER-VM-HOST-IP`。第一次连接时需要确认主机指纹并输入密码。

连接成功后，VS Code 会打开一个远程窗口，左下角显示 `SSH: $INNER-VM-HOST-IP`。

### 打开远程文件夹

在远程窗口中点击"打开文件夹"，输入远程项目路径（如 `/home/bin4xin/github/bin4xin.github.io`），即可像编辑本地文件一样编辑博客内容。

### 实时预览

保持虚拟机的 Jekyll 服务运行，在 VS Code 中修改文件后，Jekyll 会自动重新生成站点（如果未启用 `--livereload`，则手动刷新浏览器即可）。

这种方式下，你可以在熟悉的 VS Code 环境中编辑，而所有的编译和运行都在 Linux 中完成，避免了 Windows 上的依赖问题。

## Git 配置与推送

### 配置用户信息

首次提交前需要设置用户名和邮箱：

```bash
git config --global user.name "你的用户名"
git config --global user.email "你的邮箱@example.com"
```

### 推送代码到 GitHub

#### 方式一：HTTPS + Personal Access Token

使用 HTTPS 方式推送时，需要 Personal Access Token (PAT)：

1. 打开 GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. 生成新 token，勾选 `repo` 权限
3. 配置 Git 凭据存储：

```bash
git config --global credential.helper store
```

4. 执行 `git push`，输入用户名和 token（不是密码）

#### 方式二：SSH（推荐）

```bash
# 生成 SSH 密钥
ssh-keygen -t ed25519 -C "你的邮箱@example.com"

# 查看公钥并添加到 GitHub
cat ~/.ssh/id_ed25519.pub

# 修改远程仓库地址
git remote set-url origin git@github.com:你的用户名/bin4xin.github.io.git

# 推送
git push
```

## 常见问题与解决

{% include common-index/index-preset.html level="error" msg="若遇到 <code>bundle install</code>或 <code>jekyll serve</code> 报错，优先检查 Ruby 版本（<code>ruby -v</code>）与 Gemfile 中指定的版本是否一致，版本不匹配是最常见的根因。" %}

### 1. `sudo: bundle: command not found`

使用 `sudo bundle` 时，`rbenv` 的环境变量不会传递给 root。解决方法是使用 `sudo -E` 保留环境，或者直接使用高端口（如 4000），避免使用 `sudo`。

### 2. `bundler: command not found: jekyll`

同样是因为 `sudo` 导致 `PATH` 丢失。可以使用 `sudo -E`，或安装 `rbenv-sudo` 插件，或者用完整路径执行。

### 3. Git 代理问题

如果虚拟机无法直接访问 GitHub，可以配置代理。如果代理是 SOCKS5，需要改用 `socks5://` 前缀：

```bash
git config --global http.proxy socks5://192.168.3.98:7890
```

### 4. Ruby 源码下载慢

使用 `RUBY_BUILD_MIRROR_URL` 环境变量指向国内镜像，并确保 `ruby-build` 插件已更新到最新版。

### 5. Remote-SSH 连接失败

检查虚拟机 IP 是否可达，SSH 服务是否运行，防火墙是否放行 22 端口：

```bash
sudo systemctl status ssh
sudo ufw allow 22
```

### 6. `nokogiri` 编译失败

确保已安装 `libxml2-dev` 和 `libxslt1-dev`，并在 Linux 环境下编译，通常可以避免 Windows 上的编译问题。

## 总结

通过 **VMware Ubuntu + VS Code Remote-SSH + Jekyll** 的组合，我们获得了稳定高效的博客开发体验。Linux 环境下 Ruby 原生扩展的编译更加顺畅，而 VS Code 的远程开发功能让我们可以继续使用熟悉的编辑器，兼顾了开发效率和跨平台兼容性。

这种方案特别适合以下场景：

- Windows 下 Jekyll 环境配置困难
- 需要同时使用多个 Ruby 版本
- 希望保持本地 Windows 环境整洁
- 需要模拟 Linux 生产环境

{% include common-index/index-preset.html level="success" msg="以上，阐述完毕。" %}
