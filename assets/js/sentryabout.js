$(document).ready(() => {

	$("select.release-select").on('change', update_apt_file);
	$("select.release-select").each((i, e) => {
		$(e).trigger('change');
	});

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
// vim: ts=2 sts=2 sw=2 noexpandtab