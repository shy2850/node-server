f2e-server 
==========

> f2e-server 已经完全改写 [新地址](https://github.com/shy2850/f2e-server)  注意使用1.0版本安装 使用 `npm i f2e-server@1.*`  
> 查看文档： 需要通过git下载当前仓库 并切换 `gh-pages` 分支后 使用 f2eserver 启动目录

f2e-server 是基于nodejs平台的HTTP服务器，提供了基本的模板引擎以及常用的前端工具。

a nodejs based http-server with easy-template-engine and several F2E-utils

点击进入 [f2e-server.com](http://f2e-server.com) 查看详细文档 或 [点击链接加入群【f2e-server】：](http://jq.qq.com/?_wv=1027&k=MqC52t)

changelog: [change.log](change.log)

## 全局安装
f2e-server 1.8.3 以后支持全局安装

* 安装: $ 
	``npm install f2e-server@1.* -g``
* 启动:$ 
	``f2eserver start`` 服务启动后，会在当前目录自动生成 f2e-conf.js 文件, 可参考修改
* 修改hosts:$ 
	``f2eserver hosts`` 
* 恢复hosts:$ 
	``f2eserver reset``


## 局部安装

* 安装: $ 
	``npm install f2e-server``
* 进入服务器根目录: $ 
	``cd node_modules/f2e-server``
* 启动:$ 
	``npm start`` 服务启动后，会在f2e-server外层目录自动生成 conf.js 文件, 可参考修改
* 修改 hosts:$ 
	``node hosts`` 
* 恢复 hosts:$ 
	``node hosts reset`` 
* 配置文件参考: [nodeLib/config/conf.js](nodeLib/config/conf.js) 


## 文件服务器

f2e-server 提供基本的文件服务器功能, 支持通过配置文件索引项目根目录绝对路径 【__root__】

* 欢迎页面配置相对root的路径 【__welcome__】
* 404页面配置文件绝对路径 【__notFound__】
* 配置是否支持文件夹目录展示 【__fs_mod__】
* 当前服务端口号 【__port__】
* 当期服务可支持最大并发链接数 【__maxConnections__】

## 模板引擎

f2e-server 默认使用underscore模板, 参见 [nodeLib/common/handle.js#L18](nodeLib/common/handle.js#L18)

* 默认开启模板引擎 【__runJs__】 以及依赖的配置 【__handle__】
* 关闭后很多插件功能将失效
* 支持模板的引用和包含[http://www.w3cfuns.com/blog-5443978-5399247.html](http://www.w3cfuns.com/blog-5443978-5399247.html)
	* $include[_引用片段路径_]
	* $belong[_当前片段被包含母版路径_]
	* $[placeholder] 包含母版中标记引入片段位置
* 模板运行时环境变量:
	* request: 包转完成的当前请求
		* request.data: GET请求参数包装, 如 ``request.data.type`` 表示GET请求参数type的值
		* request.post: POST请求参数包装, 获取方式同GET, __ 注:GET请求时, request.post === null __ 
		* request.util: 
			* request.util.mime: f2e-server扩展mime模块
			* request.util.conf: 当前服务配置
			* request.util.staticServer: 预留staticconf配置的url
		* request.$:
			* request.$.title: 当前请求路径 pathname
			* request.$.host: 当前host
			* request.$.fileList: 文件夹列表存储
	* response: 原生的响应对象
	* require: nodejs 全局require
	* _: underscore源对象
	

## 资源合并和压缩

* 服务器内置 
[uglify-js](https://github.com/mishoo/UglifyJS2.git) 
和 
[cssmin](http://github.com/jbleuzen/node-cssmin) 
支持, 【__debug__】 为false时开启
* 使用 $include 功能可以进行资源文件的动态合并


## 中间件支持

f2e-server采用中间件的动态解析模式, 参见 
[nodeLib/filter/middleware.js](nodeLib/filter/middleware.js) 

* 默认支持 
[less](https://github.com/less/less.js.git)
/
[coffee](https://github.com/jashkenas/coffeescript.git)
/
[jade](https://github.com/visionmedia/jade.git)
/
[markdown](https://github.com/evilstreak/markdown-js.git) 
扩展,``npm install``后直接使用
* 对于其他需要且未被收录的扩展, 强烈建议开发者自己尝试修改源代码支持

## 项目输出

* 模板、 资源合并压缩、中间件支持(或混搭使用) 均被支持输出到结果文件目录中 【__output__】
* 如果安装相关图片压缩依赖的模块, build默认支持在构建输出结果时对png,jpg等类型图片进行无损压缩
* 中间件中 在请求头设置 __middleware-type__ 属性, 将能够在输出时, 修改响应的文件后缀名 
* 如在开发中使用响应后缀,建议参考 [【__agent__】配置](nodeLib/config/conf.js#L26)


## 服务器host转发功能

f2e-server 支持本地环境通过不同的hosts域名分别请求不同的项目

* [nodeLib/config/conf.js](nodeLib/config/conf.js) 中所有返回key都被认为是一组本地域名类型 (如：localhost / test.abc.com / test.xuan.news.cn)
* 如果多组配置使用了相同的端口号, 将需要使用指定域名访问(需要修改hosts文件)
* 在安装目录中提供了快速修改备份/恢复 hosts文件的模块, 
	* 可以直接使用 ``node hosts`` 修改 或 ``node hosts reset`` 恢复修改前的hosts文件 
	* 默认使用windows环境的系统路径 (linux/unix 请根据需求修改) 
	* 权限不足时，抛出异常，请使用管理员权限运行！

## 代理功能

f2e-server 方便的支持了代理远程请求功能  [【__agent__】配置](nodeLib/config/conf.js#L26)

* get方法通过分析请求路径，返回一组相关代理配置
	* host: 远程代理的host 默认为 当前host
	* port: 远程代理的端口号, 默认为 80
	* origin: 支持origin格式配置: 优先级低于host&port, 因为需要实时解析，性能不及host配置
	* path: 路径转换方式, 可以根据本地路径转换成远程指定其他路径, 默认跟远程路径相同
	* cookie: 远程代理cookie ( 直接copy远程请求的请求头中的cookie )
	* save: 代理请求资源保存到本地对应文件目录 ( 资源批量下载以及中间件模板编译 )

## 插件功能

f2e-server 提供了一些有用的插件, 提倡开发者扩展

* [agent](nodeLib/plugins/agent.js): 快速代理跨域请求如 ``/agent?http://news.cn``
* [build](nodeLib/plugins/build.js): 即[项目输出](#项目输出)
* [config](nodeLib/plugins/config.js): 临时修改当前服务配置项[Beta版]
* [favicon.ico](nodeLib/plugins/favicon.ico.js): 单独进行favicon.ico实现
* [prettify](nodeLib/plugins/prettify.js): 代码的服务端highlight实现, 支持远程请求同agent插件 ``/prettify?http://news.cn``
* [psd](nodeLib/plugins/psd.js): 读取服务器目录下的psd文件并且实时转化成png, 展示到浏览器中, 同时支持了解析PSD源资源数据，分别保存成png图片(Beta)
* [upload](nodeLib/plugins/upload.js): post请求处理使用该模块实现（支持文件上传）




