---
layout: post
toc: true
title: "「安卓渗透」：总览"
author: Bin4xin
categories:
    - blog
    - 笔记
    - 渗透
    - Android Reverse
permalink: /blog/2019/android/reversr/blog/
---


* 摘要：最近在学安卓渗透,遂记录下相关知识点和一些没有弄明白的知识点。持续更新updating~
<br>
<br>

## 前言
接触了一些安卓渗透的项目，根据不同安全公司内部的要求，规定对于安卓渗透技术的基本原则、工作方式；且使用不同的、对外的商业渗透测试。
综述包括如下:<br>
1.代码、程序安全;<br>
2.验证码机制安全;<br>
3.越权检测;<br>
4.服务器WEB漏洞。

## 一、代码/程序安全
#### 1.源码反编译，保证源码安全，保证源码不被反编译。
防止不法分子阅读源码，了解运行逻辑。
#### 2.代码混淆安全，对程序代码进行混淆加密
防止不法分子读懂源码。
#### 3.二次打包安全
防止不发分子对安装包进行篡改操作。
```
		|_主要onCreate操作类，弹窗代码：
				AlertDialog.Builder builder  = new Builder(MainActivity.this);
				builder.setTitle("test alert" ) ;
				builder.setMessage("test by bin4xin" ) ;
				builder.setPositiveButton("yes" ,  null );
				builder.show(); 
		|_在关键位置插入toast提示代码：
				btnToast1.setOnClickListener(new View.OnClickListener() {            
             @Override
             public void onClick(View v) {
                 // TODO Auto-generated method stub
                 Toast toast=Toast.makeText(MainActivity.this,"Toast Message",Toast.LENGTH_SHORT    );
                 toast.setGravity(Gravity.CENTER, 0, 0);
                 toast.show();
             	}
        		});
		|_在关键位置插入关键调试日志输出：
				public static int d(String tsg,String msg)
				Log.d("DEBUG", "This is a debug");
		|_分析smali/so代码的具体校验位置，是否能修改绕过防护；
		|_分析正版合法型数据的绕过。
```
#### 4.签名校验安全<br>
防止不法分子篡改源码、二次打包后传播安装包。
#### 5.so文件安全？<br>
so库和import库的区别，so文件可以理解成一个安装包的反汇编文件？）
#### 6.H5代码安全？<br>
（H5代码在安卓工程中的作用是否为静态代码、用于展示等）

#### 7.APK升级机制<br>
防止升级apk为不法分子的二次打包的apk。
## 二、调试安全

#### 8.debug属性安全
防止发行版apk可以调试
```
	|_AndroidManifest.xml->[-]删除debuggable属性或设置为false；
```