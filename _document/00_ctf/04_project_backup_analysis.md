---
layout: document
title: "project_backup.zip 逆向分析报告 - Git 仓库取证"
short_title: "Git备份分析"
order: 4
icon: "fas fa-code-branch"
status: "new"
tags: [2026-IDSS-CN, 取证, Git, 隐写, QR码, 跨通道异或]
author: "opencode"
date: "2026-09-21"
version: "2.0"
---

## 文件结构总览

`project_backup.zip` 是一个 Git 仓库备份压缩包，解压后为一个名为 `project_backup` 的 Git 仓库：

```
project_backup/
├── .git/
│   ├── HEAD                        # ref: refs/heads/main
│   ├── COMMIT_EDITMSG              # "automated banner render 3"
│   ├── config                      # user: Archive Bot <archive@example.invalid>
│   ├── packed-refs                 # (空，无 packed 引用)
│   ├── info/refs                   # 包含 design/archive 分支引用
│   ├── refs/heads/main             # 89316b336e58ddc69d8179c4b602891615d51054
│   ├── logs/HEAD                   # (空文件)
│   ├── logs/refs/heads/main        # (空文件)
│   └── objects/pack/
│       ├── pack-c8909541...e0d.idx # 1436 bytes
│       └── pack-c8909541...e0d.pack # 372,178 bytes
├── README.md                       # "# Banner service\nCurrent production branch."
└── banner.png                      # 3,147 bytes (main 分支版本)
```

| 文件 | 大小 | 说明 |
|------|------|------|
| `project_backup.zip` | 375,803 bytes | ZIP 压缩包 |
| `banner.png` (工作区) | 3,147 bytes | main 分支的 banner（全白图） |
| `.git/objects/pack/*.pack` | 372,178 bytes | Git 对象包（含 13 个对象） |
| `README.md` | 45 bytes | "# Banner service\nCurrent production branch." |

---

## Git 仓库结构分析

### 分支与引用

| 引用 | 类型 | SHA-1 | 说明 |
|------|------|-------|------|
| `refs/heads/main` | 分支 | `89316b336e58ddc69d8179c4b602891615d51054` | 当前工作区分支（production） |
| `refs/heads/design/archive` | 隐藏分支 | `be7aaf7e82a116eacb436b14835541dfe9fd5778` | 通过 `.git/info/refs` 暴露 |

> **发现隐蔽分支**：`design/archive` 分支未在 `refs/heads/` 目录下创建文件，而是仅记录在 `.git/info/refs` 中。常规 `git branch` 命令可以看到它，但如果只检查 `.git/refs/heads/` 目录则会遗漏。

### 提交历史

```
* be7aaf7 automated banner render 3     (design/archive)
* b31a305 automated banner render 2      (dangling)
* 2bfddca automated banner render 1      (dangling)
| * 89316b3 initial production snapshot  (main)
|/
(无共同祖先 - root commit 为 main)
```

提交链拓扑：
- **main** (`89316b3`): root commit，无 parent
- **render1** (`2bfddca`): parent = main (`89316b3`)
- **render2** (`b31a305`): parent = render1 (`2bfddca`)
- **render3** (`be7aaf7`): parent = render2 (`b31a305`)，design/archive 分支指向此提交

> **悬空提交**：render1 和 render2 不被任何分支直接引用，只能通过 pack 文件或 `design/archive` 的 parent 链访问。

### 提交者信息

所有提交由同一作者创建：

| 字段 | 值 |
|------|-----|
| Name | `Archive Bot` |
| Email | `archive@example.invalid` |
| Timestamp | `1786147688 +0800`（2026-08-08 08:08:08 CST） |
| Committer | 与 author 相同 |

所有 4 个提交的时间戳完全相同，表明是脚本化批量操作。

### Git 对象清单

Pack 文件包含 13 个对象：

