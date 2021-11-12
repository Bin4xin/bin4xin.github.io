---
layout: about
category: about
Researchname: javaDeser
permalink: /about/javaDeser/
toc: true
---

> <i class="fa fa-quote-left"></i> 序列化和反序列化是一种常见的编程思想；
>
> php、python也都存在此种机制。序列化就是将对象转化成字节流，便于保存在内存、文件或者数据库中(保存此对象的状态)。
> 反序列化就是将字节流转化为对象。 <i class="fa fa-quote-right"></i>

我们来做个简单的小实验：
定义`People class -> name、age`，在web中很常见：
```java
import java.io.Serializable;

public class People implements Serializable {
    public String name;
    public int age;
    public String getName() {
        return name;}

    public void setName(String name) {
        this.name = name;}

    public int getAge() {
        return age;}

    public void setAge(int age) {
        this.age = age;}
}
```
调用序列化接口把我们的Java对象转化为`byte[]`数组，将二进制内容写入People.txt文档：

```bash
➜ file People.txt 
People.txt: Java serialization data, version 5
➜ xxd People.txt
00000000: aced 0005 7372 0006 5065 6f70 6c65 4499  ....sr..PeopleD.
00000010: 4080 2db3 403b 0200 0249 0003 6167 654c  @.-.@;...I..ageL
00000020: 0004 6e61 6d65 7400 124c 6a61 7661 2f6c  ..namet..Ljava/l
00000030: 616e 672f 5374 7269 6e67 3b78 7000 0000  ang/String;xp...
00000040: 1274 0008 7869 616f 6d69 6e67            .t..xiaoming

➜ java Test
people对象序列化成功！
#将序列化数据写入People.txt
people对象反序列化成功！
#读取People.txt反序列化从字节流读取Java对象
xiaoming
18
```

- #### [*点击以快速开始 / 查看[序列化/反序列化] demo*](https://github.com/Bin4xin/bigger-than-bigger/tree/master/Java%20Deser%20code){:target="_blank"}
    - #### <kbd> ⌘/⏏︎ + 左键</kbd> [*移步仓库查看 Test.java*](https://github.com/Bin4xin/bigger-than-bigger/blob/master/Java%20Deser%20code/Test.java){:target="_blank"}

下一步就是模拟反序列化攻击；我们添加以下攻击代码：
```java
public class People implements Serializable {
    //添加以下方法，重写People类的readObject()方法
    private void readObject(java.io.ObjectInputStream in) throws IOException, ClassNotFoundException{
        //执行默认的readObject()方法
        in.defaultReadObject();
        //执行打开计算器程序命令
        Runtime.getRuntime().exec("calc.exe");
    }
}
```
所以简而言之，web中传入的反序列化RCE的poc必然是传入参数可控。效果：
![](/static/web-image/javadeser/javaDeser-rce.png)


### 参考

- [Java · 序列化](https://www.liaoxuefeng.com/wiki/1252599548343744/1298366845681698#0){:target="_blank"}
- [分析调试apache shiro反序列化漏洞(CVE-2016-4437)](https://saucer-man.com/information_security/396.html){:target="_blank"}
