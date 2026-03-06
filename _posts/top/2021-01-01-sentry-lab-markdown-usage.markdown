---
layout: top
title: "文章速览"
date: 2021-07-31
wrench: 2025-03-06
author: Bin4xin
categories:
  - top
tags:
  - 笔记
  - wiki
---

---


> *Tips:*
> - <i class="fa fa-plus-circle"></i>表示新增
>
> - <i class="fa fa-wrench"></i>表示修改
>
> - <i class="fa fa-level-up"></i>表示升级
>
> - <i class="fa fa-quote-right"></i>表示引用或站点新增展示记录

<!-- <i class="fa fa-hand-o-right"></i> -->



<details open>
<summary class="point"><em> Click to preview Home Articles release note quickly</em></summary>
<table class="table">
<thead>
<tr>
<th>时间</th>
<th><center>操作</center></th>
<th>书签</th>
</tr>
</thead><!--table head over-->
{% for post in site.categories['blog'] %}
<tbody>
<tr>
<td>{% if post.wrench %}{{ post.wrench | date: "%Y/%m/%-d" }}<br><del>{{ post.date | date: "%Y/%m/%-d" }}</del>{% else %} {{ post.date | date: "%Y/%m/%-d" }}{% endif %} </td>
<td>{% if post.wrench %}<font size="3" color="red"><em>*NEW</em></font><center><kbd><i class="fa fa-plus-circle"></i></kbd><kbd><i class="fa fa-wrench"></i></kbd></center>{% else %}<center><kbd><i class="fa fa-plus-circle"></i></kbd></center>{% endif %}</td>
<td><a href="{{ post.url | prepend: site.baseurl }}" target="_blank"><i class="fa fa-link"></i>《 {{ post.title }} 》</a></td>
</tr>
</tbody>
{% endfor %}
</table>
</details>

<div class="spacing"></div>
<div class="hline"></div>
<div class="spacing"></div>

<details open>
<summary class="point"><em> Others...</em></summary>
<ul><li>palin text: <code class="language-plaintext highlighter-rouge">code hline.</code></li></ul>

</details>