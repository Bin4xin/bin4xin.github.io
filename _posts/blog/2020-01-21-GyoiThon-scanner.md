---
layout: post
toc: true
title: "「资产扫描」:Let's GyoiThon !"
author: Bin4xin
categories:
    - blog
    - 笔记
    - 安全工具
    - Web
permalink: /blog/2020/Lets/GyoiThon/
---


title:GyoiThon Scanner

## 1 下载依赖项
下载源文件后，进入文件夹路径，根据`python`的依赖进行安装，即`requirements.txt`文件：

```javascript
PS G:\GyoiThon> pip install -r requirements.txt
DEPRECATION: Python 2.7 will reach the end of its life on January 1st, 2020. Please upgrade your Python as Python 2.7 won't be maintained after that date. A future version of pip will drop support for Python 2.7. More details about Python 2 support in pip, can be found at https://pip.pypa.io/en/latest/development/release-process/#python-2-support
Collecting beautifulsoup4>=4.6.3
  Using cached https://files.pythonhosted.org/packages/c5/48/c88b0b390ae1f785942fc83413feb1268a1eb696f343d4d55db735b9bb39/beautifulsoup4-4.8.2-py2-none-any.whl
Requirement already satisfied: cchardet>=2.1.4 in c:\python27\lib\site-packages (from -r requirements.txt (line 2)) (2.1.5)
Collecting censys>=0.0.8
  Using cached https://files.pythonhosted.org/packages/88/4b/3ca07679928c26bb5503b53c37e2f6eef2521289956e2c1bf74b64008afa/censys-0.0.8.tar.gz
Requirement already satisfied: docopt>=0.6.2 in c:\python27\lib\site-packages (from -r requirements.txt (line 4)) (0.6.2)
Collecting google-api-python-client>=1.7.4
  Using cached https://files.pythonhosted.org/packages/31/c7/16ca16d28f2d71c8bd6fa67c91eb2a82259dc589c0504f903b675ecdaa84/google_api_python_client-1.7.11-py2-none-any.whl
Collecting Jinja2>=2.10.1
  Using cached https://files.pythonhosted.org/packages/65/e0/eb35e762802015cab1ccee04e8a277b03f1d8e53da3ec3106882ec42558b/Jinja2-2.10.3-py2.py3-none-any.whl
ERROR: Could not find a version that satisfies the requirement matplotlib>=3.0.3 (from -r requirements.txt (line 7)) (from versions: 0.86, 0.86.1, 0.86.2, 0.91.0, 0.91.1, 1.0.1, 1.1.0, 1.1.1, 1.2.0, 1.2.1, 1.3.0, 1.3.1, 1.4.0, 1.4.1rc1, 1.4.1, 1.4.2, 1.4.3, 1.5.0, 1.5.1, 1.5.2, 1.5.3, 2.0.0b1, 2.0.0b2, 2.0.0b3, 2.0.0b4, 2.0.0rc1, 2.0.0rc2, 2.0.0, 2.0.1, 2.0.2, 2.1.0rc1, 2.1.0, 2.1.1, 2.1.2, 2.2.0rc1, 2.2.0, 2.2.2, 2.2.3, 2.2.4)
ERROR: No matching distribution found for matplotlib>=3.0.3 (from -r requirements.txt (line 7))
```

报错`ERROR: No matching distribution found for matplotlib>=3.0.3 (from -r requirements.txt (line 7))`称没有找到匹配的版本，以为是pip的版本问题，所以进行pip版本升级。
```javascript
python -m pip install --upgrade pip

DEPRECATION: Python 2.7 will reach the end of its life on January 1st, 2020. Please upgrade your Python as Python 2.7 won't be maintained after that date. A future version of pip will drop support for Python 2.7. More details about Python 2 support in pip, can be found at https://pip.pypa.io/en/latest/development/release-process/#python-2-support
Requirement already up-to-date: pip in c:\python27\lib\site-packages (19.3.1)
```

### 1.1 报错解决

