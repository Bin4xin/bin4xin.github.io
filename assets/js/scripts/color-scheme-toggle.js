((window, undefined) => {
    // ----- 工具函数与 DOM 缓存 -----
    function onDidChangeSystemColorScheme() {
        if (window.__disableColorScheme) return; // 锁定状态不更新

        AppStore.state.systemColorScheme = prefersColorSchemeMediaQueryList.matches
            ? ColorScheme.dark.value
            : ColorScheme.light.value;

        if (AppStore.state.preferredColorScheme === ColorScheme.auto.value) {
            setPreferredColorScheme(ColorScheme.auto.value);
        }
    }

    // 核心切换函数（增强防重复 + 锁定支持）
    function setPreferredColorScheme(colorSchemeValue) {
        // 1. 全局锁检查
        if (window.__disableColorScheme) return;
        // 2. 避免相同值重复执行 (防止递归循环)
        if (colorSchemeValue === AppStore.state.preferredColorScheme) return;

        // 更新 store 及持久化存储
        AppStore.setPreferredColorScheme(colorSchemeValue);

        // 同步 radio 按钮的选中状态 (基于 data-color-scheme-option 结构)
        const optionInputs = Array.from(
            window.document.querySelectorAll(
                'label[data-color-scheme-option] > input[type="radio"]',
            )
        );
        optionInputs.forEach((option) => {
            option.checked = (option.value === colorSchemeValue);
        });

        // 判断最终实际渲染的是深色还是浅色 (auto 模式下跟随 systemColorScheme)
        const prefersDark = !!(
            colorSchemeValue === ColorScheme.dark.value ||
            (colorSchemeValue === ColorScheme.auto.value &&
                AppStore.state.systemColorScheme === ColorScheme.dark.value)
        );

        // 动态注入/移除 深色专用样式表 (若有 data-color-scheme="dark" 的 link/style)
        if (prefersDark) {
            ColorSchemeDarkHead.forEach((node) => {
                if (node.parentElement === null) {
                    document.head.appendChild(node);
                }
            });
            document.body.dataset.colorScheme = ColorScheme.dark.value;
            setBodyColorThemeClass("dark");
        } else {
            ColorSchemeDarkHead.forEach((node) => {
                if (node.parentElement) node.parentElement.removeChild(node);
            });
            document.body.dataset.colorScheme = ColorScheme.light.value;
            setBodyColorThemeClass("light");
        }

        // 更新 CSS 变量以支持手动主题切换
        updateColorSchemeCSSVariables(prefersDark);
    }

    // 更新 CSS 自定义属性 (支持手动主题)
    function updateColorSchemeCSSVariables(isDark) {
        const root = document.documentElement;
        if (isDark) {
            root.style.setProperty('--color-bg', '#222');
            root.style.setProperty('--color-bg-darker', '#111');
            root.style.setProperty('--color-text', '#ddd');
            root.style.setProperty('--color-text-secondary', '#aaa');
            root.style.setProperty('--color-link', '#6793cf');
            root.style.setProperty('--color-link-hover', '#62bbe7');
            root.style.setProperty('--color-primary', '#C353D3');
            root.style.setProperty('--color-border', '#444');
            root.style.setProperty('--color-navbar-bg', '#1a1a1a');
            root.style.setProperty('--color-card-bg', '#2a2a2a');
            root.style.setProperty('--color-code-bg', '#1e1e1e');
        } else {
            root.style.setProperty('--color-bg', '#ffffff');
            root.style.setProperty('--color-bg-darker', '#f5f5f5');
            root.style.setProperty('--color-text', '#384452');
            root.style.setProperty('--color-text-secondary', '#555');
            root.style.setProperty('--color-link', '#088acb');
            root.style.setProperty('--color-link-hover', '#62bbe7');
            root.style.setProperty('--color-primary', '#82318E');
            root.style.setProperty('--color-border', '#ddd');
            root.style.setProperty('--color-navbar-bg', '#d3d3d3');
            root.style.setProperty('--color-card-bg', '#ffffff');
            root.style.setProperty('--color-code-bg', '#f6f8fa');
        }
    }

    function setBodyColorThemeClass(theme) {
        if (window.__disableColorScheme) return;
        if (theme === "dark") {
            document.body.classList.add("theme-dark");
            document.body.classList.remove("theme-light");
        } else if (theme === "light") {
            document.body.classList.add("theme-light");
            document.body.classList.remove("theme-dark");
        }
    }

    // ColorScheme 枚举
    const ColorScheme = {
        auto: { value: "auto" },
        light: { value: "light" },
        dark: { value: "dark" },
    };

    // 多语言资源 (保留原有所有语种)
    const ColorSchemeLocales = {
        en: {
            toggleAriaLabel: "Select a color scheme preference",
            auto: "Auto",
            light: "Light",
            dark: "Dark",
        },
        zh_CN: {
            toggleAriaLabel: "Select a color scheme preference",
            auto: "自动",
            light: "浅色",
            dark: "深色",
        },
        ja_JP: {
            toggleAriaLabel: "Select a color scheme preference",
            auto: "自動",
            light: "ライト",
            dark: "ダーク",
        },
        ko_KR: {
            toggleAriaLabel: "Select a color scheme preference",
            auto: "자동",
            light: "라이트",
            dark: "다크",
        },
        it_IT: {
            toggleAriaLabel: "Select a color scheme preference",
            auto: "Automatico",
            light: "Chiaro",
            dark: "Scuro",
        },
        fr_FR: {
            toggleAriaLabel: "Select a color scheme preference",
            auto: "Automatique",
            light: "Clair",
            dark: "Sombre",
        },
        de_DE: {
            toggleAriaLabel: "Select a color scheme preference",
            auto: "Automatisch",
            light: "Hell",
            dark: "Dunkel",
        },
        pt_BR: {
            toggleAriaLabel: "Select a color scheme preference",
            auto: "Automática",
            light: "Clara",
            dark: "Escura",
        },
        es_lamr: {
            toggleAriaLabel: "Select a color scheme preference",
            auto: "Automático",
            light: "Claro",
            dark: "Obscuro",
        },
        es_LA: {
            toggleAriaLabel: "Select a color scheme preference",
            auto: "Automático",
            light: "Claro",
            dark: "Obscuro",
        },
        zh_TW: {
            toggleAriaLabel: "Select a color scheme preference",
            auto: "自動",
            light: "淺色",
            dark: "深色",
        },
    };

    // 获取切换组件容器 & 需要本地化的文本元素
    const ColorSchemeToggleRadioGroup = document.querySelector(".color-scheme-toggle");
    const ColorSchemeToggleRadioLabels = ColorSchemeToggleRadioGroup?.querySelectorAll(".text");
    // 收集所有 data-color-scheme="dark" 的头部资源 (例如备用 dark.css)
    const ColorSchemeDarkHead = Array.from(
        document.head.querySelectorAll('[data-color-scheme="dark"]'),
    );

    // 根据 html 或父级 lang 确定语言
    let localeKey = "en";
    const htmlLangNode = ColorSchemeToggleRadioGroup?.closest("[lang]");
    if (htmlLangNode) {
        localeKey = htmlLangNode.lang
            .replace("en_US", "en")
            .replace("en-US", "en")
            .replace("-", "_");
    }
    const Locale = ColorSchemeLocales[localeKey] || ColorSchemeLocales.en;

    // 移除 dark 头部资源的 media 限制，使其可被动态控制
    ColorSchemeDarkHead.forEach((node) => (node.media = ""));

    // 设置 aria-label 本地化
    if (ColorSchemeToggleRadioGroup) {
        ColorSchemeToggleRadioGroup.setAttribute("aria-label", Locale.toggleAriaLabel);
    }

    // 更新按钮文本 (本地化)
    if (ColorSchemeToggleRadioLabels) {
        ColorSchemeToggleRadioLabels.forEach((textSpan) => {
            const parentLabel = textSpan.closest('label[data-color-scheme-option]');
            if (parentLabel && parentLabel.dataset.colorSchemeOption) {
                const key = parentLabel.dataset.colorSchemeOption;
                textSpan.textContent = Locale[key] || key;
            }
        });
    }

    // 检测系统是否支持 prefers-color-scheme
    const supportsAutoColorScheme =
        typeof window.matchMedia !== "undefined" &&
        [ColorScheme.light.value, ColorScheme.dark.value, "no-preference"].some(
            (scheme) => window.matchMedia(`(prefers-color-scheme: ${scheme})`).matches,
        );

    const defaultColorScheme = supportsAutoColorScheme
        ? ColorScheme.auto
        : ColorScheme.light;

    // AppStore: 存储偏好 & 状态
    window.Settings = window.Settings || {};
    const AppStore = {
        state: {
            preferredColorScheme:
                window.Settings.preferredColorScheme || defaultColorScheme.value,
            supportsAutoColorScheme,
            systemColorScheme: ColorScheme.light.value,
        },
        setPreferredColorScheme(value) {
            if (window.__disableColorScheme) return;
            this.state.preferredColorScheme = value;
            window.Settings.preferredColorScheme = value;
            // 可选：同步到 localStorage 或其它存储 (保留原逻辑)
            try {
                if (window.localStorage) {
                    localStorage.setItem('preferredColorScheme', value);
                }
            } catch(e) {}
        },
        setSystemColorScheme(value) {
            this.state.systemColorScheme = value;
        },
        syncPreferredColorScheme() {
            if (window.__disableColorScheme) return;
            if (
                !!Settings.preferredColorScheme &&
                Settings.preferredColorScheme !== this.state.preferredColorScheme
            ) {
                this.state.preferredColorScheme = Settings.preferredColorScheme;
            }
        },
    };

    // 监听系统配色变化
    const prefersColorSchemeMediaQueryList = window.matchMedia("(prefers-color-scheme: dark)");
    if (supportsAutoColorScheme) {
        AppStore.state.systemColorScheme = prefersColorSchemeMediaQueryList.matches
            ? ColorScheme.dark.value
            : ColorScheme.light.value;
    }

    try {
        prefersColorSchemeMediaQueryList.addEventListener(
            "change",
            onDidChangeSystemColorScheme,
        );
    } catch (e) {
        prefersColorSchemeMediaQueryList.addListener(onDidChangeSystemColorScheme);
    }

    if (supportsAutoColorScheme === false) {
        document.body.setAttribute("data-supports-auto-color-scheme", "false");
    }

    // 初始化：设置主题（仅当未锁定时）
    if (!window.__disableColorScheme) {
        setPreferredColorScheme(AppStore.state.preferredColorScheme);
    }

    // 暴露全局 API
    window.ColorScheme = ColorScheme;
    window.setPreferredColorScheme = setPreferredColorScheme;

    // 当页面从 bfcache 恢复时同步偏好
    window.addEventListener("pageshow", () => {
        if (!window.__disableColorScheme) {
            AppStore.syncPreferredColorScheme();
            // 重新同步界面 (防止外部存储变更)
            const currentPreferred = AppStore.state.preferredColorScheme;
            setPreferredColorScheme(currentPreferred);
        }
    });

    // 快捷键: Ctrl+I 反转亮暗 / Ctrl+Shift+I 切换自动
    function colorSchemeHotKeys(e) {
        if (window.__disableColorScheme) return;
        // Ctrl + I (Key I, which=73)
        if (e.ctrlKey && e.key === 'i' && !e.shiftKey) {
            e.preventDefault();
            const invertColorSchemeValue =
                document.body.dataset.colorScheme === "dark" ? "light" : "dark";
            setPreferredColorScheme(invertColorSchemeValue);
        }
        // Ctrl + Shift + I
        if (e.ctrlKey && e.shiftKey && e.key === 'I') {
            e.preventDefault();
            setPreferredColorScheme(ColorScheme.auto.value);
        }
    }

    if (!window.__disableColorScheme) {
        document.addEventListener("keydown", colorSchemeHotKeys, false);
    }

    // -------------------- 关键增强: 让 radio 按钮点击生效 --------------------
    // 当用户点击 label 或 radio 时，通过 change 事件触发主题切换。
    // 并且确保只处理「被选中」的 change，避免程序同步导致的无效递归。
    function setupRadioChangeListener() {
        const radioGroup = document.querySelector('.color-scheme-toggle');
        if (!radioGroup) return;
        // 使用事件委托监听所有 radio 的 change 事件
        radioGroup.addEventListener('change', (e) => {
            if (window.__disableColorScheme) return;
            const radio = e.target;
            // 仅当 radio 元素且其 checked 属性为 true (用户主动选中) 时进行切换
            if (radio && radio.tagName === 'INPUT' && radio.type === 'radio' && radio.checked) {
                const newScheme = radio.value;
                // 避免不必要的重复调用 (setPreferredColorScheme 内部已经有相同值阻断，但二次保障)
                if (newScheme !== AppStore.state.preferredColorScheme) {
                    setPreferredColorScheme(newScheme);
                }
            }
        });
    }

    // 确保 DOM 加载完成后再绑定监听 (保证 .color-scheme-toggle 存在)
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupRadioChangeListener);
    } else {
        setupRadioChangeListener();
    }

    // 额外：若通过外部 localStorage 读取过偏好，并且没有初始化锁定，同步存储的值（兼容旧 Settings）
    try {
        const storedPref = localStorage.getItem('preferredColorScheme');
        if (storedPref && !window.Settings.preferredColorScheme && !window.__disableColorScheme) {
            if (['light', 'dark', 'auto'].includes(storedPref)) {
                window.Settings.preferredColorScheme = storedPref;
                AppStore.state.preferredColorScheme = storedPref;
                setPreferredColorScheme(storedPref);
            }
        }
    } catch(e) {}
})(window);