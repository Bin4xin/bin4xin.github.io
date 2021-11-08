---
layout: post
title: "PHP:部署的一揽子问题"
date: 2020-11-25
author: Bin4xin
toc: true
categories:
    - blog
    - php
    - 笔记
permalink: /blog/2020/php-depoly/
---

```bash
[Wed Nov 25 17:19:33.475439 2020] [php7:notice] [pid 11872] [client 10.211.55.2:53568] PHP Notice:  Undefined index: step in /var/www/
html/code/BabyOnline1/setup/setupwizard.php on line 4 [Wed Nov 25 17:19:33.475577 2020] [php7:error] [pid 11872] [client 10.211.55.2:53568] 
PHP Fatal error:  Uncaught Error: Class 'DOMDocument' not found in /var/www/html/code/BabyOnline1/setup/setupwizard.php:46\n
Stack trace:\n#0 {main}\n  thrown in /var/www/html/code/BabyOnline1/setup/setupwizard.php on line 46
```


```
[Wed Nov 25 17:21:46.224793 2020] [php7:error] [pid 11882] [client 10.211.55.2:53602] PHP Fatal error:  Uncaught Error: 
Call to undefined function mysqli_connect() in 

/var/www/html/code/BabyOnline1/utility/mysqli5.php:39\nStack trace:\n#0 /var/www/html/code/BabyOnline1/utility/fun.class.php(281): 
Conn->__construct('localhost', '3306', 'root', 'tsinglink', 'qx_bbol', 'UTF8', true)\n#1 /var/www/html/code/BabyOnline1/utility/fun.class.php
(255): Utility->CreateDBConnect('localhost', '3306', 'root', 'tsinglink', 'qx_bbol', 'UTF8')\n#2 /var/www/html/code/BabyOnline1/platform/php/
ini.php(41): Utility->__construct()\n#3 /var/www/html/code/BabyOnline1/platform/php/plat_manage.php(5): require_once('/var/www/html/c...')
\n#4 {main}\n  thrown in /var/www/html/code/BabyOnline1/utility/mysqli5.php on line 39, referer: http://10.211.55.4/platform/
```
提示在`/var/www/html/code/BabyOnline1/utility/fun.class.php(281)`文件、
`/var/www/html/code/BabyOnline1/platform/php/ini.php(41)`文件
`/var/www/html/code/BabyOnline1/utility/mysqli5.php on line 39`文件

第一个fun.class.php文件是实现的日志写入数据库的功能；
```
function WriterToDB($typeid,$clientAddress,$datetime,$file,$line,$function,$content)
	{
		global $utility;
		if(is_array($content))
		{
			$conn = $utility->CreateDBConnect($_SESSION["DB"]["Host"],$_SESSION["DB"]["Port"],$_SESSION["DB"]["User"],$_SESSION["DB"]["Password"],$_SESSION["DB"]["Name"],$_SESSION["DB"]["Character"]);
			$conn->Query("INSERT INTO `NMIOperationLog` (`Index`,`Operation`,`OperationTime`,`Description`,`ManageDomainUserInfo_Index`,`ManageDomain_Index`,`ManageDomainUserInfo_Identity`,`ManageDomains`,`SqlScript`)VALUES(null,'".$content["Operation"]."','".$content["OperationTime"]."','".addslashes($content["Description"])."','".$content["ManageDomainUserInfo_Index"]."','".$content["ManageDomain_Index"]."','".$content["ManageDomainUserInfo_Identity"]."','".$content["ManageDomains"]."','".addslashes($content["SqlScript"])."') ");
	
			//$log->Writer(1,"NMI",strftime("%Y-%m-%d %H:%M:%S",time()),__FILE__,__LINE__,__FUNCTION__,mysql_error());
			
		}
		return true;
	}
```
连库WriterToDB实现功能如上；同样的`ini.php`同样定义了数据库的配置信息包括类型、url和连接信息：
```
define('LOGSAVETYPE',1);
define('LOGLEVEL',1);

define('DB_TYPE', "mysql"); 
define('IMAGE_URL', "http://61.191.35.32:8580/BabyOnline/");
define('DB_SOURCEFILE_PATH',dirname(dirname(dirname(__FILE__)))."/utility/dbsource.ini");
```
`dbsource.ini`文件里面则详细配置了jdbc的配置信息，就不单独放出来了；再来看看最后一个文件，同样是连接数据库，然后发现了一些有趣的：
随意捡了一些构造函数：
```
function QueryRecordCount($sqlstr)
	{
		if($this->connect)
		{
			unset($row);
			$row=$this->FetchArray($this->Query("SELECT count(1) as RecordCount FROM ".$sqlstr." "));
			return ($row['RecordCount'] > 0 ? $row['RecordCount'] : 0);
		}
		else
		{
			return 0;
		}
	}


if($link->FetchArray($link->query("SELECT * FROM User WHERE `Identity`='$UserId' AND AreaCode='$AreaCode'")))
    {
    ···
    }
```
咳咳，跑偏了，以上来看就直接修改ini文件就行了。