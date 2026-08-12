---
layout: default
title: 隐私政策与 Cookie 偏好
permalink: /privacy/
time: 2026年08月12日
# -----------------------------------------------------------------------------
# 页面级变量定义 (Front Matter Variables)
# -----------------------------------------------------------------------------
header_data:
  logo_text: "SENTINEL SECURITY, LAB"
  brand_sub: "PRIVACY"
  nav_links:
    - title: "隐私"
      url: "/privacy/"
      icon: "fas fa-user-shield"
    - title: "Cookie"
      url: "/privacy/#Cookie"
      icon: "fas fa-cookie-bite"

footer_data:
  copyright_start: "2019"
  brand_name: "Edited by bin4xin, Anhui Province, China"
---

<!-- 全局 UI 风格样式定义 (支持主题变量 & 暗黑模式自适应) -->
<style>
  :root {
    --site-bg: rgba(255, 255, 255, 0.75);
    --site-border: rgba(0, 0, 0, 0.08);
    --site-text: #1f2328;
    --site-text-muted: #656d76;
    --site-accent: #0969da;
    --site-active-bg: rgba(9, 105, 218, 0.08);
    --site-badge-bg: rgba(9, 105, 218, 0.1);
    --site-card-bg: rgba(0, 0, 0, 0.02);
    --site-tertiary-bg: rgba(0, 0, 0, 0.02);
    --site-tertiary-text: #8b949e;
  }

  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) {
      --site-bg: rgba(22, 27, 34, 0.75);
      --site-border: rgba(255, 255, 255, 0.08);
      --site-text: #f0f6fc;
      --site-text-muted: #8b949e;
      --site-accent: #58a6ff;
      --site-active-bg: rgba(88, 166, 255, 0.12);
      --site-badge-bg: rgba(88, 166, 255, 0.15);
      --site-card-bg: rgba(255, 255, 255, 0.03);
      --site-tertiary-bg: rgba(0, 0, 0, 0.2);
      --site-tertiary-text: #6e7681;
    }
  }

  [data-theme="dark"] {
    --site-bg: rgba(22, 27, 34, 0.75);
    --site-border: rgba(255, 255, 255, 0.08);
    --site-text: #f0f6fc;
    --site-text-muted: #8b949e;
    --site-accent: #58a6ff;
    --site-active-bg: rgba(88, 166, 255, 0.12);
    --site-badge-bg: rgba(88, 166, 255, 0.15);
    --site-card-bg: rgba(255, 255, 255, 0.03);
    --site-tertiary-bg: rgba(0, 0, 0, 0.2);
    --site-tertiary-text: #6e7681;
  }

  /* ---------------- Header 样式 ---------------- */
  .site-header {
    position: sticky;
    top: 0;
    z-index: 100;
    width: 100%;
    background: var(--site-bg);
    border-bottom: 1px solid var(--site-border);
    backdrop-filter: blur(12px) saturate(1.2);
    -webkit-backdrop-filter: blur(12px) saturate(1.2);
    transition: all 0.25s ease;
  }

  .hdr-container {
    max-width: 1100px;
    margin: 0 auto;
    padding: 0.75rem 1.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .hdr-brand {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    text-decoration: none;
    color: var(--site-text);
    font-weight: 700;
    font-size: 1.15rem;
    letter-spacing: -0.02em;
  }

  .hdr-brand-badge {
    font-size: 0.7rem;
    padding: 0.15rem 0.4rem;
    border-radius: 6px;
    background: var(--site-active-bg);
    color: var(--site-accent);
    font-weight: 600;
  }

  .hdr-nav-list {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .hdr-nav-item a {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.4rem 0.8rem;
    border-radius: 8px;
    color: var(--site-text);
    font-size: 0.875rem;
    font-weight: 500;
    text-decoration: none;
    transition: all 0.2s ease;
  }

  .hdr-nav-item a:hover,
  .hdr-nav-item.active a {
    color: var(--site-accent);
    background: var(--site-active-bg);
    font-weight: 600;
  }

  /* ---------------- Body Content 样式 ---------------- */
  .privacy-wrapper {
    font-family: var(--font-mono);
    max-width: 945px;
    margin: 2.5rem auto;
    padding: 2rem;
    background: var(--site-bg);
    border: 1px solid var(--site-border);
    border-radius: 16px;
    backdrop-filter: blur(12px) saturate(1.2);
    -webkit-backdrop-filter: blur(12px) saturate(1.2);
    color: var(--site-text);
  }

  .privacy-header {
    border-bottom: 1px dashed var(--site-border);
    padding-bottom: 1.25rem;
    margin-bottom: 2rem;
  }

  .privacy-header h1 {
    font-size: 1.75rem;
    font-weight: 700;
    margin: 0 0 0.5rem;
    color: var(--site-text);
  }

  .privacy-meta {
    font-size: 0.85rem;
    color: var(--site-text-muted);
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .privacy-section {
    margin-bottom: 2.5rem;
  }

  .privacy-section h2 {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--site-text);
  }

  .privacy-section h2::before {
    content: "";
    display: inline-block;
    width: 4px;
    height: 18px;
    background: var(--site-accent);
    border-radius: 2px;
  }

  .tech-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 1rem;
    margin: 1rem 0;
  }

  .tech-card {
    background: var(--site-card-bg);
    border: 1px solid var(--site-border);
    border-radius: 10px;
    padding: 1rem;
  }

  .tech-card h3 {
    margin: 0 0 0.4rem;
    font-size: 0.95rem;
    font-weight: 600;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .tech-card h3 i {
    margin-right: 0.4rem;
    color: var(--site-accent);
  }
  .tech-card p {
    margin: 0;
    font-size: 0.85rem;
    color: var(--site-text-muted);
    line-height: 1.5;
  }

  .prv-badge {
    font-size: 0.72rem;
    padding: 0.15rem 0.5rem;
    border-radius: 12px;
    background: var(--site-badge-bg);
    color: var(--site-accent);
    font-weight: 500;
  }

  .cookie-box {
    background: var(--site-card-bg);
    border: 1px solid var(--site-border);
    border-radius: 12px;
    padding: 1.25rem;
    margin-top: 1rem;
  }

  .cookie-item {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 0.75rem 0;
  }

  .cookie-item:not(:last-child) {
    border-bottom: 1px dashed var(--site-border);
  }

  .cookie-info h4 {
    margin: 0 0 0.25rem;
    font-size: 0.9rem;
    font-weight: 600;
  }

  .cookie-info p {
    margin: 0;
    font-size: 0.825rem;
    color: var(--site-text-muted);
  }

  /* ---------------- Footer 样式 ---------------- */
  #footerwrap {
    margin-top: 3rem;
    border-top: 1px solid var(--site-border);
    background: var(--site-bg);
    backdrop-filter: blur(12px) saturate(1.2);
    -webkit-backdrop-filter: blur(12px) saturate(1.2);
    color: var(--site-text-muted);
    font-size: 0.875rem;
  }

  .ftr-container {
    max-width: 1100px;
    margin: 0 auto;
    padding: 2.5rem 1.5rem 1.5rem;
  }

  .ftr-main-row {
    display: flex;
    flex-wrap: wrap;
    gap: 2rem;
    justify-content: space-between;
    margin-bottom: 1.5rem;
  }

  .ftr-counter-row {
    display: flex;
    align-items: center;
    justify-content: center;
    padding-top: 1.25rem;
    border-top: 1px dashed var(--site-border);
  }

  .ftr-tertiary {
    background: var(--site-tertiary-bg);
    border-top: 1px solid var(--site-border);
    padding: 0.85rem 1.5rem;
  }

  .ftr-tertiary-inner {
    max-width: 1100px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .ftr-nav-list {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 1.25rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .ftr-nav-list li {
    display: inline-flex;
    align-items: center;
  }

  .ftr-nav-list li:not(:last-child)::after {
    content: "•";
    margin-left: 1.25rem;
    color: var(--site-tertiary-text);
    opacity: 0.5;
  }

  .ftr-nav-list span, .ftr-nav-list a {
    color: var(--site-tertiary-text);
    font-weight: 500;
    font-size: 0.825rem;
    text-decoration: none;
  }

  .ftr-nav-list a:hover {
    color: var(--site-accent);
  }

  /* 响应式调整 */
  @media (max-width: 640px) {
    .hdr-container { padding: 0.6rem 1rem; font-family: var(--font-mono);}
    .hdr-nav-list { gap: 0.25rem; }
    .hdr-nav-item a { padding: 0.35rem 0.5rem; font-size: 0.825rem; }
    .hdr-nav-item i { display: none; }
    .privacy-wrapper { margin: 1rem; padding: 1.25rem; }
    .ftr-nav-list { flex-direction: column; gap: 0.5rem; }
    .ftr-nav-list li:not(:last-child)::after { display: none; }
  }

  @media print {
    .site-header, #footerwrap { display: none !important; }
  }
</style>
<!-- 1. 动态页头组件 (从 page.header_data 读取变量) -->
<header class="site-header hidden-print">
  <div class="hdr-container">
    <a href="{{ '/' | relative_url }}" class="hdr-brand">
      <span>{{ site.brand | default: page.header_data.logo_text }}</span>
      {% if page.header_data.brand_sub %}
        <span class="hdr-brand-badge">{{ page.header_data.brand_sub }}</span>
      {% endif %}
    </a>

    <nav class="hdr-nav">
      <ul class="hdr-nav-list">
        {% for item in page.header_data.nav_links %}
          {% assign is_active = false %}
          {% if page.url == item.url %}
            {% assign is_active = true %}
          {% endif %}

          <li class="hdr-nav-item {% if is_active %}active{% endif %}">
            <a href="{{ item.url | relative_url }}">
              {% if item.icon %}<i class="{{ item.icon }}"></i>{% endif %}
              <span>{{ item.title }}</span>
            </a>
          </li>
        {% endfor %}
      </ul>
    </nav>
  </div>
</header>
<!-- 2. 主体隐私内容区域 -->
<div class="privacy-wrapper">
  <div class="privacy-header">
    <h1>{{ page.title }}</h1>
    <div class="privacy-meta">
      <span><i class="far fa-calendar-alt"></i> 构建时间：{{ page.time }}</span>
      <span><i class="fas fa-shield-alt"></i> {{ site.title }} ({{ site.brand }})</span>
      {% if site.web_version %}<span><i class="fas fa-code-branch"></i> Web {{ site.web_version }}</span>{% endif %}
    </div>
  </div>

  <div class="privacy-section">
    <h2>1. 隐私承诺</h2>
    <p>欢迎访问 {{ site.title }}（<a href="{{ site.githubIO }}" target="_blank" rel="noopener noreferrer">{{ site.githubIO }}</a>）。{{ site.about }}。我们高度重视您的个人隐私与数据安全，本博客为非商业性技术实验室站点，遵循最小化收集原则，不强制要求用户注册、登录或提供敏感的个人身份信息。</p>
  </div>

  <div class="privacy-section">
    <h2>2. 技术栈与第三方服务</h2>
    <p>为了保障站点的安全性、访问速度与稳定性，本站点使用了以下技术架构及服务：</p>

    <div class="tech-grid">
      <div class="tech-card">
        <h3>
          <span><i class="fab fa-github"></i> GitHub Pages</span>
          <span class="prv-badge">托管服务</span>
        </h3>
        <p>本站源码托管于 <a href="{{ site.githubAccess }}" target="_blank" rel="noopener noreferrer">GitHub</a>，并通过 GitHub Actions (分支: <code>{{ site.githubRepos-Branch }}</code>) 自动化构建静态文件。GitHub 可能会根据其隐私政策收集必要的服务器连接日志（如 IP 地址）。</p>
      </div>

      <div class="tech-card">
        <h3>
          <span><i class="fas fa-bolt"></i> Cloudflare CDN</span>
          <span class="prv-badge">网络加速</span>
        </h3>
        <p>提供全球内容分发网络（CDN）服务，配合静态资源图床（<code>https:{{ site.PicturesLinks_Domain }}</code>），提升访问速度并优化全球访问体验。</p>
      </div>

      <div class="tech-card">
        <h3>
          <span><i class="fas fa-lock"></i> Cloudflare WAF</span>
          <span class="prv-badge">安全防护</span>
        </h3>
        <p>网站防护防火墙（WAF），用于实时检测并防御恶意请求、Bot 抓取和 DDoS 攻击，确保实验室站点的正常运行。</p>
      </div>

      <div class="tech-card">
        <h3>
          <span><i class="fas fa-code"></i>Jekyll | MD</span>
          <span class="prv-badge">静态生成</span>
        </h3>
        <p>基于 Jekyll :<br>
        代码高亮: <code>{{ site.highlighter }}</code>, <code>Markdown</code><br>
        解析器: <code>{{ site.markdown }}</code> 构建。
        纯静态 HTML 输出，不存在后端数据库收集与存储您的个人隐私数据。</p>
      </div>
    </div>
  </div>

  <div class="privacy-section" id="Cookie">
    <h2>3. Cookie 偏好与管理</h2>
    <p>Cookie 是保存在您浏览器上的小型文本文件。本博客仅使用维持基本功能与安全防护所必需的 Cookie，不包含广告追踪类 Cookie。</p>

    <div class="cookie-box">
      <div class="cookie-item">
        <div class="cookie-info">
          <h4>必要的安全与性能 Cookie (Strictly Necessary)</h4>
          <p>由 Cloudflare (例如 <code>__cf_bm</code>) 等服务自动设定，<br>用于区分真实访问者与恶意 Bot，确保 WAF 安全策略生效。</p>
        </div>
        <span class="prv-badge">强制开启</span>
      </div>

      <div class="cookie-item">
        <div class="cookie-info">
          <h4>功能性与偏好 Cookie (Functional)</h4>
          <p>用于记录您的主题模式偏好（如暗黑 / 亮色模式切换）及卡片通知的关闭状态。</p>
        </div>
        <span class="prv-badge">本地存储</span>
      </div>
    </div>
  </div>

  <div class="privacy-section">
    <h2>4. 联系与反馈</h2>
    <p>如果您对本隐私政策有任何疑问、意见或建言，欢迎通过仓库提交 <a href="{{site.githubAccess}}/{{site.githubRepos}}/issues/new?labels=Service+Issue,privacy&template=2-bug_report.yaml&title={{page.path}}&nbsp;{% if page.Researchname %}{{ page.Researchname }} |{% elsif page.title %} {{ page.title }} |{% endif %}{% if include.cattitle %} {{ include.cattitle }} |{% endif %}{% if page.title or include.cattitle %}{{" "}}{% endif %}{{ site.title }}{% if site.brand %} | {{ site.brand }}{% endif %}" target="_blank" rel="noopener noreferrer">GitHub Issue</a> 与我们取得联系。</p>
  </div>
</div>