### 构建历程

| 完成时间 | 构建历程详情 | 备注 |
| :--- | :--- | :--- |
| 2021/5/10/10:01:01 CST | `_inculde/footer.html`新增访客统计 | ![](https://profile-counter.glitch.me/bin4xin.github.io/count.svg) |
| 2021/11/10/11:39:40 CST | 修改页头页尾部分内容 | <center><a href="https://bin4xin.github.io/">网站</a>  •  <a href="https://bin4xin.gitee.io/">CN镜像</a></center> |
|  | 添加[`_config.yml`](https://github.com/Bin4xin/bin4xin.github.io/blob/main/_config.yml)添加了一些prof方便调用 | - |
| 2021/11/15/01:01:02 CST | 使用Action进行构建 | <del>尝试使用两个分支进行构建部署对应文件夹成功，但单个分支对应项目构建资产存在路由访问问题，所以暂时先放下</del> |
| ![build sync and reload](https://github.com/Bin4xin/bin4xin.github.io/workflows/build%20sync%20and%20reload/badge.svg) | <em>代码和部分博客参考</em> | <ul><li>[Action踩坑文章在此](https://bin4xin.github.io/event/2021/Jekyll-site-routers-and-config/)</li> <li> [Github Actions总结](https://jasonkayzk.github.io/2020/08/28/Github-Actions%E6%80%BB%E7%BB%93/)</li> <li>[github action-cache使用实例](https://raw.githubusercontent.com/ustclug/website/master/.github/workflows/build.yml)</li> <li>[改变github-page分支](https://stackoverflow.com/questions/14040754/deleting-remote-master-branch-refused-due-to-being-the-current-branch)</li></ul> |
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
| - | - | - |

### 下一步

- Next：
    - [x] 响应式折叠footer相关简介；
      - [ ] 折叠相关简介无法打开，待完善；
    - [x] 评论功能的硬编码问题改善；
        - [ ] 发现[编辑功能](https://github.com/Bin4xin/bin4xin.github.io/edit/main/_posts/about/2020-05-18-ShiroDeser.md)，思考变量问题；
        - [ ] 已可添加commitid进入，暂时改善硬编码问题；
    - [ ] 博客分类代码（指文章类别、文章tang等）展示暂无bug，但访问路由存在问题，需考虑；
    - [ ] ...