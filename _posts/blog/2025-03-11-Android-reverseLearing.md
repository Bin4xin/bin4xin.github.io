---
layout: post
title: "Android逆向学习"
date: 2025-03-11
toc: true
author: Bin4xin
categories:
- blog
tags:
- Android
---

# Android逆向学习笔记
## 1. Android逆向学习
### 基础知识
1. Davlik Android OS的虚拟机，Dalvik基于寄存器，Java VM基于栈，二者明显区别。Davlik专属文件执行格式dex，比Java JVM运行快，内存占用少。
2. 反编译 Apktool、dex2jar+jd-gui，最终修改APK需要操作.smali文件，然后再使用Apktool将修改的文件打包成APK，再使用 jarsigner进行APK签名：jarsigner -keystore name.keystore Folder keystorealias -keypass passwd
3. Davlik中寄存器32位，64位类型（Long/Double）用2个寄存器表示，字节码2中类型：原始类型、引用类型（包括对象和数组）
  - B- - -byte
  - C- - -char
  - D- - -double
  - F- - -float
  - I- - -int
  - J- - -long
  - S- - -short
  - V- - -void
  - Z- - -boolean
  - [XXX- - -array
  - Lxxx/yyy- - -object : LpackageName/objectName$subObjectName;
4. smali函数
  1.  hello()V —\> void hello()
  2. hello(III)Z —\> boolean hello(int,int,int)
  3. hello(Z[I[ILjava/lang/String;J)Ljava/lang/String; —\> String hello(boolean,int[],int[],String,long)
5. Smali基本语法
  1. .field private isFlag:z   定义变量  
     .field button\_login:Landroid/widget/Button;
  2. .method  方法
     .method protected onCreate(Landroid/os/Bundle;)V
  3. .parameter  方法参数
     .param p1, "name"    # Ljava/lang/String;
  4. .prologue  方法开始
  5. .line 36   此方法位于36行
  6. Invoke-super  调用父函数
  7. Return-void  函数返回void
  8. Move-result v0   上面函数执行的结果赋值给v0
  9. .end method 函数结束
  10. New-instance 创建实例
  11. Input-object  对象赋值
  12. Iget-object  调用对象
  13. Invoke-static  调用静态函数
  14. Invoke-virtual  调用函数
      invoke-virtual {p1, v0}, Ljava/lang/String;-\>equals(Ljava/lang/Object;)Z
  15. Const-string  string赋值
      const-string v0, "snow"
6. smali的条件分支
  1. If-eq vA,vB,:cond\_\*\* 如果vA和vB相等，则跳转至cond\_\*\*
  2. If-ne（不等于）、if-lt（小于）、if-ge（大于等于）、if-gt（大于）、if-le（小于等于）
  3. If-eqz v0:cond\_\*\* 如果V0等于0，则跳转至cond
  4. If-nez（不等于0）、if-ltz、if-gtz、if-gez、if-lez
7. 类的声明：
   .class public Lcom/aaaa;
   .super Lcom/bbbb;
   .source “ccc.java”
   包路径、父类、文件名称
   \#annotations
   .annotation system Ldalvik/annotation/MemberClasses;
   value={
   Lcom/aaa$qq;
   Lcom/aaa$bb;
   }
   内部类：aaa类的两个成员内部类qq和bb；
8. 寄存器V开头的是指本地寄存器，P开头的是指参数寄存器，对于非static函数中,P0代表“this”，P1代表第一个参数，而在static函数中，P0代表第一个参数。
   const/4 v0,0x1
   input-boolean v0,p0,Lcom/aaa;-\>IsRegistered:Z
   0x1放入本地寄存器v0，input-boolean将v0的值存放在com.aaa.IsRegistered变量中。
9. 成员变量：
  1. .field public/private [static] [finale] varName:\<类型\>
  2. 不同的变量，不同的指令：iget、sget、iget-boolean、sget-boolean、iget-object、sget-object等；input、input-boolean、sput-boolean、iput-object、sput-object等；-object后缀的表示操作对象是对象类型，对boolean类的操作则使用-boolean。
  3. Sget-object v0,Lcom/aaa;-\>ID:Ljava/lang/String; 获取com.aaa.ID的值放入V0
  4. Iget-object v0,p0,Lcom/aaa;-\>view:Lcom/aaa/view; 此处多了一个参数p0，指的是this，array变量采用aget和aget-object
  5. this.timer=null  
     const/4 v3,0x0
     sput-object v3,Lcom/aaa;-timer:Lcom/aaa/timer;
  6. .local v0, args:Landroid/os/Message;
     const/4 v1, 0x12
     input v1, v0,Landroid/os/Message;-\>what:I
     此处args是Message的实例，args.what=18
10. 函数调用：
  1. 函数分为direct method和virtual method，简单说direct 即private函数，其余的public和protected均属于virtual函数，所以在调用函数时，有invoke-direct、invoke-virtual，另外以及invoke-static、invoke-super、invoke-interface等几种不同的指令，当然还有invoke-XXX/range的指令，这是指参数多余4个的时候调用的指令；
  2. Invoke-static{v0},Ljava/lang/System;-\>loadLibrary(Ljava/lang/String;)V 其中{}中指定函数调用的参数值；
     invoke-direct{p0},Landroid/app/TabActivity;-\>\<init\>()V =\> init()   
     invoke-virtual{v0,v1},Lcom/cc;-\>Message(Ljava/lang/Object;)V  
     invoke-direct/range{v0,…,v5},Lcom/pb/ui/PBContainerActivity;-h(Ljava/lang/CharSequence;Ljava/lang/String;Landroid/content/Intent;l)Z
  3. 在Java代码中，调用函数和返回值可以使用一条语句完成，但是在smali中需要分开来完成，如果返回的非void，需要使用move-result（返回基本数据类型）和move-result-object（返回对象）指令：
     const-string v0,”Eric”
     invoke-static{0},Lcmd/pbi;-\>t(Ljava/lang/String;)Ljava/lang/String;
     move-result-object v2 //v2保存的就是t方法返回的值
  4. 代码理解：
     Add-int/lit8 v0,v0,0x1  //将第二个v0寄存器中的值加上0x1的值，再放入第一个寄存器，实现自增长  
     .locals 4  //本地寄存器4个，即v0,v1,v2,v3,v4
     const/4 v2,0x1  //4字节常量 V2=1
     const/16 v1,0x10 //16字节常量v1=16
     .local v1,”length”:I  //赋值 length=v1
     xor-int/lit8 v1,v1,0x3b  //将第二个寄存器v1的值和0x3b进行异或运算，赋值给第一个v1寄存器中
  
## REF

- [shadow-horse/Learning-resource](https://github.com/shadow-horse/Learning-resource/blob/master/Android/Android%E9%80%86%E5%90%91%E5%AD%A6%E4%B9%A0.md)
