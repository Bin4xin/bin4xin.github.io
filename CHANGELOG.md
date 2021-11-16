### 构建历程

| 完成时间 | 构建历程详情 | 备注 |
| :--- | :--- | :--- |
| 2021/5/10/10:01:01 CST | `_inculde/footer.html`新增访客统计 | ![](https://profile-counter.glitch.me/bin4xin.github.io/count.svg) |
| 2021/11/10/11:39:40 CST | 修改页头页尾部分内容 | <center><a href="https://bin4xin.github.io/">网站</a>  •  <a href="https://bin4xin.gitee.io/">CN镜像</a></center> |
|  | 添加[`_config.yml`](https://github.com/Bin4xin/bin4xin.github.io/blob/main/_config.yml)添加了一些prof方便调用 | - |
| 2021/11/15/01:01:02 CST | 使用Action进行构建 | DONE<del>尝试使用两个分支进行构建部署对应文件夹成功，但单个分支对应项目构建资产存在路由访问问题，所以暂时先放下</del> |
| ![build sync and reload](https://github.com/Bin4xin/bin4xin.github.io/workflows/build%20sync%20and%20reload/badge.svg) | <em>代码和部分博客参考</em> | <ul><li>[Action踩坑文章在此](https://bin4xin.github.io/event/2021/Jekyll-site-routers-and-config/)</li> <li> [Github Actions总结](https://jasonkayzk.github.io/2020/08/28/Github-Actions%E6%80%BB%E7%BB%93/)</li> <li>[github action-cache使用实例](https://raw.githubusercontent.com/ustclug/website/master/.github/workflows/build.yml)</li> <li>[改变github-page分支](https://stackoverflow.com/questions/14040754/deleting-remote-master-branch-refused-due-to-being-the-current-branch)</li></ul> |
|  | 页面添加自行点击：博客国内镜像 && 国外镜像跳转 | - |
| 2021/11/15/01:01:02 CST | About主页访问路由改变 | 2021/10/26/21:04:22记录 |
|  | About构建问题 | <ul><li>若需解决上面的问题，那么亟需修改的就是对于About的源码构建的问题</li><li>是否能够仓库2 Action构建的源码推送的仓库1的分支上</li></ul>|
|  | 解决github 与 gitee仓库[同步问题](https://github.com/Bin4xin/bin4xin.github.io/blob/main/.github/workflows/deploy.yml) | <ul><li>由于使用的GITEE ACTION模版存在疑问；所以暂时以硬编码的形式进行解决了，不是非常的优雅，这里会先标注，以后会在修改回来</li></ul> |
|  | 页面添加自行点击：博客国内镜像 && 国外镜像跳转 |  |

### 下一步


- Next：    
    - [ ] 优先：部分图片是url 404，需修复；
    - [ ] 响应式折叠footer相关简介；
    - [ ] *CNAME是否能够对应不同的镜像跳转？DNS解析中是否能够解决地域跳转问题？*
        - 只做到通过CloudFlare 访问A 302跳转到B；
        - [待参考项目](https://github.com/antvis/G2/blob/gh-pages/CNAME)
    - [x] 2021/11/16/23:53:54 CST解决
        - [x] 订阅页面存在问题；
    - [ ] 博客分类代码展示暂无bug，但访问路由存在问题，需考虑；
    - [ ] ...
