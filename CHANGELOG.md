### 构建历程

| 完成时间 | 构建历程详情 | 备注 |
| :--- | :--- | :--- |
| 2021/5/10/10:01:01 CST | `_inculde/footer.html`新增访客统计 | ![](https://profile-counter.glitch.me/bin4xin.github.io/count.svg) |
| 2021/11/10/11:39:40 CST | 修改页头页尾部分内容 | <center><a href="https://bin4xin.github.io/">网站</a>  •  <a href="https://bin4xin.gitee.io/">CN镜像</a></center> |
|  | 添加[`_config.yml`](https://github.com/Bin4xin/bin4xin.github.io/blob/main/_config.yml)添加了一些prof方便调用 | - |
| 2021/11/15/01:01:02 CST | 使用Action进行构建 | <del>尝试使用两个分支进行构建部署对应文件夹成功，但单个分支对应项目构建资产存在路由访问问题，所以暂时先放下</del> |
| ![sentrylab build sync and reload.](https://github.com/Bin4xin/bin4xin.github.io/workflows/sentrylab%20build%20sync%20and%20reload./badge.svg) | <em>代码和部分博客参考</em> | <ul><li>[Action踩坑文章在此](https://bin4xin.github.io/event/2021/Jekyll-site-routers-and-config/)</li> <li> [Github Actions总结](https://jasonkayzk.github.io/2020/08/28/Github-Actions%E6%80%BB%E7%BB%93/)</li> <li>[github action-cache使用实例](https://raw.githubusercontent.com/ustclug/website/master/.github/workflows/build.yml)</li> <li>[改变github-page分支](https://stackoverflow.com/questions/14040754/deleting-remote-master-branch-refused-due-to-being-the-current-branch)</li></ul> |
|  | 页面添加自行点击：博客国内镜像 && 国外镜像跳转 | - |
| 2021/11/15/01:01:02 CST | About主页访问路由改变 | 2021/10/26/21:04:22记录 |
|  | About构建问题 | <ul><li>若需解决上面的问题，那么亟需修改的就是对于About的源码构建的问题</li><li>是否能够仓库2 Action构建的源码推送的仓库1的分支上</li></ul>|
|  | 解决`github`与`gitee仓库`[同步问题](https://github.com/Bin4xin/bin4xin.github.io/blob/main/.github/workflows/deploy.yml) | <ul><li><del>由于使用的GITEE ACTION模版存在疑问；所以暂时以硬编码的形式进行解决了，不是非常的优雅，这里会先标注，以后会在修改回来</del></li><li>Action已完成，[分支填写错误导致](https://github.com/Bin4xin/bin4xin.github.io/blob/main/.github/workflows/deploy.yml#L80)</li></ul> |
|  | 页面添加自行点击：博客国内镜像 && 国外镜像跳转 |  |
| 2021/11/16/23:53:54 CST | 订阅页面存在问题 | code标签预览导致提前闭合了xml文件的标签从而引起报错，已完善 |
| 2021/11/18/01:03:45 CST | 优先：部分图片是url 404，需修复 | 上传图片图床[sm.sm](https://sm.ms/) |
| 2021/11/22/20:50:08 CST | 添加`windows.print()`打印功能，并做了相关处理 | <ul><li>[window.print打印指定div指定网页指定区域的方法](https://www.mk2048.com/blog/blog_i11j01babchj.html)</li><li>[codepen](https://www.mk2048.com/blog/blog_i11j01babchj.html)</li><li>[icons](https://ionic.io/ionicons/usage)</li></ul> |
| 2021/12/01/09:51:34 CST |  托管镜像域名跳转  |  <ul><li>CNAME是否能够对应不同的镜像跳转？DNS解析中是否能够解决地域跳转问题？答：可以</li><li>[antvis](https://github.com/antvis/G2/blob/gh-pages/CNAME)</li><li>[如何将域名映射至 Github 仓库](https://daijiangtao.gitee.io/2018/06/29/domain-to-github/)</li></ul>  |
| 2021/12/12/22:32:34 CST | 修改Action[build sync reload](https://github.com/Bin4xin/bin4xin.github.io/blob/main/.github/workflows/deploy.yml#L74)至Gitee |  |
| 2021/12/14/16:58:24 CST | 添加[国家公祭日运行页面构建灰色流程](https://github.com/Bin4xin/bin4xin.github.io/blob/main/.github/workflows/harmony.yml#L42) | <ul><li>yml流程文件中是否能够定义先后顺序？</li><li>如何跳过执行流程？</li></ul> |
| 2022/01/21/10:51:38 CST | 增加::about博文banner展示 | [代码参考](https://cloud.google.com/) |
| 2022/01/21/11:53:16 CST | 增加::代码块拷贝按钮 | [代码参考:给代码块pre标签增加一个“复制代码”按钮](http://qclog.cn/1060) |
| 2022/02/27/17:34:59 CST | 添加`_include`引用 | 添加页尾/评价 |
| 2022/03/03/15:28:50 CST | 修復标签栏/删除外部Icon-JS引用，加快加载速度 | `article-index.html/head` |
| 2022/04/07/14:17:05 | 四月份又是修展示BUG的一个月:( | 修复了一些在移动端code/pre不换行的文章 |
|  | 进一步完善引用代码 | <ul><li>code from cloudflare. [visit footer](https://www.cloudflare.com/zh-cn/) </li><li>code from anquanke. [visit any posts here.](https://www.anquanke.com/) </li><li> @printpage func() 代码引用申明</li><li>ETC...</li></ul> |
| 2022/05/13/21:41:49 CST | 修复打印模块 | `@media print` awesome;) |
| 2022/05/16/22:58:24 CST | 修复展示bug | [select区块url无法超链接](https://github.com/Bin4xin/bin4xin.github.io/blob/main/_layouts/about.html#L61-L70) |
|  |  | [mirror web reference](https://github.com/tuna/mirror-web/blob/master/_layouts/help.html#L38) |
|  | [Web 手机端无法显示完整，存在两个滚动条] | <ul><li>print-overflow-visible</li><li>area-scroll</li><li>[github reference](https://docs.github.com/cn/actions/learn-github-actions/environment-variables)</li></ul> |
| 2022/06/22/16:29:00 CST | 添加::响应移动端置顶按钮 | <ul><li> [main style](https://docs.github.com/) </li><li> [back shadow](https://www.sendcloud.net/sendSetting/unsubsribeSetting) </li></ul> |
| 2022/07/08/17:14:25 CST | 添加::单个窗口按钮关闭对应窗口 | <ul><li>click hidden-2-click-{{note_node}}</li><li>display:none JQuery: $("diva-{{note_node}}").hide();</li><li>{ @link More see: [/assets/js/oh-sentry.js](https://github.com/Bin4xin/bin4xin.github.io/blob/main/assets/js/oh-sentry.js) }</li></ul> |
| - | - | - |


### BUG

- TODO:
  - **FireFox display BUG** position-fixed in FireFox display position -> none
    - Reference:
    - { @link https://developer.mozilla.org/zh-CN/docs/Web/CSS/position#browser_compatibility }
    - { @link https://blog.csdn.net/DDD4V/article/details/123354124 }
    - { @link https://juejin.cn/post/6844904100576886797 }
      - { @link Demo https://codepen.io/li377242494/pen/VwLGGaR }


### 下一步

- TODO BE FIX
  - [ ] Next:

```html
<div>
    <div class="js-notice">
    <!-- '"` --><!-- </textarea></xmp> -->
        <form class="Box position-relative rounded-2 mb-4 p-3 js-notice-dismiss overflow-hidden" style="z-index: 1" data-turbo="false" action="/settings/dismiss-notice/dashboard_promo_copilot_ga" accept-charset="UTF-8" method="post"><input type="hidden" name="authenticity_token" value="mPSV2JFtUABWMNHPx22QbZgAOQkoOwAVFQg5lv518FQ5kPGlc-PDPAGD_s0hJpBGlolH2bR3zc5uuock1df_cg">
            <picture>
            <source srcset="https://github.githubassets.com/images/modules/dashboard/copilot/bg.webp" type="image/webp">
            <img src="https://github.githubassets.com/images/modules/dashboard/copilot/bg.jpg" alt="" width="768" height="642" class="position-absolute top-0 left-0 width-full" style="pointer-events: none; z-index: -1; height: 100%; height: 100%; object-fit: cover">
            </picture>
            
            <div class="position-absolute p-2" style="top: 4px; right: 6px;">
            <button aria-label="Close" type="submit" data-view-component="true" class="close-button color-fg-on-emphasis"><svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-x">
            <path fill-rule="evenodd" d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z"></path>
            </svg></button>
            </div>
            
            <img src="https://github.githubassets.com/images/modules/dashboard/copilot/copilot-logo.svg" alt="GitHub Copilot" width="179" height="22" class="d-block">
            
            <p class="my-3 col-7 color-fg-on-emphasis text-bold h4">
                Get suggestions for lines of code and entire functions in real‑time
            </p>
            <a href="/features/copilot" data-view-component="true" class="btn btn-block">  Learn more about Copilot</a>
        </form>  
    </div>
</div>
```

- *国内前端大神？BULL SHIT :-)*
- Next TODO：
    - [ ] blog文章大于100会考虑分页;
    - [x] 修改个人主页页面
    - 代码复制区域 UX Design
      - [x] copy:`<ion-icon name="copy-outline"></ion-icon>`
      - [x] copied:`<ion-icon name="checkbox-outline"></ion-icon>`
    - [x] Blog/About 窗口卡片显示
        - 参考：
          - [css-tricks](https://css-tricks.com/)
          - [CodePen Blog](https://blog.codepen.io/)
          - [scotch.io](https://scotch.io/)
        - [x] 博客分类代码（指文章类别、文章tang等）展示暂无bug，但访问路由存在问题，需考虑；
        - [x] 响应式折叠footer相关简介；
          - [x] 折叠相关简介无法打开，待完善；
        - [x] 评论功能的硬编码问题改善；
            - [x] 发现[编辑功能](https://github.com/Bin4xin/bin4xin.github.io/edit/main/_posts/about/2020-05-18-ShiroDeser.md)，思考变量问题；
            - [x] 已可添加commitid进入，暂时改善硬编码问题；
- [ ] ...