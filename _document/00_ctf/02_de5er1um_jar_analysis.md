---
layout: document
title: "de5er1um.jar 逆向分析报告"
short_title: "de5er1um_jar"
order: 2
icon: "fas fa-flag-checkered"
status: "new"
tags: [2026-IDSS-CN, JAR, SpringBoot, ApacheCamel, ReverseEngineering, CTF]
author: Bin4xin
version: "1.0"
description: "对 de5er1um.jar Spring Boot Fat JAR 的逆向工程分析报告，涵盖清单文件、类结构、路由配置与安全评估"
date: "2026-09-15"
---

{% capture _tips %}<i class="fa fa-star"></i> de5er1um.jar 逆向分析报告| <a href="/document/00_ctf/01_de5er1um_wp/">de5er1um wp文章</a>| <a href="/document/00_ctf/02_de5er1um_jar_analysis/"><i class="fa fa-link"></i> de5er1um.jar 下载链接</a>{% endcapture %}
{% include common-index/index-preset.html level="info" msg=_tips %}

## 攻击可视化演示

{% include common-index/ctf/changsanjiao-de5er1um.html %}

### 1 基本信息

| 属性 | 值 |
|------|------|
| 文件名 | `de5er1um.jar` |
| 文件大小 | 31,457,532 bytes（约 30 MB） |
| 最后修改 | 2026-08-04 10:24:26 |
| 构建工具 | Maven JAR Plugin 3.4.2 |
| JDK 规格 | 21 |
| Spring Boot 版本 | 3.5.13 |
| Apache Camel 版本 | 4.18.2 |
| 实现标题 | `camel-app-boot` |
| 实现版本 | `1.0` |
| 主类 | `org.springframework.boot.loader.launch.JarLauncher` |
| 启动类 | `ctf.App` |
| JAR 类型 | Spring Boot Fat JAR（Executable） |

### 2 JAR 结构总览

该 JAR 是标准的 Spring Boot Fat JAR 打包格式，共 241 个条目，分为三个主要层级：

```text
de5er1um.jar
├── META-INF/
│   ├── MANIFEST.MF
│   └── services/
│       └── java.nio.file.spi.FileSystemProvider
├── org/springframework/boot/loader/    (Spring Boot 引导加载器)
│   ├── jar/
│   ├── jarmode/
│   ├── launch/
│   ├── log/
│   ├── net/protocol/
│   ├── nio/file/
│   ├── ref/
│   └── zip/
├── BOOT-INF/
│   ├── classes/                        (应用程序代码)
│   │   ├── ctf/
│   │   │   ├── App.class
│   │   │   ├── HomeController.class
│   │   │   ├── CtfRoute.class
│   │   │   └── JmsConfig.class
│   │   └── application.yml
│   ├── lib/                            (107 个依赖库)
│   ├── classpath.idx
│   └── layers.idx
└── META-INF/
```

#### 2.1 分层索引（layers.idx）

| 层名 | 内容 |
|------|------|
| `dependencies` | `BOOT-INF/lib/` |
| `spring-boot-loader` | `org/` |
| `snapshot-dependencies` | （空） |
| `application` | `BOOT-INF/classes/`、`classpath.idx`、`layers.idx`、`META-INF/` |

### 3 MANIFEST.MF 清单分析

```text
Manifest-Version: 1.0
Created-By: Maven JAR Plugin 3.4.2
Build-Jdk-Spec: 21
Implementation-Title: camel-app-boot
Implementation-Version: 1.0
Main-Class: org.springframework.boot.loader.launch.JarLauncher
Start-Class: ctf.App
Spring-Boot-Version: 3.5.13
Spring-Boot-Classes: BOOT-INF/classes/
Spring-Boot-Lib: BOOT-INF/lib/
Spring-Boot-Classpath-Index: BOOT-INF/classpath.idx
Spring-Boot-Layers-Index: BOOT-INF/layers.idx
```

- `Main-Class` 指向 Spring Boot 的 `JarLauncher`，负责引导加载嵌套 JAR
- `Start-Class: ctf.App` 是实际应用入口
- 使用 Spring Boot 3.5.13 + Java 21 构建链

### 4 应用配置（application.yml）

```yaml
# @hl 4-7,9-12
server:
  port: 8080

broker:
  url: ${BROKER_URL:tcp://localhost:61616}
  user: ${BROKER_USER:ctf}
  pass: ${BROKER_PASS:ctf}

camel:
  springboot:
    name: de5er1um-gateway
    main-run-controller: true

logging:
  level:
    org.apache.camel: INFO
```

