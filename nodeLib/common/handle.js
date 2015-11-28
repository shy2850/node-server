"use strict";
var fs = require("fs"),
    path = require("path"),
    _ = require("underscore");

var livereload_code = require("uglify-js")
    .minify(
        fs.readFileSync(
            path.join( __dirname, '../../static/js/livereload.js')
        ).toString(),{
            fromString: true
        }).code;

exports.execute = function(req, resp, root, str, mini, debug, conf){
    var belong = "",
        include = new RegExp(conf.include),
        pathname = path.join(root, req.$.title).replace(/[^\\\/]+$/,"");
    var h = new RegExp(conf.belong).exec(str),
        inc,
        host = req.headers.host;

    try{
        if(h){
            belong = fs.readFileSync( /^[\/\\]/.test(h[1]) ? path.join(root,h[1]) : path.join(pathname,h[1]), 'utf-8' );    //读取belong文本
            str = str.replace(h[0], "" );              //替换关键字
            str = belong.replace(conf.placeholder,str);
        }
        while( ( inc = str.match(include) ) ){
            str = str.replace( inc[0], fs.readFileSync( /^[\/\\]/.test(inc[1]) ? path.join(root,inc[1]) : path.join(pathname,inc[1]),'utf-8') );
        }

        var result = str;
        if(conf.runJs){        //完全使用underscore内置template引擎
            if( !conf.template || !conf.template.get || (conf.template.filter && !conf.template.filter.test(req.$.title) ) ){
                var compiled = _.template(str);
                result = compiled({request: req, response: resp, require: require});
            }else{
                result = conf.template.get(str, req.$.title, req, resp, require);
            }
        }

        switch(typeof result){
            case "function": result(); return;
            case "string":
                var ends = req.url.replace(/^([^?#]+).*$/,"$1");
                if( conf.babel && ends.match(/\.js$/) ){
                    result = require("babel").transform(result).code;
                }
                else if(req.data.listen){
                    result = result + '<script data-host="'+host+'">'+livereload_code+'</script>';
                }else if(conf.livereload && conf.livereload.inject && conf.livereload.inject(req.$.title) ){
                    result = result + '<script data-host="'+host+'">'+livereload_code+'</script>';
                }
            default :
                mini.get(req.$.title, debug)(result,resp,conf);
        }
    }catch(e){
        resp.writeHead(500, {"Content-Type": "text/html"});
        resp.end( e.stack.toString().replace(/\n/g,"<br>") );
    }
};
