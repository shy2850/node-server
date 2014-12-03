"use strict";
var CONF = require("./nodeLib/config/conf"),    //综合配置
    handle = require("./nodeLib/common/handle"),//文本文件的模板操作
    middleware = require("./nodeLib/filter/middleware"),//支持中间件
    modules = require("./nodeLib/common/modules"),//支持的插件配置
    filter = require('./nodeLib/filter/filter'),//支持前置过滤器
    querystring = require("querystring"),
    mime = require("mime"),    //MIME类型
    http = require("http"),
     url = require("url"),
      fs = require("fs");
var staticConf = CONF.staticconf,                //静态文件服务器配置
    mini = middleware.mini,
    serverInfo = {needUpdate: false};        //服务器相关的一些参数。
function start(conf){
    var server = http.createServer(function (req, resp) { try{
        var host = (req.headers.host + ':80').split(':'),
            pathurl,
            hostConf = CONF[ host[0] ],
            root,
            agent;
        if( hostConf && (host[1] | 0) === (hostConf.port | 0) ){ //域名识别
            conf = hostConf;
        }else if( (host[1] | 0) === 80 ){
            conf = CONF.localhost;
        }
        root = (conf.root || __dirname); conf.root = root;
        try{pathurl = decodeURI(url.parse(req.url).pathname); }catch(e){ pathurl = req.url; }
        var pathname = (pathurl === '/') ? (root + conf.welcome) : root + pathurl;  //根目录时，追加welcome页面
        //包装request功能
        req.data = querystring.parse( url.parse(req.url).query );
        req.util = {mime: mime, conf: conf, host: host[0], staticServer: "http://" + host[0] + ":" + staticConf.port + "/"};
        req.$ = {title: pathurl, fileList: [], needUpdate: serverInfo.needUpdate };
        var DEBUG = req.data.debug === "true" || conf.debug; //DEBUG模式判断
        setTimeout( function(){
            filter.execute(req,resp,conf);
            fs.stat(pathname,function(error, stats){
                if(stats && stats.isFile && stats.isFile()){  //如果url对应的资源文件存在，根据后缀名写入MIME类型
                    if( req.method === "POST" ){    // POST请求 添加target参数以后, 使用 upload 插件进行解析。
                        req.data.target = pathurl;
                        modules.get("upload").execute(req,resp,root,handle,conf);
                        return;
                    }
                    var expires = new Date();
                    expires.setTime( expires.getTime() + (conf.expires || 0) );
                    resp.writeHead(200, {
                        "Content-Type": mime.get(pathname) || 'text/html',
                        "Expires": expires
                    });

                    var rs = fs.createReadStream(pathname), s = '', ware;
                    rs.on('error',function(err){
                        throw err;
                    }).on('data',function(d){
                        s += d;
                    });

                    if( conf.middleware && (req.data.middleware !== "false") && (ware = middleware.get(pathname)) ){  //中间件处理, MIME需要mime.type中修改
                        rs.on('end',function(){
                            ware(req,resp,s,pathname,DEBUG);
                        });
                    }else if(  conf.handle && mime.isTXT(pathname) && !( /[\.\-]min\.(js|css)$/.test(pathurl) ) && req.data.handle !== "false" ){    //handle
                        rs.on('end',function(){
                            handle.execute(req,resp,root,s, mini.get(pathname) ,DEBUG, conf);
                        });
                    }else{
                        rs.pipe(resp);
                    }
                } else if(conf.fs_mod && stats && stats.isDirectory && stats.isDirectory()){  //如果当前url被成功映射到服务器的文件夹，创建一段列表字符串写出
                    require('./nodeLib/filter/directory').execute(req,resp,root,pathname,pathurl,conf,DEBUG);
                } else{
                    var m = modules.get( pathurl.replace('/','') );
                    if(m){
                        m.execute(req,resp,root,handle,conf);
                    }else if(conf.agent && conf.agent.get && (agent = conf.agent.get(pathurl) ) ){   // 代理过滤
                        require('./nodeLib/filter/agent').execute(req,resp,agent,req.url);
                        return;
                    }else{
                        resp.writeHead(404, {"Content-Type": "text/html"});
                        fs.readFile(conf.notFound || '', function (err, data){
                            if(err){
                                if( conf.notFound ){ console.log(err); }
                                resp.end( '<h1 style="font-size:200px;text-align:center;">404</h1>' );
                            }else{
                                resp.end( data );
                            }
                        });
                    }
                }
            });
        }, req.data.delay | 0 );// 增加delay参数，使得所有GET请求可以动态延时
    }catch(err){
        console.log(err.stack);
        resp.writeHead(500, {"Content-Type": "text/html"});
        resp.end( err.stack.toString().replace(/\n/g,"<br>") );
    }});
    server.maxConnections = conf.maxConnections;
    server.listen(conf.port);
    return server;
}

var ports = {}, extCmd = ([]).slice.call( process.argv, 2 ).join(' ');
for(var k in CONF){
    (function(c){
        if(ports[c.port]){return;}
        ports[c.port] = start(c);
    })(CONF[k]);
    console.log("Server running at http://127.0.0.1:" + CONF[k].port + '\t[' + k + ']');
}

if(extCmd){ require('child_process').exec( extCmd ); }

try{
    require('./nodeLib/config/update').execute(serverInfo);
}catch(e){
    console.log( e );
}
