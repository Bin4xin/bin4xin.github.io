---
layout: about
category: about
Researchname:  通达OA利用代码分析
toc: true
author: Bin4xin
permalink: /about/ToDa-OA-VulnPoc-by-java-analysis/
---

### `main()`
```java
//Main.java
public class Main {
    public static void main(String[] args) {
        new TDOAFrame();
    }
}
```
### <kbd>⌘ command</kbd>+ 左键单击 `TDOAFrame` 跳转<a href=""> <i class="fa fa-hand-o-down"></i></a>
```java
//TDOAFrame.java
import javax.swing.*;
import java.awt.*;
public class TDOAFrame extends JFrame{}

/* TDOAFrame继承Jframe，画出GUI对应按钮等
 * JLabel jLabel = new JLabel("目标地址: ");
 * JTextField field_url = new JTextField("http://192.168.238.141", 45);
 * 继续往下初始化Jbutton
 * JButton button = new JButton("获取Cookie");
 * JButton button2 = new JButton("一键利用");
 * 给button"获取Cookie"按钮绑定事件
 * 给Button2"一键利用"按钮绑定事件
 */

public class TDOAFrame extends JFrame {
    public TDOAFrame(String title){
    button.addActionListener(new GetCookieActionListener(field_url, field_cookie, textArea)); 
    button2.addActionListener(new GetShellActionListener(field_url, field_cookie, jcomboBox, textArea));
    }
}
```
同样的，我们通过初始化按钮监听器，传入对应按钮所对应的参数，如：
`GetCookieActionListener(field_url, field_cookie, textArea)` & `GetShellActionListener(field_url, field_cookie, jcomboBox, textArea)`

即：`button获取cookie`获取用户输入的`field_url, field_cookie` 输入到`textArea`<a href=""><i class="fa fa-hand-o-right"></i></a> 紧接着`button利用按钮`点击触发获取`field_url, field_cookie, jcomboBox`，
将最终结果输出到`textArea`，但我们从图形界面来看，两个文本域应该不是同一个域，实际上我也很奇怪这一点。

紧接着，继续

### <kbd>⌘ command</kbd> + 左键单击`GetCookieActionListener`跳转<a href=""> <i class="fa fa-hand-o-down"></i></a>

```
private JTextField field_url; //目标地址
private JTextField field_cookie; //Cookie
//private JComboBox jcomboBox; GetShellActionListener利用方式显示
private TextArea textArea; //多行文本框,显示程序运行状态
```

`GetCookieActionListener`是对应按钮监听功能，与其相同的还有`GetShellActionListener`，主方法分析完毕后，操作逻辑就是这两个按钮的操作逻辑，具体工作逻辑如下：

![截屏2021-07-21 上午9.27.02.png](https://i.loli.net/2021/07/21/faGVkMqhYxR4Z6c.png)

Step 1跑完后跳至Step 2，最后Step 3；

### 美化:D [Updating...]

BeautyEye GUI美化

- http://www.52im.net/thread-26-1-1.html
- http://www.52im.net/extend/docs/api/beautyeyev3/index.html?overview-tree.html
- http://www.52im.net/extend/docs/api/beautyeyev3/serialized-form.html#org.jb2011.lnf.beautyeye.ch1_titlepane.BETitlePane

~~美化前：~~

~~美化后：~~
