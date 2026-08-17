
    
    $(document).ready(function(){
        $("#hidden-2-click-互联网的记忆").click(function(){
            $("diva-互联网的记忆").hide();
        });
    });

    
    $(document).ready(function(){
        $("#hidden-2-click-Feed-xml").click(function(){
            $("diva-Feed-xml").hide();
        });
    });

    
    $(document).ready(function(){
        $("#hidden-2-click-Github-Action").click(function(){
            $("diva-Github-Action").hide();
        });
    });


 function keyThing(obj) {
    var index = -1;
    var input = document.getElementById('search-input');
    var dd = document.getElementById('s-dropdown');
    if (!dd || !input) return;

    var rc = document.getElementById('results-container');

    function getItems() {
        return rc ? rc.querySelectorAll('.s-result-item') : [];
    }

    function clear() {
        var items = getItems();
        for (var i = 0; i < items.length; i++)
            items[i].classList.remove('s-result-active');
    }

    function setActive(i) {
        var items = getItems();
        if (items.length === 0) return;
        clear();
        index = i;
        items[index].classList.add('s-result-active');
        items[index].scrollIntoView({ block: 'nearest' });
    }

    /* ── 点击结果 ── */
    $(dd).on('click', '.s-result-item', function() {
        var items = getItems();
        clear();
        index = Array.prototype.indexOf.call(items, this);
        this.classList.add('s-result-active');
    });

    /* ── 聚焦展开 ── */
    $(input).on('focus', function() {
        if (rc && rc.children.length > 0)
            dd.classList.add('open');
    });

    /* ── 外部点击收起 ── */
    $(document).on('click', function(e) {
        if (!dd.contains(e.target) && e.target !== input) {
            dd.classList.remove('open');
            index = -1;
            clear();
        }
    });

    /* ── 清除按钮 ── */
    $(dd).closest('.search-scope').find('.s-clear').on('click', function() {
        input.value = '';
        dd.classList.remove('open');
        index = -1;
        clear();
        input.focus();
    });

    /* ── 键盘 ── */
    $(document).on('keydown', function(e) {
        var items = getItems();
        var len = items.length;

        /* [/] 聚焦搜索框（不在搜索框内时） */
        if (e.keyCode === 191 && document.activeElement !== input) {
            console.log("聚焦搜索框（不在搜索框内时）")
            e.preventDefault();
            input.focus();
            return;
        }

        /* 以下仅在搜索框聚焦时响应 */
        if (document.activeElement !== input) return;

        /* ↓ */
        if (e.keyCode === 40) {
            console.log("下");
            e.preventDefault();
            if (len === 0) return;
            if (!dd.classList.contains('open')) dd.classList.add('open');
            setActive(index + 1 >= len ? 0 : index + 1);
            return;
        }

        /* ↑ */
        if (e.keyCode === 38) {
            console.log("上");
            e.preventDefault();
            if (len === 0) return;
            setActive(index - 1 < 0 ? len - 1 : index - 1);
            return;
        }

        /* Enter */
        if (e.keyCode === 13 && index >= 0 && index < len) {
            e.preventDefault();
            var link = items[index].querySelector('.s-result-link');
            if (link && link.href) window.location.href = link.href;
            return;
        }

        /* ESC */
        if (e.keyCode === 27) {
            dd.classList.remove('open');
            index = -1;
            clear();
            return;
        }
    });

    /* ── 输入重置 ── */
    $(input).on('input', function() {
        index = -1;
        clear();
    });

    /* ── 结果变化 ── */
    if (rc) {
        new MutationObserver(function() {
            index = -1;
            clear();
            if (rc.children.length > 0 && input === document.activeElement)
                dd.classList.add('open');
            else if (rc.children.length === 0)
                dd.classList.remove('open');
        }).observe(rc, { childList: true });
    }
}

/* ── 初始化 ── */
var prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
keyThing({
    cssKey: 'backgroundColor',
    cssValue: prefersDarkMode ? '#161b22' : '#f6f8fa'
});