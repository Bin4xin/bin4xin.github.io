# 优化效果

- [localhost](https://bin4xin.github.io/about/ai-cli/CVE-2025-59828-and-CVE-2025-65099/)：
  - (1.05+0.655+1.02)/3=0.908s
- [github repo cloud deploy](https://bin4xin.github.io/about/ai-cli/CVE-2025-59828-and-CVE-2025-65099/)
  - (3.03+4.68+4.87)/3=4.193s


# Jekyll 站点前端优化方案

---

## 一、静态资源优化

### 1.1 图片优化

**[加载优化]** 批量转换 WebP 格式（保留原图作为 fallback）：

```bash
# 安装 cwebp
brew install webp  # macOS
# 或 apt install webp

# 批量转换 assets/img/ 下所有 PNG/JPEG
find assets/img -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" \) | while read f; do
  cwebp -q 80 "$f" -o "${f%.*}.webp"
done
```

在 Liquid 模板中使用 `<picture>` 标签提供 fallback：

```html
<!-- _includes/picture.html -->
{% assign webp = include.src | replace: '.png', '.webp' | replace: '.jpg', '.webp' %}
<picture>
  <source srcset="{{ webp | relative_url }}" type="image/webp">
  <img src="{{ include.src | relative_url }}"
       alt="{{ include.alt }}"
       loading="lazy"
       width="{{ include.width }}"
       height="{{ include.height }}">
</picture>
```

**[加载优化]** 响应式图片（多倍图已有 `@2x/@3x`，统一用 `srcset` 管理）：

```html
<img src="{{ '/assets/img/logo.png' | relative_url }}"
     srcset="{{ '/assets/img/logo.png' | relative_url }} 1x,
             {{ '/assets/img/logo@2x.png' | relative_url }} 2x,
             {{ '/assets/img/logo@3x.png' | relative_url }} 3x"
     alt="Logo" width="120" height="40">
```

**[加载优化]** 压缩现有 PNG/JPEG（无损/有损）：

```bash
# PNG 无损压缩
npm install -g pngquant
find assets/img -name "*.png" -exec pngquant --force --quality=65-80 --output {} {} \;

# JPEG 压缩
npm install -g mozjpeg
find assets/img -name "*.jpg" -exec mozjpeg -quality 80 -outfile {} {} \;

# 或使用 imagemin 一次性处理所有格式
npm install -g imagemin-cli imagemin-pngquant imagemin-mozjpeg imagemin-webp
imagemin assets/img/**/*.{jpg,png} --out-dir=assets/img/optimized
```

**[加载优化]** 懒加载（原生 + 兼容方案）：

```html
<!-- 原生懒加载（现代浏览器） -->
<img src="..." loading="lazy" alt="...">

<!-- 对于已有 lazyload.js 的情况，统一使用 data-src -->
<img class="lazyload"
     src="{{ '/assets/img/placeholder.svg' | relative_url }}"
     data-src="{{ '/assets/img/real-image.jpg' | relative_url }}"
     alt="...">
```

---

### 1.2 字体优化

**[加载优化]** 字体子集化（仅保留中英文常用字符）：

```bash
# 安装 pyftsubset（fonttools）
pip install fonttools brotli

# 对 Lato 字体进行子集化（仅保留 Latin 字符集）
pyftsubset assets/fonts/Lato-Regular.ttf \
  --unicodes="U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD" \
  --output-file=assets/fonts/Lato-Regular-subset.woff2 \
  --flavor=woff2
```

**[加载优化]** 在 CSS 中使用 `font-display: swap` 并只加载必要字重：

```scss
// assets/css/_fonts.scss
@font-face {
  font-family: 'Lato';
  src: url('../fonts/Lato-Regular-subset.woff2') format('woff2'),
       url('../fonts/Lato-Regular-subset.woff') format('woff');
  font-weight: 400;
  font-style: normal;
  font-display: swap;  // 关键：避免 FOIT（不可见文字闪烁）
}

@font-face {
  font-family: 'Lato';
  src: url('../fonts/Lato-Bold-subset.woff2') format('woff2');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}

// 删除 eot（IE6-8 已无需支持）、ttf 可保留作为 fallback
```

**[加载优化]** FontAwesome 迁移到 CDN + 仅加载使用到的图标：

```html
<!-- _includes/head.html -->
<!-- 方案A：CDN 加载（推荐） -->
<link rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
      integrity="sha512-..." crossorigin="anonymous">

<!-- 方案B：仅加载 solid 子集（如果只用 fas 图标） -->
<link rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/solid.min.css"
      integrity="sha512-..." crossorigin="anonymous">
```

---

### 1.3 CSS 优化

**[加载优化]** 内联关键 CSS（Critical CSS），非关键样式异步加载：

```html
<!-- _includes/head.html -->
<style>
  /* 内联关键 CSS（首屏可见内容的最小样式集） */
  /* 通过 critical 工具自动提取 */
  body { margin: 0; font-family: 'Lato', sans-serif; }
  .navbar { ... }
  .hero { ... }
</style>

<!-- 异步加载完整 CSS -->
<link rel="preload" href="{{ '/assets/css/main.min.css' | relative_url }}"
      as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript>
  <link rel="stylesheet" href="{{ '/assets/css/main.min.css' | relative_url }}">
</noscript>
```

提取关键 CSS 的工具：

```bash
npm install -g critical
critical index.html --base _site/ --inline --minify > _includes/critical.css
```

**[可维护性优化]** 移除 Bootstrap 未使用样式（PurgeCSS）：

```bash
npm install -D purgecss

# purgecss.config.js
module.exports = {
  content: ['_site/**/*.html'],
  css: ['assets/css/bootstrap.css', 'assets/css/custom.css'],
  output: 'assets/css/purged/',
  safelist: {
    // 保留 JS 动态添加的类名
    patterns: [/^is-/, /^has-/, /^active/, /^show/, /^fade/]
  }
}

npx purgecss --config purgecss.config.js
# Bootstrap 通常可从 ~200KB 压缩到 20-40KB
```

**[加载优化]** 压缩合并 CSS（Gulp 方案）：

```js
// gulpfile.js
const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const cleanCSS = require('gulp-clean-css');
const concat = require('gulp-concat');
const rev = require('gulp-rev');  // 缓存 busting

gulp.task('styles', () => {
  return gulp.src([
    'assets/css/bootstrap.css',
    'assets/css/custom.scss',
    'assets/css/syntax.css'
  ])
  .pipe(sass().on('error', sass.logError))
  .pipe(concat('main.css'))
  .pipe(cleanCSS({ level: 2 }))
  .pipe(rev())                    // 生成 main-a1b2c3d4.min.css
  .pipe(gulp.dest('assets/dist/css'))
  .pipe(rev.manifest())
  .pipe(gulp.dest('assets/dist'));
});
```

---

### 1.4 JavaScript 优化

**[加载优化]** 延迟加载非关键脚本（MathJax、flipclock 等）：

```html
<!-- _includes/footer.html -->

<!-- 关键脚本：正常加载 -->
<script src="{{ '/assets/js/jquery.min.js' | relative_url }}"></script>
<script src="{{ '/assets/js/bootstrap.min.js' | relative_url }}"></script>

<!-- 非关键脚本：defer 延迟执行 -->
<script defer src="{{ '/assets/js/lazyload.min.js' | relative_url }}"></script>
<script defer src="{{ '/assets/js/pace.min.js' | relative_url }}"></script>

<!-- MathJax：仅在含数学公式的页面按需加载 -->
{% if page.math %}
<script>
  window.MathJax = {
    tex: { inlineMath: [['$', '$'], ['\\(', '\\)']] },
    startup: { typeset: false }
  };
</script>
<script async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
{% endif %}

<!-- flipclock：仅在需要的页面加载 -->
{% if page.use_flipclock %}
<script defer src="{{ '/assets/js/flipclock.min.js' | relative_url }}"></script>
{% endif %}
```

**[可维护性优化]** 移除重复 jQuery 副本，统一版本管理：

```html
<!-- 删除 assets/js/ajax/libs/ 中的 jQuery 副本 -->
<!-- 统一使用 CDN + 本地 fallback -->
<script src="https://code.jquery.com/jquery-3.7.1.min.js"
        integrity="sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo="
        crossorigin="anonymous"></script>
<script>
  // CDN 失败时回退到本地
  window.jQuery || document.write(
    '<script src="{{ "/assets/js/jquery.min.js" | relative_url }}"><\/script>'
  );
</script>
```

**[加载优化]** 合并压缩 JS（Gulp）：

```js
// gulpfile.js（续）
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');

gulp.task('scripts', () => {
  return gulp.src([
    'assets/js/bootstrap.min.js',
    'assets/js/sticky.js',
    'assets/js/retina.js',
    'assets/js/main.js'
  ])
  .pipe(sourcemaps.init())
  .pipe(concat('bundle.js'))
  .pipe(uglify())
  .pipe(rev())
  .pipe(sourcemaps.write('.'))
  .pipe(gulp.dest('assets/dist/js'))
  .pipe(rev.manifest({ merge: true }))
  .pipe(gulp.dest('assets/dist'));
});
```

---

## 二、构建与交付优化

### 2.1 Jekyll 构建集成

**[可维护性优化]** 在 `_config.yml` 中启用 HTML 压缩：

```yaml
# _config.yml
compress_html:
  clippings: all
  comments: all
  endings: all
  startings: [html, head, body]
  blanklines: false
  profile: false
```

配合 `_layouts/compress.html`（Jekyll 原生方案，无需插件）：

```html
---
# _layouts/compress.html
---
{% capture _content %}{{ content }}{% endcapture %}
{% assign _content = _content | split: '<pre' %}
...
```

**[可维护性优化]** 完整的 `Gemfile` + `package.json` 双工具链：

```ruby
# Gemfile
gem "jekyll", "~> 4.3"
gem "jekyll-feed"
gem "jekyll-sitemap"
gem "jekyll-seo-tag"
gem "jekyll-minifier"      # HTML/CSS/JS 压缩
gem "jekyll-webp"          # 自动生成 WebP
gem "jekyll-assets"        # 资源管道（类似 Sprockets）
```

```json
// package.json
{
  "scripts": {
    "build": "gulp && bundle exec jekyll build",
    "dev": "gulp watch & bundle exec jekyll serve --livereload",
    "purge": "purgecss --config purgecss.config.js",
    "audit": "lighthouse http://localhost:4000 --output html --output-path ./reports/lighthouse.html"
  },
  "devDependencies": {
    "gulp": "^4.0",
    "gulp-sass": "^5.0",
    "gulp-clean-css": "^4.3",
    "gulp-uglify": "^3.0",
    "gulp-concat": "^2.6",
    "gulp-rev": "^10.0",
    "purgecss": "^5.0",
    "critical": "^5.0"
  }
}
```

---

### 2.2 HTTP 缓存头配置

**[加载优化]** 针对 GitHub Pages / Nginx 的缓存策略：

```nginx
# nginx.conf（自托管时）
location ~* \.(woff2|woff|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location ~* \.(css|js)$ {
    # 配合 rev() 哈希文件名，可设置长缓存
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location ~* \.(webp|png|jpg|jpeg|gif|svg|ico)$ {
    expires 6M;
    add_header Cache-Control "public";
}

location ~* \.html$ {
    expires 1h;
    add_header Cache-Control "public, must-revalidate";
}
```

GitHub Pages 用户可通过 `_headers` 文件（Netlify/Cloudflare Pages）实现：

```
# _headers（Netlify）
/assets/dist/*
  Cache-Control: public, max-age=31536000, immutable

/*.html
  Cache-Control: public, max-age=3600
```

---

### 2.3 CDN 迁移 + SRI 校验

**[加载优化]** 将主要第三方库迁移到 CDN：

```html
<!-- _includes/head.html -->

<!-- Bootstrap CSS -->
<link rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css"
      integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN"
      crossorigin="anonymous">

<!-- Bootstrap JS -->
<script defer
        src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-C6RzsynM9kWDrMNeT87bh95OGNyZPhcTNXj1NW7RuBCsyN/o0jlpcV8Qyq46cDfL"
        crossorigin="anonymous"></script>
```

生成 SRI 哈希：

```bash
# 为本地文件生成 SRI
cat assets/js/custom.js | openssl dgst -sha384 -binary | openssl base64 -A
# 输出：sha384-xxxxxxxx...
```

---

### 2.4 资源预加载提示

**[加载优化]** 在 `<head>` 中添加关键资源预加载：

```html
<!-- _includes/head.html -->

<!-- 预加载关键字体 -->
<link rel="preload" href="{{ '/assets/fonts/Lato-Regular-subset.woff2' | relative_url }}"
      as="font" type="font/woff2" crossorigin>

<!-- 预连接 CDN 域名 -->
<link rel="preconnect" href="https://cdn.jsdelivr.net">
<link rel="preconnect" href="https://cdnjs.cloudflare.com">
<link rel="dns-prefetch" href="https://fonts.googleapis.com">

<!-- 预加载 LCP 图片（首屏大图） -->
{% if page.hero_image %}
<link rel="preload"
      href="{{ page.hero_image | relative_url }}"
      as="image"
      fetchpriority="high">
{% endif %}
```

---

## 三、模板与代码可维护性

### 3.1 重构 Liquid 模板

**[可维护性优化]** 提取通用 include 片段，消除重复：

```
_includes/
├── head.html          # <head> 标签内容（meta、CSS、preload）
├── header.html        # 导航栏
├── footer.html        # 页脚 + 非关键 JS
├── picture.html       # 响应式图片组件（见上文）
├── seo.html           # SEO meta tags（配合 jekyll-seo-tag）
├── analytics.html     # 统计代码（仅 production 环境注入）
└── components/
    ├── card.html      # 文章卡片
    ├── pagination.html
    └── toc.html       # 目录组件
```

条件注入统计代码（避免开发环境污染数据）：

```html
<!-- _includes/analytics.html -->
{% if jekyll.environment == "production" %}
<!-- Google Analytics / 百度统计 -->
<script async src="https://www.googletagmanager.com/gtag/js?id={{ site.ga_id }}"></script>
{% endif %}
```

**[可维护性优化]** 统一资源路径，全面使用 `relative_url`：

```html
<!-- ❌ 硬编码路径（迁移域名时全部失效） -->
<link rel="stylesheet" href="/assets/css/main.css">

<!-- ✅ 使用过滤器（自动适配 baseurl） -->
<link rel="stylesheet" href="{{ '/assets/css/main.css' | relative_url }}">

<!-- ✅ 或在 _config.yml 中定义变量 -->
<!-- _config.yml: assets_url: /assets -->
<link rel="stylesheet" href="{{ site.assets_url }}/css/main.css">
```

---

### 3.2 SCSS 模块化重构

**[可维护性优化]** 建立清晰的 SCSS 分层结构：

```
assets/css/
├── main.scss              # 入口文件，只做 @use 导入
├── _variables.scss        # 全局变量（颜色、字体、断点）
├── _mixins.scss           # 复用 mixin
├── _reset.scss            # 基础重置
├── base/
│   ├── _typography.scss
│   └── _layout.scss
├── components/
│   ├── _navbar.scss
│   ├── _cards.scss
│   ├── _buttons.scss
│   └── _code-blocks.scss  # 代码高亮样式
├── pages/
│   ├── _home.scss
│   ├── _post.scss
│   └── _archive.scss
└── vendor/
    └── _bootstrap-custom.scss  # 仅导入用到的 Bootstrap 模块
```

`main.scss` 入口示例：

```scss
// main.scss
@use 'variables' as *;
@use 'mixins';

// Vendor（按需导入 Bootstrap 模块）
@use 'vendor/bootstrap-custom';

// Base
@use 'base/typography';
@use 'base/layout';

// Components
@use 'components/navbar';
@use 'components/cards';

// Pages
@use 'pages/post';
```

按需导入 Bootstrap（大幅减少体积）：

```scss
// _bootstrap-custom.scss
// 只导入实际使用的模块
@import "bootstrap/scss/functions";
@import "bootstrap/scss/variables";
@import "bootstrap/scss/mixins";
@import "bootstrap/scss/grid";
@import "bootstrap/scss/navbar";
@import "bootstrap/scss/buttons";
@import "bootstrap/scss/utilities";
// 不导入：carousel、modal、offcanvas 等未使用组件
```

---

### 3.3 内联样式/脚本清理

**[可维护性优化]** 将 `_posts` 中的内联样式提取为 CSS 类：

```html
<!-- ❌ 内联样式（难以维护，无法复用） -->
<div style="background:#f5f5f5; padding:16px; border-left:4px solid #0066cc;">

<!-- ✅ 提取为语义化 CSS 类 -->
<div class="callout callout--info">
```

```scss
// components/_callout.scss
.callout {
  padding: 1rem;
  border-left: 4px solid;
  background: var(--callout-bg, #f5f5f5);

  &--info  { border-color: #0066cc; --callout-bg: #e8f0fe; }
  &--warn  { border-color: #f59e0b; --callout-bg: #fef3c7; }
  &--error { border-color: #ef4444; --callout-bg: #fee2e2; }
}
```

---

## 四、性能监控与持续改进

### 4.1 性能测试工具与目标指标

| 指标 | 当前估算 | 优化目标 | 工具 |
|------|---------|---------|------|
| FCP  | ~3-5s   | < 1.8s  | Lighthouse |
| LCP  | ~5-8s   | < 2.5s  | WebPageTest |
| TBT  | ~500ms+ | < 200ms | Chrome DevTools |
| CLS  | 未知    | < 0.1   | Lighthouse |
| TTI  | ~6s+    | < 3.8s  | Lighthouse |

```bash
# 本地 Lighthouse 测试
npm install -g lighthouse
lighthouse http://localhost:4000 \
  --output html \
  --output-path ./reports/lighthouse-$(date +%Y%m%d).html \
  --preset desktop

# WebPageTest CLI
npm install -g webpagetest
wpt test https://yoursite.com \
  --location "Dulles:Chrome" \
  --runs 3 \
  --first
```

---

### 4.2 GitHub Actions 自动化检查

**[可维护性优化]** 集成 Lighthouse CI：

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Ruby
        uses: ruby/setup-ruby@v1
        with:
          bundler-cache: true

      - name: Build Jekyll
        run: bundle exec jekyll build
        env:
          JEKYLL_ENV: production

      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v11
        with:
          urls: |
            http://localhost/
            http://localhost/blog/
          uploadArtifacts: true
          temporaryPublicStorage: true
          budgetPath: .lighthouserc.json

      - name: Upload Report
        uses: actions/upload-artifact@v4
        with:
          name: lighthouse-report
          path: .lighthouseci/
```

```json
// .lighthouserc.json（性能预算）
{
  "ci": {
    "assert": {
      "assertions": {
        "categories:performance": ["error", {"minScore": 0.85}],
        "categories:accessibility": ["warn", {"minScore": 0.90}],
        "first-contentful-paint": ["error", {"maxNumericValue": 2000}],
        "largest-contentful-paint": ["error", {"maxNumericValue": 3000}],
        "total-blocking-time": ["error", {"maxNumericValue": 300}]
      }
    }
  }
}
```

---

### 4.3 长期迁移方案

**[可维护性优化]** 渐进式迁移路径（不必一步到位）：

```
阶段 1（当前）：Jekyll + Gulp 优化
  └─ 完成本文档所有优化项
  └─ 预期收益：Lighthouse 分数 60 → 85+

阶段 2（3-6个月）：Jekyll + 现代资源管道
  └─ 引入 esbuild 替代 Gulp（速度提升 10-100x）
  └─ 使用 PostCSS + Autoprefixer 替代手动前缀
  └─ 预期收益：构建时间减少 70%

阶段 3（可选，6-12个月）：迁移到 Eleventy + Vite
  └─ Eleventy 兼容 Liquid 模板，迁移成本低
  └─ Vite 提供 HMR、Tree-shaking、原生 ESM
  └─ 预期收益：开发体验大幅提升，构建产物更小
```

Eleventy 迁移预览（模板几乎无需修改）：

```js
// .eleventy.js
module.exports = function(eleventyConfig) {
  // 复用现有 _data/ 目录
  eleventyConfig.addDataExtension("yaml", contents => yaml.load(contents));

  // 复用现有 _includes/
  eleventyConfig.setLayoutsDirectory("_layouts");
  eleventyConfig.setIncludesDirectory("_includes");

  // 图片优化插件
  eleventyConfig.addPlugin(require("@11ty/eleventy-img"));

  return {
    templateFormats: ["md", "html", "liquid"],
    markdownTemplateEngine: "liquid",
    dir: { input: ".", output: "_site" }
  };
};
```

---

## 优化优先级矩阵

| 优化项 | 性能收益 | 实施难度 | 优先级 | 预计工时 |
|--------|---------|---------|--------|---------|
| 图片懒加载（`loading="lazy"`） | ⭐⭐⭐⭐⭐ | 🟢 低 | 🔴 **P0** | 2h |
| Bootstrap 按需导入 / PurgeCSS | ⭐⭐⭐⭐⭐ | 🟡 中 | 🔴 **P0** | 4h |
| JS 脚本 defer/async 化 | ⭐⭐⭐⭐ | 🟢 低 | 🔴 **P0** | 2h |
| 图片转 WebP | ⭐⭐⭐⭐ | 🟢 低 | 🔴 **P0** | 3h |
| 字体 `font-display: swap` | ⭐⭐⭐ | 🟢 低 | 🟠 **P1** | 1h |
| 字体子集化 | ⭐⭐⭐ | 🟡 中 | 🟠 **P1** | 3h |
| 内联关键 CSS | ⭐⭐⭐⭐ | 🟡 中 | 🟠 **P1** | 4h |
| 第三方库迁移 CDN + SRI | ⭐⭐⭐ | 🟢 低 | 🟠 **P1** | 2h |
| Gulp 构建管道（压缩+合并+rev） | ⭐⭐⭐ | 🔴 高 | 🟡 **P2** | 8h |
| SCSS 模块化重构 | ⭐⭐ | 🔴 高 | 🟡 **P2** | 12h |
| HTML 压缩（compress.html） | ⭐⭐ | 🟢 低 | 🟡 **P2** | 1h |
| Lighthouse CI（GitHub Actions） | ⭐⭐ | 🟡 中 | 🟡 **P2** | 4h |
| 资源预加载（preload/preconnect） | ⭐⭐⭐ | 🟢 低 | 🟡 **P2** | 2h |
| Liquid 模板重构 | ⭐⭐ | 🔴 高 | 🟢 **P3** | 16h |
| 迁移 Eleventy + Vite | ⭐⭐⭐⭐ | 🔴 极高 | 🟢 **P3** | 40h+ |

> **建议执行顺序：** 先完成所有 P0 项（约 11h，Lighthouse 分数可从 ~55 提升至 ~80），再按 P1 → P2 推进，P3 作为长期规划。