| SHA-1 | 类型 | 大小 | 说明 |
|-------|------|------|------|
| `89316b3` | commit | 202 | initial production snapshot (main) |
| `2bfddca` | commit | 248 | automated banner render 1 |
| `b31a305` | commit | 248 | automated banner render 2 |
| `be7aaf7` | commit | 248 | automated banner render 3 (design/archive) |
| `d279c06` | tree | 75 | main 的文件树 |
| `59d32b2` | tree | 75 | render1 的文件树 |
| `d191ad2` | tree | 75 | render2 的文件树 |
| `0c9d6eb` | tree | 75 | render3 的文件树 |
| `5b7d76e` | blob | 45 | README.md（所有版本相同） |
| `e8c8136` | blob | 3,147 | banner.png v0（main，全白） |
| `b41e22b` | blob | 126,572 | banner.png v1（render1） |
| `383ab1f` | blob | 126,576 | banner.png v2（render2） |
| `1c068d0` | blob | 126,687 | banner.png v3（render3） |

---

## Banner 图像分析

### 版本对比

| 版本 | Commit | 大小 | 尺寸 | 颜色数 | 描述 |
|------|--------|------|------|--------|------|
| v0 | main (`89316b3`) | 3,147 bytes | 720x720 | 1 (全白) | 初始版本，纯白背景 |
| v1 | render1 (`2bfddca`) | 126,572 bytes | 720x720 | 8 (3-bit RGB) | 第一次自动渲染 |
| v2 | render2 (`b31a305`) | 126,576 bytes | 720x720 | 8 (3-bit RGB) | 第二次自动渲染 |
| v3 | render3 (`be7aaf7`) | 126,687 bytes | 720x720 | 8 (3-bit RGB) | 第三次自动渲染（design/archive） |

### 图像格式详情

```
PNG format: 8-bit/color RGB, non-interlaced
IHDR: 720x720, bitdepth=8, colortype=2 (RGB)
Compression: zlib/deflate (0x789c = default level)
```

### 颜色调色板（v1-v3 通用）

v0 为纯白图（所有像素 RGB(255,255,255)）。v1-v3 均使用以下 8 种颜色：

| 颜色值 | RGB | 二进制 | 描述 |
|--------|-----|--------|------|
| 0 | (0, 0, 0) | 000 | 黑色 |
| 1 | (0, 0, 255) | 001 | 蓝色 |
| 2 | (0, 255, 0) | 010 | 绿色 |
| 3 | (0, 255, 255) | 011 | 青色 |
| 4 | (255, 0, 0) | 100 | 红色 |
| 5 | (255, 0, 255) | 101 | 品红色 |
| 6 | (255, 255, 0) | 110 | 黄色 |
| 7 | (255, 255, 255) | 111 | 白色 |

每个像素可视为一个 3-bit 值（0-7），整张图像可编码 720×720×3 = 1,555,200 bits = 194,400 bytes 数据。

### 图像内容分析

对 v1-v3 的像素分布进行了以下分析：

1. **颜色分布**：8 种颜色均匀分布，无单一颜色占比异常
2. **像素自相关性**：测试了 2-360 像素的各种周期，匹配率均在 12.5%（1/8）左右，符合随机噪声特征
3. **QR 码检测**：在多种模块尺寸（1-10px）下均未发现 QR 码定位标记（finder pattern）
4. **可读文本**：各通道提取的 ASCII 数据中未发现 8 字符以上的可读字符串

### PNG 结构验证

| 检查项 | v0 | v1 | v2 | v3 |
|--------|-----|-----|-----|-----|
| IEND 后附加数据 | 无 | 无 | 无 | 无 |
| zlib 流后附加数据 | 无 | 无 | 无 | 无 |
| 异常 chunk | 无 | 无 | 无 | 无 |
| IDAT 分段 | 1 (3090B) | 2 (65536+60967) | 2 (65536+60971) | 2 (65536+61082) |
| Filter 类型 | Sub(1)+Up(2) | Sub+Up+Paeth(4) | Sub+Up+Paeth | Sub+Up+Paeth |

