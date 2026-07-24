---
layout: about
category: about
Researchname:  Java框架代码动态调试分析
toc: true
wrench: 2026-07-24
author: Bin4xin
permalink: /about/Dynamic-analysis-of-java-framework-code/
desc: 「代码审计」
---

{% include common-index/index-preset.html level="error" msg="本文所述技术仅用于安全研究与代码审计目的，任何未经授权的渗透测试或恶意利用行为均违反相关法律法规，后果由使用者自行承担。<br>The techniques described herein are solely for authorized security research and code auditing. Any unauthorized penetration testing or malicious exploitation is illegal." %}

{% include common-index/index-preset.html level="info" msg="本文为 Java 框架代码动态调试分析的基础教程，从 IDEA 调试工具的基本使用入手，逐步深入到框架级源码分析。" %}

# Java框架代码动态调试分析

- [x] debug基本用法介绍
    - [x] debug的几个分类断点介绍
    - [x] 分类断点的使用
- [x] debug简单例子演示
- [ ] 以SHIRO框架来进行动态java代码调试分析

{% include shiro-common/shiro-common.md %}

---

## 一：[debug] the world

### 0x01：debug的基本用法

{% include common-index/index-preset.html level="info" msg="提示：动态调试是代码审计中最核心的技能之一。通过断点调试，可以精确跟踪程序执行流程、观察变量变化、理解框架内部机制，是静态代码分析无法替代的。" %}

> **什么是 Debug？** Debug 是程序调试的核心工具，允许开发者在代码执行过程中设置断点（Breakpoint），暂停程序运行，逐步执行代码并观察变量状态、调用栈和内存变化。对于安全研究人员来说，Debug 是理解框架执行流程、发现潜在漏洞的关键手段。

IDEA 提供了丰富的调试功能，以下是最常用的断点类型：

{: .table}
| 断点类型 | 说明 | 使用场景 |
|---------|------|---------|
| **行断点（Line Breakpoint）** | 在指定代码行暂停执行 | 最常用，追踪代码执行到特定位置 |
| **方法断点（Method Breakpoint）** | 在方法入口/出口暂停 | 追踪框架方法调用，无需关注具体行号 |
| **字段断点（Field Watchpoint）** | 在字段被读取或修改时暂停 | 追踪敏感变量（如密钥、Token）的变化 |
| **异常断点（Exception Breakpoint）** | 在抛出指定异常时暂停 | 分析异常处理流程，发现潜在安全问题 |
| **条件断点（Conditional Breakpoint）** | 仅在满足指定条件时暂停 | 精确过滤目标请求，避免频繁中断 |

{% include common-index/index-preset.html level="warn" msg="注意：在调试远程服务器时（如 Tomcat Remote），请确保调试端口仅对可信网络开放，避免调试通道被恶意利用。" %}

### 0x02：debug实现 Line Breakpoints

了解了怎么调试后，第一步：`debug the world`。

#### 1. 新建程序

{% details 👉 hello.java 源码 %}

- 打开开发软件（intelliJ IDEA 或 eclipse）
- 新建 project
- new 一个 class
- `hello.java`:

```java
public class hello {

        public static void main(String[] args) {

                System.out.println("this is a block test message");
                System.out.println("hello world");

        }
}
```

{% enddetails %}

#### 2. 运行程序

- `${path-to-project}/hello/src/hello.java` → 右键 → `run hello.main()`
- console 台输出即程序运行成功：

```bash
   ···
   ···
   this is a block test message
   hello world
   
   Process finished with exit code 0
```

#### 3. 调试程序

实现现象：
1. 程序输出 `this is a block test message` 后停下
2. 人工干预后输出 `hello world`

{% include common-index/index-preset.html level="info" msg="提示：通过在 System.println 语句行设置行断点，程序执行到该行时会暂停。此时可以在 IDEA 的 Debug 面板中查看变量值、调用栈，并使用 Step Over（F8）逐行执行或 Resume（F9）继续运行。" %}

