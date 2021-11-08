---
layout: post
title: "有关于网络安全行业的一些思考"
date: 2020-09-25
author: Bin4xin
toc: true
categories:
    - blog
    - 笔记
permalink: /blog/2020/think-about-cyber-security/
---


### Under construction

---

<div class="d-none d-sm-block position-absolute col-5 col-md-4 col-lg-3 bottom-0 right-0 mr-lg-5 mb-md-n4">

<!-- this is a gap between text and pics:) -->
</div>

<div class="d-none d-sm-block position-absolute col-5 col-md-4 col-lg-3 bottom-0 right-0 mr-lg-5 mb-md-n4">

<!-- this is a gap between text and pics:) -->
</div>
<div class="d-none d-sm-block position-absolute col-5 col-md-4 col-lg-3 bottom-0 right-0 mr-lg-5 mb-md-n4">

<!-- this is a gap between text and pics:) -->
</div>


<div class="d-none d-sm-block position-absolute col-5 col-md-4 col-lg-3 bottom-0 right-0 mr-lg-5 mb-md-n4">
<div class="width-full" >
<svg viewBox="0 0 300 305" class="width-fit">
<defs>
<mask id="https___github_githubassets_com_images_modules_site_home_astro-mona-alpha_jpg">
<image width="300" height="305" href="/assets/img/post-bg/astro-mona-alpha.jpg"></image>
</mask>
</defs>
<image mask="url(#https___github_githubassets_com_images_modules_site_home_astro-mona-alpha_jpg)" width="300" height="305" href="/assets/img/post-bg/astro-mona.jpg"></image>
</svg>
</div>
</div>

    
在当今网络安全行业趋于商业化的时代，如何能够保持一颗赤忱之心：

- 当今网络安全之趋势，当在国家安全的大前提下：
    * 教育行业应作为网络安全的"活水源头"，为这个年轻的行业输入足够的年轻血液，所以在此刻：<br>
    应当充分发挥教育职能的同时，对当下应用型、研究型专业的莘莘学子做有必要的引导；<br>
    因为当下很多学生、教师在当下行业无法认清自我，永远无法在正确的时间，做正确的事；

    * 企业在这其中也扮演重要角色：
显而易见的是，传统安全企业也面临着的抉择：
    - 适应市场或者是自己选择游戏规则；
        * 大部分传统安全厂商选择的是适应市场
            - 安服需求；夺旗需求；应付工信部门检查等。。。
        * 爱加密等厂商：
            - 自己创造需求，创造游戏规则。
 
> 对处于实习期的学生做好职业引导，网络安全行业在未来十年不会成为国家命脉行业，安全行业仅仅作为安全服务的形式为大众所熟知，如今的网络安全行业：
>  
> 国家层面：CTF赛事；护网行动；重大节日保障
>
> 企业层面：工信局部门检查；等保；自身企业业务安全保障(一般来说，越针对自身企业业务有安全需求的公司，都拥有自己的安全团队)
>
> 个人层面：个人数据、隐私、财产问题；



## 零、当下网络安全行业CTF赛事之我见

oopos！被你发现了！
* it工作人员（包括运维、开发等等）公司内的矛盾

* 软件开发和传统安全公司之间的矛盾

网络防火墙作为访问控制设备，主要工作在OSI模型三、四层，基于IP报文进行检测。只是对端口做限制，对TCP协议做封堵。
其产品设计无需理解HTTP会话，也就决定了无法理解Web应用程序语言如HTML、SQL语言。因此，它不可能对HTTP通讯进行输入验证或攻击规则分析。针对Web网站的恶意攻击绝大部分都将封装为HTTP请求，从80或443端口顺利通过防火墙检测。 
一些定位比较综合、提供丰富功能的防火墙，也具备一定程度的应用层防御能力，如能根据TCP会话异常性及攻击特征阻止网络层的攻击，通过IP分拆和组合也能判断是否有攻击隐藏在多个数据包中，但从根本上说他仍然无法理解HTTP会话，难以应对如SQL注入、跨站脚本、cookie窃取、网页篡改等应用层攻击。 
web应用防火墙能在应用层理解分析HTTP会话，因此能有效的防止各类应用层攻击，同时他向下兼容，具备网络防火墙的功能。 


<script>
var consoleConfig = {
welcome: '\n哈？(づ｡◕‿‿◕｡)づ！你在偷看什么。本文还在"思考"中...\n',
theme: '\n1、it工作人员（包括运维、开发等等）公司内的矛盾\n2、软件开发和传统安全公司之间的矛盾  \n\n源码:https://github.com/Bin4xin/bin4xin.github.io \n\n如果喜欢可以 %c star%c  %c支持一下%c  ❤️~\n',

};

var consoleInfo = (function(consoleConfig) {
console.log('%c' + consoleConfig.welcome, 'color: #6190e8');
console.log('%c' + consoleConfig.theme, 'color: #6190e8;','padding: 0 5px;color: #fff;background: #6190e8;','color: #6190e8;','padding: 0 5px;color: #fff;background: #6190e8;','color: #6190e8;');
console.log('%c' + consoleConfig.qrcode, 'color: #6190e8');
console.log('%c' + consoleConfig.search, 'color: #6190e8');

}(consoleConfig));</script>
