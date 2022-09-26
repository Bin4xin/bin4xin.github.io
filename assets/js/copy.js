
$(function(){
    //给每一串代码元素增加复制代码节点
    // $("table").addClass("table");
    let preList = $("pre");
    for (let pre of preList) {
        //给每个代码块增加上“复制代码”按钮preCopy(this)/
        let btn = $("<div class=\"hidden-print group flex right-0 top-0\" onclick='preCopy(this)' style=\"display:block;animation: fade-in 200ms both;position: absolute !important;\"><span class=\"group-hover-flex m-2 p-2 btn btn-pre-copy color-border-accent-emphasis\" style=\"display: inherit;position: relative;\"><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" class=\"d-flex\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2\" class=\"media-object copy-code-icon-path-1\"></path><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M5 13l4 4L19 7\" class=\"copy-code-icon-path-2 hidden\"></path></svg></span></div>");
        btn.prependTo(pre);
    }
});

function preCopy(obj) {
    //执行复制
    let btn = $(obj);
    let pre = btn.parent();
    //为了实现复制功能。新增一个临时的textarea节点。使用他来复制内容
    let temp = $("<textarea></textarea>");
    //避免复制内容时把按钮文字也复制进去。先临时置空
    btn.text("");
    temp.text(pre.text());
    temp.appendTo(pre);
    temp.select();
    document.execCommand("Copy");
    temp.remove();
    //复制成功[tooltipped tooltipped-n tooltipped-no-delay]
    btn = $("<div class=\"hidden-print group flex right-0 top-0\" style=\"display:block;animation: fade-in 200ms both;position: absolute !important;\"><span class=\"group-hover-flex m-2 p-2 btn btn-pre-copy color-success-icon\" style=\"display: inherit;position: relative;\" aria-label=\"滚动到顶部\" ><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" class=\"d-flex\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2\" class=\"media-object copy-code-icon-path-1 hidden\"></path><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M5 13l4 4L19 7\" class=\"color-success-icon copy-code-icon-path-2 \"></path></svg></span></div>")
    // btn = $("<div class=\"has-feedback group\" onclick='preCopy(this)'><a class=\"group-hover-flex p-2 btn btn-pre-copy mr-1 color-success-icon \"><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" class=\"d-flex\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2\" class=\"media-object copy-code-icon-path-1 hidden\"></path><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M5 13l4 4L19 7\" class=\"color-success-icon copy-code-icon-path-2 \"></path></svg></a></div>");
    btn.prependTo(pre);
    //一定时间后把按钮名改回来，先移除上面的成功按钮
    setTimeout(() =>{
            btn.remove();
        }
    ,1500);
    //再返回到最初的按钮
    setTimeout(()=> {
        // btn.text("复制代码");
        let btn = $("<div class=\"hidden-print group flex right-0 top-0\" onclick='preCopy(this)' style=\"display:block;animation: fade-in 200ms both;position: absolute !important;\"><span class=\"group-hover-flex m-2 p-2 btn btn-pre-copy color-border-accent-emphasis\" style=\"display: inherit;position: relative;\"><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" class=\"d-flex\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2\" class=\"media-object copy-code-icon-path-1\"></path><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M5 13l4 4L19 7\" class=\"copy-code-icon-path-2 hidden\"></path></svg></span></div>");
        btn.prependTo(pre);
    },1500);
}
/**
 * print document FUNC
 * @param printpage
 * - @printpage func() 代码引用申明/code reference declaration:
 * - {@link https://blog.csdn.net/qq_38128179/article/details/103344021}
 **/
function printpage() {
    let oldStr = window.document.body.innerHTML;
    let start = "<startprint2pdfs>";
    let end = "</startprint2pdfs>";
    let matchString = /(<\/?a.*?>)/gi;
    let replaceStr = oldStr.replace(matchString, '')
    let newStr = replaceStr.substr(oldStr.indexOf(start) + 17);
    // let newStr = oldStr.substr(oldStr.indexOf(start) + 17);
    newStr = newStr.substring(0, newStr.indexOf(end));
    // console.log(newStr);
    window.document.body.innerHTML = newStr;
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
            //$('#research-content').load(url);
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
    if(window.pageYOffset != null) // ie9+ 和其他浏览器
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
    /**
     * console.log("top： "+scroll().top);
     * console.log("left： "+scroll().left);
    **/
    let all_width = $(document.body).outerWidth(true);
    // console.log(all_width);
    if (all_width < 800) {
        var classVal = document.getElementById("post-content").getAttribute("class");
        classVal = classVal.replace("d-flex","");
        document.getElementById("post-content").setAttribute("class", classVal );
    }
    if (scroll().top > 280) {
        $("divs").removeClass("opacity-0");
        $("divs").addClass("opacity-100");
    }
    else {
        $("divs").removeClass("opacity-100");
        $("divs").addClass("opacity-0");
    }
}
/**
 * function: click to close a page/button etc...
 * - @param
 *  - click hidden-2-click-{{note_node|replace: ' ', '-'|replace: '.', '-'}}
 *  - display:none JQuery: $("diva-{{note_node |replace: ' ', '-'|replace: '.', '-' }}").hide();
 * By bin4xin
 * - { @link More see: `/assets/js/oh-sentry.js` }
 **/