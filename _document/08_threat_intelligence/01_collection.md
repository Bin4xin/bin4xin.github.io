---
layout: document
title: "情报采集与标准化处理"
short_title: "采集标准化"
order: 1
icon: "fas fa-database"
status: "new"
tags: [威胁情报, IOC, STIX, 情报运营, 自动化]
author: "安全运营中心"
version: "1.0"
description: "威胁情报运营技战法，涵盖情报采集标准化、情报消费能力转化和内部情报生产闭环反馈三个阶段。"
---

## 场景 2 — 阶段一：情报采集与标准化处理

### 多源情报采集渠道

| 来源 | 说明 |
|------|------|
| 官方威胁情报 | CERT / 国家信息安全中心通报，CNVD / CNNVD 漏洞公告 |
| 商业情报源 | MISP / VirusTotal / 微步 / 奇安信 |
| 开源情报 (OSINT) | Twitter / Telegram 安全社区，GitHub 漏洞 PoC |
| 行业共享情报 | ISAC 行业安全联盟共享 |
| 暗网 / 深网监控 | 暗网论坛数据泄露监控，Telegram 黑产频道跟踪 |
| 内部情报源 | SOC 事件分析产出，安全设备日志提炼 |

### 标准化处理流程

1. **格式统一化**：不同来源格式统一转换为 STIX 2.1
2. **去重与合并**：相同 IOC 跨源去重，多个情报源的关联信息合并
3. **可信度评分**：来源可信度 × 时效性 × 相关性，TLP 标记：RED / AMBER / GREEN / CLEAR
4. **上下文富化**：IP → 归属 / ASN / 地理位置，域名 → 注册信息，Hash → 病毒家族 / 沙箱报告
5. **ATT&CK 映射**：关联攻击组织 / 技术 / 战术，构建攻击者画像

### STIX 2.1 格式示例

```json
{
  "type": "indicator",
  "name": "Cobalt Strike C2",
  "pattern": "[ipv4-addr:value = '185.x.x.42']",
  "valid_from": "2025-08-01",
  "labels": ["malicious-activity"],
  "confidence": 85,
  "external_references": [{
    "source": "mitre-attack",
    "external_id": "T1071.001"
  }]
}
```

### 基线工程关键设计

1. **角色分群**：同部门 / 同职级用户归为一群
2. **时间窗口**：短期基线 (7 天) 捕捉突变，长期基线 (90 天) 捕捉趋势
3. **排除噪声**：排除已知维护窗口 / 业务高峰
4. **敏感资产加权**：核心数据库 / 代码库 / 财务系统权重更高
5. **离职 / 转岗感知**：对接 HR 系统，离职期间自动提升监控等级

> 基线构建完成 → 进入阶段二：异常行为检测与狩猎
