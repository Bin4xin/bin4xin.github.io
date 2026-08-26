---
layout: document
title: "DDoS 攻击应急响应技战法"
short_title: "概述"
order: 0
icon: "fas fa-bolt"
status: "new"
tags: [DDoS, 流量清洗, 应急响应, 业务保底, CDN]
author: sentryCyberSec
version: "2.0"
description: "DDoS 攻击应急响应技战法，涵盖攻击发现、流量清洗、业务保底和恢复复盘四个阶段。"
---

## 技战法概述

现代 DDoS 攻击的规模和复杂性不断升级，攻击带宽从最初的 Mbps 级已增长到 Tbps 级别。攻击类型也从早期的单一 SYN Flood、UDP Flood 发展为混合型攻击，将流量型攻击（Volumetric Attack）、协议型攻击（Protocol Attack）和应用层攻击（Application Layer Attack）组合使用，使得单一的防护手段难以应对。

### 四阶段技战法

| 阶段 | 名称 | 关键目标 |
|------|------|----------|
| 阶段一 | 攻击发现与紧急响应 | 通过监控系统快速发现 DDoS 攻击，启动应急响应流程 |
| 阶段二 | 流量清洗与分流 | 根据攻击类型和规模选择清洗方案，分离恶意流量 |
| 阶段三 | 业务保底运行 | 确保核心业务最低可用性 |
| 阶段四 | 恢复与复盘 | 全面恢复业务，总结经验教训 |

### DDoS 攻击三层分类

| 类型 | 英文 | 攻击目标 | 带宽占比 |
|------|------|----------|----------|
| 流量型 | Volumetric | 耗尽带宽 | 80% |
| 协议型 | Protocol | 耗尽连接资源 | 15% |
| 应用层 | Application | 耗尽处理能力 | 5% |

> 应用层虽带宽小但最难防护

### 典型攻击手法

| 攻击 | 类型 | 特征 |
|------|------|------|
| UDP Flood / DNS Amplification | 流量型 | 放大比 28-54x，Tbps 级流量 |
| SYN Flood / ACK Flood | 协议型 | 耗尽连接表，百万级并发 |
| TCP 慢速攻击 (Slowloris) | 协议型 | 低带宽高持久，模拟正常连接 |
| HTTP Flood / CC 攻击 | 应用层 | 高频 API 调用，模拟用户行为 |
| 混合型多向量攻击 | 混合 | 同时使用多种手法，动态切换 |

### 历史重大 DDoS 事件

| 年份 | 目标 | 峰值 | 攻击类型 |
|------|------|------|----------|
| 2018 | GitHub | 1.3 Tbps | Memcached 反射 |
| 2021 | Azure | 2.4 Tbps | UDP 反射 |
| 2022 | Azure | 3.47 Tbps | UDP 反射 |
| 2023 | Google | 71M RPS | HTTPS Flood |