> 这样我们就能够在对一个简单的 Java 程序进行断点调试后，对程序的输出进度实现精确可控。

---

## 二：断点用法进阶

### 0x01：条件断点实战

{% include common-index/index-preset.html level="info" msg="提示：条件断点是代码审计中最实用的断点类型之一，特别是在处理高频调用的框架方法时，可以精准定位目标请求而不会被无关调用打断。" %}

在实际的代码审计场景中，框架代码往往被大量请求频繁调用。如果在通用方法上设置普通断点，调试器会不断中断，严重影响效率。**条件断点** 可以让你只在满足特定条件时才暂停执行。

#### 使用方式

1. 在目标代码行左侧点击设置断点
2. 右键点击断点红点，打开断点属性面板
3. 在 `Condition` 输入框中填写 Java 表达式
4. 程序执行到该行时，仅当表达式返回 `true` 时才会暂停

{% details 👉 条件断点示例 %}

**示例：** 在 Shiro 框架的 `AbstractShiroFilter.doFilterInternal` 方法上设置条件断点，仅当请求路径包含 `/admin` 时暂停：

```java
// 条件表达式
request.getRequestURI().contains("/admin")
```

这样可以精确过滤出目标请求，避免被其他无关请求的调用打断。

{% enddetails %}

### 0x02：方法断点实战

方法断点适用于追踪框架内部的 API 调用链，无需关心具体代码行号（因为框架代码可能会随着版本更新而改变行号）。

#### 使用方式

1. 在方法签名行的左侧点击设置断点
2. 程序进入该方法时会自动暂停
3. 可以同时观察方法的 **入口参数** 和 **返回值**

> **技巧：** 方法断点在调试反序列化漏洞时特别有用，可以在 `ObjectInputStream.readObject()` 方法上设置断点，观察被反序列化的对象类型和内容。

### 0x03：异常断点实战

异常断点可以在程序抛出指定异常时自动暂停，这对于分析框架的异常处理机制和发现潜在安全问题非常有价值。

#### 使用方式

1. 打开 IDEA 的 `View Breakpoints` 面板（`Ctrl + Shift + F8`）
2. 点击 `+` → `Java Exception Breakpoint`
3. 输入异常类名（如 `java.lang.ClassNotFoundException`）
4. 程序抛出该异常时会自动暂停

{% include common-index/index-preset.html level="warn" msg="注意：某些异常（如 NullPointerException）在框架中被频繁抛出和捕获，设置此类异常断点可能导致调试器频繁中断。建议结合条件过滤或使用「仅捕获未处理异常」选项。" %}

### 0x04：调试快捷键速查

{: .table}
| 快捷键 | 功能 | 说明 |
|--------|------|------|
| `F7` | Step Into | 进入当前方法内部 |
| `F8` | Step Over | 跳过当前方法，执行下一行 |
| `Shift + F8` | Step Out | 跳出当前方法，返回调用处 |
| `F9` | Resume Program | 继续运行到下一个断点 |
| `Alt + F8` | Evaluate Expression | 计算表达式，查看变量值 |
| `Ctrl + Shift + F8` | View Breakpoints | 管理所有断点 |
| `Ctrl + F8` | Toggle Breakpoint | 切换当前行断点 |

---

## 三：实战应用

> 以 Shiro 框架为例，使用动态调试分析框架内部代码的执行流程。

{% include common-index/index-preset.html level="info" msg="提示：以下实战应用以 Apache Shiro 框架为例，演示如何通过动态调试深入理解框架内部的认证、授权和会话管理机制。完整的 Shiro 漏洞分析请参考「基于内存的Shiro框架Webshell攻击研究」和「Different Shiro Framework deserialization analysis ideas」。" %}

### 0x01：Shiro 认证流程调试

{% details 👉 Shiro 认证调试步骤 %}

