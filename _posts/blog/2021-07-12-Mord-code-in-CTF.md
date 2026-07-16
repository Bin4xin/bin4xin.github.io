---
layout: post
toc: true
title: "「CTF」:Morse编码与CTF中的常见编码题解"
wrench: 2021-07-15
author: Bin4xin
categories:
    - blog
    - CTF
    - 笔记
    - Python
    - 密码学
permalink: /blog/2021/morse-code-ctf/
---

> CTF比赛中，编码类题目是最基础也是最常考的题型之一。本文记录Morse编码的原理与Python脚本实现，以及CTF中常见的编码类型汇总。

## 0x00 摩尔斯电码（Morse Code）

### 原理

摩尔斯电码是一种时通时断的信号代码，通过不同的排列顺序来表达不同的英文字母、数字和标点符号：

```
A  .-      B  -...    C  -.-.    D  -..
E  .       F  ..-.    G  --.     H  ....
I  ..      J  .---    K  -.-     L  .-..
M  --      N  -.      O  ---     P  .--.
Q  --.-    R  .-.     S  ...     T  -
U  ..-     V  ...-    W  .--     X  -..-
Y  -.--    Z  --..

0  -----   1  .----   2  ..---   3  ...--
4  ....-   5  .....   6  -....   7  --...
8  ---..   9  ----.
```

### 常见分隔方式

| 分隔符 | 说明 |
|--------|------|
| `/` 或 `\|` | 分隔字母 |
| ` `（空格） | 分隔单词 |
| `.` 和 `-` | 点和划 |

> **CTF中注意**：题目可能用`0`和`1`代替`.`和`-`，或者用`/`和空格的组合来分隔。

## 0x01 Python实现Morse编解码

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-

# Morse编码字典
CHAR_TO_MORSE = {
    'A': '.-',    'B': '-...',  'C': '-.-.',  'D': '-..',
    'E': '.',     'F': '..-.',  'G': '--.',   'H': '....',
    'I': '..',    'J': '.---',  'K': '-.-',   'L': '.-..',
    'M': '--',    'N': '-.',    'O': '---',   'P': '.--.',
    'Q': '--.-',  'R': '.-.',   'S': '...',   'T': '-',
    'U': '..-',   'V': '...-',  'W': '.--',   'X': '-..-',
    'Y': '-.--',  'Z': '--..',
    '0': '-----', '1': '.----', '2': '..---', '3': '...--',
    '4': '....-', '5': '.....', '6': '-....', '7': '--...',
    '8': '---..', '9': '----.',
    '.': '.-.-.-', ',': '--..--', '?': '..--..', '!': '-.-.--',
    '/': '-..-.',  '(': '-.--.', ')': '-.--.-', '&': '.-...',
    ':': '---...', ';': '-.-.-.', '=': '-...-',  '+': '.-.-.',
    '-': '-....-', '_': '..--.-', '"': '.-..-.', "'": '.----.',
    '@': '.--.-.',
}

MORSE_TO_CHAR = {v: k for k, v in CHAR_TO_MORSE.items()}

def encode_morse(text):
    """将文本编码为Morse电码"""
    text = text.upper()
    result = []
    for char in text:
        if char == ' ':
            result.append('/')
        elif char in CHAR_TO_MORSE:
            result.append(CHAR_TO_MORSE[char])
    return ' '.join(result)

def decode_morse(morse_code):
    """将Morse电码解码为文本"""
    # 支持 / 或 | 作为单词分隔
    morse_code = morse_code.replace('|', '/')
    words = morse_code.strip().split('/')
    result = []
    for word in words:
        chars = word.strip().split(' ')
        decoded_word = ''
        for char in chars:
            if char in MORSE_TO_CHAR:
                decoded_word += MORSE_TO_CHAR[char]
            elif char == '':
                continue
            else:
                decoded_word += '?'
        result.append(decoded_word)
    return ' '.join(result)

if __name__ == '__main__':
    import sys
    if len(sys.argv) < 2:
        print("用法: python morse.py <encode|decode> <text>")
        print("示例: python morse.py encode 'HELLO WORLD'")
        print("示例: python morse.py decode '.... . .-.. .-.. --- / .-- --- .-. .-.. -..'")
        sys.exit(1)

    mode = sys.argv[1]
    text = sys.argv[2]

    if mode == 'encode':
        print(encode_morse(text))
    elif mode == 'decode':
        print(decode_morse(text))