但是依然无效，系统提示pip为最新版本。思索着应该是python的版本问题。直接就上python3
<br>使用`pip3`进行下载更新：
```javascript
pip3 install -r requirements.txt -i http://pypi.douban.com/simple/ --trusted-host pypi.douban.com

##速度可以感受一下：
Looking in indexes: http://pypi.douban.com/simple/
Requirement already satisfied: beautifulsoup4>=4.6.3 in /usr/lib/python3/dist-packages (from -r requirements.txt (line 1)) (4.8.0)
Collecting cchardet>=2.1.4 (from -r requirements.txt (line 2))
  Downloading http://pypi.doubanio.com/packages/c6/20/905b6c5664736d884a40ac3b1204ab874c3c4a8ce86f7b2e28abc1fc6ee4/cchardet-2.1.5-cp37-cp37m-manylinux1_x86_64.whl (241kB)
    100% |████████████████████████████████| 245kB 6.9MB/s 
Collecting censys>=0.0.8 (from -r requirements.txt (line 3))

```
`-i $url --trust-host $host`此参数则是指定pip下载更新的url库。<br>
后来发现，requirements中，`matplotlib>=3.0.3`这一项依赖需要`python3.6`版本以上，所以运行会报错。
```javascript
cat /media/root/binAxin/GyoiThon/requirements.txt 
beautifulsoup4>=4.6.3
cchardet>=2.1.4
censys>=0.0.8
docopt>=0.6.2
google-api-python-client>=1.7.4
Jinja2>=2.10.1
matplotlib>=3.0.3
msgpack-python>=0.5.6
networkx>=2.2
pandas>=0.22.0
pysocks>=1.6.7
Scrapy>=1.5.0
tldextract>=2.2.1
urllib3>=1.25
```


## 2 扫描使用
### 2.1 配置host
运行gyoithon后，会在`module`文件夹对CVE漏洞进行更新配置，此时我们等待即可。看一下简介：<br>
<center><strong>GyoiThon是一款基于机器学习的渗透测试工具</strong></center><br>
GyoiThon根据学习数据识别安装在Web服务器上的软件（操作系统，中间件，框架，CMS等）。之后，GyoiThon为已识别的软件执行有效的攻击。最终，GyoiThon会自动生成扫描结果报告。<br>

<br>上述处理均由GyoiThon自动执行；用户唯一的操作就是在GyoiThon中，输入目标web服务器的首页URL。这非常的简单，几乎不花费你任何的时间和精力，就能让你轻松的识别Web服务器上的漏洞。
所以GyoiThon需要一些识别项（特征库）进行匹配，下载完后，就可以使用扫描器了；需要注意的是，我们运行前需要对`host`文件进行配置
```javascript
# ls
config.ini   handout   LICENSE  __pycache__  requirements.txt  util.py
docker       host.txt  logs     README.md    signatures        util.pyc
gyoithon.py  img       modules  report       temp_signatures

# cat host.txt 
http localhost 80 /
```
如上，格式为：<br>
`协议<空格>url地址<空格>端口号<空格>路径`

```javascript
PS G:\GyoiThon> python3 .\gyoithon.py

^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 ██████╗██╗   ██╗ ██████╗ ██╗████████╗██╗  ██╗ ██████╗ ███╗   ██╗
██╔════╝╚██╗ ██╔╝██╔═══██╗██║╚══██╔══╝██║  ██║██╔═══██╗████╗  ██║
██║  ███╗╚████╔╝ ██║   ██║██║   ██║   ███████║██║   ██║██╔██╗ ██║
██║   ██║ ╚██╔╝  ██║   ██║██║   ██║   ██╔══██║██║   ██║██║╚██╗██║
╚██████╔╝  ██║   ╚██████╔╝██║   ██║   ██║  ██║╚██████╔╝██║ ╚████║
 ╚═════╝   ╚═╝    ╚═════╝ ╚═╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝  (beta)
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
by gyoithon.py

       =[ GyoiThon v0.0.3-beta                               ]=
+ -- --=[ Author  : Gyoiler (@gyoithon)                      ]=--
+ -- --=[ Website : https://github.com/gyoisamurai/GyoiThon/ ]=--
```
扫描完成后，扫描器就会出一个csv的报告查看即可。

以上。