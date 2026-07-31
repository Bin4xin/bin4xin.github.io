# 开发精准提示词模板

> 用于与 AI 助手（Claude / ChatGPT / Copilot）进行精准协作开发的提示词模板

---

## 1. 需求分析阶段

### 1.1 项目背景描述

```
## 项目背景
- 项目类型：{Jekyll 静态博客 / Python 脚本 / Web 应用 / ...}
- 技术栈：{具体框架、语言版本}
- 当前状态：{新项目 / 已有项目迭代}
- 目标用户：{安全研究人员 / 开发者 / ...}

## 约束条件
- 兼容性：{浏览器版本 / Python版本 / 操作系统}
- 性能要求：{响应时间 / 文件大小 / 加载速度}
- 设计规范：{GitHub Primer Design / Apple HIG / ...}
```

### 1.2 功能需求描述

```
## 功能需求
### 核心功能
- [ ] 功能1：{简要描述} → 预期行为：{具体行为}
- [ ] 功能2：{简要描述} → 预期行为：{具体行为}

### 交互逻辑
- 用户操作：{点击/输入/滚动...}
- 系统响应：{显示/隐藏/跳转/...}
- 异常处理：{错误提示/降级方案}

### 数据来源
- API：{接口地址、参数、返回格式}
- 本地数据：{JSON/YAML/Markdown 文件路径}
- Liquid 模板变量：{site.xxx / page.xxx}
```

---

## 2. 代码生成阶段

### 2.1 精准指令模板

```
## 任务
请在 {文件路径} 中完成以下修改：

## 修改内容
1. {具体修改1}：{参考代码片段}
2. {具体修改2}：{参考代码片段}

## 技术约束
- 使用 {CSS变量/SCSS变量/硬编码值}
- 兼容 {Dark Mode/Light Mode}
- 响应式断点：{480px / 768px / 991px}
- 遵循 {命名规范/类名规范}

## 参考样式
```css
/* 参考目标样式 */
.component {
    display: flex;
    border: 1px solid #d0d7de;
    border-radius: 8px;
    @include dark { border-color: #30363d; }
}
```

## 验证标准
- [ ] 在 Chrome/Firefox/Safari 中渲染正常
- [ ] Dark mode 下颜色对比度 ≥ 4.5:1
- [ ] 移动端 (390px) 不溢出
- [ ] 打印样式下内容完整显示
```

### 2.2 组件重构指令

```
## 重构任务
将 {旧组件名} 重构为 {新组件名}，遵循 {设计系统名称} 规范。

## 当前代码（需重构）
{粘贴旧代码}

## 目标代码风格
- 使用语义化 HTML（<nav>, <section>, <article> 等）
- CSS 类名遵循 BEM 或 GitHub Primer 命名
- 支持 @include dark { } 暗黑模式
- 移除内联样式，使用 CSS 变量

## 保持不变
- 功能逻辑（JavaScript/ Liquid）
- 数据绑定（变量名、循环逻辑）
- URL 路由
```

---

## 3. 调试修复阶段

### 3.1 Bug 修复模板

```
## Bug 描述
- 现象：{具体表现}
- 预期：{正确行为}
- 复现步骤：{步骤1 → 步骤2 → 步骤3}

## 环境信息
- 浏览器：{Chrome 120 / Safari 17 ...}
- 屏幕尺寸：{390px (iPhone 12 Pro) / 1440px (桌面)}
- 主题模式：{Light / Dark}
- 相关文件：{file1, file2}

## 已排查
- [ ] 是否为 CSS 优先级问题
- [ ] 是否为 JavaScript 时序问题
- [ ] 是否为 Liquid 模板变量未定义
- [ ] 是否为 Dark mode 颜色缺失

## 修复方向
请优先使用 {最小化修改} 策略：
1. 在 {文件} 的 {行号范围} 附近添加/修改
2. 不要改动其他文件
3. 保留现有的 {特定样式/逻辑}
```

### 3.2 性能优化模板

```
## 性能问题
- 指标：{LCP / FID / CLS / 页面加载时间}
- 当前值：{具体数值}
- 目标值：{具体数值}

## 排查范围
- CSS：{未使用的规则 / 过大的选择器权重 / 内联样式}
- JS：{阻塞渲染 / 未 defer/async / 冗余请求}
- 图片：{未压缩 / 未 lazy-load / 格式不优}
- 字体：{未预加载 / 过多字重}

## 优化策略
请按以下优先级执行：
1. 首屏关键 CSS 内联
2. 非关键 JS 添加 defer/async
3. 图片添加 loading="lazy"
4. 字体使用 font-display: swap
```

---

## 4. 设计系统维护

### 4.1 新增设计规范

```
## 设计规范
### 颜色
- Primary: {#82318e} (主题紫)
- Text: {#1f2328} (正文) / {#656d76} (次要)
- Border: {#d0d7de} (Light) / {#30363d} (Dark)
- Link: {#0969da} (Light) / {#58a6ff} (Dark)

### 字体
- Base: --font-sans (系统字体栈)
- Mono: --font-mono (代码字体)
- Sizes: xs(12) → sm(14) → base(16) → md(18) → lg(20) → xl(24) → 2xl(28) → 3xl(32)

### 间距
- spacing-sm: 8px
- spacing-md: 16px
- spacing-lg: 24px
- spacing-xl: 32px

### 圆角
- 小组件: 6px
- 卡片: 8px
- 徽章/Token: 16px (pill)
- 头像: 50%
```

### 4.2 暗黑模式检查清单

```
## 暗黑模式适配检查
- [ ] 所有硬编码颜色已替换为 @include dark { }
- [ ] 内联 style 中的颜色在 dark mode 下可见
- [ ] border-color 使用 #30363d (Dark)
- [ ] background 使用 #161b22 (Dark)
- [ ] 文字颜色使用 #e6edf3 (primary) / #8b949e (secondary)
- [ ] 图标/SVG 在 dark mode 下颜色适配
- [ ] 阴影使用 rgba(0,0,0,0.4) (Dark)
- [ ] hover 状态在两种模式下均有反馈
```

---

## 5. Git Commit 规范

```
## Commit Message 格式
<type>(<scope>): <subject>

## Type 类型
- feat: 新功能
- fix: Bug 修复
- style: 样式调整（不影响功能）
- refactor: 代码重构
- docs: 文档更新
- perf: 性能优化
- chore: 构建/工具链变更

## 示例
feat(categories): 添加时间轴分类页面布局
fix(toc): 修复侧边栏折叠后按钮不可见问题
style(typography): 优化标题层级与行高系统
perf(feed): 修复 RSS feed 的 pubDate 逻辑