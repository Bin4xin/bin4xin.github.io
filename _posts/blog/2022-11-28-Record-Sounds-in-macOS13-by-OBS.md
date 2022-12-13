---
layout: post
title: "「OBS on MacOS13」:（悠雅de）录制桌面声音"
date: 2022-12-13
toc: true
author: Bin4xin
categories:
- blog
tags:
- MacOS13
- OBS
---

解决问题：使用命令打开OBS后存在终端。

## 添加OBS声音

> 目前使用的`MacOS13`，由于新版系统权限问题， OBS无法自动取得桌面声音，只能依靠第三方软件[^1]

我这里用的是`iShowU`，参考1中使用的是`soundflower`，应该操作都差不多；

然后需要在终端中执行添加参数快捷方式的命令才能录制桌面声音：

```bash
open /Applications/OBS.app/Contents/MacOS/OBS --args -picture
```

## 解决

使用自动操作即可，基本操作可以查看参考[^2]。

### 运行shell

打开自动操作 -> 运行shell脚本 -> 填入以下：

```bash
cd /Applications/OBS.app/Contents/MacOS/ && nohup ./OBS --args -picture -Xdock:icon=/Applications/OBS.app/Contents/Resources/AppIcon.icns &
```

![2022-12-13-11.31.37.png]({{site.PicturesLinks_Domain}}/images/2022/12/13/2022-12-13-11.31.37.png)

### 美化

![2022-12-13-11.21.29.png]({{site.PicturesLinks_Domain}}/images/2022/12/13/2022-12-13-11.21.29.png)

然后拖进Dock栏运行即可，就不会存在终端了。

**不过需要注意的是，这种方式是通过自动操作app运行的OBS，所以需要额外赋（屏幕录制+麦克风）权限给自动操作。**

![2022-12-13-10.56.09.png]({{site.PicturesLinks_Domain}}/images/2022/12/13/2022-12-13-10.56.09.png)

## REF

[^1]: [ macOS下OBS没有桌面声音且不录音 ](https://blog.51cto.com/lilongsy/5454725){:target="_blank"}
[^2]: [Mac OSX中带参数启动应用程序（如Chrome）的方法比较](https://blog.csdn.net/chusizhua9738/article/details/100905982){:target="_blank"}