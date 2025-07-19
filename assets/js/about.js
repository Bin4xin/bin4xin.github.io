document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('toggleButton');
    const sidebar = document.getElementById('sidebar1');
    const ulsElements = document.querySelectorAll('#help-nav > details');
    const logoElement = document.getElementById('logo');
    const figmaElements = document.querySelectorAll('.new_figma_des'); // 选中所有 new_figma_des 元素

    if (!button || !sidebar) return; // 确保必要的元素存在，避免错误

    button.addEventListener('click', () => {
        const isCollapsed = sidebar.classList.toggle('collapsed');
        button.setAttribute('aria-expanded', !isCollapsed);

        // 切换 ul 元素的显示状态
        [...ulsElements].forEach(element => {
            if (element) element.style.display = isCollapsed ? 'none' : '';
        });

        // 切换 .new_figma_des 的 padding
        figmaElements.forEach(element => {
            element.style.padding = isCollapsed ? '0px' : '32px';
        });
    });
});
