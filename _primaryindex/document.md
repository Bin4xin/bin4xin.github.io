---
layout: document
title: "工作文档中心"
permalink: /document/
author: Bin4xin
order: 0
---

## WELCOME

欢迎来到哨兵安全实验室的应急响应手册。本手册覆盖 8 大安全事件分类、37 篇实操文档，适用于 SOC 分析师、应急响应工程师、红蓝队成员在实战中快速查阅与执行。

所有文档按目录自动归类，新文章只需放在 `_document/` 对应子目录下即可自动出现在导航中。

---

## 每篇文档的标准结构

每篇文档遵循统一的事件响应生命周期框架：

1. **概述** — 场景定义、适用范围、前置条件
2. **检测与发现** — 告警来源、IOC 提取、日志分析
3. **隔离与遏制** — 网络隔离、账户锁定、进程终止
4. **评估与溯源** — 影响范围、攻击路径、时间线还原
5. **清除与恢复** — 恶意文件清理、系统恢复、业务验证
6. **加固与复盘** — 策略加固、复盘报告、预防措施

---

## 文档规范

| 规范项 | 要求 |
|---|---|
| 格式 | Markdown（GFM 语法） |
| front matter | 必须包含 `layout: document` 和 `categories` |
| 命名 | `编号_文件名.md`，如 `01_attack_model.md` |
| order | 目录编号 × 100 + 文件编号 |
| 代码块 | 使用 fenced code block，标注语言类型 |
| 截图 | 存放至 `/assets/img/` 对应目录，使用相对路径引用 |
| 外部链接 | 需注明来源，敏感链接标注 `[内部]` |

---

## 认证徽章

<div class="doc-honors">
  <div class="doc-honors-grid">
    <a class="doc-honor-card" href="https://developers.google.com/profile/badges/activity/chrome-devtools/chrome-devtools-user" target="_blank" rel="noopener">
      <img class="doc-honor-badge" src="/assets/img/svg/google/chrome-devtools-user/badge.svg" alt="Chrome DevTools User" />
      <span class="doc-honor-label">Chrome DevTools</span>
    </a>
    <a class="doc-honor-card" href="https://developers.google.com/profile/badges/activity/android/sdk-platform-tools" target="_blank" rel="noopener">
      <img class="doc-honor-badge" src="/assets/img/svg/google/sdk-platform-tools/badge.svg" alt="Android SDK Platform Tools" />
      <span class="doc-honor-label">SDK Platform Tools</span>
    </a>
    <a class="doc-honor-card" href="https://developers.google.com/profile/badges/activity/android/install-android-studio" target="_blank" rel="noopener">
      <img class="doc-honor-badge" src="/assets/img/svg/google/install-android-studio/badge.svg" alt="Android Studio User" />
      <span class="doc-honor-label">Android Studio</span>
    </a>
    <a class="doc-honor-card" href="https://developers.google.com/profile/badges/activity/cloud/activate-cloud-shell" target="_blank" rel="noopener">
      <img class="doc-honor-badge" src="/assets/img/svg/google/activate-cloud-shell/badge.svg" alt="Cloud Shell" />
      <span class="doc-honor-label">Cloud Shell</span>
    </a>
    <a class="doc-honor-card" href="https://developers.google.com/profile/badges/profile/created-profile" target="_blank" rel="noopener">
      <img class="doc-honor-badge" src="/assets/img/svg/google/created-profile/created_profile.svg" alt="Google Developer Program" />
      <span class="doc-honor-label">Developer Program</span>
    </a>
  </div>
</div>

---

## 许可

本手册由[**sentinel Lab**](https://github.com/sentryCyberSec) \| [**Bin4xin**](https://github.com/Bin4xin)维护，源代码遵循 [**GPL V2 License**](https://github.com/Bin4xin/bin4xin.github.io/tree/gh-pages?tab=License-1-ov-file) 开源协议，欢迎自由使用、修改与分发，但请保留原作者署名并遵守协议条款。

如有问题或改进建议，请通过下方的BUG按钮提交反馈。