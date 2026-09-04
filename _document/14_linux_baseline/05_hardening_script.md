---
layout: document
title: "自动化加固脚本参考"
short_title: "加固脚本"
order: 5
icon: "fas fa-terminal"
status: "stable"
tags: [Linux, 安全基线, 最小权限, 自动化核查, 安全加固]
author: sentryCyberSec
version: "3.0"
description: "Linux服务器安全基线加固技战法，涵盖安全基线制定、基线配置实施和自动化核查与持续合规三个阶段。"
---

## 场景 6 — 自动化加固脚本参考

### Ansible Playbook 加固示例

```yaml
# linux_security_hardening.yml
- hosts: all
  become: yes
  tasks:
    # SSH 加固
    - name: SSH 安全配置
      lineinfile:
        path: /etc/ssh/sshd_config
        regexp: "{{ item.regexp }}"
        line: "{{ item.line }}"
      loop:
        - { regexp: '^#?PermitRootLogin', line: 'PermitRootLogin no' }
        - { regexp: '^#?PasswordAuthentication', line: 'PasswordAuthentication no' }
        - { regexp: '^#?MaxAuthTries', line: 'MaxAuthTries 3' }
        - { regexp: '^#?ClientAliveInterval', line: 'ClientAliveInterval 300' }
      notify: restart sshd

    # 禁用不必要服务
    - name: 禁用不必要服务
      systemd:
        name: "{{ item }}"
        enabled: no
        state: stopped
      loop: [telnet, rpcbind, avahi-daemon, cups]
      ignore_errors: yes

    # 内核参数加固
    - name: 内核安全参数
      sysctl:
        name: "{{ item.key }}"
        value: "{{ item.value }}"
        state: present
        reload: yes
      loop:
        - { key: 'net.ipv4.ip_forward', value: '0' }
        - { key: 'net.ipv4.conf.all.send_redirects', value: '0' }
        - { key: 'net.ipv4.conf.all.accept_redirects', value: '0' }
        - { key: 'net.ipv4.tcp_syncookies', value: '1' }
        - { key: 'kernel.randomize_va_space', value: '2' }

    # 文件权限加固
    - name: 关键文件权限
      file:
        path: "{{ item.path }}"
        owner: root
        group: root
        mode: "{{ item.mode }}"
      loop:
        - { path: '/etc/shadow', mode: '0600' }
        - { path: '/etc/gshadow', mode: '0600' }
        - { path: '/etc/passwd', mode: '0644' }
        - { path: '/etc/ssh/sshd_config', mode: '0600' }

    # 密码策略
    - name: 设置密码有效期
      lineinfile:
        path: /etc/login.defs
        regexp: "{{ item.regexp }}"
        line: "{{ item.line }}"
      loop:
        - { regexp: '^PASS_MAX_DAYS', line: 'PASS_MAX_DAYS 90' }
        - { regexp: '^PASS_MIN_DAYS', line: 'PASS_MIN_DAYS 7' }
        - { regexp: '^PASS_MIN_LEN', line: 'PASS_MIN_LEN 12' }

  handlers:
    - name: restart sshd
      systemd:
        name: sshd
        state: restarted
```

### 加固实施流程

| 步骤 | 说明 |
|------|------|
| 1. 基线确认 | 确认适用的基线等级(L1/L2/L3) |
| 2. 影响评估 | 评估加固对业务的影响，准备回退方案 |
| 3. 测试环境验证 | 在测试环境先行执行，验证无兼容性问题 |
| 4. 灰度执行 | 先在非核心服务器执行，观察 1-2 天 |
| 5. 全量推广 | 确认无问题后批量执行全量服务器 |
| 6. 核查验证 | 加固后自动核查确认合规 |

### 加固回退方案

| 场景 | 回退措施 |
|------|----------|
| SSH 加固导致无法连接 | 通过控制台/VNC 修改 sshd_config 并重启服务 |
| 禁用导致业务异常 | systemctl start + enable 恢复服务 |
| 内核参数导致网络异常 | sysctl 恢复原值 |
| 权限变更导致功能异常 | chmod 恢复原权限 |
