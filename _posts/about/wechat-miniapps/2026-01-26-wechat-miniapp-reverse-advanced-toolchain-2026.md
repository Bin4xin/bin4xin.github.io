---
layout: about
category: about
Researchname: 微信小程序逆向III
toc: true
author: Bin4xin
permalink: /about/wechat-miniapp-reverse-advanced-toolchain/
desc: 「移动攻防」
---

# 微信小程序逆向III

主流工具全流程与 `KillWxapkg` 自动化实战

当你已熟练掌握基础的解包与动态 Hook 技术后，可引入自动化工具链提升逆向分析的效率。本文将介绍 2026 年主流的自动化逆向工具链，重点推荐 `KillWxapkg` 工具的完整使用方式。

## 推荐工具链对比

{: .table}
|工具|自动化程度|支持微信4.x|Hook能力|还原质量|推荐指数|
|---|---|---|---|---|---|
|wux1an/wxapkg|高|是|无|★★★★☆|★★★★★|
|zhuweiyou/wxapkg|极高|是|无|★★★★|★★★★☆|
|KillWxapkg|最高|是|内置通用 Hook|★★★★★|★★★★★|
|wxappUnpacker|中|部分|无|★★★|备用|
|r0capture|中|是|内存转储|★★★★|补充方案|

## KillWxapkg指南

### 工具优势

该工具的核心优势如下：

- 支持自动化扫描、解密、解包与工程目录还原的全流程处理

- 内置通用 Hook 点，覆盖 AES、RSA、MD5 等常见加密算法与`wx.request`请求接口

- 支持小程序分包自动合并

- 2026 年仍保持活跃更新，适配最新版本的微信

### 安装与运行

```bash
git clone https://github.com/Ackites/KillWxapkg
pip install -r requirements.txt
python main.py
```

### 常用命令

```bash
# 扫描本地所有已安装的小程序
python main.py scan
# 解包指定名称的小程序
python main.py unpack --name "小程序名称"
# Hook模式，自动提取加密密钥
python main.py hook --name "目标小程序"
```

运行完成后，将在`output/`目录下生成完整的小程序工程目录。

### 实战流程示例

1. 执行`scan`命令，扫描定位目标小程序

2. 执行`unpack`命令，完成小程序的自动解密与解包，生成工程目录

3. 将生成的工程目录导入微信开发者工具

4. 启动小程序，工具将自动输出 Hook 日志，提取加密相关信息

### 常见问题与优化建议

- 分包未自动合并：可添加`--merge`参数启用分包合并功能

- 解密失败：可先使用`wux1an/wxapkg`完成预解密，再进行后续操作

- Hook 无输出：可自定义 Frida 脚本，补充针对性的 Hook 点

- 微信更新导致缓存路径变更：可使用 Everything 工具搜索最新的`radium/Applet`目录定位缓存

---

## 自动化实战

- 构建 HTTPS 业务解密与协议复现流水线

> 本部分为高级篇的核心进阶内容，完成该阶段后，分析工作将从单次逆向升级为协议工程化分析。
> 

### 流水线目标

该流水线的目标为实现全自动化的分析流程：

- 小程序启动后自动提取加密密钥与初始向量

- 自动完成请求参数的加密处理

- 实现 HTTPS 接口的脚本化调用

- 全程无需人工值守，完成自动化分析

### 输出结构化

Hook 的输出可进行结构化处理，示例输出如下：

```text
[AES] key = 0123456789abcdef0123456789abcdef
[AES] iv  = fedcba9876543210
[AES] plain = {"uid":123,"token":"xxx"}
```

可将结构化的输出写入本地文件，方便后续自动化脚本读取：

```javascript
fs.appendFileSync(
  '/data/local/tmp/crypto_dump.json',
  JSON.stringify(obj) + '\n'
)
```

### 自动加载Key/IV

```python
import json
ctx = json.loads(open("crypto_dump.json").read().splitlines()[-1])
key = bytes.fromhex(ctx["key"])
iv  = bytes.fromhex(ctx["iv"])
```

### 自动化构造

```python
from Crypto.Cipher import AES
import base64, json, requests
def encrypt(data, key, iv):
    raw = json.dumps(data).encode()
    pad = 16 - len(raw) % 16
    raw += bytes([pad]) * pad
    return base64.b64encode(
        AES.new(key, AES.MODE_CBC, iv).encrypt(raw)
    ).decode()
payload = encrypt({"uid":123,"amount":100}, key, iv)
r = requests.post(
    "https://api.example.com/pay",
    json={"data": payload}
)
print(r.text)
```

### 技术结论

仅依靠 HTTPS、AES 与动态密钥的防护方案，在工程化的逆向分析面前，防护能力存在明显局限。

---

> \[\!NOTE\]
> 本文档对原始内容的格式与表述修正说明：
> 
> 1. 调整了工具对比表格的格式，统一了星级标识与列对齐，提升可读性。
> 
> 2. 调整了部分绝对化表述，将原文档中 “远远不够” 的主观表述调整为更严谨的技术结论，提升表述的严谨性。
> 
> 3. 标准化了术语表述，将 “内存 dump” 调整为 “内存转储”，统一了技术术语的规范。


{% include common-index/index-preset.html level="info" msg='<a href="/about/wechat-miniapp-reverse-expert-vm-bypass/">
👉 下一篇内容将进入字节码虚拟机、内存解密与反自动化对抗| More info reverse-expert-vm-bypass</a>' %}