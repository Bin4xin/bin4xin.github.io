---
title:      "「LINUX」:anaconda3公网部署历程"
author:     "Bin4xin"
catalog: true

article_header:
  type: cover
  image:
    src: img/post-bg/post-anaconda3-linux-deploy1.png
tags:
    - 笔记
    - 机器学习
    - python

---
参考：https://blog.csdn.net/hitzijiyingcai/article/details/81099951

# 1、下载linux版本的Anaconda安装包

下载地址：https://www.continuum.io/downloads
选择64位linux的Python 2.7版本点击下载，下载完成后，得到Anaconda3-4.2.0-Linux-x86_64.sh安装文件。

# 2、安装Anaconda

进入下载文件所在的文件夹，在命令行运行：
```javascript
bash  Anaconda3-4.2.0-Linux-x86_64.sh
安装过程一路回车即可，中途询问是否允许许可条款
Do you approve the license terms? [yes|no]
>>> yes
在询问是否将anaconda路径加入到系统环境变量步骤，默认为no，设置为yes
Do you wish the installer to prepend the Anaconda2 install location
to PATH in your $path ? [yes|no]
[no] >>> yes
等待安装完毕即可
```

# 3、安装tensorflow

首先创建一个conda环境，命名为tensorflow
```javascript
conda create -n tensorflow python=3.x
然后激活该环境并在环境下安装tensorflow
source activate tensorflow
```
接下来为利用清华大学镜像进行安装，镜像地址为https://mirrors.tuna.tsinghua.edu.cn/help/tensorflow/，

可以根据需要自己选择想要安装的tensorflow版本，以下为本次安装的：
```javascript
pip install \  -i https://pypi.tuna.tsinghua.edu.cn/simple/ \  https://mirrors.tuna.tsinghua.edu.cn/tensorflow/linux/gpu/tensorflow_gpu-1.4.0-cp35-cp35m-linux_x86_64.whl
```
要注意对应的版本要和anaconda对应一致，由于本次安装的anaconda所需要的版本为python3.5所以为cp35，否则就出现错误：
`is not a supported wheel in this platform`

# 4、测试

安装完成javascript之后就可以进入进行测试
```javascript
source activate tensorflow
python3
import tensorflow as tf
(此处进行一个python程序的测试，直接运行python3 test.py进行测试即可，在测试过程中发现有部分库未安装再进行安装即可)
测试完成之后source deactivate
```
5、在安装配置过程中遇到的其他错误
（１）conda报错：'Could not connect to https://repo.continuum.io/pkgs/pro/linux-64'
执行conda命令：
`conda config`
更换安装源镜像，清华大学有提供镜像具体更换方法有如下：
```javascript
conda config --add channels 'https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/free/'
conda config --set show_channel_urls yes
```
然后使用vim.condarc命令打开文件，打开之后将 -defaults删除

（２）在使用python程序进行测试时易出现：Intel MKL FATAL ERROR: Cannot load libmkl_avx2.so or libmkl_def.so

输入这两条命令即可：
```javascript
conda install nomkl numpy scipy scikit-learn numexpr
conda remove mkl mkl-service
```
（３）在测试tensorflow时import tensorflow as tf 易出现的问题：
```javascript
can not find libcusolver.so.8.0:
ImportError: libcusolver.so.8.0: cannot open shared object file: No such file or directory
````
解决措施：

sudo vim ~/.bashrc
export LD_LIBRARY_PATH=/usr/local/cuda/lib64/
source ~/.bashrc