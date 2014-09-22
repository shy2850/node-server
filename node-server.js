var conf = require("./nodeLib/config/conf"),    //综合配置 
    staticConf = conf.staticConf,                //静态文件服务器配置 
    handle = require("./nodeLib/common/handle"),//文本文件的模板操作 
    module = require("./nodeLib/common/module"),//支持的插件配置 
    mime = require("./nodeLib/module/mime"),    //MIME类型 
    http = require("http"),                         
    url  = require("url"), 
    path = require("path"), 
    fs   = require("fs"), 
    querystring = require("querystring"), 
    middleware =  require("./nodeLib/common/middleware"),
    mini = middleware.mini;
 
function start(conf){ 
    var server = http.createServer(function (req, resp) { try{ 
        var root = conf.root || __dirname; 
        var pathurl;    try{pathurl = decodeURI(url.parse(req.url).pathname); }catch(e){ pathurl = req.url; } 
        var pathname= (pathurl === '/') ? (root+conf.welcome) :  root + pathurl;  //根目录时，追加welcome页面 
        var extType = path.extname(pathname).substring(1);    //获取资源后缀 

        //包装request功能 
        req.data = querystring.parse( url.parse(req.url).query ); 
        req.util = {mime:mime}; 
        req.$ = { title:pathurl, staticServer:"http://"+req.headers.host.split(":")[0]+":"+staticConf.port+"/", fileList:[] }; 
 
        var _DEBUG = req.data.debug == "true" || conf.debug; //DEBUG模式判断
        
        if( conf['nginx-http-concat'] && req.url.match(/\?\?/) ){        // nginx-http-concat 资源合并 
            require('./nodeLib/common/nginx-http-concat').execute(req,resp,root,mini,conf); 
            return; 
        }
 
        fs.stat(pathname,function(error,stats){ 
            if(stats && stats.isFile && stats.isFile()){  //如果url对应的资源文件存在，根据后缀名写入MIME类型 
                var expires = new Date(); 
                expires.setTime( expires.getTime() + (conf.expires || 0) ); 
                resp.writeHead(200, { 
                    "Content-Type": mime.get(extType) || 'text/html', 
                    "Expires": (req.method==="GET")?expires:undefined 
                }); 
 
                if( req.method === "POST" ){    // POST请求 添加target参数以后, 使用 upload 插件进行解析。 
                    req.data.target = pathurl; 
                    module.get("upload").execute(req,resp,root,handle,mini.__,conf); 
                    return; 
                } 
 
                fs.readFile(pathname,function (err,data){ 
                    var rs = data.toString(), ware; 
                    if( conf.middleware && ("false" !== req.data[extType]) && (ware = middleware.get(extType)) ){  //中间件处理, MIME需要mime.type中修改
                        ware(req,resp,rs,pathname,_DEBUG)
                    }else if(  conf.handle && mime.isTXT(extType) && !( /[\.\-]min\.(js|css)$/.test(pathurl) ) && req.data.handle !== "false" ){    //handle 
                        handle.execute(req,resp,root,rs, mini.get(extType) ,_DEBUG, conf) 
                    }else{ 
                        resp.end( data ) 
                    } 
                }); 
           } else if(conf.fs_mod && stats && stats.isDirectory && stats.isDirectory()){  //如果当前url被成功映射到服务器的文件夹，创建一段列表字符串写出 
                pathurl = pathurl.lastIndexOf('/') == pathurl.length-1 ? pathurl : pathurl+"/"; 
                resp.writeHead(200, {"Content-Type": mime.get(req.data.type||'html')}); 
                fs.readdir(pathname,function(error,files){ 
                    var urlSplit = pathurl.split("/"); 
                        (urlSplit.length > 1) ? (urlSplit.length -= 2) : (urlSplit[0] = ".."); 
                    
                    req.$.fileList.push({                                                //返回上一级 
                        href: (urlSplit.join("/")||"/"), 
                        name: "../" 
                    }); 
                    for ( var i in files) {        //对应下级目录或资源文件 
                        req.$.fileList.push({ 
                            href: encodeURI( pathurl+files[i] ), 
                            name: files[i] 
                        }); 
                    } 

                    switch(req.data.type){
                        case 'json':resp.end( JSON.stringify( files ) ); break;
                        case 'jsonp':resp.end( (req.data.callback||'callback') + '(' + JSON.stringify( files ) + ')' );break;
                        case undefined:
                            try{
                                var data = fs.readFileSync( conf.folder,'utf-8');
                                handle.execute(req,resp,root,data.toString(),mini.get(extType),_DEBUG, conf); 
                            }catch(e){
                                conf.folder && console.log(e);
                            }
                            if(conf.folder)break;
                        case 'xml': 
                            var list = [];
                            req.$.fileList.map(function(item,i){
                                list.push( '<p><a href="'+item.href+'">'+item.name+'</a></p>' );
                            }); 
                            resp.end( '<div>'+list.join('')+'</div>' );
                    }
                }); 
            } else{ 
                var m = module.get( pathurl.replace('/','') ); 
                if(m){ 
                    m.execute(req,resp,root,handle,mini.__, conf); 
                }else if(conf.agent && conf.agent.get && (agent = conf.agent.get(pathurl) ) ){   // 代理过滤
                    require('./nodeLib/common/agent').execute(req,resp,agent,req.url); 
                    return;
                }else{ 
                    resp.writeHead(404, {"Content-Type": "text/html"}); 
                    fs.readFile(conf.notFound||'', function (err,data){ 
                        if(err){
                            conf.notFound && console.log(err);
                            resp.end( '<h1 style="font-size:200px;text-align:center;">404</h1>' )
                        }else{
                            resp.end( data );
                        }
                    }); 
                } 
            } 
        }); 
    }catch(err){ 
        console.log(err.stack); 
        resp.writeHead(500, {"Content-Type": "text/html"}); 
        resp.end( e.stack.toString().replace(/\n/g,"<br>") ); 
    }}); 
 
    server.maxConnections = conf.maxConnections;  
    server.listen(conf.port); 
    console.log("Server running at http://127.0.0.1:"+conf.port); 
} 
for(var k in conf){ 
    (function(c){ 
        start(c);
    })(conf[k]) 
} 