| 配置项 | 默认值 | 环境变量覆盖 |
|--------|--------|--------------|
| 服务端口 | `8080` | — |
| Broker URL | `tcp://localhost:61616` | `BROKER_URL` |
| Broker 用户名 | `ctf` | `BROKER_USER` |
| Broker 密码 | `ctf` | `BROKER_PASS` |
| Camel 应用名 | `de5er1um-gateway` | — |
| Camel 运行控制器 | `true`（保持进程常驻） | — |

### 5 应用类逆向分析

#### 5.1 `ctf.App` — 启动入口

| 项目 | 内容 |
|------|------|
| 父类 | `java.lang.Object` |
| 注解 | `@SpringBootApplication` |
| 方法 | `<init>()`、`main(String[])` |

`main` 方法调用 `SpringApplication.run(App.class, args)` 启动 Spring Boot 上下文。这是标准的 Spring Boot 启动模板，无额外逻辑。

#### 5.2 `ctf.HomeController` — HTTP 控制器

| 项目 | 内容 |
|------|------|
| 父类 | `java.lang.Object` |
| 注解 | `@RestController` |
| 依赖 | `CamelContext`（构造注入） |
| 方法 | `<init>(CamelContext)`、`index()`、`status()` |

**路由映射：**

| 方法 | 路径 | HTTP 方法 | 产出类型 | 说明 |
|------|------|-----------|----------|------|
| `index()` | `/` | GET | `text/html` | 返回静态 HTML 信息页 |
| `status()` | `/actuator-lite` | GET | `JSON Map` | 返回 Camel 运行状态 |

**`index()` 返回的 HTML 内容：**

```html
<!doctype html>
<meta charset="utf-8">
<title>de5er1um message gateway</title>
<style>
  body{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;
       max-width:44rem;margin:6rem auto;padding:0 1.5rem;line-height:1.7}
  h1{font-size:1.4rem;letter-spacing:.02em}
  code{background:#8881;padding:.1rem .35rem;border-radius:.2rem}
  .m{color:#888}
</style>
<h1>de5er1um message gateway</h1>
<p class="m">Integration layer for upstream order events.</p>
<p>Status endpoint: <code>/actuator-lite</code></p>
<p class="m">Inbound traffic is consumed from the broker, not from HTTP.
This page is informational only.</p>
```

**`status()` 返回的状态字段：**

| 键 | 数据来源 | 类型 |
|----|----------|------|
| `camel` | `CamelContext.getVersion()` | String（Camel 版本号） |
| `context` | `CamelContext.getName()` | String（上下文名称） |
| `uptimeMillis` | `CamelContext.getUptime().toMillis()` | Long（运行时长毫秒） |
| `routes` | `CamelContext.getRoutes().size()` | Integer（路由数量） |
| `status` | `CamelContext.getStatus().name()` | String（服务状态名） |

#### 5.3 `ctf.CtfRoute` — Camel 路由定义

| 项目 | 内容 |
|------|------|
| 父类 | `org.apache.camel.builder.RouteBuilder` |
| 注解 | `@Component` |
| 常量 | `INBOUND_QUEUE = "gateway.inbound"` |
| 方法 | `<init>()`、`configure()`、`lambda$configure$0(Exchange)` |

**路由配置（`configure` 方法）：**

```java
// @hl 1,4
from("activemq6:queue:gateway.inbound")
    .routeId("inbound-consumer")
    .process(ex -> {
        Object body = ex.getMessage().getBody();
        log.info("inbound message accepted, payload type = {}",
                 body == null ? "null" : body.getClass().getName());
    });
```

| 路由属性 | 值 |
|----------|------|
| 来源 | `activemq6:queue:gateway.inbound` |
| 路由 ID | `inbound-consumer` |
| 处理逻辑 | 记录消息体类型到日志，不做进一步转换或转发 |

> 该路由仅消费 `gateway.inbound` 队列消息并记录日志，**无出站路由、无消息转换、无错误处理**。这是一个典型的消息网关入口点，但当前只做日志记录。

#### 5.4 `ctf.JmsConfig` — JMS/ActiveMQ 配置

| 项目 | 内容 |
|------|------|
| 父类 | `java.lang.Object` |
| 注解 | `@Configuration` |
| 方法 | `<init>()`、`activemq6(url, user, pass)` |

**Bean 定义（`activemq6` 方法）：**

