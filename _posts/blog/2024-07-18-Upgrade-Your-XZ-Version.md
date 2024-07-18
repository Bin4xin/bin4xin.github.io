---
layout: post
title: "「macOS」更新XZ | Upgrade Your XZ Version"
date: 2024-07-18
toc: true
author: Bin4xin
categories:
- blog
tags:
- XZ
- Supply Chain Poisoning
---

> 5.6.2 (2024-05-29) `https://github.com/tukaani-project/xz/releases/tag/v5.6.2 change log`
> 
>    * Remove the backdoor (CVE-2024-3094).
>
>    * Not changed: Memory sanitizer (MSAN) has a false positive
>      in the CRC CLMUL code which also makes OSS Fuzz unhappy.
>      Valgrind is smarter and doesn't complain.
>
>    ...

# 效果图

![](https://image.isisy.com/images/2024/07/18/2024-07-17-17.18.00.png)

### 1. 使用 Homebrew 安装最新版本

通常情况下，安装最新版本的 XZ 可能是一个更好的选择，特别是如果您不需要特定版本的特定功能或修复。

```bash
brew install xz
```

这将安装 Homebrew 中可用的最新版本的 XZ。

### 2. 手动下载和安装特定版本

如果您非常需要特定版本的 XZ，可以手动下载该版本的源代码并进行编译和安装。步骤如下：

- 前往 [Tukaani XZ Github](https://github.com/tukaani-project/xz/releases/tag/v5.6.2)，找到并下载您需要的特定版本的源代码（例如，xz-5.2.5.tar.gz）。
- 解压缩下载的源代码包：
  ```bash
  tar -xzvf xz-5.6.2.tar.gz
  cd xz-5.6.2
  ```
- 编译和安装：
  ```bash
  ./configure
  make
  sudo make install
  ```
- 验证安装：
  ```bash
  xz --version
  ```

