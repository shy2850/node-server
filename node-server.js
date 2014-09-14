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
    mini = { 
        _cssmin_: require("cssmin"), 
        js  : function(str,resp){ 
            var resu = require("uglify-js").minify(str,{fromString: true}); 
            resp.end( resu.code ); 
        }, 
        css : function(str,resp){ resp.end( mini._cssmin_(str)) }, 
        htm : function(str,resp){ resp.end( (str).replace(/\s+/g," ") ) }, 
        __  : function(str,resp){ resp.end( str ) }, 
        get : function(extType){ 
            return mini[extType] || mini.__; 
        } 
    }; 
 
function start(conf){ 
    var server = http.createServer(function (req, resp) { try{ 
        var root = conf.root || __dirname; 
        var pathurl = ""; 
            try{ 
                pathurl = decodeURI(url.parse(req.url).pathname); 
            }catch(e){ 
                pathurl = req.url; 
            } 
        var pathname= (pathurl === '/') ? (root+conf.welcome) :  root + pathurl;  //根目录时，追加welcome页面 
        var extType = path.extname(pathname).substring(1);    //获取资源后缀 
        req.data = querystring.parse( url.parse(req.url).query ); //包装request查询参数 
        req.util = {mime:mime}; 
        req.$ = { title:pathurl, staticServer:"http://"+req.headers.host.split(":")[0]+":"+staticConf.port+"/", fileList:[] }; 
 
        var _DEBUG = req.data.debug == "true" || conf.debug, agent; 
        
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
                    var rs = data.toString(); 
                    if( conf.less && extType === "less" && req.data.less !== "false" ){    //LESS 
                        try{ 
                            new(require("./nodeLib/module/less").Parser)({ 
                                paths:[ pathname.replace(/(\/[^\/]+?)$/,"") ] 
                            }).parse(rs, function (err, tree) { 
                                if (err) { return console.error(err) } 
                                else{ 
                                    _DEBUG ? resp.end( tree.toCSS() ) : mini.css(tree.toCSS(),resp) ; 
                                } 
                            }); 
                        }catch(e){ 
                            resp.writeHead(500, {"Content-Type": "text/html"}); 
                            resp.end( e + "" ); 
                        } 
                    }else if(conf.coffee && extType === "coffee" && req.data.coffee !== "false" ){ 
                        try{ 
                            var scriptStr = require("coffee-script").compile( rs ); 
                            _DEBUG ? resp.end( scriptStr ) : mini.js(scriptStr,resp) ; 
 
                        }catch(e){ 
                            resp.writeHead(500, {"Content-Type": "text/html"}); 
                            console.log(e); 
                            resp.end( e + "" ); 
                        } 
                   }else if(  conf.handle && mime.isTXT(extType) && !( /[\.\-]min\.(js|css)$/.test(pathurl) ) && req.data.handle !== "false" ){    //handle 
                        handle.execute(req,resp,root,rs, mini.get(extType) ,_DEBUG, conf) 
                    }else{ 
                        resp.end( data ) 
                    } 
                        
                    
                }); 
           } else if(conf.fs_mod && stats && stats.isDirectory && stats.isDirectory()){  //如果当前url被成功映射到服务器的文件夹，创建一段列表字符串写出 
                pathurl = pathurl.lastIndexOf('/') == pathurl.length-1 ? pathurl : pathurl+"/"; 
                resp.writeHead(200, {"Content-Type": "text/html"}); 
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
                    fs.readFile(conf.folder,function (err,data){ 
                        if(err)console.log(err); 
                        handle.execute(req,resp,root,data.toString(),mini.get(extType)  ,_DEBUG, conf); 
                    }); 
                }); 
            } else{ 
                var m = module.get( pathurl.replace('/','') ); 
                if(m){ 
                    try{ 
                        m.execute(req,resp,root,handle,mini.__, conf); 
                    }catch(e){ 
                        resp.writeHead(500, {"Content-Type": "text/html"}); 
                        resp.end( e.stack.toString().replace(/\n/g,"<br>") ); 
                    } 
                }else if(conf.agent && conf.agent.get && (agent = conf.agent.get(pathurl) ) ){   // 代理过滤
                    require('./nodeLib/common/agent').execute(req,resp,agent,req.url); 
                    return;
                }else{ 
                    resp.writeHead(404, {"Content-Type": "text/html"}); 
                    resp.end( fs.readFileSync( conf.notFound,'utf-8') ); 
                } 
            } 
        }); 
    }catch(err){ 
        console.log(err.stack); 
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

