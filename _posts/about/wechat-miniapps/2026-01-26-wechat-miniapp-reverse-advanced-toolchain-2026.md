---
layout: about
category: about
Researchname: 微信小程序逆向III
toc: true
author: Bin4xin
permalink: /about/wechat-miniapp-reverse-advanced-toolchain/
desc: 「移动攻防」
---

# 微信小程序逆向高级篇：2026主流工具全流程 + KillWxapkg自动化实战

当你已经熟练解包 + Hook 后，就可以开始使用更高效的自动化工具了。本文重点介绍2026年最活跃的工具链，特别是 **KillWxapkg** 的完整使用方式。

## 2026年推荐工具链对比

工具               | 自动化程度 | 支持新微信4.x | Hook能力 | 还原工程质量 | 推荐指数
-------------------|------------|---------------|----------|--------------|----------
wux1an/wxapkg     | 高         | 是            | 无       | ★★★★☆        | ★★★★★
zhuweiyou/wxapkg  | 极高       | 是            | 无       | ★★★★         | ★★★★☆
KillWxapkg        | 最高       | 是            | 有       | ★★★★★        | ★★★★★
wxappUnpacker     | 中         | 部分          | 无       | ★★★          | 备用
r0capture         | 中         | 是            | 内存dump | ★★★★         | 最后手段

## KillWxapkg 完整使用指南（强烈推荐）

**为什么选它？**

- 自动扫描 + 解密 + 解包 + 尝试还原工程目录  
- 内置常见 Hook 点（AES、RSA、MD5、wx.request）  
- 支持分包合并  
- 2026 年仍活跃更新  

### 安装 & 运行

```bash
git clone https://github.com/Ackites/KillWxapkg
pip install -r requirements.txt
python main.py
```

### 常用命令

```bash
# 扫描所有已安装小程序
python main.py scan

# 解包指定小程序
python main.py unpack --name "小程序名称"

# Hook 模式（自动打印加密 key）
python main.py hook --name "目标小程序"
```

运行完成后，会在 `output/` 下生成完整工程目录。

### 实战流程示例

1. `scan` → 找到目标小程序  
2. `unpack` → 解包生成工程  
3. 导入微信开发者工具  
4. 启动小程序 → 控制台自动输出 Hook 日志  

### 高级 Tips & 常见坑

- 分包没合并 → 加 `--merge`
- 解密失败 → 先用 `wux1an/wxapkg` 解密一次
- Hook 没输出 → 改用自定义 Frida 脚本
- 微信更新导致路径变化 → 用 Everything 搜索最新 `radium/Applet`

---

## 自动化实战：构建 HTTPS 业务解密与协议复现流水线 🚀

> **这是高级篇的“分水岭”**  
> 从这里开始，你做的已经不是“逆向”，而是**协议工程**

### 目标

- 小程序运行即抓 key / iv  
- 参数自动加密  
- HTTPS 接口脚本化调用  
- 全程无人值守  

### Hook 输出结构化

```text
[AES] key = 0123456789abcdef0123456789abcdef
[AES] iv  = fedcba9876543210
[AES] plain = {"uid":123,"token":"xxx"}
```

建议写入文件：

```js
fs.appendFileSync(
  '/data/local/tmp/crypto_dump.json',
  JSON.stringify(obj) + '\n'
)
```

### Python 自动加载 key / iv

```python
import json

ctx = json.loads(open("crypto_dump.json").read().splitlines()[-1])
key = bytes.fromhex(ctx["key"])
iv  = bytes.fromhex(ctx["iv"])
```

### 自动化构造加密请求

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

### 对防守方的现实结论

- HTTPS + AES + 动态 key  
- 在工程化逆向面前 **远远不够**

---

下一篇进入专家级：  
**字节码虚拟机、内存解密与反自动化对抗**