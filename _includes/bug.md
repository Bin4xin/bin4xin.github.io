### BUG

- [x] ~~Fixed: `**FireFox display BUG** position-fixed in FireFox display position -> none`；~~
- [x] ~~add: `footer`页面底部当访问终端为移动端时并在特定分辨率下时，显示文字会溢出到footer外；~~
    - [x] ~~还没有尝试：我会考虑去和`_includes/suggestion.html`一样，尝试使用`col-xs-x`之类的排版属性进行排版；~~
- [ ] 复制为 Markdown CORS BUG from `localhost` to `github.com`:

```console
Access to fetch at 'https://github.com/Bin4xin/main/_posts/about/2025-02-01-get-start.md' from origin 'http://localhost' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource. If an opaque response serves your needs, set the request's mode to 'no-cors' to fetch the resource with CORS disabled.
```

### DONE

- [x] ~~blog文章大于100会考虑分页~~;
    - [x] ~~有一个问题需要考虑的是：blog文章显示简介页面右上角的设计思路是有一个文章编号存在的，如果引入分页插件后，那么是不是会存在一个都是固定的数字？~~
    - [x] ~~同样，文章编号`#numbers => #42`可以引入一些设计（包括svg图片等）；~~
- [x] ~~尝试添加copy-clipboar:: `copy.js`；~~
    - [x] ~~`assets/js/copy.js`;~~
    - [x] ~~`assets/css/bootstrap.css`;~~
    - 已实现按钮等参照物，不过在hover属性无法显示按钮，还没有找到原因，猜测的原因和`.group-hover-flex .group: display`相关；
- [x] ~~搜索框 TODO~~
    - [x] ~~`_includes/sentrybar.html`~~
    - [x] ~~`_includes/search.html`~~
- [x] TOC 侧边栏优化
    - [x] GitHub MiniToc / ActionList 样式重设计
    - [x] 侧边栏折叠按钮跟随 border-right 贴合屏幕左边
    - [x] 侧边栏滚动条显示修复
    - [x] 折叠按钮点击后保持显示
    - [ ] 折叠后左侧 border 与按钮视觉贴合优化
- [x] 博客列表卡片化
    - [x] `paginator-blog.html` 重构为 `.blog-card` 卡片布局
    - [x] 修复 `blog-card-footer` 在白色背景下的 `ymh-*` 样式兼容
- 2022/09/09/17:01:57 以上

### 下一步
- [ ] About 页面体验优化
    - [ ] `about.js` 侧边栏折叠/展开平滑动画优化
    - [ ] 移动端 sidebar-toggle-btn 自动隐藏逻辑
    - [ ] `about-nav.html` 当前文章高亮样式加深
- [ ] TOC 侧边栏增强
    - [ ] TOC 滚动时自动跟踪当前标题（active 高亮跟随）
    - [ ] TOC 文章动作按钮组在移动端隐藏或收起
    - [ ] `article-index.html` 同分类文章导航 Liquid 排序（按 date 或 `Researchname`）
- [ ] 博客列表卡片化
    - [ ] 卡片添加文章标签/分类 badge
    - [ ] 卡片支持阅读时间估算（`reading_time`）
    - [ ] 卡片 hover 动画微调（阴影/缩放）
- [ ] 暗黑模式完善
    - [ ] `_structure.scss` 中 `@include dark` 覆盖检查（遗漏的组件）
    - [ ] `research.css` 暗黑模式兼容
- [ ] 响应式布局
    - [ ] `@media (max-width: 480px)` 下 TOC 按钮组折叠
    - [ ] `blog-card-footer` 小屏幕下纵向排列
    - [ ] 侧边栏折叠按钮在超小屏幕（< 360px）下自动隐藏
- [ ] 无障碍（a11y）
    - [ ] `article-index.html` 添加 `aria-label` 和 `role` 属性
    - [ ] `blog-card` 添加 `role="article"` 语义化
    - [ ] 按钮键盘导航支持（`tabindex`, `onkeydown`）
- [ ] 性能优化
    - [ ] `copyAsMarkdown()` 使用 `async/await` 替代 `.then()` 链
    - [ ] TOC 侧边栏滚动防抖（`debounce`）
    - [ ] 图片 lazy loading（`loading="lazy"`）
