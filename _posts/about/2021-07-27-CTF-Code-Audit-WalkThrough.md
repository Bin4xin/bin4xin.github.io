---
layout: about
category: about
wrench: 2021-09-03
toc: true
Researchname: CTF - 代码审计向
permalink: /about/CTF-Code-Audit-WalkThrough/
---


# 零：WEB

#### # 0x01 任意文件读取绕过

```php
<?php
highlight_file(__FILE__);
class emmm
{
    public static function checkFile(&$page)
    {
        $whitelist = ["source"=>"source.php","hint"=>"hint.php"];
        if (! isset($page) || !is_string($page)) {
            echo "you can't see it";
            return false;
        }

        if (in_array($page, $whitelist)) {
            return true;
        }

        $_page = mb_substr(
            $page,
            0,
            mb_strpos($page . '?', '?')
        );
        if (in_array($_page, $whitelist)) {
            return true;
        }

        $_page = urldecode($page);
        $_page = mb_substr(
            $_page,
            0,
            mb_strpos($_page . '?', '?')
        );
        if (in_array($_page, $whitelist)) {
            return true;
        }
        echo "you can't see it";
        return false;
    }
}

if (! empty($_REQUEST['file'])
    && is_string($_REQUEST['file'])
    && emmm::checkFile($_REQUEST['file'])
) {
    include $_REQUEST['file'];
    exit;
} else {
    echo "<br><img src=\"https://i.loli.net/2018/11/01/5bdb0d93dc794.jpg\" />";
}
?> 
```
先看if判断主逻辑，同时满足下列三个条件即可：

- `if (! empty($_REQUEST['file'])`
    - 传入file参数不为空，不多说；
- `&& is_string($_REQUEST['file'])`
    - 传入file参数是字符串；
- `&& emmm::checkFile($_REQUEST['file']))`
    - 传入file参数满足`emmm类的checkFile函数`，主要看这个函数，传入checkFile函数的file参数被重新接受为page参数，判断参数是否为空、是否为字符串，是则往下：
        - 1.检查$page在不在数组$whitelist里`$whitelist = ["source"=>"source.php","hint"=>"hint.php"]; if (in_array($page, $whitelist)) {return true;}`：
            - 即：传入参数file`file=source(.php) / file=hint(.php)` ；
        - 2.对传入参数进行一次url解码
        - 3.往下；
        ```php
        $_page = mb_substr(
            $page,
            0,
            mb_strpos($page . '?', '?')
        );
        ```
            - 先看mb_strpos，就是？在$page里第一次出现的位置再看mb_substr，只留了$page从0到？的位置；
        - 4.对`_page`重复1；
        - 5.对`_page`重复2；
        - 6.对`_page`重复3；
        - 7.再次判断参数重复1；
        - 8.`include $_REQUEST['file'];`

只要我们构造的参数满足上述步骤绕过：
`file=source.php%3f../../../../../../../../../../../../etc/passwd`，然后根据题目提示读取flag文件。

