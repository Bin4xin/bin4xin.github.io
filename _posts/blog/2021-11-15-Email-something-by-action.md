---
layout: post
title: "如何通过Action来定制化您的订阅邮件"
date: 2021-11-15
wrench: 2021-11-19
author: Bin4xin
toc: true
categories: [blog, 笔记, Github Action]
permalink: /blog/2021/如何通过Action来定制化您的订阅邮件/
---

### Github Actions的简介

> [GitHub Actions](https://github.com/features/actions) 是 GitHub 的持续集成服务，
> 于[2018年10月](https://github.blog/changelog/2018-10-16-github-actions-limited-beta/)推出。
> 摘于[GitHub Actions 入门教程](https://www.ruanyifeng.com/blog/2019/09/getting-started-with-github-actions.html)

我更愿意把她叫做Paas(平台服务)；为什么？谈谈我最近这段时间使用的看法：

举一个简单的例子：我们在家里怎么做出一块面包？

- 采购面包原材料；
- 确定面包的外形、口味；
- 手动加工原材料；
- 烘焙成型。

那么一个***面包Action***是怎么样的呢？我们只需要人为负责1、2两步，而3、4步怎么办？人类的智慧总是无限，我们确定基本重复流程后“教会”机器，让机器来完成；而我们把精力放在原材料的质量上和面包外形和口味；

这就是工厂；

来谈谈Action，假设我们定义：

在软件生产周期内，不涉及到需求方向，只考虑代码作业；为了方便叙述我简化流程：那么从编辑代码、运行调试代码到最后的上线代码，在某种程度上来看实际上只有第一个流程是和我们息息相关、关联度极高的，我们需要定义各种根据需求来个性化定制的代码、接口、函数，后面的两个流程从一定意义上来看，属于***流水线作业***；

***嘿!把环境搭建和枯燥的环境变量交给机器吧!!!***

这，是什么？平台。

### Github Actions的作用

十一月份对我来说是痴迷Action的一个月，可以看到下面的图，整个十一月按每天算，单天我最多提交了146次包括调试、构建在内的代码，令人痴迷。

![截屏2021-11-19 下午5.15.44.png](https://i.loli.net/2021/11/19/qF2nZRi7g1xBV6Y.png)

Github Action提供 Github 服务器托管的虚拟机包括Linux、Windows以及macOS，支持很多环境，您可以[移步docs快速开始](https://docs.github.com/cn/actions/quickstart)
<!-- 现在也有个词很火，叫[元宇宙]()； -->

还有一些相关的基本概念、文件相关，我就不搬运了，可以移步开头的入门教程查看相关文章内容。

### Email 相关实例

如果您对一些实时数据感兴趣，比如最新的CVE、CNVD漏洞库，亦或者您关心服务器服务的运行状态，亦或者是每天的天气，您都可以使用Github Actions市场里的Email Action相关实例进行复用，紧接着可以对相关配置文件进行配置达到您的目的。

我这里以服务器的实时运行任务来举例：

{: .table}
| [Email Action示例](https://github.com/Bin4xin/Mail-Action/) | 相关代码 | 备注 |
| :--- | :--- | :--- |
| `.github/workflows/action.yml` | [`action.yml`](https://github.com/Bin4xin/Mail-Action/blob/master/.github/workflows/action.yml) | git目录下流程文件，目录不可变动，文件名可自定义 |
| name | `name: 'GitHub Actions Email Actions By bin4xin'` | 任务名称 |
| on | `on: [push]` | 任务触发条件，这里指在分支收到推送请求后即执行 |
| jobs | `jobs: ` | 任务流程开始 |
| {folwname} | `{folwname}: ` | 任务流程1名称 |
| runs-on | `runs-on: ubuntu-latest` | 任务运行镜像自定义，可选Windows、Linux、macOS |
| steps | `steps: ` | 流程步骤定义开始 |
| {step}name | `- name: 'Checkout codes'` | 步骤名称，一个流程可以有多个步骤 |
| uses | `uses: actions/checkout@v1` | 使用actions市场共享代码，只需要设置一些相关必要参数即可成功运行action |
| run | `run: bash ./processEmail.sh` | 运行系统命令 |
|  | ![截屏2021-11-19 下午4.53.47.png](https://i.loli.net/2021/11/19/fpyDCvRzsG3dgNF.png) | 如果有多条命令可以如左边格式书写或者参考[此处](https://github.com/Bin4xin/Mail-Action/blob/master/.github/workflows/action.yml#L17) |
| needs | `needs: build` | 在`{folwname}`后，Actions默认多个流程并发进行，如果有先后关系则使用 |

到此，我们就可以使用actions来构建一套标准的任务流程；

#### 下一步

使用默认的邮件action进行测试，参考[GitHub Actions 教程：定时发送天气邮件](https://www.ruanyifeng.com/blog/2019/12/github_actions.html)

#### 最后

除了文章内的纯文本外，我们还可以自定义邮件为html，然后发一些漂亮的邮件：

```
- name: 'Send mail'
	uses: dawidd6/action-send-mail@v3
	with:
	  server_address: smtp.qq.com
	  server_port: 465
	  username: ${{ secrets.MAIL_USERNAME }}
	  password: ${{ secrets.MAIL_PASSWORD }}
	  subject: "${{ env.REPORT_PLACE }} - 订阅信息"
	  html_body: file://result.html
	  to: 3313336101@qq.com
	  from: 哨兵 -  ${{ env.REPORT_COMMIT }}
	  content_type: text/html
```
我的思路是：写好一些通用模版，html模版可以在本地调试好上传即可，然后在bash脚本里拼接、闭合标签即可；

`echo -e "$fontStyleEnd\n$fontStyleEnd\n$htmlTempStart\n$serverAllTipsInfo\n$process\n$htmlTempEnd\n" > result.html`

效果如下：

![IMG_E169327EB634-1.jpeg](https://i.loli.net/2021/11/19/seIawvQ8qbMHdDS.jpg)

### 拓展阅读

- [其他一些可能用到的Action变量](https://docs.github.com/cn/actions/learn-github-actions/environment-variables)
- [关于使用 GitHub Actions 进行打包](https://docs.github.com/cn/actions/publishing-packages/about-packaging-with-github-actions)
- [等等]
