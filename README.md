node-server
===========
基于nodejs平台的文件服务器，提供了基本的模板引擎以及常用的前端工具。
<br/>
a nodejs based file-system-server with easy-template-engine and several F2E-utils

<div class="panel-block">
	<p>
		<span style="font-family: 微软雅黑, 'Microsoft YaHei';">
			github:&nbsp;
		</span>
		<a href="https://github.com/shy2850/node-server.git" _src="https://github.com/shy2850/node-server.git"
		style="font-family: 微软雅黑, 'Microsoft YaHei'; text-decoration: underline;">
			<span style="font-family: 微软雅黑, 'Microsoft YaHei';">
				https://github.com/shy2850/node-server.git
			</span>
		</a>
		<span style="font-family: 微软雅黑, 'Microsoft YaHei';">
			&nbsp;
		</span>
	</p>
	<p>
		<span style="font-family: 微软雅黑, 'Microsoft YaHei';">
			npm:&nbsp;
		</span>
		<span style="font-family: 微软雅黑, 'Microsoft YaHei';">
			npm install f2e-node-server
		</span>
		<span style="font-family: 微软雅黑, 'Microsoft YaHei';">
			&nbsp;
		</span>
	</p>
	<h1>
		<span style="font-family: 微软雅黑, 'Microsoft YaHei';">
			why
		</span>
	</h1>
	<ol class=" list-paddingleft-2" style="list-style-type: decimal;">
		<li>
			<p>
				<span style="font-family: 微软雅黑, 'Microsoft YaHei';">
					出于学习的目的，学习掌握nodejs的核心API，从一个应用着手。
				</span>
			</p>
		</li>
		<li>
			<p>
				<span style="font-family: 微软雅黑, 'Microsoft YaHei';">
					出于对前端相关的新鲜的开发模式的兴趣，搭建了动态的less&amp;coffeeScript解释器，方便的编码调试。
				</span>
			</p>
		</li>
		<li>
			<p>
				<span style="font-family: 微软雅黑, 'Microsoft YaHei';">
					搜集常用的前端优化方案，主要是：javascript以及css文件的压缩，包括简单压缩和智能混淆，动态的支持，实现从服务端实现资源的优化【压缩，合并(待完成)】。
				</span>
			</p>
		</li>
		<li>
			<p>
				<span style="font-family: 微软雅黑, 'Microsoft YaHei';">
					提供页面拆分/包含的功能，方便统一文档框架的维护。
				</span>
			</p>
		</li>
		<li>
			<p>
				<span style="font-family: 微软雅黑, 'Microsoft YaHei';">
					提供基本的模板引擎，完全javascript语句实现服务端脚本功能。
				</span>
			</p>
			<p>
				<span style="font-family: 微软雅黑, 'Microsoft YaHei';">
				</span>
			</p>
		</li>
	</ol>
	<p>
		<br>
	</p>
	<p>
		<br>
	</p>
	<h2>
		<span style="font-family: 微软雅黑, 'Microsoft YaHei';">
			模板引擎
		</span>
	</h2>
	<p>
		<span style="font-family: 微软雅黑, 'Microsoft YaHei';">
			1. 使用&lt;%%&gt;区分js代码和原生文本
		</span>
	</p>
		<ol class=" list-paddingleft-2" style="list-style-type: lower-alpha;">
			<li>
				<pre class="brush:js;toolbar:false">
					&lt;%&nbsp;for(var&nbsp;i&nbsp;=&nbsp;0;&nbsp;i&nbsp;&lt;&nbsp;4;&nbsp;i++)&nbsp;{%&gt;
					&nbsp;&nbsp;&nbsp;&nbsp;&lt;h2&gt;&lt;%&nbsp;if(i%2==0){&nbsp;%&gt;Welcome&nbsp;&lt;%}&nbsp;else{%&gt;YOU&lt;%}&nbsp;%&gt;&lt;/h2&gt;
					&lt;%&nbsp;}&nbsp;%&gt;
				</pre>
				<p>
					转换后的HTML文本
				</p>
			</li>
			<li>
				<pre class="brush:html;toolbar:false;">
					&lt;h2&gt;Welcome&nbsp;&lt;/h2&gt;&nbsp;&nbsp;&nbsp;&nbsp; &lt;h2&gt;YOU&lt;/h2&gt;&nbsp;&nbsp;&nbsp;&nbsp;
					&lt;h2&gt;Welcome&nbsp;&lt;/h2&gt;&nbsp;&nbsp;&nbsp;&nbsp; &lt;h2&gt;YOU&lt;/h2&gt;
				</pre>
			</li>
		</ol>
	<p>
		<span style="font-family: 微软雅黑, 'Microsoft YaHei';">
			&nbsp; &nbsp; &nbsp;&nbsp;
		</span>
	</p>
	<p>
		<span style="font-family: 微软雅黑, 'Microsoft YaHei';">
			2. 输出变量后台变量&lt;% echo(str) %&gt; 或者 &lt;%=str%&gt;
		</span>
		<span style="font-family: 微软雅黑, 'Microsoft YaHei';">
			&nbsp;
		</span>
	</p>
  <ol class=" list-paddingleft-2" style="list-style-type: lower-alpha;">
			<li>
	<pre class="brush:html;toolbar:false">
		&lt;div&nbsp;id="hd"&gt; &nbsp;&nbsp;&nbsp;&nbsp;&lt;%&nbsp;echo(&nbsp;new&nbsp;Date()&nbsp;)&nbsp;%&gt;&nbsp;&lt;%=&nbsp;"hello&nbsp;world!"%&gt;
		&lt;/div&gt;
	</pre>
  	</li>
		</ol>
	<p>
		<br>
	</p>
	<p>
		<span style="font-family: 微软雅黑, 'Microsoft YaHei';">
		</span>
		<span style="font-family: 微软雅黑, 'Microsoft YaHei';">
			3. 包含和布局：&nbsp;
		</span>
	</p>
	<ul class=" list-paddingleft-2" style="list-style-type: disc;">
		<li>
			<p>
				<span style="font-family: 微软雅黑, 'Microsoft YaHei';">
					include :&nbsp;$include[包含文件路径]，该路径使用相对项目根目录的绝对路径。
				</span>
			</p>
		</li>
		<li>
			<p>
				<span style="font-family: 微软雅黑, 'Microsoft YaHei';">
					belong：$belong[布局文件路径]，路径同上，页面输出将把当前内容替换
					<span style="font-family: 微软雅黑, 'Microsoft YaHei';">
						布局文件中的$[placeholder] 以后输出。
					</span>
					<br>
				</span>
			</p>
		</li>
	</ul>
	<p>
		<br>
	</p>
	<p>
		<span style="font-family: 微软雅黑, 'Microsoft YaHei';">
			4. 页面支持的API&amp;参数：
			<br>
		</span>
	</p>
	<ul class=" list-paddingleft-2" style="list-style-type: disc;">
		<ul class=" list-paddingleft-2" style="list-style-type: square;">
			<li>
				<p>
					<span style="font-family: 微软雅黑, 'Microsoft YaHei';">
						<span id="_baidu_bookmark_start_147" style="display: none; line-height: 0px;">
							‍
						</span>
						支持ECMAScript核心API，
						<span style="font-family: 微软雅黑, 'Microsoft YaHei'; color: rgb(255, 0, 0);">
							支持nodejs-require
						</span>
						。
					</span>
				</p>
			</li>
			<li>
				<p>
					<span style="font-family: 微软雅黑, 'Microsoft YaHei';">
						页面支持
						<span style="font-family: 微软雅黑, 'Microsoft YaHei';">
							参数对象包括：
						</span>
					</span>
				</p>
			</li>
		</ul>
	</ul>
	<ol class=" list-paddingleft-2" style="list-style-type: lower-alpha;">
		<ol class=" list-paddingleft-2" style="list-style-type: lower-roman;">
			<ol class=" list-paddingleft-2" style="list-style-type: upper-alpha;">
				<li>
					<p>
						<span style="font-family: 微软雅黑, 'Microsoft YaHei';">
							<span style="font-family: 微软雅黑, 'Microsoft YaHei';">
								请求来源request(原生的
								<a href="http://nodejs.org/api/http.html#http_class_http_clientrequest"
								style="color: rgb(70, 72, 62); text-decoration: none; border-bottom-width: 1px; border-bottom-style: dotted; border-bottom-color: rgb(68, 136, 0); font-family: Georgia, FreeSerif, Times, serif; font-size: 15px; line-height: 22px; white-space: normal; background-color: rgb(255, 255, 255);">
									http.ClientRequest
								</a>
								对象)，用来获取请求参数和信息；
							</span>
						</span>
					</p>
				</li>
				<li>
					<p>
						<span style="font-family: 微软雅黑, 'Microsoft YaHei';">
							<span style="font-family: 微软雅黑, 'Microsoft YaHei';">
								response(
								<a href="http://nodejs.org/api/http.html#http_class_http_serverresponse"
								style="color: rgb(70, 72, 62); text-decoration: none; border-bottom-width: 1px; border-bottom-style: dotted; border-bottom-color: rgb(68, 136, 0); font-family: Georgia, FreeSerif, Times, serif; font-size: 15px; line-height: 22px; white-space: normal; background-color: rgb(255, 255, 255);">
									http.ServerResponse
								</a>
								对象)，可以改写服务端输出的所有信息。
							</span>
						</span>
					</p>
				</li>
				<li>
					<p>
						<span style="font-family: 微软雅黑, 'Microsoft YaHei';">
							request自定义参数：
						</span>
					</p>
				</li>
			</ol>
		</ol>
	</ol>
	<ol class=" list-paddingleft-2" style="list-style-type: lower-roman;">
		<ol class=" list-paddingleft-2" style="list-style-type: upper-alpha;">
			<ol class=" list-paddingleft-2" style="list-style-type: upper-roman;">
				<ol class="custom_num list-paddingleft-1">
					<li class="list-num-1-1 list-num-paddingleft-1">
						<p>
							<span style="font-family: 微软雅黑, 'Microsoft YaHei';">
								request.data： 存储GET请求获取的所有参数信息，没有参数时为: {}；
							</span>
						</p>
					</li>
					<li class="list-num-1-2 list-num-paddingleft-1">
						<p>
							<span style="font-family: 微软雅黑, 'Microsoft YaHei';">
								request.post： 存储POST请求参数信息，非POST请求时为: null；
							</span>
						</p>
					</li>
					<li class="list-num-1-3 list-num-paddingleft-1">
						<p>
							<span style="font-family: 微软雅黑, 'Microsoft YaHei';">
								<span style="font-family: 微软雅黑, 'Microsoft YaHei';">
									request.util ： 预留的工具参数绑定，目前只有一个mime-module对象，request.util.mime。
								</span>
							</span>
						</p>
					</li>
					<li class="list-num-1-4 list-num-paddingleft-1">
						<p>
							<span style="font-family: 微软雅黑, 'Microsoft YaHei';">
								<span style="font-family: 微软雅黑, 'Microsoft YaHei';">
									reque
									<span id="_baidu_bookmark_end_148" style="display: none; line-height: 0px;">
										‍
									</span>
									st.$ ： 通过服务端操作存储其他信息供页面使用，主要在显示文件列表中有使用样例。
								</span>
							</span>
						</p>
						<p>
							<span style="font-family: 微软雅黑, 'Microsoft YaHei';">
								<span style="font-family: 微软雅黑, 'Microsoft YaHei';">
								</span>
							</span>
						</p>
					</li>
				</ol>
			</ol>
		</ol>
	</ol>
	<p>
		<span style="font-family: 微软雅黑, 'Microsoft YaHei';">
			<br>
		</span>
	</p>
	<p>
		<span style="font-family: 微软雅黑, 'Microsoft YaHei';">
			<br>
		</span>
	</p>
	<h1>
		<span style="font-family: 微软雅黑, 'Microsoft YaHei';">
			工具
		</span>
	</h1>
	<ol class=" list-paddingleft-2" style="list-style-type: decimal;">
		<li>
			<p>
				<span style="font-family: 微软雅黑, 'Microsoft YaHei';">
					LESS 动态支持，需要使用.less后缀命名文件 (可以使用sublime或者webstorm等进行编辑，具有高亮提示) ，从URI直接访问将获取编译后的css，可动态调试。
				</span>
			</p>
			<p>
				<span style="font-family: 微软雅黑, 'Microsoft YaHei';">
					<a href="http://www.lesscss.net/article/home.html" target="_blank" title="神马是LESS">
						神马是LESS
					</a>
				</span>
			</p>
		</li>
		<li>
			<p>
				<span style="font-family: 微软雅黑, 'Microsoft YaHei';">
					coffeeScript 动态支持， 需要使用.coffee后缀&nbsp;
					<span style="font-family: 微软雅黑, 'Microsoft YaHei';">
						(可以使用sublime或者webstorm等进行编辑，具有高亮提示) ,
						<span style="font-family: 微软雅黑, 'Microsoft YaHei';">
							从URI直接访问将获取编译后的javascript代码，格式可能让你很不爽。
						</span>
					</span>
				</span>
			</p>
			<p>
				<a href="http://coffeescript.org/" target="_blank" title="">
					<span style="font-family:微软雅黑, Microsoft YaHei">
						CoffeeScript又是神马
					</span>
				</a>
			</p>
		</li>
		<li>
			<p>
				<span style="font-family: 微软雅黑, 'Microsoft YaHei';">
					压缩支持： 支持css去除空白的cssmin，以及
					<a href="https://github.com/mishoo/UglifyJS.git" target="_self" title="">
						uglify-js
					</a>
					对javascript以及coffeeScript编译后的js进行压缩。
				</span>
			</p>
		</li>
		<li>
			<p>
				<span style="font-family: 微软雅黑, 'Microsoft YaHei';">
					支持简单的get请求代理，如： /agent?
					<a href="http://news.cn:" _src="http://news.cn:">
						http://news.cn
					</a>
					&nbsp;
				</span>
			</p>
		</li>
		<li>
			<p>
				<span style="font-family: 微软雅黑, 'Microsoft YaHei';">
					文件上传(beta)：&nbsp;
				</span>
				<span style="font-family: 微软雅黑, 'Microsoft YaHei';">
					/upload?uploadUrl=/uploads&amp;target=/demo/upload.json&nbsp;
				</span>
			</p>
			<p>
				<span style="font-family: 微软雅黑, 'Microsoft YaHei';">
				</span>
			</p>
		</li>
	</ol>
	<ul class=" list-paddingleft-2" style="list-style-type: disc;">
		<ul class=" list-paddingleft-2" style="list-style-type: square;">
			<li>
				<p>
					<span style="font-family: 微软雅黑, 'Microsoft YaHei';">
						uploadUrl : 文件上传地址（绝对路径）； &nbsp;默认在服务器所在文件夹。
					</span>
				</p>
			</li>
			<li>
				<p>
					<span style="font-family: 微软雅黑, 'Microsoft YaHei';">
						target: 数据返回页面（绝对路径）； 默认由服务器提供的模板。
					</span>
				</p>
				<p>
					<span style="font-family: 微软雅黑, 'Microsoft YaHei';">
					</span>
				</p>
			</li>
		</ul>
	</ul>

	<p>
		<br>
	</p>
</div>

