---
layout: about
category: about
toc: true
Researchname: 域名前置隐藏C2服务器
desc: 「Cobalt Stike」
author: Bin4xin
permalink: /about/Cobalt-Stike-C2-Server-hidden/
---

## cobaltstrike服务端配置

> *TIPS*: [查看Cobalt Stike服务器搭建](/about/Cobalt-Stike-Server-build-walkthrough/)

- 登录VPS启动`teamserver`
- 修改域名dns到Cloudflare
- 添加DNS A记录到teamserver监听的VPS 真实IP

![2022-02-19-1.43.26.png](https://image.yjs2635.xyz/images/2022/02/19/2022-02-19-1.43.26.png)

等待完成ping域名后已经接入CDN；

## cobaltstrike客户端配置

- 添加`Listeners` 并填写`host`和`port`
- Cloudflare HTTP端口 `80,8080,8880,2052,2082,2086,2095`
- Cloudflare HTTPs端口 `43,2053,2083,2087,2096,8443`

配置如下：

[![2022-02-19-1.18.45.md.png](https://image.yjs2635.xyz/images/2022/02/19/2022-02-19-1.18.45.md.png)](https://image.yjs2635.xyz/image/cuZa)

## 验证

> 生成木马 `payload=windows/beacon_http/reverse_http`

执行shell命令

```bash
beacon> shell ipconfig
```

在测试靶机里打开wireshark监听流量，流量已经发送到对应域名：

![2022-02-19-1.40.12.png](https://image.yjs2635.xyz/images/2022/02/19/2022-02-19-1.40.12.png)

## 返回

等待执行命令的返回包

![2022-02-19-1.34.52.png](https://image.yjs2635.xyz/images/2022/02/19/2022-02-19-1.34.52.png)

## 参考

- [反溯源-cs和msf域名上线](https://xz.aliyun.com/t/5728)
- [红队基础建设:隐藏你的C2 server](https://xz.aliyun.com/t/4509)
- [检测与隐藏Cobaltstrike服务器/#CDN](https://hosch3n.github.io/2020/12/16/%E6%A3%80%E6%B5%8B%E4%B8%8E%E9%9A%90%E8%97%8FCobaltstrike%E6%9C%8D%E5%8A%A1%E5%99%A8/#CDN)
- [C2服务器隐藏真实ip](https://www.kitsch.live/2021/04/14/c2%E6%9C%8D%E5%8A%A1%E5%99%A8%E9%9A%90%E8%97%8F%E7%9C%9F%E5%AE%9Eip/)
