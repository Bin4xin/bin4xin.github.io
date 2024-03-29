---
layout: about
category: about
wrench: 2022-09-07
toc: true
Researchname: 2022年网鼎杯玄武组-解题记录
author: Bin4xin
permalink: /about/WANGDINGCTF2022-Walkthrough/
desc: 「CTF」
---

# 零：WEB

## # 0x00 web237-openlitespeed

### SSRF

{% highlight php %}
<?php
highlight_file(__FILE__);
if (isset($_POST["curl_opt"]) && is_array($_POST["curl_opt"])){
    $ch = curl_init();
    foreach ($_POST["curl_opt"] as $key=>$value){
        curl_setopt($ch, $key, $value);
    }
    $result = curl_exec($ch);
    curl_close($ch);
    echo $result;
}
?>
{% endhighlight %}

- ssrf

![2022-09-01-09.00.26.png]({{site.PicturesLinks_Domain}}/images/2022/09/07/2022-09-01-09.00.26.png)

- 尝试写shell失败：

![2022-09-01-09.00.19.png]({{site.PicturesLinks_Domain}}/images/2022/09/07/2022-09-01-09.00.19.png)

## # 0x01 web441-ezjava

### 路由绕过

payload `http://localhost/;Evil` 绕过 `if (path.startsWith("/Evil"))`

{%highlight java%}
@ResponseBody
@RequestMapping({"/Evil"})
public String Evil(HttpServletRequest request, HttpServletResponse response) throws IOException, ClassNotFoundException {
        String path = request.getRequestURI();
        if (path.startsWith("/Evil"))
        return "nonono!!!";
        String base = request.getParameter("base");
        EInputStream in = new EInputStream(new ByteArrayInputStream(Base64.getDecoder().decode(base)));
        Object a = in.readObject();
        return "OK";
        }
{% endhighlight %}

[`base` 参数如何？进一步查看writeUp：](/about/WANGDINGCTF2022-WEB-ezJava-Walkthrough/)