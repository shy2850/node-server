"use strict";
var url = require("url"),
    fs = require("fs"),
    mime = require("mime");
exports.execute = function(req, resp, root, mini, conf){
    var p = url.parse( req.url ), result = "", extType = "js";
    var $root = root + p.pathname + ( p.pathname.match(/^.*?\/$/) ? '' : '/' );
    try{
        p.search.replace(/^\?*(.*?)$/,'$1').replace(/[^\,]+/g,function(match){
            var filePath = $root + match.split('?')[0];
            extType = filePath.split('.').pop();
            result += fs.readFileSync( filePath,'utf-8');
        });
        resp.writeHead(200, {
            "Content-Type": mime.get(extType)
        });
        if( conf.debug ){
            resp.end( result );
        }else{
            mini.get(extType)(result,resp);
        }
    }catch(e){
        resp.writeHead(500, {"Content-Type": "text/html"});
        resp.end( e.stack.toString().replace(/\n/g,"<br>") );
    }
};