```java
// @del 10
@Bean
ActiveMQComponent activemq6(
    @Value("${broker.url}") String url,
    @Value("${broker.user}") String user,
    @Value("${broker.pass}") String pass
) {
    ActiveMQConnectionFactory cf = new ActiveMQConnectionFactory(url);
    cf.setUserName(user);
    cf.setPassword(pass);
    cf.setTrustAllPackages(true);    // ← 注意
    ActiveMQComponent component = new ActiveMQComponent();
    component.setConnectionFactory(cf);
    return component;
}
```

| 配置项 | 值 | 来源 |
|--------|------|------|
| 连接工厂 | `ActiveMQConnectionFactory` | ActiveMQ 6.1.8 |
| Broker URL | `tcp://localhost:61616` | `${broker.url}` |
| 用户名 | `ctf` | `${broker.user}` |
| 密码 | `ctf` | `${broker.pass}` |
| `setTrustAllPackages` | **`true`** | 硬编码 |

### 6 依赖库分析

#### 6.1 核心框架依赖

| 框架 | 版本 | JAR 数 | 说明 |
|------|------|---------|------|
| Spring Boot | 3.5.13 | 2 | 核心框架 + 自动配置 |
| Spring Framework | 6.2.17 | 7 | web、beans、aop、context、expression、tx、jms |
| Apache Camel | 4.18.2 | 42 | 核心引擎 + 30+ 组件 starter |
| Tomcat Embed | 10.1.53 | 3 | core、el、websocket |
| Jackson | 2.21.2 | 5 | JSON 序列化 |
| Logback + SLF4J | 1.5.32 / 2.0.17 | 5 | 日志框架 |
| ActiveMQ | 6.1.8 | 2 | client + hawtbuf |
| SnakeYAML | 2.4 | 1 | YAML 解析 |
| Jakarta APIs | — | 3 | annotation、xml.bind、activation、jms |

#### 6.2 Camel 组件清单

| 组件 | Starter JAR | 组件 JAR | 说明 |
|------|-------------|----------|------|
| bean | ✓ | ✓ | Bean 组件 |
| browse | ✓ | ✓ | 浏览端点 |
| controlbus | ✓ | ✓ | 控制总线 |
| dataformat | ✓ | ✓ | 数据格式 |
| dataset | ✓ | ✓ | 测试数据集 |
| direct | ✓ | ✓ | 直接调用 |
| file | ✓ | ✓ | 文件传输 |
| language | ✓ | ✓ | 语言组件 |
| log | ✓ | ✓ | 日志端点 |
| mock | ✓ | ✓ | 测试 Mock |
| ref | ✓ | ✓ | 引用端点 |
| rest | ✓ | ✓ | REST DSL |
| saga | ✓ | ✓ | 分布式事务 |
| scheduler | ✓ | ✓ | 定时调度 |
| seda | ✓ | ✓ | 异步队列 |
| stub | ✓ | ✓ | 桩端点 |
| timer | ✓ | ✓ | 定时器 |
| validator | ✓ | ✓ | 验证器 |
| xpath | ✓ | ✓ | XPath 表达式 |
| xslt | ✓ | ✓ | XSLT 转换 |
| xml-jaxp | ✓ | ✓ | XML JAXP |
| activemq6 | ✓ | ✓ | ActiveMQ 6 集成 |
| jms | — | ✓ | JMS 通用组件 |

### 7 安全分析

#### 7.1 发现的安全问题

| 级别 | 问题 | 位置 | 说明 |
|------|------|------|------|
| **高危** | `setTrustAllPackages(true)` | `JmsConfig.activemq6()` | ActiveMQ 连接工厂信任所有 Java 包，允许反序列化任意类的对象。如果攻击者能控制 Broker 上的消息内容，可通过构造恶意的序列化对象实现 RCE |
| **中危** | 默认弱凭据 `ctf/ctf` | `application.yml` | Broker 默认用户名和密码均为 `ctf`，且通过环境变量覆盖时可能暴露在进程环境或容器编排配置中 |
| **中危** | 消息体无验证/过滤 | `CtfRoute.configure()` | 路由直接 `getMessage().getBody()` 获取原始消息体，不做类型检查或内容过滤，仅记录日志 |
| **低危** | 状态端点信息泄露 | `HomeController.status()` | `/actuator-lite` 暴露 Camel 版本号、上下文名、运行时长、路由数和状态，可被用于侦察 |
| **低危** | 无认证/授权 | `HomeController` | 所有 HTTP 端点（`/` 和 `/actuator-lite`）无认证机制，任何能访问 8080 端口的人均可查看 |
| **低危** | 默认 TCP 明文通信 | `application.yml` | Broker 连接使用 `tcp://`（非 `ssl://`），凭据和消息在传输中为明文 |

