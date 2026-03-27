(function() {
    // DOM 元素
    const sidebar = document.getElementById('sidebar1');
    const toggleBtnContainer = document.querySelector('.aside-area-toggle-btn');
    const restoreBtn = document.getElementById('aside-area-toggle-btn');

    if (!sidebar || !toggleBtnContainer) {
    console.warn('缺少必要元素: sidebar1 或 .aside-area-toggle-btn');
    return;
}

    // 确保按钮初始隐藏（dp-none 控制不可见）
    toggleBtnContainer.classList.add('dp-none');
    toggleBtnContainer.classList.remove('visible');

    // 确保 restore-btn 移除隐藏类（使之可点击可见）
    if (restoreBtn) {
    restoreBtn.classList.remove('dp-none');
    restoreBtn.style.display = 'flex';
    // 确保图片指针事件穿透，点击生效
    const img = restoreBtn.querySelector('.toggle-logo-img');
    if (img) {
    img.style.pointerEvents = 'none';
}
}

    // 切换侧边栏核心函数：折叠/展开，并自动处理Logo显隐（通过CSS类控制）
    function toggleSidebar() {
    sidebar.classList.toggle('collapsed');
    // 侧边栏状态改变后，如果按钮当前是可见状态，需要重新定位（因为侧边栏宽度可能变为0）
    if (toggleBtnContainer && !toggleBtnContainer.classList.contains('dp-none')) {
    showToggleBtnAtSidebarEdge();
}
}

    // 给切换按钮绑定点击事件
    if (restoreBtn) {
    restoreBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleSidebar();
});
}
    // 同时确保容器点击也能触发（兼容）
    toggleBtnContainer.addEventListener('click', (e) => {
    if (e.target === restoreBtn || restoreBtn?.contains(e.target)) return;
    if (restoreBtn) {
    restoreBtn.click();
} else {
    toggleSidebar();
}
});

    // ========== 鼠标悬浮侧边栏右侧边缘时显示按钮 ==========
    const TRIGGER_THRESHOLD = 24;  // 距离右侧边缘24px内触发显示

    // 显示切换按钮并精确定位到侧边栏右侧垂直居中位置
    function showToggleBtnAtSidebarEdge() {
    if (!sidebar || !toggleBtnContainer) return;
    const sidebarRect = sidebar.getBoundingClientRect();
    const sidebarRight = sidebarRect.right;
    const sidebarTop = sidebarRect.top;
    const sidebarBottom = sidebarRect.bottom;
    const sidebarHeight = sidebarBottom - sidebarTop;
    const centerY = sidebarTop + sidebarHeight / 2;

    // 按钮宽度40px，定位使其紧贴侧边栏右侧边缘（视觉上右侧中间）
    let btnLeft = sidebarRight - 8;  // 略微嵌入边缘，制造“附着”感
    // 边界保护，避免超出视口右侧
    const maxLeft = window.innerWidth - toggleBtnContainer.offsetWidth - 5;
    btnLeft = Math.min(btnLeft, maxLeft);
    btnLeft = Math.max(btnLeft, 5);

    toggleBtnContainer.style.position = 'fixed';
    toggleBtnContainer.style.left = btnLeft + 'px';
    toggleBtnContainer.style.top = (centerY - toggleBtnContainer.offsetHeight / 2) + 'px';
    // 移除隐藏类，显示按钮
    toggleBtnContainer.classList.remove('dp-none');
    toggleBtnContainer.classList.add('visible');
}

    function hideToggleBtn() {
    if (!toggleBtnContainer) return;
    toggleBtnContainer.classList.add('dp-none');
    toggleBtnContainer.classList.remove('visible');
}

    // 判断鼠标是否在侧边栏右侧边缘阈值内
    function isMouseNearSidebarRightEdge(mouseX, mouseY) {
    if (!sidebar) return false;
    const rect = sidebar.getBoundingClientRect();
    const isNearRightEdge = (mouseX >= rect.right - TRIGGER_THRESHOLD && mouseX <= rect.right + TRIGGER_THRESHOLD);
    const isWithinVerticalRange = (mouseY >= rect.top - 5 && mouseY <= rect.bottom + 5);
    return isNearRightEdge && isWithinVerticalRange;
}

    let currentMouseX = 0, currentMouseY = 0;
    let rafId = null;
    let isBtnVisibleByHover = false;

    function updateBtnVisibilityBasedOnMouse() {
    if (!sidebar || !toggleBtnContainer) return;
    const isNearEdge = isMouseNearSidebarRightEdge(currentMouseX, currentMouseY);
    if (isNearEdge) {
    showToggleBtnAtSidebarEdge();
    isBtnVisibleByHover = true;
} else {
    // 鼠标不在边缘区，检查是否悬浮在按钮本身上（避免抖动）
    const btnRect = toggleBtnContainer.getBoundingClientRect();
    const isMouseOverBtn = (currentMouseX >= btnRect.left - 5 && currentMouseX <= btnRect.right + 5 &&
    currentMouseY >= btnRect.top - 5 && currentMouseY <= btnRect.bottom + 5);
    if (!isMouseOverBtn && isBtnVisibleByHover) {
    hideToggleBtn();
    isBtnVisibleByHover = false;
} else if (isMouseOverBtn) {
    // 鼠标在按钮上，确保按钮保持显示且位置正确
    if (toggleBtnContainer.classList.contains('dp-none')) {
    showToggleBtnAtSidebarEdge();
    isBtnVisibleByHover = true;
} else {
    // 动态更新位置（防止滚动或resize偏移）
    showToggleBtnAtSidebarEdge();
}
}
}
}

    function onMouseMove(e) {
    currentMouseX = e.clientX;
    currentMouseY = e.clientY;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(updateBtnVisibilityBasedOnMouse);
}

    // 全局鼠标追踪
    document.addEventListener('mousemove', onMouseMove);

    // 当窗口滚动或尺寸改变时，若按钮可见则重新定位
    function repositionIfVisible() {
    if (toggleBtnContainer && !toggleBtnContainer.classList.contains('dp-none')) {
    showToggleBtnAtSidebarEdge();
}
}
    window.addEventListener('scroll', repositionIfVisible, true);
    window.addEventListener('resize', () => {
    repositionIfVisible();
    // 额外确保鼠标移出边缘后重新检测
    if (isBtnVisibleByHover) {
    showToggleBtnAtSidebarEdge();
}
});

    // 监听侧边栏class变化（折叠/展开时可能影响按钮位置）
    const observer = new MutationObserver((mutations) => {
    mutations.forEach((mut) => {
    if (mut.attributeName === 'class' && mut.target === sidebar) {
    // 侧边栏折叠状态改变时，如果按钮可见，需要重新定位
    if (toggleBtnContainer && !toggleBtnContainer.classList.contains('dp-none')) {
    showToggleBtnAtSidebarEdge();
}
}
});
});
    observer.observe(sidebar, { attributes: true });

    // 侧边栏鼠标离开时辅助隐藏（但优先依赖全局mousemove）
    sidebar.addEventListener('mouseleave', (e) => {
    setTimeout(() => {
    if (!toggleBtnContainer) return;
    const btnRect = toggleBtnContainer.getBoundingClientRect();
    const isOverBtn = (currentMouseX >= btnRect.left - 2 && currentMouseX <= btnRect.right + 2 &&
    currentMouseY >= btnRect.top - 2 && currentMouseY <= btnRect.bottom + 2);
    if (!isOverBtn && !isMouseNearSidebarRightEdge(currentMouseX, currentMouseY)) {
    hideToggleBtn();
    isBtnVisibleByHover = false;
}
}, 30);
});

    // 页面初始化时确保按钮隐藏，状态同步
    hideToggleBtn();

    // 清理资源（可选，保持良好习惯）
    window.addEventListener('beforeunload', () => {
    document.removeEventListener('mousemove', onMouseMove);
    if (rafId) cancelAnimationFrame(rafId);
    observer.disconnect();
});

    // 初始设置侧边栏为展开状态（确保无collapsed类）
    if (sidebar.classList.contains('collapsed')) {
    sidebar.classList.remove('collapsed');
}

    console.log('侧边栏功能已加载，切换按钮使用自定义图片Logo，鼠标悬浮右侧边缘显示，点击收起/展开，侧边栏Logo同步显隐');
})();
