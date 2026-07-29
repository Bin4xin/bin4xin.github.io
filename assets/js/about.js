(function() {
    const sidebar = document.getElementById('sidebar1');
    const toggleBtn = document.getElementById('sidebar-toggle-btn');

    if (!sidebar || !toggleBtn) {
        return;
    }

    // 切换侧边栏：折叠/展开
    function toggleSidebar() {
        sidebar.classList.toggle('collapsed');
        // 同步按钮方向指示
        updateButtonDirection();
    }

    // 更新按钮方向指示（旋转箭头）
    function updateButtonDirection() {
        if (sidebar.classList.contains('collapsed')) {
            toggleBtn.classList.add('sidebar-collapsed');
        } else {
            toggleBtn.classList.remove('sidebar-collapsed');
        }
    }

    // 给切换按钮绑定点击事件
    toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleSidebar();
    });

    // ========== 鼠标悬浮侧边栏右侧边缘时显示按钮 ==========
    const TRIGGER_THRESHOLD = 24;

    function isMouseNearSidebarRightEdge(mouseX, mouseY) {
        if (!sidebar) return false;
        const rect = sidebar.getBoundingClientRect();
        const isNearRightEdge = (mouseX >= rect.right - TRIGGER_THRESHOLD && mouseX <= rect.right + TRIGGER_THRESHOLD);
        const isWithinVerticalRange = (mouseY >= rect.top - 5 && mouseY <= rect.bottom + 5);
        return isNearRightEdge && isWithinVerticalRange;
    }

    function onMouseMove(e) {
        const isNear = isMouseNearSidebarRightEdge(e.clientX, e.clientY);
        const isOverBtn = (toggleBtn.matches(':hover'));

        if (isNear || isOverBtn) {
            toggleBtn.classList.add('toggle-btn-visible');
        } else {
            toggleBtn.classList.remove('toggle-btn-visible');
        }
    }

    document.addEventListener('mousemove', onMouseMove);

    // 当侧边栏class变化时同步按钮状态
    const observer = new MutationObserver(() => {
        updateButtonDirection();
    });
    observer.observe(sidebar, { attributes: true, attributeFilter: ['class'] });

    // 初始状态：确保无collapsed类，按钮隐藏
    sidebar.classList.remove('collapsed');
    toggleBtn.classList.remove('toggle-btn-visible');
    updateButtonDirection();

    // 清理资源
    window.addEventListener('beforeunload', () => {
        document.removeEventListener('mousemove', onMouseMove);
        observer.disconnect();
    });
})();