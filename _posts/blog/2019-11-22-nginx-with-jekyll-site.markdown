---
title:      "nginx和jekyll会摩擦出什么样的火花呢"
author:     "Bin4xin"

article_header:
  type: cover
  image:
    src: img/post-bg/post-bg-archive.png
catalog: true
tags:
    - 技巧
    - Web
---
> 摘要：webrick真是不省心啊。还是nginx大法好～

使用nginx作为jekyll博客的服务启动容器介绍：

## 1.jekyll如何工作

首先先从用户角度解释一下我理解中的jekyll服务的运行原理<br>
`1.编写markdown文档->2.markdown解析->3.jekyll运行生成web站点文件`

所以我们直接去找站点文件夹，把web站点文件夹复制到nginx的根目录下就好了

```
cd /your-jekyll-web/
ls                   #我们可以看到_site/文件夹，这个文件夹就是web站点文件夹
cd _site/
vi 2019-01-01-your-article-title.markdown
cp _site/ /var/www/html/ -r
nginx -t
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
systemctl start nginx
curl localhost
```
测试nginx完毕没有问题，既可以直接启动nginx。然后看一下本地页面，如果出现本地页面就是调试完成了。

## 2.配置nginx-server


```
cat /etc/nginx/nginx.conf
中间略去，直接看server区块
server {
        listen       80;
        server_name  ip;     #修改这里，如果这里你是公网ip，修改成公网ip就可以啦。
        #charset koi8-r;
        #access_log  logs/host.access.log  main;
		 
		root   /home/www/_site/;

        location / {
			 #try_files $uri $uri/ /index.php$is_args$args;
            index  index.html index.htm;
        				}
 location ~ \.php{          ＃这里是定位到输入php的页面解析代码，如果不需要可以直接注释掉。
				index  index.php index.html;
				include /etc/nginx/snippets/fastcgi-php.conf;
				fastcgi_pass unix:/etc/init.d/php7.3-fpm;
					}

	# deny access to .htaccess files, if Apache's document root
	# concurs with nginx's one
	#
	location ~ /\.ht {
		deny all;
		}
        #error_page  404              /404.html;

        # redirect server error pages to the static page /50x.html
        #
        error_page   500 502 503 504  /50x.html;
        #location = /50x.html {
         #   root   /usr/share/nginx/html;

		}
}
```
同样测试一下，没问题就可以了。
这个时候就可以看一下公网地址是不是已经可以访问上了，访问上就没什么问题了。维护博客就可以通过markdown文件的形式post到服务器上用jekyll解析就可以访问了。

> 希望你们自己也能动手试试看。`么么哒`