1. 在 `org.apache.shiro.web.filter.authc.FormAuthenticationFilter.executeLogin` 方法上设置方法断点
2. 触发登录请求
3. 观察 `UsernamePasswordToken` 中的用户名和密码
4. Step Into 进入 `Subject.login()` → `SecurityManager.login()` → `Authenticator.authenticate()`
5. 追踪 Realm 的认证逻辑

{% enddetails %}

#### 认证流程伪代码

以下伪代码展示了 Shiro 认证的完整调用链，调试时可以沿着这条链逐步 Step Into：

```java
// =====================================================
// Shiro 认证流程伪代码（对应调试时的 Step Into 调用链）
// =====================================================

// 【断点1】入口：用户提交登录表单
// 位置：FormAuthenticationFilter.executeLogin()
public boolean executeLogin(ServletRequest request, ServletResponse response) {
    // 从请求中获取用户名和密码
    String username = request.getParameter("username");   // ← Debugger: 观察变量 username
    String password = request.getParameter("password");   // ← Debugger: 观察变量 password
    
    // 构建认证令牌
    UsernamePasswordToken token = new UsernamePasswordToken(username, password);
    token.setRememberMe(true);                            // ← Debugger: 观察 rememberMe 标志
    
    // 获取当前 Subject（用户主体）
    Subject subject = SecurityUtils.getSubject();
    
    try {
        // 【Step Into → 进入 Subject.login()】
        subject.login(token);
        return true;
    } catch (AuthenticationException e) {
        // 认证失败，记录日志
        log.warn("认证失败: {}", e.getMessage());        // ← Debugger: 条件断点 e != null
        return false;
    }
}

// 【断点2】Subject 委托给 SecurityManager
// 位置：DelegatingSubject.login()
public void login(AuthenticationToken token) {
    // 委托给 SecurityManager 处理
    // 【Step Into → 进入 SecurityManager.login()】
    this.securityManager.login(this, token);
}

// 【断点3】SecurityManager 委托给 Authenticator
// 位置：DefaultSecurityManager.login()
public Subject login(Subject subject, AuthenticationToken token) {
    // 创建认证信息（包含 Realm 列表）
    AuthenticationInfo info;
    try {
        // 【Step Into → 进入 Authenticator.authenticate()】
        info = this.authenticator.authenticate(token);
    } catch (AuthenticationException e) {
        // 认证失败处理
        onFailedLogin(token, e, subject);
        throw e;
    }
    
    // 认证成功，创建已认证的 Subject
    Subject loggedIn = createSubject(token, info, subject);
    return loggedIn;
}

// 【断点4】Authenticator 遍历 Realm 进行认证
// 位置：AbstractAuthenticator.authenticate()
public AuthenticationInfo authenticate(AuthenticationToken token) {
    Collection<Realm> realms = getRealms();               // ← Debugger: 观察 Realm 列表
    
    AuthenticationInfo info = null;
    for (Realm realm : realms) {
        if (realm.supports(token)) {
            // 【Step Into → 进入 Realm.doGetAuthenticationInfo()】
            info = realm.getAuthenticationInfo(token);
            if (info != null) {
                break;                                     // ← Debugger: 找到匹配的 Realm
            }
        }
    }
    
    if (info == null) {
        throw new AuthenticationException("无可用的 Realm");
    }
    
    // 【断点5】密码比对
    // 位置：AuthenticatingRealm.assertCredentialsMatch()
    assertCredentialsMatch(token, info);                   // ← Debugger: 观察密码比对过程
    
    return info;
}

// 【断点5】自定义 Realm：从数据库获取用户信息
// 位置：自定义 Realm（如 JdbcRealm 或自定义实现）
public AuthenticationInfo doGetAuthenticationInfo(AuthenticationToken token) {
    String username = (String) token.getPrincipal();       // ← Debugger: 获取用户名
    
    // 从数据库查询用户
    User user = userDao.findByUsername(username);          // ← Debugger: 观察数据库查询结果
    if (user == null) {
        throw new UnknownAccountException("用户不存在");
    }
    
    // 返回认证信息（包含数据库中的密码哈希）
    // 【Step Into → 进入密码比对流程】
    return new SimpleAuthenticationInfo(
        user.getUsername(),
        user.getPasswordHash(),    // ← Debugger: 观察密码哈希值（如 BCrypt、SHA-256）
        user.getSalt(),
        getName()
    );
}
```

