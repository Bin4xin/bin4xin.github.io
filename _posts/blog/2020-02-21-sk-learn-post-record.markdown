---
title:      "「机器学习」:sklearn-学习记录-pip"
author:     "Bin4xin"
catalog: true

article_header:
  type: cover
  image:
    src: img/post-bg/post-python-pip-bg.png
tags:
    - 笔记
    - 机器学习
    - python

---
> 关关雎鸠，在河之洲。窈窕淑女，君子好逑。
> ——《诗经·国风·周南·关雎》


# pip的环境问题



# pip-timeout

安装scikit-learn依赖包，安装时一直报错time out超时，所以加上了`default-timeout`参数：
```javascript
pip3 --default-timeout=1000 install -U scikit-learn
 Downloading https://pypi.tuna.tsinghua.edu.cn/packages/73/db/7d8204ddba84ab5d1e4fd1af8f82bbe39c589488bee71e45c662f4144010/scikit_learn-0.22.1-cp37-cp37m-manylinux1_x86_64.whl (7.0MB)
    100% |████████████████████████████████| 7.0MB 159kB/s 
Successfully installed scikit-learn-0.22.1
```

```javascript
pip3 --default-timeout=1000 install -U SciPy
Downloading https://pypi.tuna.tsinghua.edu.cn/packages/dd/82/c1fe128f3526b128cfd185580ba40d01371c5d299fcf7f77968e22dfcc2e/scipy-1.4.1-cp37-cp37m-manylinux1_x86_64.whl (26.1MB)
    100% |████████████████████████████████| 26.1MB 44kB/s 
Successfully installed SciPy-1.4.1
```

# 国内换源
或者还有一种可能是因为pip找的库在国外的库，会导致下载速度过慢。这种情况可以直接换成国内的源
```javascript
vi ~/.pip/pip.conf
把下面内容放进去
[global]
timeout = 6000
index-url = https://pypi.tuna.tsinghua.edu.cn/simple/
*******
**pip国内的一些镜像：
*******
  阿里云 http://mirrors.aliyun.com/pypi/simple/ 
  中国科技大学 https://pypi.mirrors.ustc.edu.cn/simple/ 
  豆瓣(douban) http://pypi.douban.com/simple/ 
  清华大学 https://pypi.tuna.tsinghua.edu.cn/simple/ 
  中国科学技术大学 http://pypi.mirrors.ustc.edu.cn/simple/
```

windows下：
```javascript
进入C:\Users\用户名\pip，在pip目录下新建文件（没有新建文件夹）
pip.ini
同样输入上面的内容即可。
```
## 测试
可以看到，下载依赖已经在我们指定的pip库里索引了。
```javascript
# pip install pandas
DEPRECATION: Python 2.7 reached the end of its life on January 1st, 2020. Please upgrade your Python as Python 2.7 is no longer maintained. A future version of pip will drop support for Python 2.7. More details about Python 2 support in pip, can be found at https://pip.pypa.io/en/latest/development/release-process/#python-2-support
Looking in indexes: https://pypi.tuna.tsinghua.edu.cn/simple
Requirement already satisfied: pandas in /usr/local/lib/python2.7/dist-packages (0.24.2)
Requirement already satisfied: pytz>=2011k in /usr/lib/python2.7/dist-packages (from pandas) (2019.3)
Requirement already satisfied: numpy>=1.12.0 in /usr/local/lib/python2.7/dist-packages (from pandas) (1.16.6)
Requirement already satisfied: python-dateutil>=2.5.0 in /usr/local/lib/python2.7/dist-packages (from pandas) (2.8.1)
Requirement already satisfied: six>=1.5 in /usr/lib/python2.7/dist-packages (from python-dateutil>=2.5.0->pandas) (1.14.0)
```