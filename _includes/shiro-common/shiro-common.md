{% include common-index/index-preset.html level="warn" msg="Shiro 通用前置技术文档：以下内容仅供安全研究与授权渗透测试使用，任何未经授权的攻击行为均属违法。" %}

### SHIRO COMMON TABLE

<table class="table">
<thead>
<tr>
<th align="left">前置</th>
<th align="left">备注</th>
</tr>
</thead>
<tbody>
<tr>
<td align="left"><strong>构建问题</strong></td>
<td align="left"><ul dir="auto"><li><a href="/about/Research-on-Webshell-Attack-of-Shiro-Framework-Based-on-Memory/#-0x01idea-tomcat%E8%B0%83%E8%AF%95%E9%83%A8%E7%BD%B2">IDEA tomcat本地调试部署</a></li><ul><li>如何快速切换shiro版本</li><li>如何快速构建sample-web</li></ul></ul></td>
</tr>
<tr>
<td align="left"></td>
<td align="left"><ul dir="auto"><li>若需解决上面的问题，那么亟需修改的就是对于About的源码构建的问题</li><li>是否能够仓库2 Action构建的源码推送的仓库1的分支上</li></ul></td>
</tr>
<tr>
<td align="left"><strong>攻击</strong></td>
<td align="left"><ul dir="auto"><li><a href="/about/ShiroDeser/#1x01shiro代码层分析">代码层分析</a></li></ul></td>
</tr>
<tr>
<td align="left"><strong>CVE</strong></td>
<td align="left"><strong>链接</strong></td>
</tr>
</tbody>
</table>

{% include common-index/index-preset.html level="info" msg="提示：Shiro 反序列化漏洞涉及多个 CVE（如 CVE-2016-4437、CVE-2019-12422、CVE-2020-1957 等），建议结合具体版本进行针对性分析。" %}