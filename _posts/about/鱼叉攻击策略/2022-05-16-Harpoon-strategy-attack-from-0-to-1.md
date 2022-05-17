---
layout: about
category: about
Researchname: 鱼叉攻击策略落地：从零到一
toc: true
wrench: 2022-05-17
author: Bin4xin
permalink: /about/Harpoon-strategy-attack-from-0-to-1/
desc: 「鱼叉攻击策略」
---

### 邮件网关的选择

- [鱼叉攻击策略落地：邮件网关应用](/about/2022-05-17-Harpoon-strategy-attack-EmailGateway-usage/)
- [钓鱼邮件的投递和伪造](https://xz.aliyun.com/t/6325#toc-4)
- 提高送达成功率
  - 适当控制发信的频率，如果短时间内向同一个邮箱地址发信，也会容易被标记为垃圾邮件。最好向同一邮箱发信间隔在2-5天
  - 将较大的收件人列表分割成若干个小的，分时间段发送
  - 使用变量，一般来说，邮件服务器多次收到来自同一个邮件IP地址的相同内容邮件，很容易就被判定为垃圾邮件。在进行邮件编辑时，多采用变量设置，像公司名、收件人，可以进行变量添加，避免邮件内容完全一致

### 载荷/Cobalt Stike

- [Cobalt Stike备忘录 I: COBALT STIKE服务器搭建历程](/about/Cobalt-Stike-Server-build-walkthrough/)
- [Cobalt Stike备忘录 II: COBALT STIKE服务器隐藏真实IP](/about/Cobalt-Stike-hidden-true-ip/)
- [CS上线木马免杀入门](/about/Cobalt-Stike-beacon-bypass-walkthrough/)

这一部分是我们邮件中的payload/载荷，钓鱼邮件不管是发送附件上线还是钓鱼网站，我们总要对输出的"产品"接近完善，不管哪一类，都需要一个好的文案来让目标点击或者下载。

### 发文

- 信息搜集确定用户/员工邮箱靶标
- 确定发文内容
  - 发文单位
  - 常见发文口吻
  - 发文域名伪造

上面两个小节其实有很多细节可以深究，包括CS端的指纹去除防止被网络测绘，CDN上线等等。

### 参考

- [钓鱼邮件的投递和伪造](https://xz.aliyun.com/t/6325){:target="_blank"}
- [SendCloud API DOCS](https://www.sendcloud.net/doc/){:target="_blank"}
- [punycode](https://www.charset.org/punycode){:target="_blank"}