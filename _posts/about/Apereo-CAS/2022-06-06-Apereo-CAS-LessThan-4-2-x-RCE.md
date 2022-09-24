---
layout: about
category: about
wrench: 2022-06-11
Researchname: Apereo CAS < 4.2.x 反序列化远程代码执行
author: Bin4xin
toc: true
permalink: /about/Apereo-CAS-Less-than-4-2-x-RCE/
desc: 「Apereo CAS」
---

### CAS靶场搭建


{% comment %}
---
<div class="content">
<p>
<a href="https://mvnrepository.com/artifact/org.jasig.cas/cas-server-webapp" class="btn-primary btn color-border-accent-emphasis" target="blank">
CAS::Maven仓库地址<span class="DocsMarkdown--link-external-icon">
<svg fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 16 16" role="img" aria-labelledby="title-9637423397128071" xmlns="http://www.w3.org/2000/svg"><title id="title-9637423397128071">External link icon</title><path d="M6.75,1.75h-5v12.5h12.5v-5m0,-4v-3.5h-3.5M8,8l5.5-5.5"></path></svg>
</span></a></p>
</div>
---
<div class="content">
<p>
<a href="https://mvnrepository.com/artifact/org.jasig.cas/cas-server-webapp/4.1.6" class="btn-primary btn color-border-accent-emphasis" target="blank">
cas-server-webapp::4.1.6<span class="DocsMarkdown--link-external-icon">
<svg fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 16 16" role="img" aria-labelledby="title-9637423397128071" xmlns="http://www.w3.org/2000/svg"><title id="title-9637423397128071">External link icon</title><path d="M6.75,1.75h-5v12.5h12.5v-5m0,-4v-3.5h-3.5M8,8l5.5-5.5"></path></svg>
</span></a>
<a href="https://mvnrepository.com/artifact/org.jasig.cas/cas-server-webapp/4.2.7" class="btn-primary btn color-border-accent-emphasis" target="blank">
cas-server-webapp::4.2.7<span class="DocsMarkdown--link-external-icon">
<svg fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 16 16" role="img" aria-labelledby="title-9637423397128071" xmlns="http://www.w3.org/2000/svg"><title id="title-9637423397128071">External link icon</title><path d="M6.75,1.75h-5v12.5h12.5v-5m0,-4v-3.5h-3.5M8,8l5.5-5.5"></path></svg>
</span></a>
</p>
</div>
---
{% endcomment %}

分别进入下载Pom或者War，不想麻烦直接下载WAR包放到tomcat web文件夹就行。

### 如何发现CAS资产

- `Apereo Central Authentication Service`版本

通过路由404报错查看版本：`https://cas.example.com/cas/iwana404;)`

- 在CAS访问404资源时跳转302，本地不管是否配置`HTTPS证书`都不会返回404页面，所以排除了HTTPS证书的可能性；

- [Tomcat SSL Cert](https://www.jianshu.com/p/a55590f486a2){:target="_blank"}

![2022-06-06-16.14.28.png](https://image.yjs2635.xyz/images/2022/06/06/2022-06-06-16.14.28.png)

或者页脚处本身也会体现版本：

![2022-06-06-17.10.40.png](https://image.yjs2635.xyz/images/2022/06/06/2022-06-06-17.10.40.png)

- 登录`Post`请求包个性参数

```
POST http://localhost:8000/login;jsessionid=1653784B0F427BE086AD4EC81386726D HTTP/1.1
Host: localhost:8000

username=admin&password=123&execution=
```

如上面所示的`execution`参数（也是反序列化的入口）