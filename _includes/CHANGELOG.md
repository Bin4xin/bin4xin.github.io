<table class="table">
<thead>
<tr>
<th align="left">完成时间</th>
<th align="left">构建历程详情</th>
<th align="left">备注</th>
</tr>
</thead>
<tbody>
<tr>
<td align="left">2021/5/10/10:01:01 CST</td>
<td align="left"><code>_inculde/footer.html</code>新增访客统计</td>
<td align="left"><a target="_blank" rel="noopener noreferrer nofollow" href="https://camo.githubusercontent.com/87291ba95fd3a1ae6f619b454a9047c14ca1371bab12d423fc6594225858818a/68747470733a2f2f70726f66696c652d636f756e7465722e676c697463682e6d652f62696e3478696e2e6769746875622e696f2f636f756e742e737667"><img src="https://camo.githubusercontent.com/87291ba95fd3a1ae6f619b454a9047c14ca1371bab12d423fc6594225858818a/68747470733a2f2f70726f66696c652d636f756e7465722e676c697463682e6d652f62696e3478696e2e6769746875622e696f2f636f756e742e737667" alt="" data-canonical-src="https://profile-counter.glitch.me/bin4xin.github.io/count.svg" style="max-width: 100%;"></a></td>
</tr>
<tr>
<td align="left">2021/11/10/11:39:40 CST</td>
<td align="left">修改页头页尾部分内容</td>
<td align="left"><a href="https://bin4xin.github.io/" rel="nofollow">网站</a>  •  <a href="https://bin4xin.gitee.io/" rel="nofollow">CN镜像</a></td>
</tr>
<tr>
<td align="left"></td>
<td align="left">添加<a href="https://github.com/Bin4xin/bin4xin.github.io/blob/main/_config.yml"><code>_config.yml</code></a>添加了一些prof方便调用</td>
<td align="left">-</td>
</tr>
<tr>
<td align="left">2021/11/15/01:01:02 CST</td>
<td align="left">使用Action进行构建</td>
<td align="left"><del>尝试使用两个分支进行构建部署对应文件夹成功，但单个分支对应项目构建资产存在路由访问问题，所以暂时先放下</del></td>
</tr>
<tr>
<td align="left"><a target="_blank" rel="noopener noreferrer" href="https://github.com/Bin4xin/bin4xin.github.io/workflows/sentrylab%20build%20sync%20and%20reload./badge.svg"><img src="https://github.com/Bin4xin/bin4xin.github.io/workflows/sentrylab%20build%20sync%20and%20reload./badge.svg" alt="sentrylab build sync and reload." style="max-width: 100%;"></a></td>
<td align="left"><em>代码和部分博客参考</em></td>
<td align="left"><ul dir="auto"><li><a href="https://bin4xin.github.io/event/2021/Jekyll-site-routers-and-config/" rel="nofollow">Action踩坑文章在此</a></li> <li> <a href="https://jasonkayzk.github.io/2020/08/28/Github-Actions%E6%80%BB%E7%BB%93/" rel="nofollow">Github Actions总结</a></li> <li><a href="https://raw.githubusercontent.com/ustclug/website/master/.github/workflows/build.yml" rel="nofollow">github action-cache使用实例</a></li> <li><a href="https://stackoverflow.com/questions/14040754/deleting-remote-master-branch-refused-due-to-being-the-current-branch" rel="nofollow">改变github-page分支</a></li></ul></td>
</tr>
<tr>
<td align="left"></td>
<td align="left">页面添加自行点击：博客国内镜像 &amp;&amp; 国外镜像跳转</td>
<td align="left">-</td>
</tr>
<tr>
<td align="left">2021/11/15/01:01:02 CST</td>
<td align="left">About主页访问路由改变</td>
<td align="left">2021/10/26/21:04:22记录</td>
</tr>
<tr>
<td align="left"></td>
<td align="left">About构建问题</td>
<td align="left"><ul dir="auto"><li>若需解决上面的问题，那么亟需修改的就是对于About的源码构建的问题</li><li>是否能够仓库2 Action构建的源码推送的仓库1的分支上</li></ul></td>
</tr>
<tr>
<td align="left"></td>
<td align="left">解决<code>github</code>与<code>gitee仓库</code><a href="https://github.com/Bin4xin/bin4xin.github.io/blob/main/.github/workflows/deploy.yml">同步问题</a></td>
<td align="left"><ul dir="auto"><li><del>由于使用的GITEE ACTION模版存在疑问；所以暂时以硬编码的形式进行解决了，不是非常的优雅，这里会先标注，以后会在修改回来</del></li><li>Action已完成，<a href="https://github.com/Bin4xin/bin4xin.github.io/blob/main/.github/workflows/deploy.yml#L80">分支填写错误导致</a></li></ul></td>
</tr>
<tr>
<td align="left"></td>
<td align="left">页面添加自行点击：博客国内镜像 &amp;&amp; 国外镜像跳转</td>
<td align="left"></td>
</tr>
<tr>
<td align="left">2021/11/16/23:53:54 CST</td>
<td align="left">订阅页面存在问题</td>
<td align="left">code标签预览导致提前闭合了xml文件的标签从而引起报错，已完善</td>
</tr>
<tr>
<td align="left">2021/11/18/01:03:45 CST</td>
<td align="left">优先：部分图片是url 404，需修复</td>
<td align="left">上传图片图床<a href="https://sm.ms/" rel="nofollow">sm.sm</a></td>
</tr>
<tr>
<td align="left">2021/11/22/20:50:08 CST</td>
<td align="left">添加<code>windows.print()</code>打印功能，并做了相关处理</td>
<td align="left"><ul dir="auto"><li><a href="https://www.mk2048.com/blog/blog_i11j01babchj.html" rel="nofollow">window.print打印指定div指定网页指定区域的方法</a></li><li><a href="https://www.mk2048.com/blog/blog_i11j01babchj.html" rel="nofollow">codepen</a></li><li><a href="https://ionic.io/ionicons/usage" rel="nofollow">icons</a></li></ul></td>
</tr>
<tr>
<td align="left">2021/12/01/09:51:34 CST</td>
<td align="left">托管镜像域名跳转</td>
<td align="left"><ul dir="auto"><li>CNAME是否能够对应不同的镜像跳转？DNS解析中是否能够解决地域跳转问题？答：可以</li><li><a href="https://github.com/antvis/G2/blob/gh-pages/CNAME">antvis</a></li><li><a href="https://daijiangtao.gitee.io/2018/06/29/domain-to-github/" rel="nofollow">如何将域名映射至 Github 仓库</a></li></ul></td>
</tr>
<tr>
<td align="left">2021/12/12/22:32:34 CST</td>
<td align="left">修改Action<a href="https://github.com/Bin4xin/bin4xin.github.io/blob/main/.github/workflows/deploy.yml#L74">build sync reload</a>至Gitee</td>
<td align="left"></td>
</tr>
<tr>
<td align="left">2021/12/14/16:58:24 CST</td>
<td align="left">添加<a href="https://github.com/Bin4xin/bin4xin.github.io/blob/main/.github/workflows/harmony.yml#L42">国家公祭日运行页面构建灰色流程</a></td>
<td align="left"><ul dir="auto"><li>yml流程文件中是否能够定义先后顺序？</li><li>如何跳过执行流程？</li></ul></td>
</tr>
<tr>
<td align="left">2022/01/21/10:51:38 CST</td>
<td align="left">增加::about博文banner展示</td>
<td align="left"><a href="https://cloud.google.com/" rel="nofollow">代码参考</a></td>
</tr>
<tr>
<td align="left">2022/01/21/11:53:16 CST</td>
<td align="left">增加::代码块拷贝按钮</td>
<td align="left"><a href="http://qclog.cn/1060" rel="nofollow">代码参考:给代码块pre标签增加一个“复制代码”按钮</a></td>
</tr>
<tr>
<td align="left">2022/02/27/17:34:59 CST</td>
<td align="left">添加<code>_include</code>引用</td>
<td align="left">添加页尾/评价</td>
</tr>
<tr>
<td align="left">2022/03/03/15:28:50 CST</td>
<td align="left">修復标签栏/删除外部Icon-JS引用，加快加载速度</td>
<td align="left"><code>article-index.html/head</code></td>
</tr>
<tr>
<td align="left">2022/04/07/14:17:05</td>
<td align="left">四月份又是修展示BUG的一个月:(</td>
<td align="left">修复了一些在移动端code/pre不换行的文章</td>
</tr>
<tr>
<td align="left"></td>
<td align="left">进一步完善引用代码</td>
<td align="left"><ul dir="auto"><li>code from cloudflare. <a href="https://www.cloudflare.com/zh-cn/" rel="nofollow">visit footer</a> </li><li>code from anquanke. <a href="https://www.anquanke.com/" rel="nofollow">visit any posts here.</a> </li><li> @printpage func() 代码引用申明</li><li>ETC...</li></ul></td>
</tr>
<tr>
<td align="left">2022/05/13/21:41:49 CST</td>
<td align="left">修复打印模块</td>
<td align="left"><code>@media print</code> awesome;)</td>
</tr>
<tr>
<td align="left">2022/05/16/22:58:24 CST</td>
<td align="left">修复展示bug</td>
<td align="left"><a href="https://github.com/Bin4xin/bin4xin.github.io/blob/main/_layouts/about.html#L61-L70">select区块url无法超链接</a></td>
</tr>
<tr>
<td align="left"></td>
<td align="left"></td>
<td align="left"><a href="https://github.com/tuna/mirror-web/blob/master/_layouts/help.html#L38">mirror web reference</a></td>
</tr>
<tr>
<td align="left"></td>
<td align="left">[Web 手机端无法显示完整，存在两个滚动条]</td>
<td align="left"><ul dir="auto"><li>print-overflow-visible</li><li>area-scroll</li><li><a href="https://docs.github.com/cn/actions/learn-github-actions/environment-variables">github reference</a></li></ul></td>
</tr>
<tr>
<td align="left">2022/06/22/16:29:00 CST</td>
<td align="left">添加::响应移动端置顶按钮</td>
<td align="left"><ul dir="auto"><li> <a href="https://docs.github.com/">main style</a> </li><li> <a href="https://www.sendcloud.net/sendSetting/unsubsribeSetting" rel="nofollow">back shadow</a> </li></ul></td>
</tr>
<tr>
<td align="left">2022/07/08/17:14:25 CST</td>
<td align="left">添加::单个窗口按钮关闭对应窗口</td>
<td align="left"><ul dir="auto"><li>click hidden-2-click-{{note_node}}</li><li>display:none JQuery: $("diva-{{note_node}}").hide();</li><li>{ @link More see: <a href="https://github.com/Bin4xin/bin4xin.github.io/blob/main/assets/js/oh-sentry.js">/assets/js/oh-sentry.js</a> }</li></ul></td>
</tr>
<tr>
<td align="left">2022/07/09/16:48:51 CST</td>
<td align="left">修复:: <code>FireFox display position</code></td>
<td align="left"><ul dir="auto"><li>Fiex In <a href="https://github.com/Bin4xin/bin4xin.github.io/blob/main/assets/css/style.scss"><code>assets/css/style.scss</code></a></li><li>{ @link <a href="https://developer.mozilla.org/zh-CN/docs/Web/CSS/position#browser_compatibility" rel="nofollow">https://developer.mozilla.org/zh-CN/docs/Web/CSS/position#browser_compatibility</a> }</li><li>{ @link <a href="https://blog.csdn.net/DDD4V/article/details/123354124" rel="nofollow">https://blog.csdn.net/DDD4V/article/details/123354124</a> }</li><li>{ @link <a href="https://juejin.cn/post/6844904100576886797" rel="nofollow">https://juejin.cn/post/6844904100576886797</a> }</li><li>{ @link Demo <a href="https://codepen.io/li377242494/pen/VwLGGaR" rel="nofollow">https://codepen.io/li377242494/pen/VwLGGaR</a> }</li></ul></td>
</tr>
<tr>
<td align="left">2022/09/09/16:33:11 CST</td>
<td align="left">尝试添加copy-clipboar:: <code>copy.js</code></td>
<td align="left">暂时没有实现鼠标hover显示</td>
</tr>
<tr>
<td align="left">2022/09/14/22:26:45 CST</td>
<td align="left">修改</td>
<td align="left"><ul dir="auto"><li>1.更改书签显示为 <code>flex-column</code> </li><li>2.修改了 <a href="/Bin4xin/bin4xin.github.io/blob/main/_includes/_primaryindex/blog.html"><code>blog</code></a> 的展示页面</li></ul></td>
</tr>
<tr>
<td align="left">-</td>
<td align="left">-</td>
<td align="left">-</td>
</tr>
</tbody>
</table>