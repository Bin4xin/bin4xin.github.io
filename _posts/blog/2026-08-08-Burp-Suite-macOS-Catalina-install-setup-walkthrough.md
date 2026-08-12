---
layout: post
toc: true
title: "Burp Suite 2026.7.3 for macOS 10.15.7/Catalina"
author: Bin4xin
categories:
    - blog
tags: 
    - JAVA
    - steghide
---

## 在 macOS Catalina 上安装与配置 Burp Suite 2026.7.3

{% include common-index/index-preset.html level="info" msg="<strong>教程说明</strong><br>本教程基于在 macOS Catalina (10.15.x) 系统上安装 Burp Suite 2026.7.3 的真实经历编写。整个过程遇到了多个典型的兼容性问题（Java 版本冲突、图形库缺失、浏览器启动失败等），以下是经过验证的完整解决方案。" %}

---

## 一、系统环境与前置要求

### 1.1 确认 macOS 版本

```bash
sw_vers -productVersion
10.15.7
# 应显示 10.15.x
```

### 1.2 Java 版本（最关键）

Burp Suite 2026.7.3 要求 **Java 21 或更高版本**。

检查当前 Java 版本：

```bash
java -version
```

如果版本低于 21，必须升级。在 Catalina 上，推荐使用 **JDK 21 LTS**（不是 Java 25，因为 Java 25 在 Catalina 上存在图形库兼容问题）：

**方法一：使用 Homebrew 安装（推荐）**

```bash
# 安装 Homebrew（如果没有）
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 安装 OpenJDK 21
brew install openjdk@21

# 创建软链接，让系统能找到
sudo ln -sfn /opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-21.jdk
```

**方法二：手动安装 DMG**

