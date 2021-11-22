---
layout: about
category: about
Researchname:  Dynamic-analysis-of-java-framework-code
toc: true
author: Bin4xin
permalink: /about/Dynamic-analysis-of-java-framework-code/
---

# 零：[debug] the world

- [ ] debug基本用法介绍
    - [ ] debug的几个分类断点介绍
    - [ ] 分类断点的使用
- [x] debug简单例子演示
- [ ] 以SHIRO框架来进行动态java代码调试分析

## 0x01：debug的基本用法

## 0x02：debug实现line breakpoints
了解了怎么调试后，第一步：`debug the world`。

- 1.新建程序
    - 打开开发软件(intelliJ IDEA或者eclipse)
    - 新建project
    - new 一个 class
    - hello.java:
    ```java
    public class hello {
    
            public static void main(String[] args) {
                    
                    System.out.println("this is a block test message");
                    System.out.println("hello world");
    
            }
    }
    ```
- 2.运行程序
    - `${path-to-project}/hello/src/hello.java`-右键-`run hello.main()`
    - console台输出即程序运行成功：
    ```bash
       ···
       ···
       this is a block test message
       hello world
       
       Process finished with exit code 0
    ```

- 3.调试程序
    - 实现现象：
        - 1)程序输出`this is a block test message`后停下
        - 2)人工干预后输出`hello world`

就这样我们就可以在对一个简单的java程序进行进程断点后，我们就能够对程序的输出的进度可控。

# 二：断点用法

## 0x01：
