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

function keyThing(obj) {
    var index;
    $("#ul-results-container>li").on("click", function() {
        $(this).siblings().find("a").css(obj.cssKey, "transparent");
        $(this).find("a").css(obj.cssKey, obj.cssValue);
        index = $(this).index();
    })
    var searchInput = document.getElementById('search-input');
    //var results_container = document.getElementById('results-container');
    document.addEventListener('keyup', function(e) {
        // console.log(e.keyCode);
        if (e.keyCode == 191) {
            searchInput.focus();
        }
    });
    /*
     *[x] step 1. type esc or
         *  // Char Code: 13  Enter,
         *  // 37  👈,
         *  // 38  ⬆️,
         *  // 39  👉,
         *  // 40  ⬇
         * lose foucus.️
     * step 2. press enter to click.
     * [x] step 3. prepare more json data FOR [simple jekyll search].
     * step 4. while in dark mode, @para obj.cssValue unwell. Any good way prefer to
     * `prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches`?
     * that's all.
     */
    $(document).on("keydown", function(event) {
        var e = event || window.event || arguments.callee.caller.arguments[0];
        //console.log(e.keyCode);
        //获取键对应的keyCode
        if (index != undefined) {
            if (e.keyCode == 40) {
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
            }
            //else if (e.keyCode == 13) {
            //let results = document.getElementsByClassName("results-focus");
            // $(".results-focus").click(function(){console.log("click.")});
            //}
            // obj.callback(index);
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
//obj.callback = function(n) {
//此处可以输出对应的索引值。
//   console.log('index'+n);
//}
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