#### 7.2 `setTrustAllPackages(true)` 深度分析

`ActiveMQConnectionFactory.setTrustAllPackages(true)` 会禁用 ActiveMQ 的反序列化过滤器。默认情况下 ActiveMQ 只信任受信任包列表中的类，设置为 `true` 后，**所有 Java 序列化对象** 都会被反序列化。

**攻击路径：**

```text
攻击者控制 ActiveMQ Broker 或中间人攻击
  └── 向 gateway.inbound 队列发送恶意序列化消息
      └── Camel 路由消费消息 → getMessage().getBody()
          └── ActiveMQ 反序列化消息体 → 任意类加载
              └── 利用 gadget chain → 远程代码执行 (RCE)
```

> 此配置在 CTF 场景中通常是刻意设置的漏洞入口。

#### 7.3 攻击面总结

```text
攻击面
├── HTTP 端口 8080
│   ├── GET /              → 信息泄露（HTML 信息页）
│   └── GET /actuator-lite → 状态信息泄露
├── ActiveMQ TCP 61616
│   ├── 默认凭据 ctf/ctf
│   ├── TrustAllPackages → 反序列化 RCE
│   └── 向 gateway.inbound 投递恶意消息
└── 无认证 / 无 TLS / 无输入验证
```

### 8 架构与数据流

```text
                    ┌─────────────────┐
                    │   HTTP :8080    │
                    │  (Tomcat Embed) │
                    ├─────────────────┤
                    │  GET /          │ → 静态 HTML 信息页
                    │  GET /actuator  │ → JSON 状态信息
                    │     -lite       │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  Spring Boot    │
                    │  3.5.13 + Camel │
                    │  4.18.2         │
                    │  (App.java)     │
                    └─────────┬───────┘
                              │
             ┌────────────────┼──────────────┐
             │                │              │
     ┌───────▼──────────┐ ┌───▼────┐ ┌───────▼────────┐
     │ HomeController   │ │CtfRoute│ │  JmsConfig     │
     │ (@RestController)│ │(Route  │ │(@Configuration)│
     │                  │ │Builder)│ │                │
     │ - CamelContext   │ │        │ │ ActiveMQComp   │
     │   inject         │ │ from(  │ │ → CF(url,user, │
     │                  │ │  activ │ │   pass,        │
     │                  │ │  emq6: │ │   trustAll)    │
     │                  │ │  queue:│ │                │
     │                  │ │  gate  │ │                │
     │                  │ │  way.  │ │                │
     │                  │ │  inbou │ │                │
     │                  │ │  nd)   │ │                │
     │                  │ │ .proc  │ │                │
     │                  │ │  ess(  │ │                │
     │                  │ │  log)  │ │                │
     └──────────────────┘ └───┬────┘ └───────┬────────┘
                              │              │
                              │              │
                  ┌───────────▼──────────────▼──────┐
                  │     ActiveMQ Broker 6.1.8       │
                  │     tcp://localhost:61616       │
                  │     user: ctf / pass: ctf       │
                  │     trustAllPackages: true      │
                  │                                 │
                  │  Queue: gateway.inbound         │
                  └─────────────────────────────────┘
```

### 9 CTF 解题思路推测

基于应用名 `de5er1um`（谐音 deserium，暗示 deserialize）以及安全分析，推测以下攻击链：

| 步骤 | 操作 | 目标 |
|------|------|------|
| 1 | 访问 `/actuator-lite` 获取 Camel 版本和运行状态 | 信息侦察 |
| 2 | 使用默认凭据 `ctf/ctf` 连接 ActiveMQ Broker | 获取 Broker 访问权限 |
| 3 | 向 `gateway.inbound` 队列发送恶意序列化消息 | 触发反序列化 |
| 4 | 利用 ActiveMQ `trustAllPackages=true` + 已知 gadget chain | 实现 RCE |
| 5 | 读取 flag 文件 | 完成 CTF |

> 应用名 `de5er1um` 明确指向 **Java 反序列化** 攻击，`setTrustAllPackages(true)` 是刻意留的漏洞。

### 10 检查清单

- [x] JAR 结构完整分析（MANIFEST、BOOT-INF、Spring Boot Loader）
- [x] 应用配置 `application.yml` 提取与分析
- [x] 全部 4 个应用类反编译与方法签名提取
- [x] 依赖库清单（107 个 lib JAR）完整列举
- [x] 安全漏洞识别（6 项，1 高危 / 2 中危 / 3 低危）
- [x] 架构数据流图绘制
- [x] CTF 攻击链推测