> **调试技巧：** 在上述每个 `【断点N】` 位置设置断点，配合 IDEA 的 `Evaluate Expression`（`Alt + F8`）功能，可以在断点暂停时实时计算任意表达式，例如 `new String(token.getPassword())` 查看明文密码。

---

### 0x02：Shiro 反序列化调试

{% details 👉 Shiro 反序列化调试步骤 %}

1. 在 `org.apache.shiro.mgt.AbstractRememberMeManager.getRememberedPrincipals` 方法上设置方法断点
2. 发送携带 `rememberMe` Cookie 的请求
3. 观察 Cookie 值（Base64 编码的序列化数据）
4. Step Into 进入 `decrypt()` → `convertBytesToPrincipals()`
5. 在 `ObjectInputStream.readObject()` 上设置断点，观察反序列化过程

{% enddetails %}

#### 反序列化流程伪代码

以下伪代码展示了 Shiro `rememberMe` Cookie 的反序列化处理流程，也是 CVE-2016-4437 的漏洞触发链：

```java
// =====================================================
// Shiro 反序列化漏洞伪代码（CVE-2016-4437 调试链）
// =====================================================

// 【断点1】入口：请求进入 Shiro Filter 链
// 位置：AbstractShiroFilter.doFilterInternal()
protected void doFilterInternal(ServletRequest request, ServletResponse response, FilterChain chain) {
    // 获取或创建 Subject
    Subject subject = createSubject(request, response);    // ← Debugger: 观察 request 中的 Cookie
    
    // 【Step Into → 进入 Subject 创建流程】
    // Subject 创建过程中会检查 rememberMe Cookie
    try {
        subject.getSession(true);                          // ← Debugger: 观察 Session 创建
        chain.doFilter(request, response);
    } finally {
        subject.logout();
    }
}

// 【断点2】从 Cookie 中读取 rememberMe 数据
// 位置：AbstractRememberMeManager.getRememberedPrincipals()
public PrincipalCollection getRememberedPrincipals(SubjectContext subjectContext) {
    // 获取 rememberMe Cookie 值
    Cookie cookie = getCookie();                           // ← Debugger: 观察 Cookie 对象
    String base64 = getCookieValue();                      // ← Debugger: 观察 Base64 编码的原始值
    
    if (base64 == null) {
        return null;
    }
    
    // Base64 解码
    byte[] decoded = Base64.getDecoder().decode(base64);   // ← Debugger: 观察解码后的字节数组
    
    // 【Step Into → 进入 decrypt() 解密流程】
    byte[] decrypted = decrypt(decoded);                   // ← Debugger: 断点！观察解密后的字节
    
    // 【Step Into → 进入 convertBytesToPrincipals() 反序列化】
    return convertBytesToPrincipals(decrypted, subjectContext);
}

// 【断点3】解密流程 — 这里使用 AES-CBC 解密
// 位置：AbstractRememberMeManager.decrypt()
protected byte[] decrypt(byte[] encrypted) {
    // 获取 AES 密钥
    byte[] decryptionCipherKey = getDecryptionCipherKey(); // ← Debugger: 观察 AES 密钥！
    
    // ⚠️ 漏洞关键点：Shiro 1.x 默认使用硬编码的 AES 密钥
    // 默认密钥：kPH+bIxk5D2deZiIxcaaaA==
    // 如果密钥泄露，攻击者可以构造任意序列化数据进行加密并注入
    
    CipherService cipherService = getCipherService();       // 默认为 AesCipherService
    byte[] decrypted = cipherService.decrypt(encrypted, decryptionCipherKey).getBytes();
    
    return decrypted;                                       // ← Debugger: 观察解密结果
}

// 【断点4】反序列化 — 漏洞触发点！
// 位置：AbstractRememberMeManager.convertBytesToPrincipals()
protected PrincipalCollection convertBytesToPrincipals(byte[] bytes, SubjectContext context) {
    // 获取反序列化器
    Serializer<PrincipalCollection> serializer = getSerializer();
    
    // 【Step Into → 进入反序列化器】
    // 默认使用 Java 原生 ObjectInputStream 进行反序列化
    // ⚠️ 这里是漏洞的根本原因：未对反序列化类型做白名单限制
    return serializer.deserialize(bytes);
}

// 【断点5】反序列化器实现 — 漏洞最终触发点
// 位置：DefaultSerializer.deserialize()
public <T> T deserialize(byte[] serialized) throws SerializationException {
    ByteArrayInputStream bais = new ByteArrayInputStream(serialized);
    
    // ⚠️ 直接使用 ObjectInputStream 反序列化，无类型白名单检查
    // 攻击者构造的恶意对象（如 CommonsCollections gadget chain）在此处被反序列化执行
    ObjectInputStream ois = new ObjectInputStream(bais);   // ← Debugger: 断点！观察 serialized 内容
    
    // 🚨 漏洞触发！恶意对象的 readObject() 方法在此执行
    // 如果 serialized 包含 CC gadget chain，此处将触发远程代码执行（RCE）
    T deserialized = (T) ois.readObject();                 // ← Debugger: 断点！Step Into readObject()
    
    return deserialized;
}

// =====================================================
// 攻击构造伪代码（仅供理解攻击原理）
// =====================================================

// 攻击者侧的恶意 Cookie 构造流程：
/*
1. 构造恶意序列化对象（如 CommonsCollections Transformer 链）
   Object payload = createCCGadgetChain("calc.exe");        // ← 恶意命令

2. 序列化为字节数组
   byte[] serialized = serialize(payload);

3. 使用已知的 AES 密钥加密
   byte[] key = Base64.decode("kPH+bIxk5D2deZiIxcaaaA==");  // ← Shiro 默认密钥
   byte[] encrypted = new AesCipherService().encrypt(serialized, key).getBytes();

4. Base64 编码
   String maliciousCookie = Base64.getEncoder().encodeToString(encrypted);

5. 设置到 HTTP 请求的 Cookie 中
   request.addCookie("rememberMe=" + maliciousCookie);
*/
```

{% include common-index/index-preset.html level="error" msg="重要：上述攻击构造伪代码仅用于理解漏洞原理和调试分析。实际利用时需要配合具体的 Gadget Chain（如 CommonsCollections、Fastjson 等），且不同 Shiro 版本的密钥和加密方式可能存在差异。请勿对未授权系统进行测试。" %}

> **调试要点总结：**
> 1. **断点1** — `doFilterInternal`：观察请求是否携带 `rememberMe` Cookie
> 2. **断点2** — `getRememberedPrincipals`：观察 Base64 解码后的原始字节
> 3. **断点3** — `decrypt`：观察 AES 密钥和解密结果（关键！确认密钥是否为默认值）
> 4. **断点4** — `convertBytesToPrincipals`：观察反序列化器类型
> 5. **断点5** — `ObjectInputStream.readObject`：观察恶意对象的反序列化过程（RCE 触发点）

{% include common-index/index-preset.html level="warn" msg="注意：调试 Shiro 反序列化漏洞时，建议在本地靶场环境中进行（如 vulhub CVE-2016-4437），切勿对未授权的生产环境进行测试。" %}
