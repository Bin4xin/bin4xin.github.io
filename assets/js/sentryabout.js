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
	topSpacing: 10,
});

$(document).scroll(function(){

/* class: article-index :page.toc
 * while window scroll to buttom then disappear; else display article's toc;
 */
	const nav = $(".article-index");
	if ( $(document).scrollTop() * 1.18 > $(document).height()) {
		/*addclass to remove sticky article index*/
		nav.addClass("navbar-hide");
		//console.log($(document).scrollTop(),"compare with:",$(document).height())
		//console.log("here is remove sticky article index!",$(document).scrollTop() * 1.18)
	}
	else{
		/*else to exchange.*/
		nav.removeClass("navbar-hide");
		//console.log($(document).scrollTop(),"compare with:",$(document).height())
		//console.log("show article index")
	}
});



/*
* ----------------------------------------------------------------------------------------------------------
* TODO: 按钮点击展开ul事件测试
* ----------------------------------------------------------------------------------------------------------
 */
// ----------------------------------------------------------------------------------------------------------
// 2.	按钮点击展开ul事件测试2



// ----------------------------------------------------------------------------------------------------------
// 1.	按钮点击展开ul事件测试1 多个按钮点击会同时展开关闭
// $(function(){
// 	$(".fold-button").click(function(){
// 		$(".fold-box").slideToggle("slow");
// 		$(".open").toggle();
// 		$(".close").toggle();
// 	});
// });
// ----------------------------------------------------------------------------------------------------------


// $(function () {
// 	$(".footer-row button").click(function(){
// 		var $this = $(this);
// 		if($this.hasClass("rotate-90")) {
// 			$this.removeClass("rotate-90").addClass("rotate-270").val("收起");
// 		} else {
// 			$this.removeClass("rotate-270").addClass("rotate-90").val("展开");
// 		}
// 	});
// });

// $(document).ready(function(){
//
// 	var preResult = $('.ul dn').height();
// 	var pre = $('.ul dn-ns').height();
// 	$(".dn-m").click(function() {
// 		if ($this.hasClass("dn dn-ns dn-m")) {
// 			$this.removeClass("dn dn-ns dn-m").addClass("db db-ns db-m").val("收起");
// 		} else {
// 			$this.removeClass("db db-ns db-m").addClass("dn dn-ns dn-m").val("展开");
// 		}
// 	});
// });

/*
* ----------------------------------------------------------------------------------------------------------
* ----------------------------------------------------------------------------------------------------------
 */

// $(function() {
// 	$(".footer-row button").click(function(){
// 		var $this = $(this);
// 		if($this.hasClass("rotate-90")) {
// 			$this.removeClass("rotate-90").addClass("rotate-270").val("收起");
// 		} else {
// 			$this.removeClass("rotate-270").addClass("rotate-90").val("展开");
// 		}
// 		$(".div ul").click(function(){
// 			// var $this = $(this);
// 			if($this.hasClass("dn dn-ns dn-m")) {
// 				$this.removeClass("dn dn-ns dn-m").addClass("db db-ns db-m").val("收起");
// 			} else {
// 				$this.removeClass("db db-ns db-m").addClass("dn dn-ns dn-m").val("展开");
// 			}
// 		});
// 	});
// });

// vim: ts=2 sts=2 sw=2 noexpandtab