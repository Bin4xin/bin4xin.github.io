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
| 2022/07/09/16:48:51 CST | 修复:: `FireFox display position` | <ul><li>Fiex In [`assets/css/style.scss`](https://github.com/Bin4xin/bin4xin.github.io/blob/main/assets/css/style.scss)</li><li>{ @link https://developer.mozilla.org/zh-CN/docs/Web/CSS/position#browser_compatibility }</li><li>{ @link https://blog.csdn.net/DDD4V/article/details/123354124 }</li><li>{ @link https://juejin.cn/post/6844904100576886797 }</li><li>{ @link Demo https://codepen.io/li377242494/pen/VwLGGaR }</li></ul> |
| 2022/09/09/16:33:11 CST | 尝试添加copy-clipboar:: `copy.js` | 暂时没有实现鼠标hover显示 |
| - | - | - |

### BUG

- [x] Fixed: **FireFox display BUG** position-fixed in FireFox display position -> none
- [ ] add: `footer`页面底部当访问终端为移动端时并在特定分辨率下时，显示文字会溢出到footer外；
  - [ ] 还没有尝试：我会考虑去和`_includes/suggestion.html`一样，尝试使用`col-xs-x`之类的排版属性进行排版；
- ...

### 下一步

- Next TODO：
    - [ ] blog文章大于100会考虑分页;
      - [ ] 有一个问题需要考虑的是：blog文章显示简介页面右上角的设计思路是有一个文章编号存在的，如果引入分页插件后，那么是不是会存在一个都是固定的数字？
      - [ ] 同样，文章编号`#numbers => #42`可以引入一些设计（包括svg图片等）；
    - [ ] 尝试添加copy-clipboar:: `copy.js`；
      - [ ] `assets/js/copy.js`;
      - [ ] `assets/css/bootstrap.css`;
      - 已实现按钮等参照物，不过在hover属性无法显示按钮，还没有找到原因，猜测的原因和`.group-hover-flex .group: display`相关；
    - [ ] 搜索框 TODO
      - `_includes/sentrybar.html`
      -  `_includes/search.html`
- 2022/09/09/17:01:57 以上
- [ ] ...
[comment]: <> (    - [x] 修改个人主页页面)

[comment]: <> (    - 代码复制区域 UX Design)

[comment]: <> (      - [x] copy:`<ion-icon name="copy-outline"></ion-icon>`)

[comment]: <> (      - [x] copied:`<ion-icon name="checkbox-outline"></ion-icon>`)

[comment]: <> (    - [x] Blog/About 窗口卡片显示)

[comment]: <> (        - 参考：)

[comment]: <> (          - [css-tricks]&#40;https://css-tricks.com/&#41;)

[comment]: <> (          - [CodePen Blog]&#40;https://blog.codepen.io/&#41;)

[comment]: <> (          - [scotch.io]&#40;https://scotch.io/&#41;)

[comment]: <> (        - [x] 博客分类代码（指文章类别、文章tang等）展示暂无bug，但访问路由存在问题，需考虑；)

[comment]: <> (        - [x] 响应式折叠footer相关简介；)

[comment]: <> (          - [x] 折叠相关简介无法打开，待完善；)

[comment]: <> (        - [x] 评论功能的硬编码问题改善；)

[comment]: <> (            - [x] 发现[编辑功能]&#40;https://github.com/Bin4xin/bin4xin.github.io/edit/main/_posts/about/2020-05-18-ShiroDeser.md&#41;，思考变量问题；)

[comment]: <> (            - [x] 已可添加commitid进入，暂时改善硬编码问题；)


- *国内前端大神？BULL SHIT :-)*