![截屏2021-07-29 下午4.33.54.png](https://i.loli.net/2021/07/29/XroGifUcBNMdsPz.png)

- 参考
    - [PHP: is_string - Manual](https://www.php.net/manual/zh/function.is-string.php){:target="_blank"}
    - [PHP: mb_strpos - Manual](https://www.php.net/manual/zh/function.mb-strpos.php){:target="_blank"}
    - [XCTF - Warmup Writeup](https://adworld.xctf.org.cn/task/writeup?type=web&id=5442&number=3&grade=1&page=undefined){:target="_blank"}


#### # 0x02 NaNNaNNaNNaN-Batman：奇妙的js

[NaNNaNNaNNaN-Batman附件](https://adworld.xctf.org.cn/media/task/attachments/646ecdf05af7490a85bb5c8ccb96c102.zip){:target="_blank"}文本编辑器打开发现`<script>_='function $()`超文本标签，修改为html后缀，同时修改`eval(_)`为`alert(_)`

处理后如下：

![截屏2021-07-29 下午4.48.07.png](https://i.loli.net/2021/07/29/nQH65odjRtgNeh9.png)

```js
function $(){
    var e=document.getElementById("c").value;
    if(e.length==16)
    if(e.match(/^be0f23/)!=null)
    if(e.match(/233ac/)!=null)
    if(e.match(/e98aa$/)!=null)
    if(e.match(/c7be9/)!=null)
    {
        var t=["fl","s_a","i","e}"];
        var n=["a","_h0l","n"];
        var r=["g{","e","_0"];
        var i=["it'","_","n"];
        var s=[t,n,r,i];
        for(var o=0;o<13;++o){document.write(s[o%4][0]);s[o%4].splice(0,1)
        }
    }
}
    document.write('<input id="c"><button onclick=$()>Ok</button>');
    delete _
```
根据if判断逻辑内的定义console输出：

![截屏2021-07-29 下午4.51.36.png](https://i.loli.net/2021/07/29/vSJgTNcsjDFGMoz.png)


#### # 0x03 php伪协议

本题思路：

- index.php
    - 对应file参数读取文件但是过滤了关键词`flag`，同时给出关键文件`secure.php`
    - `secure.php`对应输出flag的逻辑；

- secure.php
    - 尝试读取对应php文件代码：
    - 读取payload`index.php?file=php://filter/read=convert.base64-encode/resource=secure.php`

![截屏2021-07-29 下午2.25.57.png](https://i.loli.net/2021/07/30/Sxo6lWYBCIpQ2tU.png)

- `secure.php`

```bash
➜ echo PG1ldGEgY2hhcnNldD0iVVRGLTgiPgo8P3BocAogICAgaW5jbHVkZSAnLi9mbGFnLnBocCc7CiAgICBlcnJvcl9yZXBvcnRpbmcoMCk7CiAgICAkcGFyMSA9ICRfR0VUWydwYXIxJ107CiAgICAkcGFyMiA9ICRfR0VUWydwYXIyJ107CiAgICAkcGFyMyA9ICRfUE9TVFsncGFyMyddOwogICAgJHBhcjQgPSAkX1BPU1RbJ3BhcjQnXTsKICAgIGlmIChpc3NldCgkcGFyMSkmJmlzc2V0KCRwYXIyKSYmaXNzZXQoJHBhcjMpJiZpc3NldCgkcGFyNCkpIHsKICAgICAgICBpZiAoJHBhcjEgPT09ICRwYXIyICYmIG1kNSgkcGFyMSkgIT09IG1kNSgkcGFyMikpIHsKICAgICAgICAgICAgZGllKCfov5jmg7Por7vlj5ZmbGFn77yfJyk7CiAgICAgICAgfQogICAgICAgIGlmIChoYXNoKCJtZDQiLCAkcGFyMykgPT0gaGFzaCgibWQ0IiwgJHBhcjQpKSB7CiAgICAgICAgICAgIGVjaG8gJ+e7meS9oGZsYWfvvIEnIC4gJGZsYWc7CiAgICAgICAgfQogICAgfQo=|base64 -d
#secure.php:
<meta charset="UTF-8">
<?php
    include './flag.php';
    error_reporting(0);
    $par1 = $_GET['par1'];
    $par2 = $_GET['par2'];
    $par3 = $_POST['par3'];
    $par4 = $_POST['par4'];
    if (isset($par1)&&isset($par2)&&isset($par3)&&isset($par4)) {
        if ($par1 === $par2 && md5($par1) !== md5($par2)) {
            die('还想读取flag？');
        }
        if (hash("md4", $par3) == hash("md4", $par4)) {
            echo '给你flag！' . $flag;
        }
    }
```
从代码可以看到直接传入的四个参数GET：`par1 & par2`，POST：`par3 & par4`；

判断：

- `if (isset($par1)&&isset($par2)&&isset($par3)&&isset($par4))`
    - 设置四个参数即可；
- `if ($par1 === $par2 && md5($par1) !== md5($par2)) ` 
    - 与判断，直接不满足其中一个条件即可；比如让两个参数不相等或两个参数的md5
    值不相等；
- 继续往下：`if (hash("md4", $par3) == hash("md4", $par4))`
    - 两个参数的md4值相等给出flag；不多说，直接上payload：

![](https://i.loli.net/2021/07/30/WgMqKXGUmrxoYIv.png)

#### # 0x03 卖瓜

这道题对于当下的我来说还是比较难，是看了题解才做得出来；究其原因我觉得是由于代码基础太过薄弱的缘故，就拿这道题来说，就算是找到[PHP文档: Integer 整型](https://www.php.net/manual/zh/language.types.integer.php)，下一次遇到这样的题目还是没有办法。

题目描述：

<div><p>有一个人前来买瓜。</p>
<p>HQ：哥们，这瓜多少钱一斤啊？</p>
<p>你：两块钱一斤。</p>
<p>HQ：What's up！这瓜皮子是金子做的还是瓜粒子是金子做的？</p>
<p>你：你瞧瞧现在哪有瓜啊？这都是大棚的瓜，只有 6 斤一个和 9 斤一个的，你嫌贵我还嫌贵呢。</p>
<p>（HQ 心里默默一算）</p>
<p>HQ：给我来 20 斤的瓜。</p>
<p>你：行！</p>
<p>HQ：行？这瓜能称出 20 斤吗？</p>
<p>你：我开水果摊的，还不会称重？</p>
<p>HQ：我问你这瓜能称出 20 斤吗？</p>
<p>你：你是故意找茬，是不是？你要不要吧！</p>
<p>HQ：你这瓜要是刚好 20 斤吗我肯定要啊。那它要是没有怎么办啊？</p>
<p>你：要是不是 20 斤，我自己吃了它，满意了吧？</p>
<p>（你开始选瓜称重）</p>
<p><b style="color:red">补充说明：当称的数字变为浮点数而不是整数时，HQ 不会认可最终的称重结果。</b></p></div>

题目描述看完就可以得到方程： `6x + 9y = 20` ；我的第一反应是尝试能否负数来解题；而事实上并不可以:D

![img-No-negativenumbers]()

实际上，题目解题思路是没有问题的，我们可以看到上面标红的补充说明，因为我们知道上面的方程x和y是没有整数解的，所以基本思路就是通过Int型与Float型的数在PHP中的转换来使的正负相加得到一个固定的数，下面来谈谈这道题；

我们先来整理一下关键的点：

- `Server: nginx/1.21.3`、`X-Powered-By: PHP/8.0.10`；
- `POST method: b6=1&b9=1`，b6参数代表6斤的瓜，b9代表9斤的瓜；

提出问题：

- 1、PHP8是否有这样的机制导致可以溢出为负整数呢？答：可以，[PHP文档: Integer 整型](https://www.php.net/manual/zh/language.types.integer.php)
- 2、如果有的话，回到这道题上来，在没有给出代码的情况下如何利用呢？


针对问题1，我参考文档给出的代码做了一些本地实验方便理解：

> 如果给定的一个数超出了 int 的范围，将会被解释为 float。同样如果执行的运算结果超出了 int 范围，也会返回 float。如下图：

![](https://i.loli.net/2021/11/04/6qzWEmMROCZ5TiS.png)

> 当从浮点数 float 转换成整数 int 时，将向下取整。
