
    
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



 function getQueryVariable(variable) {
    const query = window.location.search.substring(1);
    const vars = query.split("&");
    for (let i = 0; i < vars.length; i++) {
        const pair = vars[i].split("=");
        if (pair[0] === variable) return pair[1];
    }
    return "";
}

const mykeyword = decodeURI(getQueryVariable("keyword"));
const sbox = document.getElementById("search-input");
if (mykeyword && mykeyword.toString().length > 1) {
    sbox.value = mykeyword;
}
function base64Decode(str) {
    if (!str) return str;
    try {
        const decoded = atob(str);
        return decodeURIComponent(escape(decoded));
    } catch (e) {
        console.warn("Base64解码失败，返回原字符串:", str.substring(0, 50) + "...", e);
        return str;
    }
}

$.getJSON("search.json", function (json) {
    console.log("加载 search.json 成功，条目数:", json.length);
    const sjs = SimpleJekyllSearch({
        searchInput: sbox,
        resultsContainer: document.getElementById("results-container"),
        json: json,
        searchResultTemplate:
            '\
<li class="s-result-item" role="option"><a href="{url}" class="s-result-link"><span class="s-result-icon" aria-hidden="true"><svg viewBox="0 0 16 16" width="14" height="14"><path fill="currentColor" d="M10.68 11.74a6 6 0 0 1-7.922-8.982 6 6 0 0 1 8.982 7.922l3.04 3.04a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215ZM11.5 7a4.499 4.499 0 1 0-8.997 0A4.499 4.499 0 0 0 11.5 7Z"/></svg></span><span class="s-result-body"><span class="s-result-title">{title}</span><span class="s-result-url">{url}</span></span><span class="s-result-arrow" aria-hidden="true"><svg viewBox="0 0 16 16" width="14" height="14"><path fill="currentColor" fill-rule="evenodd" d="M8.22 2.97a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.751.751 0 01-1.042-.018.751.751 0 01-.018-1.042l2.97-2.97H3.75a.75.75 0 010-1.5h7.44L8.22 4.03a.75.75 0 010-1.06z"/></svg></span></a></li>\
',
        noResultsText:
            '\
<li class="s-result-empty" role="presentation"><div class="s-empty-icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="32" height="32"><path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg></div><span class="s-empty-text">未找到相关结果</span><span class="s-empty-hint">换个关键词试试？</span></li>\
',
        limit: 8,
        templateMiddleware: function (prop, value, template) {
            if (prop === "content" && value && typeof value === "string") {
                console.log(value.substring(0, 50));
                const decoded = base64Decode(value);
                if (decoded !== value) return decoded;
            }
            return undefined;
        },
    });
    if (mykeyword) sjs.search(mykeyword);
    }).fail(function (jqXHR, textStatus, errorThrown) {
    console.error("Load search.json failed:", textStatus, errorThrown);
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