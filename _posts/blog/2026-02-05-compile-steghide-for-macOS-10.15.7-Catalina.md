---
layout: post
toc: true
title: "Compiled 「steghide」 for macOS 10.15.7/Catalina"
date: 2026-02-05
author: Bin4xin
categories:
    - blog
tags: 
    - 编译
    - CTF
    - MISC
    - libmcrypt
    - jpegsrc
    - steghide
---

## 1. 安装 libmcrypt 库

```bash
# 下载源码包
curl -LO https://downloads.sourceforge.net/project/mcrypt/Libmcrypt/2.5.8/libmcrypt-2.5.8.tar.gz

# 解压
tar xzf libmcrypt-2.5.8.tar.gz

# 进入目录
cd libmcrypt-2.5.8

# 配置编译参数（使用特定的 CFLAGS）
./configure CFLAGS="-g -O2 -Wno-implicit-function-declaration"

# 编译
make

# 安装（需要管理员权限）
sudo make install
```

## 2. 安装 JPEG 库

```bash
# 下载 JPEG 源码
curl -O https://www.ijg.org/files/jpegsrc.v9f.tar.gz

# 解压
tar xzf jpegsrc.v9f.tar.gz

# 进入目录
cd jpeg-9f

# 配置（指定安装路径为 /usr/local）
./configure --prefix=/usr/local

# 编译
make

# 安装
sudo make install
```

## 3. 安装 steghide

```bash
# 克隆源代码
git clone https://github.com/StegHigh/steghide.git

# 进入目录
cd steghide/

# 配置（指定 JPEG 和 libmcrypt 的路径）
./configure \
  CPPFLAGS="-I/usr/local/Cellar/jpeg/9f/include -I/usr/local/include" \
  LDFLAGS="-L/usr/local/Cellar/jpeg/9f/lib -L/usr/local/lib -ljpeg -lmcrypt"

# 编译（指定使用 glibtool）
make LIBTOOL=glibtool

# 安装
sudo make LIBTOOL=glibtool install
```

## 依赖关系说明

1. **libmcrypt**：加密算法库
2. **JPEG 库**：图像处理库，版本为 9f
3. **steghide**：依赖于上述两个库，用于在图像中隐藏信息

## 注意事项

1. 这些命令需要在 Unix/Linux/macOS 系统下执行
2. 部分命令需要管理员权限（sudo）
3. 确保系统已安装必要的开发工具：gcc, make, autoconf, automake, libtool 等
4. 如果遇到路径问题，可能需要根据实际安装位置调整 CPPFLAGS 和 LDFLAGS 中的路径

## 赛题相关

```bash
steghide extract -sf shanghao.jpg -p qsnctf
wrote extracted data to "flag.txt".

cat flag.txt 
qsnctf{07f..d10}
```