> v1-v3 的 IDAT 被分割为 64KB + 剩余两段，这是 zlib 压缩的常见行为，无异常。

### Steganography 尝试（单图分析，均未成功）

尝试了以下单图隐写分析方法，均未提取出有效数据：

| 方法 | 尝试内容 | 结果 |
|------|----------|------|
| LSB 提取 | 各通道单独提取 1-bit 数据 | 纯噪声，无文件签名或可读文本 |
| 多图位平面组合 | v1(bit0) + v2(bit1) + v3(bit2) → 灰度图 | 噪声图像，无可视图案 |
| 同通道 XOR | v1⊕v2, v2⊕v3, v1⊕v2⊕v3（同通道） | 仍为 8 色噪声 |
| 八进制编码 | 每像素 3-bit → 八进制数字 → 字节 | 无有效文件签名 |
| 行/列优先遍历 | row-major 与 column-major 两种顺序 | 均无发现 |
| Filter 字节提取 | 将 PNG scanline filter 类型 (0-4) 作为数据 | 无可读内容 |
| Bit 顺序 | MSB-first 与 LSB-first 两种排列 | 均无文件签名 |

---

## Git 取证发现

### 隐藏分支发现过程

1. `git branch -a` 仅显示 `main` 分支
2. `.git/refs/heads/` 目录下仅有 `main` 文件
3. `.git/info/refs` 文件包含两个引用：
   - `89316b3...` → `refs/heads/main`
   - `be7aaf7...` → `refs/heads/design/archive`
4. 通过 `git update-ref refs/heads/design/archive be7aaf7` 创建分支引用后，`git checkout design/archive` 成功切换

### 悬空提交发现

Pack 文件中的 4 个 commit 对象中，render1 (`2bfddca`) 和 render2 (`b31a305`) 不被任何分支直接引用：

```
git verify-pack -v pack-c8909541...idx

be7aaf7e82a116eacb436b14835541dfe9fd5778 commit 248 165 12   # design/archive
89316b336e58ddc69d8179c4b602891615d51054 commit 202 136 177   # main
2bfddca0a56f7f5f6aaac60b06ac58b41de6d004 commit 248 165 313   # 悬空
b31a305c11f473991a7c326e8bd0e769e384cb4f commit 248 164 478   # 悬空
```

### Reflog 异常

| 文件 | 预期 | 实际 |
|------|------|------|
| `.git/logs/HEAD` | 包含操作记录（config 中 `logallrefupdates = true`） | 空文件 (0 bytes) |
| `.git/logs/refs/heads/main` | 包含操作记录 | 空文件 (0 bytes) |

> Reflog 被清空或从未启用，但 config 中明确设置了 `logallrefupdates = true`，这表明 reflog 被人为清除。

### Git 配置

```ini
; @hl 5
[core]
    repositoryformatversion = 0
    filemode = true
    bare = false
    logallrefupdates = true    # 启用 reflog，但实际为空
    ignorecase = true
    precomposeunicode = true
[user]
    name = Archive Bot
    email = archive@example.invalid
```

---

## 分析总结

