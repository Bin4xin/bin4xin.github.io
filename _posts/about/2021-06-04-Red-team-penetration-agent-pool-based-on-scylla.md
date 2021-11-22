---
layout: about
category: about
Researchname: ATT&CK - 基于 scylla 的访问代理池
toc: true
author: Bin4xin
permalink: /about/Thousand-people-Thousand-faces-Red-team-penetration-agent-pool-based-on-scylla/
---

# 红队技术向：基于 scylla 的访问代理池搭建

>优点：手工burp渗透的同时，后台Xray扫描
>
>缺点：会被封IP，所以需要一个代理池或机场作为Xray的出口

运行逻辑：

![requestResponse-running-logic.png](https://i.loli.net/2021/11/12/nikoaX72SKrDAJ8.png)


## 一、Scylla Agent Pool

- [目前在`Ubuntu 18 、Darwin`下测试成功](#1x01-ubuntu--darwin)
    - [*Scylla V1.1.7 Download*](https://github.com/imWildCat/scylla/archive/refs/tags/1.1.7.zip){:target="_blank"}
    - [*Scylla 中文文档*](https://scylla.wildcat.io/zh/latest/){:target="_blank"}
- 2021年 6月10日 星期四 15时56分53秒 CST *WINDOWS*测试环境
    - [~~*Windows10*测试排坑失败 不推荐win环境下部署~~](#1x02-windows-10)

### *1x01 Ubuntu & Darwin*

```bash
➜ cd scylla-1.1.7
➜ python3 -m pip install -r requirements.txt
➜ export http_proxy="http://127.0.0.1:8082"; export HTTP_PROXY="http://127.0.0.1:8082"; export https_proxy="http://127.0.0.1:8082"; export HTTPS_PROXY="http://127.0.0.1:8082"
#需加上科学代理，否则报错WARNING: [Worker] Cannot get this url: 
#https://raw.githubusercontent.com/a2u/free-proxy-list/master/free-proxy-list.txt
➜ python3 -m scylla
2021-06-04 - 09:57:56 DEBUG: create new db connection
2021-06-04 - 09:57:57 INFO: Scheduler starts...
2021-06-04 - 09:57:57 DEBUG: feed 16 providers...
2021-06-04 - 09:57:57 INFO: Start python scheduler
2021-06-04 - 09:57:57 INFO: worker_process started
2021-06-04 - 09:57:57 INFO: validator_thread started
2021-06-04 - 09:57:57 INFO: Start the web server
[2021-06-04 09:57:57 +0800] [3848] [INFO] Goin' Fast @ http://0.0.0.0:8899
[2021-06-04 09:57:57 +0800] [3848] [ERROR] Unable to start server
···
···
···
2021-06-04 - 10:04:20 DEBUG: Get a provider from the provider queue: ProxyNovaProvider
2021-06-04 - 10:04:20 DEBUG: Catch requests.Timeout for proxy ip: 110.76.148.242
2021-06-04 - 10:04:21 DEBUG: Catch requests.Timeout for proxy ip: 160.19.232.85
2021-06-04 - 10:04:22 INFO:  ProxyNovaProvider: feed 0 potential proxies into the validator queue
2021-06-04 - 10:04:23 INFO:  PubproxyProvider: feed 5 potential proxies into the validator queue
```
看到`PubproxyProvider`返回提供的代理ip即可用：
```bash
#真实ip
➜ curl http://api.ipify.org                         
60.168.247.60
#代理池ip                              
➜ curl http://api.ipify.org -x http://127.0.0.1:8081
12.186.206.84
```

### *1x02 Windows 10*


- Could not find a version that satisfies the requirement pycurl==7.43.0.1
    - 1、[windows pip换源](https://blog.csdn.net/Artprog/article/details/75632723)
    - 2、修改`requirements.txt` pycurl==7.43.0.5
    - 3、`python3 -m pip install pycurl==7.43.0.5`
    - 4、`python3 -m pip install -r requirements.txt`
- Building wheel for multidict (PEP 517) ... error
    -   ```bash
        #详细报错：
        error: Microsoft Visual C++ 14.0 or greater is required. Get it with "Microsoft C++ Build Tools": https://visualstudio.microsoft.com/visual-cpp-build-tools/
          ----------------------------------------
          ERROR: Failed building wheel for multidict
        ```
    - 安装 VS C++ 14以上版本即可
        - `python3 -m pip install --upgrade setuptools`
        - [*Microsoft Build Tools for Visual Studio 2019 集成开发环境 (IDE)*](https://visualstudio.microsoft.com/zh-hans/downloads/)
        - 下载`Community`版；选择组件参考：
        ![](https://pic3.zhimg.com/v2-d9b62b311a453bfb5364e1fec5fe23c2_r.jpg)
- npm install
    ```bash
    C:\Windows>npm -v
    7.15.1
    
    C:\Windows>node -v
    v16.3.0
    
    npm ERR! code 1
    npm ERR! path C:\Users\bin4xin\Desktop\scylla\node_modules\deasync
    npm ERR! command failed
    npm ERR! command C:\Windows\system32\cmd.exe /d /s /c node ./build.js
    npm ERR! gyp info it worked if it ends with ok
    npm ERR! gyp info using node-gyp@3.8.0
    npm ERR! gyp info using node@16.3.0 | win32 | ia32
    npm ERR! gyp ERR! configure error
    npm ERR! gyp ERR! stack Error: Command failed: C:\Python39\python.EXE -c import sys; print "%s.%s.%s" % sys.version_info[:3];
    npm ERR! gyp ERR! stack   File "<string>", line 1
    npm ERR! gyp ERR! stack     import sys; print "%s.%s.%s" % sys.version_info[:3];
    ```
看到上面的`C:\Python39\python.EXE -c import sys; print "%s.%s.%s" % sys.version_info[:3];`报错，实际上正确的写法应该是：
```bash
Type "about", "copyright", "credits" or "license" for more information.
>>> import sys
>>> print("%s.%s.%s" % sys.version_info[:3])
3.8.5
```
想到几种可能性：1、scylla python的源码；2、npm安装源码依赖导致；顿时觉得这里面的坑深不可测我把握不住，遂放弃在windows平台搭建；
由于在macosOS、Ubuntu上搭建成功，只能走曲线救国方式，在docker中尝试；



## BurpSuite with Agent Pool

<kbd>Proxy Listeners</kbd> -> 127.0.0.1 8081端口

https://www.rmccurdy.com/.scripts/proxy/good.txt

- ![burp-with-agentPool.png](https://i.loli.net/2021/11/12/2T9IOf1R68KPaHV.png)


## passive-scan-client

```bash
➜ git clone https://github.com/c0ny1/passive-scan-client
➜ cd passive-scan-client
➜ mvn package
➜ ls target/      
archive-tmp                                       maven-archiver                                    passive-scan-client-0.1.jar
classes                                           maven-status
generated-sources                                 passive-scan-client-0.1-jar-with-dependencies.jar
```
`passive-scan-client-0.1-jar-with-dependencies.jar`导入Burp Suite：

- <kbd>Extender</kbd> -> <kbd>Extensions</kbd> -> <kbd>Add</kbd>
    - `{/path-to-taget-dir/passive-scan-client-0.1-jar-with-dependencies.jar`
    
配置转发扫描端口
- ![passive-scan-client-config.png](https://i.loli.net/2021/11/12/pgP2ztx4vimeZBu.png)

## xray with Agent Pool

- 扫描配置 
    - 浏览器配置代理`http(s)://127.0.0.1:12344`  Burp Suite 监听 12344
    - passive-scan-client如上配置
    - xray 如下配置即可

```bash
➜ nohup ./xray webscan --listen 127.0.0.1:7777 --html-output output/2021-05/2021-05-28.html &
➜ tail -f nohup.out
```
效果：

![截屏2021-11-12 上午11.31.19.png](https://i.loli.net/2021/11/12/DT9S1fyBF6PwGo8.png)

## 参考

---
- [burp流量转发插件PSC+xray/w13scan实现被动扫描](https://www.cnblogs.com/Rain99-/p/12531370.html)
- [xray + passive-scan-client 配置](http://wp.blkstone.me/2020/04/xray-config/)

以上。