```

### 使用示例

```bash
# 编码
$ python morse.py encode 'HELLO WORLD'
.... . .-.. .-.. --- / .-- --- .-. .-.. -..

# 解码
$ python morse.py decode '.... . .-.. .-.. --- / .-- --- .-. .-.. -..'
HELLO WORLD
```

## 0x02 enumerate在CTF脚本中的应用

在编写CTF解题脚本时，`enumerate`函数常用于遍历带索引的数据：

```python
# enumerate基础用法
>>> for num, i in enumerate(range(104)):
...     print(i)
0
1
2
...
103
# 输出i的值为0-103

# 实际应用：遍历Morse编码的每个字符
>>> morse = ".... . .-.. .-.. ---"
>>> for idx, char in enumerate(morse):
...     if char == '.':
...         print(f"位置{idx}: dot")
...     elif char == '-':
...         print(f"位置{idx}: dash")
位置0: dot
位置1: dot
位置2: dot
位置3: dot
位置5: dot
位置7: dot
...
```

```python
# 枚举flag的每个字符进行编码
>>> flag = "flag{m0rs3_c0d3_1s_fun}"
>>> encoded = encode_morse(flag)
>>> for i, c in enumerate(encoded.split(' ')):
...     print(f"[{i}] {c} -> {MORSE_TO_CHAR.get(c, '?')}")
[0] ..-. -> F
[1] .-.. -> L
[2] .- -> A
[3] --. -> G
...
```

## 0x03 CTF中常见编码类型汇总

### 1. Base系列编码

{:.table}
| 编码 | 特征 | 字符集 |
|------|------|--------|
| Base16 | 全大写字母+数字 | `0-9A-F` |
| Base32 | 大写字母+数字，末尾`=`填充 | `A-Z2-7=` |
| Base64 | 大小写字母+数字+`+/=` | `A-Za-z0-9+/=` |
| Base58 | 无`0OIl+/=` | `1-9A-HJ-NP-Za-km-z` |
| Base85 | ASCII可打印字符 | `!-u` |

### 2. 古典密码

{:.table}
| 密码 | 特点 | 解法 |
|------|------|------|
| 凯撒密码 | 字母位移 | 暴力枚举26种偏移 |
| ROT13 | 固定位移13 | 直接解码 |
| 维吉尼亚密码 | 多表替换 | 需要密钥 |
| 栅栏密码 | 字母分栏排列 | 枚举栏数 |
| 培根密码 | 二进制编码 | 5个字母为一组 |

### 3. 现代编码

{:.table}
| 编码 | 工具 |
|------|------|
| URL编码 | `%xx`形式 |
| Unicode | `\uXXXX`形式 |
| HTML实体 | `&#xx;`形式 |
| JSFuck | 只用`[]()!+`字符 |

### 4. 音频/图片隐写

{:.table}
| 方式 | 工具 |
|------|------|
| SSTV（慢扫描电视） | QSSTV |
| DTMF拨号音 | multimon-ng |
| 频谱图隐写 | Audacity / Sonic Visualiser |
| LSB隐写 | stegsolve / zsteg |

## 0x04 CTF解题思路

```bash
# 1. 看到编码先判断类型
#    - 全是点和划 → Morse
#    - 大写字母+数字 → Base32
#    - 大小写+数字++/= → Base64
#    - %xx → URL编码
#    - 纯数字 → ASCII / 手机键盘 / 进制转换

# 2. 在线工具辅助
#    - CyberChef（万能编解码工具）
#    - https://gchq.github.io/CyberChef/

# 3. 如果一步解码不是明文，尝试多层嵌套
#    例如: Base64 → Hex → ROT13 → Flag
```

## 参考

- [CyberChef - 编解码万能工具](https://gchq.github.io/CyberChef/){:target="_blank"}
- [Morse Code Translator](https://morsecode.world/){:target="_blank"}
- [CTF Wiki - 编码](https://ctf-wiki.org/crypto/classical/){:target="_blank"}

以上。