- 从 [oracle](https://www.oracle.com/java/technologies/downloads/#java21) 下载适用于 Intel Mac 的 x64 版本的 JDK 21 DMG 安装包
- 文件名示例：`OpenJDK21U-jdk_x64_mac_hotspot_21.0.12_8.tar.gz`
- 解压后移动到 `/Library/Java/JavaVirtualMachines/`

验证安装：

```bash
/usr/libexec/java_home -v 21
# 应输出 JDK 21 的路径
/Library/Java/JavaVirtualMachines/jdk-21.jdk/Contents/Home
```

### 1.3 关于 macOS Catalina 的特殊说明

- Catalina 对未公证的应用有严格限制，需要手动处理
- **不要使用 Java 25（Early Access）**，它在 Catalina 上缺少 `JavaRuntimeSupport.framework` 依赖，会导致 AWT 图形界面无法启动

---

## 二、下载 Burp Suite

### 2.1 推荐方式：下载 JAR 文件

1. 访问 [PortSwigger 下载页面](https://portswigger.net/burp/releases#professional)
2. 找到 **Burp Suite Professional / Community 2026.7.3**
3. 下载 **JAR 格式文件**（如 `burpsuite_pro_v2026.7.3.jar`）

{% include common-index/index-preset.html level="info" msg="<strong>TIPS</strong><br>最新版本2026.7.3不再区分Professional / Community，激活即可。" %}

---

## 三、配置与启动

### 3.1 创建 JVM 参数配置文件

在`.app`目录下编辑 `burp.vmoptions` 文件：

```bash
cat /Applications/Burp\ Suite.app/Contents/vmoptions.txt
```

粘贴以下内容：

```text
-XX:MaxRAMPercentage=50
-include-options user.vmoptions

--add-opens=java.base/java.lang=ALL-UNNAMED
--add-opens=java.base/java.lang=ALL-UNNAMED
--add-opens=java.base/jdk.internal.org.objectweb.asm=ALL-UNNAMED
--add-opens=java.base/jdk.internal.org.objectweb.asm.tree=ALL-UNNAMED
--add-opens=java.base/jdk.internal.org.objectweb.asm.Opcodes=ALL-UNNAMED
-javaagent:BurpLoaderKeygen_v1.18.jar
-noverify
```

{% include common-index/index-preset.html level="info" msg="<strong>说明</strong><br>1、<code>--add-opens</code> 参数是 Java 9+ 模块化系统要求的，用于允许 Burp 访问内部 API<br>2、<a href='https://github.com/h3110w0r1d-y/burploaderkeygen'>h3110w0r1d-y/burploaderkeygen</a>" %}


### 3.2 处理 Catalina 安全限制

如果 JAR 文件被 macOS 标记为"来自未知开发者"，执行：

```bash
sudo xattr -d com.apple.quarantine ~/BurpSuite/burpsuite_pro_v2026.7.3.jar
```

### 3.3 启动 Burp Suite

使用以下命令启动（注意使用 JDK 21）：

默认的`Burp\ Suite.app`java 自带版本：

```bash
/Applications/Burp\ Suite.app/Contents/Resources/jre.bundle/Contents/Home/bin/java -version
openjdk version "26.0.1" 2026-04-21
OpenJDK Runtime Environment (build 26.0.1+8-34)
OpenJDK 64-Bit Server VM (build 26.0.1+8-34, mixed mode)
```
直接把`/Library/Java/JavaVirtualMachines/jdk-21.jdk/Contents/`下的所有目录复制到`/Applications/Burp\ Suite.app/Contents/Resources/jre.bundle/Contents/`目录下，`open /Applications/Burp\ Suite.app`即可。

目录结构都是一致的：

```bash
ls /Library/Java/JavaVirtualMachines/jdk-21.jdk/Contents/                   🚀 for 12ms
Home		Info.plist	MacOS		_CodeSignature

ls /Applications/Burp\ Suite.app/Contents/Resources/jre.bundle/Contents/    🚀 for 13ms
Home		Info.plist	MacOS		_CodeSignature
```
### 其他

其他参考，不一定准确。

```bash
/Library/Java/JavaVirtualMachines/openjdk-21.jdk/Contents/Home/bin/java @burp.vmoptions -jar burpsuite_pro_v2026.7.3.jar
```

如果提示 `java` 命令找不到，使用完整路径：

```bash
/usr/libexec/java_home -v 21 --exec java @burp.vmoptions -jar burpsuite_pro_v2026.7.3.jar
```


### 3.4 创建启动脚本（方便日常使用）

创建 `~/BurpSuite/start-burp.sh`：

```bash
#!/bin/bash
cd ~/BurpSuite
JAVA_CMD="/usr/libexec/java_home -v 21 --exec java"
$JAVA_CMD @burp.vmoptions -jar burpsuite_pro_v2026.7.3.jar
```

赋予执行权限：

```bash
chmod +x ~/BurpSuite/start-burp.sh
./start-burp.sh
```

---

## 四、常见问题与解决方案

### 4.1 UnsupportedClassVersionError

**错误信息**：`... has been compiled by a more recent version of the Java Runtime (class file version 65.0)`

**原因**：使用的 Java 版本低于 21

**解决**：按照步骤 1.2 安装并切换到 JDK 21

### 4.2 java.lang.UnsatisfiedLinkError: libawt.dylib

**错误信息**：`Library not loaded: /System/Library/Frameworks/JavaRuntimeSupport.framework/Versions/A/JavaRuntimeSupport`

**原因**：使用了 Java 25（Early Access）或 JDK 与 macOS 版本不兼容

**解决**：切换到 JDK 21 LTS，不要使用 Java 25

### 4.3 NoSuchMethodError: Persistence.extensionData()

**错误信息**：`burp.api.montoya.persistence.Persistence.extensionData()`

**原因**：加载的 MCP 扩展与 Burp 版本不兼容（通常是 Burp 版本太旧）

**解决**：

- 升级 Burp Suite 到最新版（2026.7.3）
- 或在加载扩展前，先确保 Burp 已更新到最新

### 4.4 Burp 启动后立即崩溃

**现象**：点击 Burp 图标后 1 秒内退出

**诊断**：用命令行启动查看详细错误

```bash
/usr/libexec/java_home -v 21 --exec java @burp.vmoptions -jar burpsuite_pro_v2026.7.3.jar
```

**常见原因**：

{: .table}
| 原因 | 解决方案 |
|------|----------|
| Java 版本不对 | 切换到 JDK 21 |
| JVM 参数错误 | 检查 `burp.vmoptions` 内容 |
| 配置文件损坏 | 删除 `~/Library/Application Support/BurpSuite/Preference.json` |

### 4.5 内置浏览器无法启动

**现象**：点击 "Open Browser" 报错 `posix_spawn failed`

**原因**：Burp 自带的 Chromium 150 版本在 Catalina 上不兼容

**解决方案（二选一）**：

**方案 A：手动启动浏览器（推荐）**

创建启动脚本 `~/Desktop/burp-browser.command`：

```bash
#!/bin/zsh
/Applications/Burp\ Suite\ Professional.app/Contents/Resources/app/burpbrowser/108.0.5359.124/Chromium.app/Contents/MacOS/Chromium \
  --proxy-server="http://127.0.0.1:8080" \
  --user-data-dir="/tmp/burp-chromium-profile" \
  --ignore-certificate-errors \
  --disable-web-security \
  --disable-features=IsolateOrigins,site-per-process \
  --no-first-run \
  --new-window "http://burp"
```

双击 `.command` 文件即可启动带代理的浏览器。

{% include common-index/index-preset.html level="info" msg="<strong>TIPS:</strong><br>以上操作会打开一个终端窗口，不够优雅~<br>亦可以新增一个自动操作<code>Burp Browser</code>app，选择<code>运行/bin/zsh脚本</code>保存后默认app在iCloud云盘/自动操作目录下，拖到dock栏即可。" %}



**方案 B：替换 Burp 内置浏览器（不推荐，容易出错）**

需要修改 `manifest.properties` 文件，但 Burp 有严格的完整性校验，替换过程复杂且容易失败。

---

## 五、加载 MCP 扩展（如需连接 Claude Code）

### 5.1 构建扩展

```bash
git clone https://github.com/PortSwigger/mcp-server.git
cd mcp-server
./gradlew embedProxyJar
# 生成 build/libs/burp-mcp-all.jar
```

### 5.2 在 Burp 中加载

1. Burp → **Extensions** 标签 → **Add**
2. Extension Type: **Java**
3. 选择 `burp-mcp-all.jar`
4. 点击 **Next**

### 5.3 配置 Claude Code 连接

```bash
claude mcp add --transport sse burp http://127.0.0.1:9876/sse
```

{% include common-index/index-preset.html level="warn" msg="<strong>注意</strong><br>Burp 的 MCP 服务器默认运行在 <code>http://127.0.0.1:9876/sse</code>，需要确保 Burp 中的 MCP 扩展已启用（MCP 标签页勾选 “Enabled”）。" %}

---

## 六、总结与建议

{: .table}
| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 无法启动 | Java 版本 < 21 | 安装 JDK 21 |
| 图形界面报错 | 使用 Java 25 | 切换回 JDK 21 |
| 扩展加载失败 | Burp 版本太旧 | 升级到 2026.7.3 |
| 内置浏览器崩溃 | Chromium 150 不兼容 Catalina | 手动启动浏览器并配置代理 |
| 安全提示 | 未公证的应用 | 使用 `xattr -d com.apple.quarantine` |

### 最佳实践

- ✅ 始终使用 **JDK 21 LTS**，不要追求最新版 Java
- ✅ 从 **JAR 文件**启动，不要使用 DMG 安装包
- ✅ 使用**命令行启动**，方便查看错误信息
- ✅ **手动启动浏览器**，放弃 Burp 的内置浏览器按钮

---

> 这份教程完全基于实际问题和解决方案编写，适用于在 macOS Catalina 上使用 Burp Suite 2026.7.3。如果遇到其他问题，可以在命令行启动查看详细错误日志，然后针对性解决。
