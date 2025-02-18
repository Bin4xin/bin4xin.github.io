---
layout: about
category: about
toc: true
Researchname: 在棉花糖及以下版本中获取图案密码
author: Bin4xin
permalink: /about/Get-Pattern-password-in-Marshmallow-and-below/
desc: 「CTF」
---

# # 0、解题准备

需要提前准备：

- `python2.7`
- `getekeeper-pattern.key` 文件

# # 1、前提

> 前置知识[^1]：
> 在早期版本(2.3-5.1)的Android手机中，锁屏密码相关的文件如下，这种类型的加密方式比较简单，只需要破解相关的SHA1的哈希值即可。
> - `/data/system/password.key`
> - `/data/system/gesture.key`
>
> 在6.0-8.0版本的Android手机中
> 文件加密方式则相对复杂，应该采用的是：
> - [scrypt-hash算法](https://github.com/dannycoates/scrypt-hash){:target="_blank"}
>
> 锁屏密码相关的文件如下
> - `/data/system/gatekeeper.pattern.key`
> - `/data/system/gatekeeper.password.key`


# # 2、实操

## # 2x01 获取密码长度

在`/data/system/`目录下的`device_policies.xml`文件中：
```xml
<?xml version='1.0' encoding='utf-8' standalone='yes' ?>
<policies setup-complete="true">
<admin name="com.google.android.gms/com.google.android.gms.mdm.receivers.MdmDeviceAdminReceiver">
<policies flags="540" />
<disable-bt-contacts-sharing value="true" />
</admin>
<active-password quality="65536" length="7" uppercase="0" lowercase="0" letters="0" numeric="0" symbols="0" nonletter="0" />
</policies>
```

我们可以看到：`length="7"`

于是生成脚本；

## # 3x02 生成密码字典

```python
# 生成所有不重复的9位密码组合
with open('password.txt', 'a') as file1:
    for perm in itertools.permutations("123456789", 7):
    # 生成所有9位不重复的排列
        password = ''.join(perm)
        # 组合成字符串
        file1.write(password + '\n')
        # 写入文件
```

## # 3x03 实现对应匹配算法

```python
# Scrypt Lib依赖参数
N = 16384  # CPU/内存消耗参数，控制计算复杂度
r = 8      # 块大小参数，控制内存使用
p = 1      # 并行化参数，控制并行计算的数量

# 读取 gatekeeper.pattern.key 文件
with open('gatekeeper.pattern.key', 'rb') as f:  # 以二进制模式打开文件
    blob = f.read()  # 读取文件内容到变量 blob

# 提取关键信息
s = struct.Struct('<' + '17s 8s 32s')  # 定义二进制数据的解析格式：17字节字符串 + 8字节字符串 + 32字节字符串
(meta, salt, signature) = s.unpack_from(blob)  # 从 blob 中解析出 meta、salt 和 signature

# 读取字典文件
with open('password.txt', 'r') as f1:  # 以只读模式打开字典文件
    lines = f1.readlines()  # 读取所有行到列表 lines

# 遍历字典尝试破解
for data in lines:
    password = data.strip()  # 去除每行首尾的空白字符（如换行符）
    
    # 确保密码为二进制格式
    password_bytes = password.encode('utf-8')  # 将密码字符串编码为 UTF-8 格式的字节
    to_hash = meta + password_bytes  # 组合 meta 和密码字节，形成待哈希的数据
    
    # 计算 Scrypt Hash
    hash_result = scrypt.hash(to_hash, salt, N, r, p)  # 使用 Scrypt 算法计算哈希值

    # 打印调试信息
    print 'Passed: %s' % password  # 打印当前尝试的密码
    print 'signature: %s' % signature.encode('hex')  # 打印签名（十六进制格式）
    print 'Hash:      %s' % hash_result[0:32].encode('hex')  # 打印哈希值的前 32 位（十六进制格式）
    print 'Equal:     %s' % (hash_result[0:32] == signature)  # 比较哈希值的前 32 位与签名是否相等

    if hash_result[0:32] == signature:  # 如果匹配，打印成功密码并终止程序
        print "Matched: %s" % password  # 打印找到的密码
        print "SUccess"  # 打印成功信息
        exit(0)  # 退出程序

# 如果遍历完所有密码仍未找到匹配项
print "Unmatched..."  # 打印未找到匹配密码的信息
```

如果成功的话会输出如下：

```bash
$ python2 crack.py
Passed: 1256987
signature: ef68fd098aad3083794dbebaf9190bf1d981956d8a3301aece73cdfb4ed3bd6e
Hash:      ef68fd098aad3083794dbebaf9190bf1d981956d8a3301aece73cdfb4ed3bd6e
Equal:     True
Matched: 1256987
Success!
```

## # 3x04 代码

```python
#!/usr/bin/python
# -*- coding:utf-8 -*-

import itertools
import struct
import binascii
import scrypt

def Rock():
    N = 16384
    r = 8
    p = 1
    with open('gatekeeper.pattern.key', 'rb') as f:
        blob = f.read()
    s = struct.Struct('<' + '17s 8s 32s')
    (meta, salt, signature) = s.unpack_from(blob)

    with open('password.txt', 'r') as f1:
        lines = f1.readlines()

    for data in lines:
        password = data.strip()
        password_bytes = password.encode('utf-8')  
        to_hash = meta + password_bytes
        hash_result = scrypt.hash(to_hash, salt, N, r, p)
        print 'Passed: %s' % password
        print 'signature: %s' % signature.encode('hex')
        print 'Hash:      %s' % hash_result[0:32].encode('hex')
        print 'Equal:     %s' % (hash_result[0:32] == signature)
        if hash_result[0:32] == signature:
            print "Matched: %s" % password
            print "Success!"
            exit(0)
    print "Unmatched..."

def Passlist():
    with open('password.txt', 'a') as file1:
        for perm in itertools.permutations("123456789", 7):
            password = ''.join(perm)
            file1.write(password + '\n')
    Rock()

if __name__ == "__main__":
    Passlist()
```

### Python 代码总结

该 Python 脚本尝试通过暴力破解的方式，使用 `scrypt` 密钥派生函数和一个密码模式进行密码破解。它首先尝试从密码列表中匹配密码，并将生成的哈希与存储的签名进行比较，查看是否匹配。

### 主要函数

1. **`Rock()`**
    - 读取文件 `gatekeeper.pattern.key`，其中包含元数据、盐值和签名。
    - 从 `password.txt` 文件中读取密码列表。
    - 对每个密码，使用 `scrypt` 函数对元数据和密码的拼接结果进行哈希计算。
    - 将计算出的哈希值与存储的签名进行比较，查看是否匹配。
    - 如果找到了匹配的密码，打印该密码并退出程序。

2. **`Passlist()`**
    - 生成从数字 `1-9` 中取 7 位数的所有可能排列，并写入 `password.txt` 文件。
    - 在生成完密码列表后，调用 `Rock()` 来检查这些生成的密码。

### 主要组件

- **`scrypt`**：用于密码和盐值的哈希计算，结合了内存密集型和 CPU 密集型的算法。
- **`itertools.permutations`**：用于生成从给定字符集（`1-9`）中取 7 位数的所有排列。
- **`struct`**：用于从 `gatekeeper.pattern.key` 文件中解析出元数据、盐值和签名。

### 代码流程详解

1. **读取密钥 (`Rock()`)**：
    - 读取 `gatekeeper.pattern.key` 文件，将其解包为三个变量：`meta`（17 字节字符串）、`salt`（8 字节字符串）和 `signature`（32 字节字符串）。
    - 从 `password.txt` 中读取密码列表。对于每个密码，脚本：
        - 使用 `scrypt` 函数对 `meta` 和密码（UTF-8 编码）进行哈希计算。
        - 将哈希的前 32 字节与存储的签名进行比较。
        - 如果哈希值与签名匹配，则打印出密码，并退出程序。

2. **生成密码列表 (`Passlist()`)**：
    - 该函数使用 `itertools.permutations` 生成所有可能的 7 位数排列，字符集为 `"123456789"`，并将它们写入 `password.txt` 文件。
    - 生成完密码列表后，调用 `Rock()` 来检查这些生成的密码。

### 外部库

- **`scrypt`**：用于密钥派生函数，结合盐值和密码生成哈希值。
- **`itertools`**：用于生成密码的排列组合。
- **`struct`**：用于解析二进制数据。

### 注意事项

- `WindowsError: [Error 126]`

```powershell
ps> python2 .\crypt.py
Traceback (most recent call last):
  File ".\crypt.py", line 4, in <module>
    import scrypt
  File "C:\Python27\lib\site-packages\scrypt.py", line 11, in <module>
    _scrypt = cdll.LoadLibrary(imp.find_module('_scrypt')[1])
  File "C:\Python27\lib\ctypes\__init__.py", line 444, in LoadLibrary
    return self._dlltype(name)
  File "C:\Python27\lib\ctypes\__init__.py", line 366, in __init__
    self._handle = _dlopen(self._name, mode)
WindowsError: [Error 126]
```

需要使用下面的命令安装`scrypt`库：

```bash
python2 -m pip install scrypt==0.8.11
```

# REF

[^1]: [ Cracking gatekeeper.pattern.key ](https://mp.weixin.qq.com/s/go9IgKTWucYploSkEQVEHw){:target="_blank"}
