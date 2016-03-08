"use strict";
var fs = require("fs"),
    path = require("path"),
    _ = require("underscore");

exports.execute = function(req, resp, root, str, mini, debug, conf){
    var belong = "",
        include = new RegExp(conf.include),
        pathname = path.join(root, req.$.title).replace(/[^\\\/]+$/,"");
    var h = new RegExp(conf.belong).exec(str),
        inc;
    try{
        if(h){
            belong = fs.readFileSync( /^[\/\\]/.test(h[1]) ? path.join(root,h[1]) : path.join(pathname,h[1]), 'utf-8' );    //读取belong文本
            str = str.replace(h[0], "" );              //替换关键字
            str = belong.replace(conf.placeholder,str);
        }
        while( ( inc = str.match(include) ) ){
            str = str.replace( inc[0], fs.readFileSync( /^[\/\\]/.test(inc[1]) ? path.join(root,inc[1]) : path.join(pathname,inc[1]),'utf-8') );
        }

        // 需要设置重命名
        str = require("./rename").execute(req, resp, root, str, mini, debug, conf);

        var result = str;
        if(conf.runJs){try{ //模板引擎渲染
            if( !conf.template || !conf.template.get || (conf.template.filter && !conf.template.filter.test(req.$.title) ) ){
                var compiled = _.template(str);
                result = compiled({request: req, response: resp, require: require});
            }else{
                result = conf.template.get(str, req.$.title, req, resp, require);
            }
        }catch(compileError){
            console.log(compileError);
            console.log(req.$.title + ": 模板引擎渲染异常！ ");
        }}

        switch(typeof result){
            case "function": result(); return;
            case "string":
            default :
                mini.get(req.$.title, debug)(result,resp,conf);
        }
    }catch(e){
        resp.writeHead(500, {"Content-Type": "text/html"});
        resp.end( e.stack.toString().replace(/\n/g,"<br>") );
    }
};
