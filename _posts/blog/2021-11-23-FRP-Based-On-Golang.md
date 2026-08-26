---
layout: post
wrench: 2026-08-26
Researchname: FRP Based On Golang
author: Bin4xin
categories:
    - blog
toc: true
tags:
    - Golang
    - FRP
    - NAT
---

# FRP Based On Golang

{% include common-index/index-preset.html level="info" msg="frp 是一个专注于内网穿透的高性能的反向代理应用，支持 TCP、UDP、HTTP、HTTPS等多种协议。可以将内网服务以安全、便捷的方式通过具有公网 IP 节点的中转暴露到公网。" %}

## FRP 介绍
通过在具有公网 IP 的节点上部署 frp 服务端，可以轻松地将内网服务穿透到公网，同时提供诸多专业的功能特性，这包括：

- 客户端服务端通信支持 TCP、KCP 以及 Websocket 等多种协议。
- 采用 TCP 连接流式复用，在单个连接间承载更多请求，节省连接建立时间。
- 代理组间的负载均衡。
- 端口复用，多个服务通过同一个服务端端口暴露。
- 多个原生支持的客户端插件（静态文件查看，HTTP、SOCK5 代理等），便于独立使用 frp 客户端完成某些工作。
- 高度扩展性的服务端插件系统，方便结合自身需求进行功能扩展。
- 服务端和客户端 UI 页面。

## 下载链接

{% include components/download-panel.html
  title="FRP v0.39.1"
  version="v0.39.1"
  id="frp-dl"
  note="根据实际服务器架构选择对应版本"
  mirrors=site.data.downloads.frp-039
  verify=site.data.verify.frp-039
%}

## Q & A

- [怎么远程关闭FRPC端？ #2391](https://github.com/fatedier/frp/issues/2391)

{% include common-index/index-preset.html level="success" msg="可以通过将 frpc 的 admin 界面通过 frps 代理出来，然后通过这个代理的界面来操作 frpc。这样这个需求就变成 frpc 的管理界面提供一个关闭自身的方法" %}
