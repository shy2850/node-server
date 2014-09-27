f2e-server
===========
基于nodejs平台的HTTP服务器，提供了基本的模板引擎以及常用的前端工具。
<br/>
a nodejs based http-server with easy-template-engine and several F2E-utils

<p>github: <a href="https://github.com/shy2850/node-server.git">https://github.com/shy2850/node-server.git</a></p>
<br>
<p><strong>NPM: npm install f2e-server</strong></p>
<p><strong>修改hosts[windows]: node host </strong></p>
<p><strong>运行: node node_modules/f2e-server [explorer http://localhost:2850]</strong></p>
<p><strong>恢复hosts[windows]: node hosts reset </strong></p>
<p><strong>项目配置: f2e-server/nodeLib/config/conf.js</strong></p>

conf.js 配置
===========
<p>
	<table style="text-align:center">
		<tr>
			<th>配置名:</th><th>描述</th><th>默认值</th><th>其他</th>
		</tr>
		<tr>
			<td>root</td>
			<td>服务器索引的根目录，可配置为任意本地硬盘路径(斜杠结尾)</td>
			<td>D:\\</td>
			<td>建议多个配置路径一般不要重叠</td>
		</tr>
		<tr>
			<td>welcome</td>
			<td>项目更目录的欢迎页面</td>
			<td>-</td>
			<td>仅对根目录有用</td>
		</tr>
		<tr>
			<td>notFound</td>
			<td>404页面配置路径,文件系统完整路径</td>
			<td>服务器Demo</td>
			<td>为空或者配置异常时,用最简单的404文字代替页面</td>
		</tr>
		<tr>
			<td>folder</td>
			<td>文件列表页面模板</td>
			<td>服务器Demo</td>
			<td>需要开启runJs配置支持</td>
		</tr>
		<tr>
			<td>handle</td>
			<td>启用服务器包含/被包含以及模板引擎</td>
			<td>true</td>
			<td>可以在GET请求参数中增加handle=false,查看源文件</td>
		</tr>
		<tr>
			<td>coffee/less</td>
			<td>中间件相关配置</td>
			<td>true</td>
			<td>nodeLib/common/middleware.js</td>
		</tr>
		<tr>
			<td>debug</td>
			<td>设置为false后，将对所有js和css类型文件进行压缩</td>
			<td>true</td>
			<td>可以在GET请求参数中增加debug=true,来恢复被压缩的资源</td>
		</tr>
		<tr>
			<td>fs_mod</td>
			<td>展示文件夹列表页面</td>
			<td>true</td>
			<td></td>
		</tr>
		<tr>
			<td>port</td>
			<td>服务器端口号</td>
			<td>80/2850</td>
			<td>如果应用开启失败极有可能是端口被占用</td>
		</tr>
		<tr>
			<td>maxConnections</td>
			<td>当前服务器最大并发请求数</td>
			<td>1000</td>
			<td>根据不同应用调节并发请求数</td>
		</tr>
		<tr>
			<td>nginx-http-concat</td>
			<td>合并相同类型文本类型请求</td>
			<td>true</td>
			<td>完全匹配nginx响应扩展模块规则</td>
		</tr>
		<tr>
			<td>expires</td>
			<td>缓存时间设置</td>
			<td>0</td>
			<td>开启缓存有利于减少HTTP请求和减小服务端压力</td>
		</tr>
		<tr>
			<td>agent</td>
			<td>
				通过请求路径正则匹配设置代理请求转发
				<p>host: 转发的HTTP服务器域名</p>
				<p>port: 服务器端口,默认是80</p>
				<p>path: 转发请求和本地请求路径的映射规则,不设置即表示相同</p>
				<p>cookie: 为了解决SSO等问题提供cookie验证支持,直接从原地址请求结果头复制cookie</p>
			</td>
			<td>-</td>
			<td>代理转发，仅在原地址无数据返回时候触发,只是post字段,不支持文件上传</td>
		</tr>
	</table>
</p>
