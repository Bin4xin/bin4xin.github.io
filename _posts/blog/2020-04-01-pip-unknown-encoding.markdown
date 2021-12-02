---
layout: post
toc: true
title: "「Terminal」:pip报错'unkown-encoding'"
author: Bin4xin
categories:
    - blog
    - python
    - Terminal
permalink: /blog/2020/pip/said/unkown/encoding/
---

* 可怖的unkown encoding.



自从修改了windows终端的编码格式后，就出了各种问题，几乎在终端上执行的软件都运行不了，提示`LookupError: unknown encoding: cp65001`，如下报错。

```javascript
C:\Users\本阿信>pip --version
Traceback (most recent call last):
  File "c:\python27\lib\runpy.py", line 174, in _run_module_as_main
    "__main__", fname, loader, pkg_name)
  File "c:\python27\lib\runpy.py", line 72, in _run_code
    exec code in run_globals
  File "C:\Python27\Scripts\pip.exe\__main__.py", line 4, in <module>
  File "c:\python27\lib\site-packages\pip\_internal\cli\main.py", line 10, in <module>
    from pip._internal.cli.autocompletion import autocomplete
  File "c:\python27\lib\site-packages\pip\_internal\cli\autocompletion.py", line 9, in <module>
    from pip._internal.cli.main_parser import create_main_parser
  File "c:\python27\lib\site-packages\pip\_internal\cli\main_parser.py", line 7, in <module>
    from pip._internal.cli import cmdoptions
  File "c:\python27\lib\site-packages\pip\_internal\cli\cmdoptions.py", line 31, in <module>
    from pip._internal.utils.ui import BAR_TYPES
  File "c:\python27\lib\site-packages\pip\_internal\utils\ui.py", line 64, in <module>
    _BaseBar = _select_progress_class(IncrementalBar, Bar)  # type: Any
  File "c:\python27\lib\site-packages\pip\_internal\utils\ui.py", line 57, in _select_progress_class
    six.text_type().join(characters).encode(encoding)
LookupError: unknown encoding: cp65001
```

只能怪自己，好好的改什么txt文本编码，现在好了。<a href="https://stackoverflow.com/questions/35176270/python-2-7-lookuperror-unknown-encoding-cp65001">解铃还须系铃人：</a>暂时在该终端下可以使用pip

```javascript
C:\Users\本阿信>set PYTHONIOENCODING=UTF-8

C:\Users\本阿信>pip --version
pip 20.0.2 from c:\python27\lib\site-packages\pip (python 2.7)
```
链接还建议设置全局变量为`$env:PYTHONIOENCODING = "UTF-8"`，但是我搜索了一下，没有找到方法，希望会的朋友邮件我教我。
`CHCP 936`


---

UTF-8是unicode编码的一种落地方案：

Unicode符号范围 | UTF-8编码方式
(十六进制) | （二进制）
--------------------+---------------------------------------------
0000 0000-0000 007F | 0xxxxxxx
0000 0080-0000 07FF | 110xxxxx 10xxxxxx
0000 0800-0000 FFFF | 1110xxxx 10xxxxxx 10xxxxxx
0001 0000-0010 FFFF | 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx

\x对应的是UTF-8编码的数据，通过转化规则可以转换为Unicode编码，就能得到对应的汉字，转换规则很简单，先将\x去掉，转换为数字，然后进行对应的位移操作即可，需要注意的是先要判断utf-8的位数.
