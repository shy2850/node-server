"use strict";
var CONF = require("./nodeLib/config/conf"),    //综合配置
    handle = require("./nodeLib/common/handle"),//文本文件的模板操作
    middleware =  require("./nodeLib/common/middleware"),//支持中间件
    modules = require("./nodeLib/common/modules"),//支持的插件配置
    querystring = require("querystring"),
    mime = require("mime"),    //MIME类型
    http = require("http"),
    url  = require("url"),
    fs   = require("fs");
var staticConf = CONF.staticconf,                //静态文件服务器配置
    mini = middleware.mini;
function start(conf){
    var server = http.createServer(function (req, resp) { try{
        var host = (req.headers.host + ':80').split(':'),
            pathurl,
            hostConf = CONF[ host[0] ],
            root,
            agent;
        if( hostConf && (host[1] | 0) === (hostConf.port | 0) ){ //域名识别
            conf = hostConf;
        }
        root = (conf.root || __dirname); conf.root = root;
        try{pathurl = decodeURI(url.parse(req.url).pathname); }catch(e){ pathurl = req.url; }
        var pathname = (pathurl === '/') ? (root + conf.welcome) :  root + pathurl;  //根目录时，追加welcome页面
        //包装request功能
        req.data = querystring.parse( url.parse(req.url).query );
        req.util = {mime:mime,conf:conf,host:host[0],staticServer:"http://" + host[0] + ":" + staticConf.port + "/",};
        req.$ = { title:pathurl, fileList:[] };
        var DEBUG = req.data.debug === "true" || conf.debug; //DEBUG模式判断
        if( conf['nginx-http-concat'] && req.url.match(/\?\?/) ){        // nginx-http-concat 资源合并
            require('./nodeLib/common/nginx-http-concat').execute(req,resp,root,mini,conf);
            return;
        }
        setTimeout( function(){
            fs.stat(pathname,function(error,stats){
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
                        "Expires":expires
                    });
                    fs.readFile(pathname,function (err,data){
                        if(err){throw err;}
                        if( data.length > 100 * 1024 * 1024 ){
                            resp.writeHead(500, {"Content-Type" : "text/html"});
                            resp.end( '<center><h1 style="font:bold 72px/2 Microsoft Yahei;color: #c00;">文件过大！ 无法下载</h1></center>' );
                            return;
                        }
                        var rs = data.toString(), ware;
                        if( conf.middleware && (req.data.middleware !== "false") && (ware = middleware.get(pathname)) ){  //中间件处理, MIME需要mime.type中修改
                            ware(req,resp,rs,pathname,DEBUG);
                        }else if(  conf.handle && mime.isTXT(pathname) && !( /[\.\-]min\.(js|css)$/.test(pathurl) ) && req.data.handle !== "false" ){    //handle
                            handle.execute(req,resp,root,rs, mini.get(pathname) ,DEBUG, conf);
                        }else{
                            resp.end( data );
                        }
                    });
                } else if(conf.fs_mod && stats && stats.isDirectory && stats.isDirectory()){  //如果当前url被成功映射到服务器的文件夹，创建一段列表字符串写出
                    pathurl = pathurl.lastIndexOf('/') === pathurl.length - 1 ? pathurl : pathurl + "/";
                    resp.writeHead(200, {"Content-Type": mime.get(req.data.type || 'html')});
                    fs.readdir(pathname,function(error,files){
                        var urlSplit = pathurl.split("/"), list = [];
                        if(urlSplit.length > 1){urlSplit.length -= 2;}else{urlSplit[0] = "..";}
                        req.$.fileList.push({                                                //返回上一级
                            href: (urlSplit.join("/") || "/"),
                            name: "../"
                        });
                        for ( var i in files) {        //对应下级目录或资源文件
                            req.$.fileList.push({
                                href: encodeURI( pathurl + files[i] ),
                                name: files[i]
                            });
                        }
                        switch(req.data.type){
                            case 'json':resp.end( JSON.stringify( files ) ); break;
                            case 'jsonp':resp.end( (req.data.callback || 'callback') + '(' + JSON.stringify( files ) + ')' );break;
                            case undefined:
                                try{
                                    var data = fs.readFileSync( conf.folder,'utf-8');
                                    handle.execute(req,resp,root,data.toString(),mini.get(pathname),DEBUG, conf);
                                    return;
                                }catch(e){
                                    if(conf.folder){console.log(e);}else{
                                        req.$.fileList.map(function(item){
                                            list.push( '<p><a href="' + item.href + '">' + item.name + '</a></p>' );
                                        });
                                        resp.end( '<div>' + list.join('') + '</div>' );
                                    }
                                }
                                break;
                            case 'xml':
                                req.$.fileList.map(function(item){
                                    list.push( '<p><a href="' + item.href + '">' + item.name + '</a></p>' );
                                });
                                resp.end( '<div>' + list.join('') + '</div>' );
                        }
                    });
                } else{
                    var m = modules.get( pathurl.replace('/','') );
                    if(m){
                        m.execute(req,resp,root,handle,conf);
                    }else if(conf.agent && conf.agent.get && (agent = conf.agent.get(pathurl) ) ){   // 代理过滤
                        require('./nodeLib/common/agent').execute(req,resp,agent,req.url);
                        return;
                    }else{
                        resp.writeHead(404, {"Content-Type": "text/html"});
                        fs.readFile(conf.notFound || '', function (err,data){
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
}
var ports = {}, extCmd = ([]).slice.call( process.argv, 2 ).join(' ');
if(extCmd){ require('child_process').exec( extCmd ); }
for(var k in CONF){
    console.log("Server running at http://127.0.0.1:" + CONF[k].port + '\t[' + k + ']');
    (function(c){
        if(ports[c.port]){return;}
        ports[c.port] = true;
        start(c);
    })(CONF[k]);
}
