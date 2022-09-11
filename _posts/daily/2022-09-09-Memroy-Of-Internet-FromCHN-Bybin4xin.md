---
category: daily
layout: daily
title: "互联网的记忆"
author: Bin4xin
poster: https://camo.githubusercontent.com/4db3e4069e59f51d03dd3e7fa5e89ab8fb95c9f4acda36cd5bfdf58d95269d92/68747470733a2f2f6f686d797a73682e73332e616d617a6f6e6177732e636f6d2f6f6d7a2d616e73692d6769746875622e706e67
---

zsh的显示优化配置，我们自定义了一些「经典语录」，加入了zsh显示区域，这里实现的主要难点在于：

我们很容易把「经典语录」加入到数组里面，不过我们希望，在每次打开`terminal`时，都有一些惊喜的感受 ;)

## 定义一个「经典语录」数组

我们先摘抄一些「经典语录」，把它放入数组，并根据自己的喜好「粉饰」：

```bash
declare -a expressions=(
'📣What are Y0u f4cking barking.📣'
'📣We are all F4CKING SMALL-TOWN SWOT (LOUDLY).📣'
'~~APPEARANCE IS THE FIRST PRODUCTIVE FORCE~~;'
)
```

就比如上面`'📣We are all F4CKING SMALL-TOWN SWOT (LOUDLY).📣'`，前后加上两个喇叭emoji的初衷是表示强调，并且后面加上了语气词（doge）。

## 颜值是第一生产力

到此时，我们已经有一个可用的数组了，那么下一步就是需要把它「悠亚」 地输出出来，怎么能够实现前者，又能「惊喜」呢？

很简单，我们定义了一个简单算法：

1. 计算出数组大小index[array]
2. 然后随机在[0 , index\[arrary\]]区间中输出对应的「经典语录」就好了

```bash
index=$((0 + $RANDOM % ${#expressions[@]}))
selected_expression=${expressions[index]}
```

第一步重点在于防止生成随机数导致区间过大，最终的输出为空；

此时，我们的大体轮廓就已经完成了，把它封装

## 你在狗叫什么

函数封装后，告诉zsh调用它就好，整个代码如下：

```bash
msg_header() {
declare -a expressions=(
'📣What are Y0u f4cking barking.📣'
'📣We are all F4CKING SMALL-TOWN SWOT (LOUDLY).📣'
'~~APPEARANCE IS THE FIRST PRODUCTIVE FORCE~~;'
)
index=$((0 + $RANDOM % ${#expressions[@]}))
selected_expression=${expressions[index]}
echo $selected_expression
}

PROMPT="%(?:%{$fg_bold[green]%}[$(msg_header)] :%{$fg_bold[red]%}[Ooooooops @@S0mething WROOONG@@] )"
PROMPT+='%{$fg[cyan]%}[🤑🎧🚩:<%c>]%{$reset_color%}$(git_prompt_info) %{$fg_bold[white]%}$%{$fg_bold[green]%}$%{$fg_bold[yellow]%}$ '

ZSH_THEME_GIT_PROMPT_PREFIX="%{$fg_bold[yellow]%}[%{$fg_bold[blue]%}<git:%{$fg[red]%}"
ZSH_THEME_GIT_PROMPT_SUFFIX="%{$reset_color%}%{$fg_bold[yellow]%}]"
ZSH_THEME_GIT_PROMPT_DIRTY="%{$fg[blue]%}>%{$fg[yellow]%}%{$fg_bold[yellow]%}]"
ZSH_THEME_GIT_PROMPT_CLEAN="%{$fg[blue]%}>"
```

以上。