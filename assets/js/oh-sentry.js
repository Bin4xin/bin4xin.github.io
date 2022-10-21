---
---
{% for notes in site.data.notes %}
    {% assign note_node = notes.note_node %}
    $(document).ready(function(){
        $("#hidden-2-click-{{note_node|replace: ' ', '-'|replace: '.', '-'}}").click(function(){
            $("diva-{{note_node |replace: ' ', '-'|replace: '.', '-' }}").hide();
        });
    });
{% endfor %}
/*
 *[x] step 1. type esc or
     *  // Char Code: 13  Enter,
     *  // 37  👈,
     *  // 38  ⬆️,
     *  // 39  👉,
     *  // 40  ⬇
     * lose foucus.️
 * [x] step 2. press enter to click.
 * [x] step 3. prepare more json data FOR [simple jekyll search].
 * step 4. while in dark mode, @para obj.cssValue unwell. Any good way prefer to
 * `prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches`?
 * that's all.
 */
function keyThing(obj) {
    var index = 0;
    $("#ul-results-container>li").on("click", function() {
        $(this).siblings().find("a").css(obj.cssKey, "transparent");
        $(this).find("a").css(obj.cssKey, obj.cssValue);
        index = $(this).index();
    })
    $(document).on("keydown", function(event) {
        var e = event || window.event || arguments.callee.caller.arguments[0];
        if (index != undefined) {
            var searchInput = document.getElementById('search-input');
                if (e.keyCode == 191) {
                    searchInput.focus();
                } else if (e.keyCode == 40) {
                    if (index > $("#ul-results-container>li").length - 1) {
                        return false;
                    } else {
                        clear();
                        index = index + 1;
                    }
                    $("#ul-results-container>li").eq(index - 1).find("a").css(obj.cssKey, obj.cssValue);
                } else if (e.keyCode == 38) {
                    if (index < 2) {
                        return false;
                    } else {
                        clear();
                        index = index - 1;
                    }
                    $("#ul-results-container>li").eq(index - 1).find("a").css(obj.cssKey, obj.cssValue);
                } else if (e.keyCode == 13) {
                    var b = document.getElementById("results-container");       /*通过父标签id获取ul标签内容*/
                    var a = b.getElementsByTagName("li");      /* 通过子标签获取li标签里的内容*/
                    var x = a[index-1].getElementsByTagName("a");    /*通过获取数组的第一个元素也就是第一个li的a 标签*/
                    for(var i = 0; i<x.length; i++)
                    {location.href = x[i].href;}
                }
            } else {
            if (e.keyCode) {
                index = 1;
                $("#ul-results-container>li").eq(0).find("a").css(obj.cssKey, obj.cssValue);
            }
        }
    })
    function clear() {
        for (var i = 0; i < $("#ul-results-container>li").length; i++) {
            $("#ul-results-container>li").eq(i).find("a").css(obj.cssKey, "");
        }
    }
}
var prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
var obj = {};
obj.row = 10;
obj.cssKey = "backgroundColor";
if (prefersDarkMode){
    obj.cssValue = "#111";
} else {
    obj.cssValue = "#eeeeee";
}
keyThing(obj);
// ==========================
// ======= search button
// ======= css zoom design.
// ==========================
// const input = document.querySelector(".finder__input");
// const finder = document.querySelector(".finder");
// const form = document.querySelector("form");
//
// input.addEventListener("focus", () => {
//     finder.classList.add("active");
// });
//
// input.addEventListener("blur", () => {
//     if (input.value.length === 0) {
//         finder.classList.remove("active");
//     }
// });