```
┌──────────────────────────────────────────────────────────┐
│              project_backup.zip 分析画像                  │
├──────────────────────────────────────────────────────────┤
│  文件类型: ZIP 压缩包 → Git 仓库备份                      │
│  仓库类型: 非裸仓库 (working tree + .git)                 │
│  分支数量: 2 (main + design/archive)                      │
│  提交数量: 4 (含 2 个悬空提交)                             │
│  Git 对象: 13 (4 commit + 4 tree + 5 blob)               │
│  文件数量: 2 (README.md + banner.png)                     │
├──────────────────────────────────────────────────────────┤
│  取证发现:                                               │
│  1. 隐藏分支 design/archive (仅存于 info/refs)            │
│  2. 2 个悬空提交 (render1, render2)                       │
│  3. Reflog 被清空 (与 config 矛盾)                        │
│  4. banner.png 有 4 个版本，v0→v3 内容逐次变化             │
│  5. v0 = 全白图, v1-v3 = 8 色随机噪声图                    │
├──────────────────────────────────────────────────────────┤
│  Flag 提取:                                              │
│  方法: 跨通道异或 (v1.R ⊕ v2.G ⊕ v3.B) → QR 码           │
│  工具: Pillow + numpy + OpenCV QRCodeDetector            │
│  结果: flag{unreachable_does_not_mean_deleted}            │
└──────────────────────────────────────────────────────────┘
```

### 解题路径回顾

```
project_backup.zip
    │
    ├── 解压 → Git 仓库
    │
    ├── 发现 .git/info/refs 中的 design/archive 隐藏分支
    │
    ├── git verify-pack → 发现 4 个 commit (含 2 个悬空)
    │
    ├── 恢复 4 个版本的 banner.png:
    │   ├── v0 (main):         全白 720x720
    │   ├── v1 (render1):      8 色噪声 720x720
    │   ├── v2 (render2):      8 色噪声 720x720
    │   └── v3 (render3):      8 色噪声 720x720
    │
    ├── 单图分析 (zsteg/steghide/binwalk/LSB): 全部失败
    │
    └── 跨通道异或:
        v1[:,:,0] (R)  ⊕  v2[:,:,1] (G)  ⊕  v3[:,:,2] (B)
        → 720x720 二值 QR 码
        → cv2.QRCodeDetector().detectAndDecode()
        → flag{unreachable_does_not_mean_deleted}
```

### 考点总结

| 考点 | 说明 |
|------|------|
| **Git 取证** | 悬空提交恢复、隐藏分支发现、info/refs 引用 |
| **多图隐写** | QR 码被拆分到 3 张图的不同颜色通道，单图分析无效 |
| **跨通道异或** | v1.R ⊕ v2.G ⊕ v3.B 还原 QR 码，非传统 LSB 方法 |
| **QR 码识别** | 使用 OpenCV 自动解码，无需人工识别 |
| **Flag 寓意** | "unreachable does not mean deleted" 呼应 Git 悬空对象主题 |

### 工具分析

获取 sudo 权限后安装了 zsteg、steghide、outguess、binwalk、Pillow、numpy、opencv 等工具：

| 工具 | 分析对象 | 结果 |
|------|----------|------|
| **zsteg** | v1-v3 原始 PNG + 360x360 缩小版 | 无有效数据（误报 MPEG/TeX/OpenPGP） |
| **steghide** (BMP) | v0-v3 BMP 格式，11 种密码 | 全部 "could not extract any data" |
| **outguess** | v1-v3 PNG/BMP | "Unknown data type" 格式不支持 |
| **stepic** | v1, v3 PNG | 提取出少量无意义字节 |
| **binwalk** | v0-v3 PNG | 仅标准 PNG + zlib，无嵌入文件 |
| **Pillow + numpy** | 像素分布 / FFT 频域 | 确认随机噪声，无周期性 |
| **FFT 频域分析** | v1-v3 像素值 2D 傅里叶变换 | 无显著峰值，无周期性 |

> zsteg 对单张 PNG 的 LSB 穷举未能发现数据，因为关键信息不是藏在单图中，而是需要跨图跨通道组合。

---

## Flag 提取：跨通道异或还原 QR 码

### 核心原理

三张噪声图像看似无关，但实际上 QR 码数据被分散到了三个图像的不同颜色通道中。关键操作是：

**取 v1 的 R 通道、v2 的 G 通道、v3 的 B 通道进行三通道异或**，噪声相互抵消，还原出隐藏的 QR 码。

### 提取代码

