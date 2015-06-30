"use strict";
var fs = require('fs'),
    mime = require('mime'),
    handle = require("../common/handle"),
    mini = require("./middleware").mini;
exports.execute = function(req, resp, root, pathname, pathurl, conf, DEBUG){
    if( conf['nginx-http-concat'] && req.url.match(/\?\?/) ){        // nginx-http-concat 资源合并
        require('./nginx-http-concat').execute(req,resp,root,mini,conf);
        return;
    }
    pathurl = pathurl.lastIndexOf('/') === pathurl.length - 1 ? pathurl : pathurl + "/";
    var type = req.data.type || "html";
    resp.writeHead(200, {
        "Content-Type": mime.get( type, mime.get("js") ),
        "Content-Encoding": resp.gzip ? "gzip" : "utf-8"
    });
    fs.readdir(pathname, function(error, files){
        var urlSplit = pathurl.split("/"), list = [];
        if(urlSplit.length > 1){
            urlSplit.length -= 2;
        }else{
            urlSplit[0] = "..";
        }
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
            case 'jsonp':resp.end( (req.data.callback || 'callback') + '(' + JSON.stringify( files ) + ')' ); break;
            case undefined:
                if( !conf.folder){
                    req.$.fileList.map(function(item){
                        list.push( '<p><a href="' + item.href + '">' + item.name + '</a></p>' );
                    });
                    resp.end( '<meta charset="utf-8"/><div>' + list.join('') + '</div>' );
                    return;
                }
                var data = fs.readFileSync( conf.folder,'utf-8');
                handle.execute(req,resp,root,data.toString(),mini,DEBUG, conf);
                break;
            case 'xml':
                req.$.fileList.map(function(item){
                    list.push( '<p><a href="' + item.href + '">' + item.name + '</a></p>' );
                });
                resp.end( '<div>' + list.join('') + '</div>' );
        }
    });
};
