---
layout: post
title: "「Jekyll开发美化」:如何添加访客次数 I"
date: 2022-11-18
toc: true
author: Bin4xin
categories:
- blog
tags:
- Development
- Jekyll
- GA
- SuperProxy
---

我们已经迫不及待地向您介绍这些"过时的技术"：

大致思路[^1]：

> 通过`Google App Engine`搭建superProxy, 开启其GA权限;
>
> 设置对应查询query以及更新频率;
>
> 获取json结果生成地址;
>
> 通过js请求获取json数据, 解析展现;
>
> 加入本地pageview文件备份容错;


### 技术栈

- Google Appspot
- Google App engine Build Api
  - 构建superProxy
- Google Analytics Api
  - superProxy接入Analytics Api，拿到Analytics数据
- 给superProxy添加一个私有域（认证）
  - 在API Access pane中创建一个OAuth

基本方法[^1]可以参考：[《如何给 Jekyll 博文添加阅读数显示 》](https://taoalpha.github.io/blog/2015/06/07/tech-add-google-analytics-pageviews-to-jekyll-blog/){:target="_blank"}

我这儿根据过程提供一些过来建议。

### BUILD [Permissions error]

```
Please make sure that you have permission to view applications on the project and that **@**.com has the App Engine Deployer (roles/appengine.deployer) role.
```

如上，报`App Engine Deployer (roles/appengine.deployer) role.`的错，也就是构建者权限的问题；

#### 第一步：

需要进入[Google Cloud dashboard](https://console.cloud.google.com/apis/dashboard){:target="_blank"}查看您是否开启了Build的Api

在`【已启用的API和服务中】`找`【Cloud Build Api】`，没有开启可以搜索Build Api把她开启：

![2022-11-18-11.13.23.png]({{site.PicturesLinks_Domain}}/images/2022/11/18/2022-11-18-11.13.23.png)

#### 第二步：

进入[iam admin panel](https://console.cloud.google.com/iam-admin/iam){:target="_blank"}

找到终端报权限错误的用户，给这个用户赋权，（就是说这个用户现在没有构建的权限，我们给她赋上权就行），在这里的示例就是`***@**.com`

找到【App Engine】下的【Deployer】权限：

![2022-11-16-11.02.41.png]({{site.PicturesLinks_Domain}}/images/2022/11/18/2022-11-16-11.02.41.png)


### BUILD [invalid_client]

```
{u'error_description': u'Unauthorized', u'error': u'invalid_client'}
```

构建完成后，访问superProxy，返回invalid_client。

#### 第一步

进入Gcloud【凭据服务】，找到新建的`OAuth 2.0 客户端 ID` -> `【重置 Secret】`；

#### 第二步

保持[apis/credentials](https://console.cloud.google.com/apis/credentials){:target="_blank"}获得的两个Secret与Build的代码：

`https://{your-app-id}.appspot.com`与`src/config.py`中`OAUTH_REDIRECT_URI`

**保持一致**

### Build [fetching application]

```
ERROR: (gcloud.app.deploy) Permissions error fetching application [apps/**-your-**-project**]. Please make sure that you have permission to view applications on the project and that ***@**.com has the App Engine Deployer (roles/appengine.deployer) role.
```

#### 第一步

如果报的权限错误是跟application有关，跟用户无关，那么大概率是您的本地sdk配置存在配置问题[^2]：

进入【appengine】-> header处【选择项目】，而针对此错误需要修改您本地默认project-id，id参考如下：

![2022-11-18-14.28.13.png]({{site.PicturesLinks_Domain}}/images/2022/11/18/2022-11-18-14.28.13.png)

希望能够帮助您在构建Appspot/构建superProxy/OAuth时帮到您，如果有任何问题请在下方点击need help提交issues。

### REF

[^1]: [《如何给 Jekyll 博文添加阅读数显示 》](https://taoalpha.github.io/blog/2015/06/07/tech-add-google-analytics-pageviews-to-jekyll-blog/){:target="_blank"}
[^2]: [App Engine 错误问题排查](https://cloud.google.com/appengine/docs/standard/troubleshooting#no-project-permission){:target="_blank"}