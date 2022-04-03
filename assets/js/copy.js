$(function(){
    //给每一串代码元素增加复制代码节点
    let preList = $("pre");
    for (let pre of preList) {
        //给每个代码块增加上“复制代码”按钮
        let btn = $("<span class=\"btn-pre-copy\" onclick='preCopy(this)'><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"22\" height=\"22\" viewBox=\"0 0 512 512\"><rect x=\"128\" y=\"128\" width=\"336\" height=\"336\" rx=\"57\" ry=\"57\" style=\"fill:none;stroke:currentColor;stroke-linejoin:round;stroke-width:32px\"/><path d=\"M383.5,128l.5-24a56.16,56.16,0,0,0-56-56H112a64.19,64.19,0,0,0-64,64V328a56.16,56.16,0,0,0,56,56h24\" style=\"fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px\"/></svg></span><hr>");
        btn.prependTo(pre);
    }
});

/**
 * 执行复制代码操作
 * @param obj
 */
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
    //复制成功
    btn = $("<span class=\"btn-pre-copy\" onclick='preCopy(this)'><ion-icon><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"22\" height=\"22\" viewBox=\"0 0 512 512\"><polyline points=\"352 176 217.6 336 160 272\" style=\"fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px\"/><rect x=\"64\" y=\"64\" width=\"384\" height=\"384\" rx=\"48\" ry=\"48\" style=\"fill:none;stroke:currentColor;stroke-linejoin:round;stroke-width:32px\"/></svg></ion-icon>");
    btn.prependTo(pre);
    //一定时间后把按钮名改回来，先移除上面的成功按钮
    setTimeout(() =>{
            btn.remove();
        }
    ,1500);
    //再返回到最初的按钮
    setTimeout(()=> {
        // btn.text("复制代码");
        let btn = $("<span class=\"btn-pre-copy\" onclick='preCopy(this)'><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"22\" height=\"22\" viewBox=\"0 0 512 512\"><rect x=\"128\" y=\"128\" width=\"336\" height=\"336\" rx=\"57\" ry=\"57\" style=\"fill:none;stroke:currentColor;stroke-linejoin:round;stroke-width:32px\"/><path d=\"M383.5,128l.5-24a56.16,56.16,0,0,0-56-56H112a64.19,64.19,0,0,0-64,64V328a56.16,56.16,0,0,0,56,56h24\" style=\"fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:32px\"/></svg></span>");
        btn.prependTo(pre);
    },1500);
}