```python
from PIL import Image
import numpy as np
import cv2

paths = ["banner_v1.png", "banner_v2.png", "banner_v3.png"]
ims = [np.array(Image.open(p).convert("RGB")) for p in paths]

# 三张图分别取 R、G、B 通道做异或
mask = (
    (ims[0][:, :, 0] > 0)    # v1 的 R 通道
    ^ (ims[1][:, :, 1] > 0)  # v2 的 G 通道
    ^ (ims[2][:, :, 2] > 0)  # v3 的 B 通道
).astype(np.uint8)

img = (1 - mask) * 255  # 反色（QR 码需要黑底白码或白底黑码）
Image.fromarray(img).save("qr.png")

data, _, _ = cv2.QRCodeDetector().detectAndDecode(img)
print(data)
```

### 提取过程

```
v1 (R channel)  ──┐
                  ├── XOR ──→ 二值图像 (QR 码) ──→ cv2.QRCodeDetector ──→ flag
v2 (G channel)  ──┤
                  │
v3 (B channel)  ──┘
```

1. 从 `design/archive` 分支及其 parent 链恢复 v1、v2、v3 三个版本的 `banner.png`
2. 每张图取不同颜色通道（v1→R, v2→G, v3→B），二值化（`> 0` → `True/False`）
3. 三个通道做 XOR 运算，噪声抵消，还原出 720x720 的 QR 码
4. 反色后用 OpenCV `QRCodeDetector` 解码

### 提取结果

```
flag{unreachable_does_not_mean_deleted}
```

### Flag 含义

> `unreachable does not mean deleted`（不可达不等于已删除）

这句 flag 直接点明了本题的核心考点——**Git 悬空对象的取证**：

- Git 中被"删除"的分支/提交仍然是 **reachable**（可达的），只要它们存在于 pack 文件中
- `render1` 和 `render2` 两个提交不被任何分支直接引用（unreachable），但并未被删除
- 通过 `git verify-pack` 或 `.git/info/refs` 仍可恢复这些"不可达"的对象
- 三个版本的 `banner.png` 藏在这些"不可达"的提交中，组合后还原出 flag

### 为什么单图分析失败

| 分析维度 | 失败原因 |
|----------|----------|
| 单图 LSB 提取 | 每张图都是完整 QR 码 + 随机噪声的叠加，单图看全是噪声 |
| 同通道跨图 XOR | v1(R)⊕v2(R) 仍为噪声，因为 QR 码只藏在 R⊕G⊕B 的组合中 |
| zsteg 自动穷举 | zsteg 只分析单张图像，不做跨图跨通道组合 |
| steghide | steghide 不支持 PNG 格式，BMP 版也无数据（隐写方式不是 steghide 类型） |
| 位平面叠加 | v1(bit0)+v2(bit1)+v3(bit2) 得到 8 级灰度，不是 QR 码的二值结构 |

> 关键洞察：QR 码的每个像素被拆成 3 个 bit，分别嵌入到 3 张图的不同颜色通道中。单张图看每个通道都是 50% 随机噪声（因为 QR 码的黑白大约各占 50%），三通道异或后噪声抵消，QR 码显现。

## 核心方法论

```
┌─────────────────────────────────────────────────┐
│              CTF 取证与隐写方法论                  │
├─────────────────────────────────────────────────┤
│                                                 │
│  1. 识别 → file / binwalk / strings              │
│                                                 │
│  2. 分类 → 二进制 / Git / 图像 / 文本              │
│                                                 │
│  3. 工具 → zsteg / steghide / checksec / GDB     │
│                                                 │
│  4. 关联 → 多文件关联 / 多图组合 / 时间戳            │
│                                                 │
│  5. 穷举 → 跨通道异或 / 位平面 / 密码爆破            │
│                                                 │
│  6. 验证 → QR 解码 / 文件签名 / zlib 解压          │
│                                                 │
└─────────────────────────────────────────────────┘
```