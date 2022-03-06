$(document).ready(() => {

    $('#help-select').on('change', (ev) => {
        let help_url = $(ev.target).find("option:selected").data('help-url');
        window.location = `${window.location.protocol}//${window.location.host}${help_url}`;
    });

});

$(function () {
    $("img").lazyload({
        effect: "fadeIn"
    });
    $(".lazy").lazyload({
        effect: "fadeIn"
    });
});
$(".article-index").sticky({
    topSpacing: 88,
});

/*
* javascript @func (".footer-col-lg-2 button") click(function())
* 通过点击改变角度 实现点击展开闭合的动画效果，
*/

$(function() {
    $(".footer-col-lg-2 button").click(function(){
        var $this = $(this);
        const nav = $(".article-index");
        if($this.hasClass("rotate-90")) {
            $this.removeClass("rotate-90").addClass("rotate-270").val("收起");
            nav.removeClass("db db-ns db-m").addClass("dn dn-ns dn-m").val("展开");
        } else {
            $this.removeClass("rotate-270").addClass("rotate-90").val("展开");
            nav.removeClass("dn dn-ns dn-m").addClass("db db-ns db-m").val("收起");
        }
    });
});