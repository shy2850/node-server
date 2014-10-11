"use strict";
var $path = require('path'),
    fs = require('fs'),
    _ = require('underscore'),
    http = require('http'),
    exec = require('child_process').exec;
var building = 0,
    pathMap = function(path){
    if( path.match(/(.+?\.)(css|js)$/) && !path.match(/(\bmin\.)(css|js)$/) ){
        return path.replace(/(.+?\.)(css|js)$/,'$1min.$2');
    }else{
        return path;
    }
};
//两秒内没有新的build,则build finished
var i = 0, builded = false, l = [0,0,0,0,0,0,0,0,0,0];
setInterval(function(){
    l[i] = building;
    if( _.filter(l,function(n){return !!n;}).length ){
        if( i === 0 ){
            builded = true;
            console.log( 'building......' );
        }
    }else if(builded){
        builded = false;
        console.log( 'build finished!\n' );
    }
    i = (i + 1) % l.length;
},200);

exports.execute = function(req,resp,root,handle,conf){
    var $root = conf.output,
        mime = req.util.mime,
        buildFilder = conf.buildFilder || function(){return true;},
        host = "http://" + req.headers.host + "/";
    var build = function( path ){
        var path1 = path,
            extType = $path.extname(path).substring(1);
        fs.stat(root + path,function(error,stats){
            if(stats && stats.isFile && stats.isFile() && mime.isTXT(extType) && buildFilder(path) ){
                var info = "";
                building = 1;
                http.get(host + path, function(res) {
                    var type = res.headers['middleware-type'];
                    res.on('data',function(data){
                       building = 1;
                       info += data;
                    });
                    res.on('end',function(){
                        if(type){
                            path1 = path.replace(/[^\.]+$/,type);     //对应 middleware 里面的type
                        }
                        fs.writeFile( $root + path, info, function() {
                            fs.rename( $root + path, $root + ( conf.debug ? path1 : pathMap(path1) ), function(err){
                                building = 0;
                                if(err){
                                    console.log(err);
                                }
                            });
                        });
                    });
                });
            }else if(stats && stats.isDirectory && stats.isDirectory()){
                fs.readdir(root + path,function(error,files){
                    for ( var i in files) {        //对应下级目录或资源文件
                        build(path + '/' + files[i]);
                    }
                });
            }
        });
    };

    exec('del ' + $root + '* /s/q',function(err){
        if(!err){
            exec('xcopy ' + root.replace(/(.*?)[\\\/]$/,'$1') + ' ' + $root + ' /e/d/s', function (error) {
                if (!error) {
                    build("");
                }
                resp.end(JSON.stringify({
                    error:error,
                    command: 'xcopy ' + root.replace(/(.*?)[\\\/]$/,'$1') + ' ' + $root + ' /e/d/s'
                }));
            });
        }else{
            exec('rm -rf ' + $root,function(err2){
                if(!err2){
                    exec('cp -Rf ' + root + '* ' + $root,function(err3){
                        if (!err3) {
                            build("");
                        }
                        resp.end(JSON.stringify({
                            error:err3,
                            command: 'cp -Rf  ' + root + '* ' + $root
                        }));
                    });
                }else{
                    resp.end(JSON.stringify({
                        error:'目录不存在: ' + $root,
                        command: 'xcopy ' + root.replace(/(.*?)[\\\/]$/,'$1') + ' ' + $root + ' /e/d/s'
                    }));
                }
            });
        }
    });
};
