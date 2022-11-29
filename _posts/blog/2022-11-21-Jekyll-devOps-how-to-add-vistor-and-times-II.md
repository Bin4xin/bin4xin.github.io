---
layout: post
title: "「Jekyll开发美化」:如何添加访客次数 II（以翻页钟样式为例）"
date: 2022-11-21
toc: true
author: Bin4xin
categories:
- blog
tags:
- Development
- Jekyll
- CSS
- JavaScript
---

在上一篇文章中[《「Jekyll开发美化」:如何添加访客次数 I》](blog/2022/Jekyll-devOps-how-to-add-vistor-and-times-I/){:target="_blank"}

我们已经向您介绍了如何获得访客次数，这一篇我们将会把这些数据「悠雅」地利用起来，效果如下：

![2022-11-18-14.59.42.png](https://image.yjs2635.xyz/images/2022/11/18/2022-11-18-14.59.42.png)

如果您不清楚如何获得访客，可以移步上面的「如何添加访客次数 I」链接。

### 技术栈

- JavaScript
- Jquery
- Ajax
- CSS

### FlipClock

首先我们需要获得一个展示数据的样式，我们这里选择的是翻页钟的样式，这里是[<i class="fa fa-github"></i> objectivehtml / FlipClock仓库](https://github.com/objectivehtml/FlipClock){:target="_blank"}

选一个您喜欢的样式把源码获取过来（别忘了给个Star）：

#### 第一步

新建`_includes/extensions/counter.html`：

```html
<!--
   - FlipClock design
   -    @link { https://github.com/objectivehtml/FlipClock }
-->
<link rel="stylesheet" href="/assets/flipclock/flipclock.css">
<script src="/assets/flipclock/flipclock.js"></script>
<script>
    $(document).ready(function() {
        // Instantiate a counter
        clock_counts = 1
        clock = new FlipClock($('.clock'), clock_counts , {
            clockFace: 'Counter'
        });
</script>
```

我们可以清楚的看到翻页钟接收了`clock_counts`并传入`clock`类，于是我们要想办法把访客参数通过代码的方式获取到并传到`clock`里即可。

#### 第二步

通过构建的SuperProxy[^1]中获得的Public Endpoint URL[^2]来实现站点获取Pageviews数据，此之前，我们需要对获取的参数进行处理，可以参考「GAE上创建查询」[^3]

进行这一步，对了Public Endpoint长这样：

![2022-11-18-15.18.26.png](https://image.yjs2635.xyz/images/2022/11/18/2022-11-18-15.18.26.png)

#### 第三步

确认完您后的了Public Endpoint之后，将以下代码加入您的`counter.html`中：

```html
<script>
    function getGAJson() {
        let counts = null
        $.ajax({
            url: 'your Public Endpoint URL',
            dataType: 'json', // for cross-origin access
            timeout: 1000 * 10, // 10 secs
            async: false,
            success: function(data) { counts = displayPageviews(data.rows); },
            error: function() { console.log('Failed to load Pageviews!'); }
        });
        return counts;
    }
    function displayPageviews(rows) {
        if (rows === undefined) { return; }
        var curPath = window.location.pathname;
        var curFile = curPath.slice(curPath.lastIndexOf('/') + 1); // Sometimes posts will be moved.
        var len = rows.length;
        var cnt = 0;

        for (var i = 0; i < len; ++i) {
            var gaPath = rows[i][0];
            var gaFile = gaPath.slice(gaPath.lastIndexOf('/') + 1);

            if (gaPath === curPath || gaFile === curFile) {
                cnt += parseInt(rows[i][1]);
            }
        }
        return setInitialCount(cnt);
        // ref @link
        //      - { https://cotes.page/posts/fetch-pageviews-from-google-analytics/#web-%E7%AB%AF%E5%A4%84%E7%90%86-ga-%E6%95%B0%E6%8D%AE }
        //      - { https://taoalpha.github.io/blog/2015/06/07/tech-add-google-analytics-pageviews-to-jekyll-blog/ }
    }
    // <!-- @link { https://profile-counter.glitch.me/bin4xin.github.io/count.svg } -->
    function setInitialCount(num) {
        // var init_SiteOffset = 66749;
        // _value_site_pv = parseInt(num)
        // all_counts = init_SiteOffset + _value_site_pv
        // return all_counts
        // 如果您不从0开始计次，使用上面的代码，并注释掉下面的return
        return num
    }
</script>
```

然后传给clock就行了：

```html
<script>
    let All_Counts = getGAJson()
    $(document).ready(function() {
        // Instantiate a counter
        clock = new FlipClock($('.clock'), All_Counts , {
            clockFace: 'Counter'
        });
</script>
```

### 数据持久化

如果不想实时去访问API，可以做一个数据持久化，我的思路是这样的：

1. JSON文件本地存储
2. Action 持久层

#### 第一步

- i.下载`your Public Endpoint URL`的JSON数据；
- ii.修改Ajax中的url为`assets/ga.json`；

#### 第二步

- i.添加`.github/workflows/deploy.yml`[^4]

{% highlight bash %}{% raw %}
curl ${{ secrets.GA_API }} > assets/ga.json
{% endraw %}{% endhighlight %}

- ii.为仓库添加`GA_API secrets`
- iii.Push

这样我们就实现了数据持久化，防止远端API犯病的情况，同时加快了站点访问速度；

同样，由于Google的API是有免费额度的，像：

- Build Api是一天2个小时的构建时长；
- Appspots的免费配额参考[配额](https://cloud.google.com/appengine/docs/standard/quotas#Safety_Quotas_and_Billable_Quotas){:target="_blank"}

![2022-11-18-15.35.02.png](https://image.yjs2635.xyz/images/2022/11/18/2022-11-18-15.35.02.png)

正常访问是不会有过溢的现象导致付费，所以在测试中，尽量减少外力干扰。

### REF

[^1]: [《「Jekyll开发美化」:如何添加访客次数 I》](blog/2022/Jekyll-devOps-how-to-add-vistor-and-times-I/){:target="_blank"}
[^2]: [从 Google Analytics 获取 Pageviews](https://cotes.page/posts/fetch-pageviews-from-google-analytics/#web-%E7%AB%AF%E5%A4%84%E7%90%86-ga-%E6%95%B0%E6%8D%AE){:target="_blank"}
[^3]: [GAE 上创建查询](https://cotes.page/posts/fetch-pageviews-from-google-analytics/#gae-%E4%B8%8A%E5%88%9B%E5%BB%BA%E6%9F%A5%E8%AF%A2){:target="_blank"}
[^4]: [bin4xin.github.io::deploy.yml#L46](https://github.com/Bin4xin/bin4xin.github.io/blob/main/.github/workflows/deploy.yml#L46){:target="_blank"}