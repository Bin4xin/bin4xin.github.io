---
layout: post
toc: true
title: "「Python」:pip环境配置与换源记录"
wrench: 2020-02-25
author: Bin4xin
categories:
    - blog
    - python
    - 笔记
    - 运维
permalink: /blog/2020/sk_learn/record/
---

## 0x00 pip的环境问题

在安装scikit-learn等科学计算包时，经常会遇到下载超时或依赖冲突的问题。以下记录常见解决方案。

## 0x01 pip-timeout

设置`default-timeout`参数避免下载超时：

安装scikit-learn依赖包，安装时一直报错time out超时，所以加上了`default-timeout`参数：
```bash
pip3 --default-timeout=1000 install -U scikit-learn
 Downloading https://pypi.tuna.tsinghua.edu.cn/packages/73/db/7d8204ddba84ab5d1e4fd1af8f82bbe39c589488bee71e45c662f4144010/scikit_learn-0.22.1-cp37-cp37m-manylinux1_x86_64.whl (7.0MB)
    100% |████████████████████████████████| 7.0MB 159kB/s 
Successfully installed scikit-learn-0.22.1
```

```bash
pip3 --default-timeout=1000 install -U SciPy
Downloading https://pypi.tuna.tsinghua.edu.cn/packages/dd/82/c1fe128f3526b128cfd185580ba40d01371c5d299fcf7f77968e22dfcc2e/scipy-1.4.1-cp37-cp37m-manylinux1_x86_64.whl (26.1MB)
    100% |████████████████████████████████| 26.1MB 44kB/s 
Successfully installed SciPy-1.4.1
```

## 0x02 国内换源

pip默认源在国外，下载速度慢。配置国内镜像源：

### Linux/macOS

```bash
vi ~/.pip/pip.conf
```

```ini
[global]
timeout = 6000
index-url = https://pypi.tuna.tsinghua.edu.cn/simple/
```

### Windows

```powershell
# 进入C:\Users\用户名\pip，在pip目录下新建文件
# pip.ini，填入同样内容
```

### 常用国内镜像源

{:.table}
| 镜像 | 地址 |
|------|------|
| 清华 | `https://pypi.tuna.tsinghua.edu.cn/simple/` |
| 阿里云 | `http://mirrors.aliyun.com/pypi/simple/` |
| 中科大 | `https://pypi.mirrors.ustc.edu.cn/simple/` |
| 豆瓣 | `http://pypi.douban.com/simple/` |

## 0x03 验证

```bash
# pip install pandas
DEPRECATION: Python 2.7 reached the end of its life on January 1st, 2020. Please upgrade your Python as Python 2.7 is no longer maintained. A future version of pip will drop support for Python 2.7. More details about Python 2 support in pip, can be found at https://pip.pypa.io/en/latest/development/release-process/#python-2-support
Looking in indexes: https://pypi.tuna.tsinghua.edu.cn/simple
Requirement already satisfied: pandas in /usr/local/lib/python2.7/dist-packages (0.24.2)
Requirement already satisfied: pytz>=2011k in /usr/lib/python2.7/dist-packages (from pandas) (2019.3)
Requirement already satisfied: numpy>=1.12.0 in /usr/local/lib/python2.7/dist-packages (from pandas) (1.16.6)
Requirement already satisfied: python-dateutil>=2.5.0 in /usr/local/lib/python2.7/dist-packages (from pandas) (2.8.1)
Requirement already satisfied: six>=1.5 in /usr/lib/python2.7/dist-packages (from python-dateutil>=2.5.0->pandas) (1.14.0)
```