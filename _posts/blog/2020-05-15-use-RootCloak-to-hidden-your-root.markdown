---
layout: post
toc: true
title: "「安卓」:使用rootCloak绕过root权限监测"
author: Bin4xin
categories:
    - blog
    - 笔记
    - Android Reverse
permalink: /blog/2020/escape/from_android_root/
---


* gradle打包
    - https://blog.csdn.net/EthanCo/article/details/52064044
    - https://www.kutu66.com/GitHub/article_105897
    - https://jingyan.baidu.com/article/c45ad29c20a123051753e2af.html

```javascript
.\gradlew.bat task
Active code page: 65001
Failed to notify ProjectEvaluationListener.afterEvaluate(), but primary configuration failure takes precedence.
java.lang.RuntimeException: SDK location not found. Define location with sdk.dir in the local.properties file or with an ANDROID_HOME environment variable.
        at org.gradle.initialization.DefaultGradleLauncher.doBuildStages(DefaultGradleLauncher.java:122)
        at org.gradle.initialization.DefaultGradleLauncher.access$200(DefaultGradleLauncher.java:32)
        at org.gradle.initialization.DefaultGradleLauncher$1.create(DefaultGradleLauncher.java:99)
        at org.gradle.initialization.DefaultGradleLauncher$1.create(DefaultGradleLauncher.java:93)
        at org.gradle.internal.progress.DefaultBuildOperationExecutor.run(DefaultBuildOperationExecutor.java:90)
        at org.gradle.internal.progress.DefaultBuildOperationExecutor.run(DefaultBuildOperationExecutor.java:62)
        at org.gradle.initialization.DefaultGradleLauncher.doBuild(DefaultGradleLauncher.java:93)
        at org.gradle.initialization.DefaultGradleLauncher.run(DefaultGradleLauncher.java:82)
        at org.gradle.launcher.exec.InProcessBuildActionExecuter$DefaultBuildController.run(InProcessBuildActionExecuter.java:94)
        at org.gradle.tooling.internal.provider.ExecuteBuildActionRunner.run(ExecuteBuildActionRunner.java:28)
        at org.gradle.launcher.exec.ChainingBuildActionRunner.run(ChainingBuildActionRunner.java:35)
        at org.gradle.launcher.exec.InProcessBuildActionExecuter.execute(InProcessBuildActionExecuter.java:43)
        at org.gradle.launcher.exec.InProcessBuildActionExecuter.execute(InProcessBuildActionExecuter.java:28)
        at org.gradle.launcher.exec.ContinuousBuildActionExecuter.execute(ContinuousBuildActionExecuter.java:78)
        at org.gradle.launcher.exec.ContinuousBuildActionExecuter.execute(ContinuousBuildActionExecuter.java:48)
        at org.gradle.launcher.exec.DaemonUsageSuggestingBuildActionExecuter.execute(DaemonUsageSuggestingBuildActionExecuter.java:51)
        at org.gradle.launcher.exec.DaemonUsageSuggestingBuildActionExecuter.execute(DaemonUsageSuggestingBuildActionExecuter.java:28)
        at org.gradle.launcher.cli.RunBuildAction.run(RunBuildAction.java:43)
        at org.gradle.internal.Actions$RunnableActionAdapter.execute(Actions.java:170)
        at org.gradle.launcher.cli.CommandLineActionFactory$ParseAndBuildAction.execute(CommandLineActionFactory.java:237)
        at org.gradle.launcher.cli.CommandLineActionFactory$ParseAndBuildAction.execute(CommandLineActionFactory.java:210)
        at org.gradle.launcher.cli.JavaRuntimeValidationAction.execute(JavaRuntimeValidationAction.java:35)
        at org.gradle.launcher.cli.JavaRuntimeValidationAction.execute(JavaRuntimeValidationAction.java:24)
        at org.gradle.launcher.cli.CommandLineActionFactory$WithLogging.execute(CommandLineActionFactory.java:206)
        at org.gradle.launcher.cli.CommandLineActionFactory$WithLogging.execute(CommandLineActionFactory.java:169)
        at org.gradle.launcher.cli.ExceptionReportingAction.execute(ExceptionReportingAction.java:33)
        at org.gradle.launcher.cli.ExceptionReportingAction.execute(ExceptionReportingAction.java:22)
        at org.gradle.launcher.Main.doAction(Main.java:33)
        at org.gradle.launcher.bootstrap.EntryPoint.run(EntryPoint.java:45)
        at sun.reflect.NativeMethodAccessorImpl.invoke0(Native Method)
        at sun.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:62)
        at sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43)
        at java.lang.reflect.Method.invoke(Method.java:498)
        at org.gradle.launcher.bootstrap.ProcessBootstrap.runNoExit(ProcessBootstrap.java:54)
        at org.gradle.launcher.bootstrap.ProcessBootstrap.run(ProcessBootstrap.java:35)
        at org.gradle.launcher.GradleMain.main(GradleMain.java:23)
        at sun.reflect.NativeMethodAccessorImpl.invoke0(Native Method)
        at sun.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:62)
        at sun.reflect.DelegatingMethodAccessorImpl.invoke(DelegatingMethodAccessorImpl.java:43)
        at java.lang.reflect.Method.invoke(Method.java:498)
        at org.gradle.wrapper.BootstrapMainStarter.start(BootstrapMainStarter.java:33)
        at org.gradle.wrapper.WrapperExecutor.execute(WrapperExecutor.java:130)
        at org.gradle.wrapper.GradleWrapperMain.main(GradleWrapperMain.java:48)

FAILURE: Build failed with an exception.
```
https://blog.csdn.net/coder_ken/article/details/50853927