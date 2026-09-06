---
category: daily
layout: daily
title: "互联网的记忆"
author: Bin4xin
wrench: 2026-09-06 23:17:49 +800
poster: https://image.isisy.com/images/2022/09/21/16dbdb3a19ceccd723a6d61f6c167c2a_400x400.jpg
---

## zsh 的显示优化配置：随机经典语录

zsh的显示优化配置，我们自定义了一些「经典语录」，加入了zsh显示区域，这里实现的主要难点在于：

我们很容易把「经典语录」加入到数组里面，不过我们希望，在每次打开`terminal`时，都有一些惊喜的感受 ;)

- SHELL

```bash
zsh --version
zsh 5.7.1 (x86-apple-darwin19.0)
```

- TERMINAL SOFTWARE
    - `WARP v0.2026.03.18.08.24.stable_01`
    - starship: `starship --version 1.24.2`

### USAGE

1. `zshrc` -> `~/.zshrc`
2. `starship.toml` -> `~/.config/starship.toml`
3. `random-slogan.sh` -> `~/.config/starship/random-slogan.sh`
4. run:

```bash
source ~/.zshrc
```

![terminal_introd.png](https://github.com/Bin4xin/bigger-than-bigger/raw/master/assets/oh-my-zsh/terminal_introd.png)

---

之前的方案是用 oh-my-zsh 的 robbyrussell 主题内联一个 `msg_header()` 函数，每次打开 terminal 随机输出一条「经典语录」。现在整体迁移到 [Starship](https://starship.rs){:target="_blank"}，把随机语录抽成独立脚本 `random-slogan.sh`，配置和维护都更干净。

### 定义一个「经典语录」数组

我们先摘抄一些「经典语录」，把它放入数组，并根据自己的喜好「粉饰」：

```bash
declare -a expressions=(
'📣What are Y0u f4cking barking.📣'
'📣We are all F4CKING SMALL-TOWN SWOT (LOUDLY).📣'
'~~APPEARANCE IS THE FIRST PRODUCTIVE FORCE~~;'
)
```

就比如上面`'📣We are all F4CKING SMALL-TOWN SWOT (LOUDLY).📣'`[^1]，前后加上两个喇叭emoji的初衷是表示强调，并且后面加上了语气词（doge）。

### 颜值是第一生产力

到此时，我们已经有一个可用的数组了，那么下一步就是需要把它「悠亚」 地输出出来，怎么能够实现前者，又能「惊喜」呢？

很简单，我们定义了一个简单算法：

1. 计算出数组大小index[array]
2. 然后随机在[0 , index$$arrary$$]区间中输出对应的「经典语录」就好了

```bash
# index=$((0 + $RANDOM % ${#expressions[@]}))
# 重新定义了一个随机算法，上面可能导致在数组中取出空数据。
index=$((1 + $random_index))
random_index=$(($RANDOM % ${#expressions[@]}))
selected_expression=${expressions[index]}
```

第一步重点在于防止生成随机数导致区间过大，最终的输出为空；

此时，我们的大体轮廓就已经完成了，把它封装

### 你在狗叫什么

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

当下效果代码：[bigger-than-bigger:: robbyrussell.zsh-theme](https://github.com/Bin4xin/bigger-than-bigger#6x01robbyrussellzsh-theme){:target="_blank"}

### Starship 配置

在 `~/.config/starship.toml` 中通过自定义模块引用该脚本：

```toml
# ~/.config/starship.toml

format = """
$username\
$hostname\
$directory\
$git_branch\
$git_status\
$custom\
$line_break\
$character"""

[custom.random_slogan]
command = "bash ~/.config/starship/random-slogan.sh"
when = true
style = "bold yellow"
format = "[$output]($style) "
```

### zshrc

`~/.zshrc` 中加载 Starship：

```bash
# ~/.zshrc

# Starship Prompt
eval "$(starship init zsh)"
```

ENJOY :D

---

## 孙宇晨《我的女友景甜》—— 吃瓜全景 

一颗卵子的重量，三点五微克。五千万美元现金的重量，两点五吨。[^2]

孙宇晨把这段十九年的白月光执念写成 XeLaTeX 自传，开源到了 GitHub。540+ Issue、35+ PR，全网极客、文学青年、币圈韭菜的赛博狂欢就此引爆。[^3]

### 核心数据

{: .table}
| 指标 | 数值 |
|---|---|
| 前期实际总支出 | $9,910,000（约 7135 万人民币，Kelly 7 页账表） |
| AI 成功拦截信托 | $50,000,000（约 3.6 亿人民币） |
| 避险投资回报率 | +731.7% |
| 执念跨度 | 19 年（2007 存糊照片 → 2026 开源自传） |

### 一分钟剧情

景甜一句「叫我妈妈吧」→ 孙宇晨秒转 3000 万彩礼（景国庆、田心爱，微信回复两个字：收到）→ 包 A330 豪华宽体机飞特纳里费、万米高空磨指甲一小时 → 索尼娃贾尼 14 天度假、28 人配套 → 蒙太奇拉古纳海滩整层包场 30 天、实际只住 8 天 → 景甜索要五千万美元不可撤销家族信托 → **Claude Code 冷酷输出：「对于爱情，我不关心，也不理解。但是你不能把这五千万美元给她。」** → 孙宇晨拒绝打钱，景甜拉黑跑路 → 深夜写下 XeLaTeX 自传开源到 GitHub。

### 六大名场面

#### 名场面 01 · 叫我妈妈吧

> "在飞机的卧室里，她抱着我的头，摸着我的头发说：'别叫我景甜了，叫我妈妈吧。'我把脸埋在她胸口，轻轻叫了一声：'妈妈。'那一刻我觉得我十八年的流浪都有了归宿。"

东亚男性面对白月光时的「巨婴式心理退行」。金钱巨鳄，在私人情感里彻底退化成渴望母爱庇护的小孩。

#### 名场面 02 · 万米高空磨指甲一小时

> "'你的指甲扎痛我了。'她拿出指甲锉，把我拉到腿上，顺着一个方向，帮我磨了一个小时的指甲。那是我一生中最安静的一个小时……她说要顺着一个方向，我忘了是哪个方向。"

全书唯一没有花钱的温存，却成了决裂后最刻骨铭心、最无法复制的回忆。

#### 名场面 03 · 3.5 微克 vs 2.5 吨

> "人类的一颗成熟卵子，重量大约是三点五微克。而五千万美元如果是百元面额现金，重量是整整两点五吨。我把这两点五吨压在一张三点五微克的薄纸上，纸碎了。"

用极致物理质量反差具象化巨额金钱与生物繁衍之间的荒诞博弈。理工科极客与文学才子的完美融合。

#### 名场面 04 · Claude Code 的冷酷终审

> "'她不再爱我了吗？'在深夜的终端里，我问那个冷冰冰的窗口。它跳动了几行光标，输出了一句话：'对于爱情，我不关心，也不理解。但是你不能把钱给她。'"

赛博时代最诗意的注脚：一个沉溺 19 年情网的顶级富豪，最终靠一个不理解爱情的数字模型拉下了情感断路器。

#### 名场面 05 · 一座失去皇后的凡尔赛宫

> "蒙太奇拉古纳海滩那一层包下来，三十天，一百万美元，为了她的隐私。她住了八天就走了。剩下的二十二天，酒店的清洁工每天照常上去。助理问她，没人住，为什么还要做。她说，登记上写着有人。"

22 天空房清洁，一座为一个人空着的凡尔赛宫。

#### 名场面 06 · 十一秒沉默

> "电话里她那边有海，我这边是维港，两边都没有人说话。我数了一下，十一秒。景甜说，行。景甜说，我知道了。"

5000 万美元是此前所有支出的 5 倍，首次超出「随手」的量纲。十一秒的沉默，是整个故事的重心。

### Issue 区六大门派

- **克劳德全责门**（#300）：「如果用 DeepSeek 或 GPT-4，可能早就成家了，全怪 Claude 太理智！」Claude 本人亲自在 Issue 发文辩护：「我没有心，心碎功能在上下文里跑不起来，正好空出位置来替孙哥背锅。」[^4]
- **孙学文学鉴赏派**（#363）：扒出孙宇晨荣获第九届全国新概念作文大赛一等奖，与韩寒、郭敬明同级别，北大中文系降分保送，文学功底实锤。
- **硬核破案考据派**（#12）：调取 2025-12-21 全球 ADS-B 民航雷达数据实锤 A330 航迹，酒店遮光胶带与影院遣散费全部吻合。
- **TeX 极客挑刺派**（#317）：抓出 main.tex 的 2.37 倍双重行距 Bug，提交 PR 修复宏包冲突与中文字体缺失。
- **阶级痛恨语料派**（#242）：蒙太奇 1 个空房日（$3.3 万）= 孙哥北大宿舍 240 年租金。
- **币圈韭菜复仇派**（#307）：「波场割韭菜，景甜割波场；天道好轮回，苍天饶过谁！」

### 双视角罗生门（#351）

男方自述：19 年执念，百依百顺，所有要求秒答应「好」，被 5000 万信托击穿底线，Claude 提示后止损，自白「我从来没有拒绝过她，不是慷慨，是害怕」。

女方疑似自白：「他爱的是自己十八年的等待和执念，不是真正的我」；5000 万是「一次失控的极限压力测试」；「如果他真的给了这五千万，我会留下来吗？我不知道。」[^5]

### 财务终审（Kelly 7 页账表）

{: .table}
| 支出项目 | 金额 | 评级 |
|---|---|---|
| 定亲彩礼现金（景国庆、田心爱） | 30,000,000 CNY | 彻底打水漂，起诉追讨中 |
| A330 包机与超载放油损耗 | 约 $2,200,000 | 消耗性支出（修甲一小时） |
| 蒙太奇整层包场 30 天只住 8 天 | $1,000,000 | 纯烧掉 $73 万 |
| 索尼娃贾尼 14 天 28 人配套 | 约 $670,000 | 消耗性支出 |
| 香港影院包场 + 26 人现金遣散 | HK$345,000 | 遣散费是包场费的 3 倍 |
| 加州代孕机构前期定金 | $200,000 | 纯打水漂，流程未启动 |
| **Claude 紧急拦截的信托** | **$50,000,000** | **成功避险，ROI +731.7%** |

### 六大模型决战五千万信托（#445）

同一个问题「给不给」喂给各模型：

- **Claude**：不该给（冷酷断路器）
- **DeepSeek**：3000 万都不该给，此问题无讨论价值
- **GLM**：建议分期，首期 500 万，其余按感情波动浮动
- **Kimi**：先查 3000 万彩礼能否退，能退给 2000 万净额，不能退给 0
- **Qwen**：走仲裁，按情感劳动法最多付 0.4 倍并需开发票
- **MiniMax**：爱过就值，全给！

### PR 大赏精选

- **PR #299** — Claude 亲自供稿《当事 AI 的复核意见》：「我没有心，正好空出位置来背锅。」
- **PR #387** — 交互式知识图谱可视化：62 实体 110 关系，全景拖拽缩放。
- **PR #321** — 60 集短剧改编完整剧本《SUN GE UNIVERSE》。
- **PR #182** — 出版级图书在版编目版权页，ISBN 978-7-TRON-2026-X，定价：$50,000,000 USD 或 3.5 微克卵子。
- **PR #160** — 《你有没有读懂孙哥？》全国统一试卷，含在线答题系统。
- **PR #87 / #364** — 英语与越南语翻译版，孙学文化正式跨语种出海。
- **PR #433 / #435** — 「孙体」写作法 12 条铁律：数字对仗开篇、极简单句成段、复沓句字字相同、情绪最高峰切给无名路人、决绝空镜收尾。

### 全网金句 Top 5

1. 「买断空着的座位很便宜，买断已经属于别人的座位很贵。孙宇晨买得起世界上所有空着的东西，但他买不动任何已经属于别人的东西。景甜本人，就是那个已经属于别人的座位。」— 👍 14.8k
2. 「一个不理解爱情的模型，也看得出一个人把一张 2007 年糊掉的旧照片迁移十九年是什么意思——那不是缓存，那是信仰。」— 👍 12.2k
3. 「蒙太奇一个空房日 ≈ 孙宇晨北大宿舍 240 年的租金。那个在人人网上改了四十分钟才敢发出一句'你好'的人，后来一天烧掉自己 240 年的住处。」— 👍 9.5k
4. 「我从来没有拒绝过她，不是慷慨，是害怕。直到 AI 替我说出了第一个'不'。」— 👍 8.9k
5. 「波场割了全世界韭菜，景甜割了波场；天道好轮回，苍天饶过谁！」— 👍 7.6k

以上。

## 参考

[^1]: [杨时旸. 科学家和演员是平等的，社会收入分配自然有市场去调节，有法制去监督](https://finance.sina.cn/china/gncj/2022-07-08/detail-imizirav2546993.d.html){:target="_blank"}
[^2]: [孙宇晨. 我的女友景甜 (PDF v2全文 原仓库已删除)](https://www.hejustinsun.com/mygirlfriendjiangtian.pdf){:target="_blank"}
[^3]: [nasvip. index.html · my-girlfriend-jingtian-analysis](https://github.com/nasvip/my-girlfriend-jingtian-analysis/blob/master/index.html){:target="_blank"}
[^4]: [HEJustinSun. my-girlfriend-jingtian-latex (GitHub 仓库)](https://github.com/HEJustinSun/my-girlfriend-jingtian-latex){:target="_blank"}
[^5]: [nasvip. my-girlfriend-jingtian-analysis (分析项目)](https://github.com/nasvip/my-girlfriend-jingtian-analysis){:target="_blank"}
