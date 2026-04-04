/**
 * copy document FUNC
 * @param pre
 * - @preCopy func() 代码引用申明/code reference declaration:
 * - {@link -}
 **/
$(function(){
    let preList = $("pre");
    for (let pre of preList) {
        let btn = $("<div class=\"hidden-print group flex right-0 top-0 btn-pre-copy-position\" onclick='preCopy(this)'><span class=\"group-hover-flex m-2 p-2 btn btn-pre-copy color-border-accent-emphasis\" style=\"display: inherit;position: relative;\"><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" class=\"d-flex\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2\" class=\"media-object copy-code-icon-path-1\"></path><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M5 13l4 4L19 7\" class=\"copy-code-icon-path-2 hidden\"></path></svg></span></div>");
        btn.prependTo(pre);
    }
    let all_width = $(document.body).outerWidth(true);
    if (all_width < 800) {
        var classVal = document.getElementById("post-content").getAttribute("class");
        classVal = classVal.replace("d-flex","");
        document.getElementById("post-content").setAttribute("class", classVal );
    }
});
function preCopy(obj) {
    let btn = $(obj);
    let pre = btn.parent();
    let temp = $("<textarea></textarea>");
    btn.text("");
    temp.text(pre.text());
    temp.appendTo(pre);
    temp.select();
    // 替代废弃的execCommand，兼容现代浏览器
    navigator.clipboard.writeText(temp.text()).then(() => {
    }).catch(err => {
        document.execCommand("Copy");
    });
    temp.remove();
    btn = $("<div class=\"hidden-print group flex right-0 top-0 btn-pre-copy-position\"><span class=\"group-hover-flex m-2 p-2 btn btn-pre-copy color-success-icon\" style=\"display: inherit;position: relative;\" aria-label=\"滚动到顶部\" ><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" class=\"d-flex\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2\" class=\"media-object copy-code-icon-path-1 hidden\"></path><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M5 13l4 4L19 7\" class=\"color-success-icon copy-code-icon-path-2 \"></path></svg></span></div>")
    btn.prependTo(pre);
    setTimeout(() =>{
            btn.remove();
        }
        ,1500);
    setTimeout(()=> {
        let btn = $("<div class=\"hidden-print group flex right-0 top-0 btn-pre-copy-position\" onclick='preCopy(this)'><span class=\"group-hover-flex m-2 p-2 btn btn-pre-copy color-border-accent-emphasis\" style=\"display: inherit;position: relative;\"><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" class=\"d-flex\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2\" class=\"media-object copy-code-icon-path-1\"></path><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M5 13l4 4L19 7\" class=\"copy-code-icon-path-2 hidden\"></path></svg></span></div>");
        btn.prependTo(pre);
    },1500);
}
/**
 * print document FUNC (修复边界溢出+补全文字)
 * @param printpage
 * - 强化打印CSS，彻底解决右侧溢出，补全缺失文字
 **/
function printpage() {
    let oldStr = window.document.body.innerHTML;
    let start = "<startprint2pdfs>";
    let end = "</startprint2pdfs>";
    let matchString = /(<\/?a.*?>)/gi;
    let replaceStr = oldStr.replace(matchString, '');
    let newStr = replaceStr.substr(replaceStr.indexOf(start) + 17);
    newStr = newStr.substring(0, newStr.indexOf(end));

    // 修复溢出+补全文字核心CSS：强制换行、取消截断、全屏适配、定位修复
    let printStyle = '<style media="print">' +
        '/* 全局基础适配 */' +
        'html, body, #research-content, .col-sm-bb { ' +
        '  width: 100% !important; ' +
        '  margin: 0 !important; ' +
        '  padding: 0 5mm !important; ' +
        '  box-sizing: border-box !important; ' +
        '  overflow: visible !important; ' +
        '}' +
        '/* 修复代码块/文本溢出，强制换行 */' +
        'pre, code, .code-block, .highlight, p, div, span { ' +
        '  white-space: pre-wrap !important; ' +
        '  word-wrap: break-word !important; ' +
        '  word-break: break-all !important; ' +
        '  overflow-wrap: break-word !important; ' +
        '  max-width: 100% !important; ' +
        '  width: 100% !important; ' +
        '  text-overflow: unset !important; ' + // 取消文字截断，补全“方案”
        '  overflow: visible !important; ' +
        '}' +
        '/* 媒体元素适配 */' +
        'img, table { ' +
        '  max-width: 100% !important; ' +
        '  height: auto !important; ' +
        '  page-break-inside: avoid !important; ' +
        '}' +
        '/* 表格修复 */' +
        'table { table-layout: fixed !important; width: 100% !important; }' +
        'td, th { word-break: break-word !important; padding: 2mm !important; }' +
        '/* 修复定位导致的偏移/溢出 */' +
        '* { position: static !important; float: none !important; }' +
        '/* 打印分页设置 */' +
        '@page { size: A4; margin: 1.5cm; }' +
        '</style>';

    window.document.body.innerHTML = printStyle + newStr;
    window.print();
    window.document.body.innerHTML = oldStr;
}
/**
 * Load Pages Ajax FUNC
 * @param research-content
 * - @printpage func() 代码引用申明/code reference declaration:
 * - {@link https://blog.csdn.net/qq_40910746/article/details/86597083}
 **/
function loadPage(url) {
    $.ajax({
        type: "GET",
        url: url,
        async: true,
        dataType: "html",
        contentType: 'application/x-www-form-urlencoded; charset=utf-8',
        success: function (html) {
            $('#research-content').html(html);
        }
    });
}
/**
 * get scroll FUNC
 * - @param <divs> -> document.body.APIs
 * - @printpage scroll() 代码引用申明/code reference declaration:
 * - { @link replace: https://blog.csdn.net/u010393758/article/details/52888974 }
 * - { @link getScroll API: https://www.jianshu.com/p/cd5ba22a416d }
 **/
function scroll() {
    if(window.pageYOffset != null)
    {
        return {
            left: window.pageXOffset,
            top: window.pageYOffset
        }
    }
    else if(document.compatMode == "CSS1Compat")
    {
        return {
            left: document.documentElement.scrollLeft,
            top: document.documentElement.scrollTop
        }
    }
    return {
        left: document.body.scrollLeft,
        top: document.body.scrollTop
    }
}
window.onscroll = function() {
    if (scroll().top > 280) {
        $("divs").removeClass("opacity-0");
        $("divs").addClass("opacity-100");
    }
    else {
        $("divs").removeClass("opacity-100");
        $("divs").addClass("opacity-0");
    }
}