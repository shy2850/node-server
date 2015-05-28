"use strict";
var $path = require('path'),
    fs = require('fs'),
    _ = require('underscore'),
    url = require("url"),
    http = require('http'),
    exec = require('child_process').exec,
    execFile = require('child_process').execFile;
var building = 0;
//两秒内没有新的build,则build finished
var i = 0, builded = false, l = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
setInterval(function(){
    l[i] = building;
    if( _.filter(l, function(n){ return !!n; }).length ){
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

var optipng, jpegtran;
try{
    optipng = require('optipng-bin');
    jpegtran = require('jpegtran-bin').path;
}catch(e){
    console.log( "optipng-bin & jpegtran-bin is not installed. \n building will run without Image minified!" );
}

exports.execute = function(req, resp, root, handle, conf){
    var referer = url.parse( req.headers.referer );
    root = $path.join(root, referer.pathname);
    var $root = conf.output,
        mime = req.util.mime,
        buildFilder = conf.buildFilder || function(){ return true; };

    var build = function( path ){
        var path1 = path,
            extType = $path.extname(path).substring(1),
            joinPath = $path.join($root, path);
        fs.stat( $path.join(root, path), function(error, stats){
            //文本类型资源通过HTTP获取, 以确保跟开发环境资源相同
            if(stats && stats.isFile && stats.isFile() && mime.isTXT(extType) && buildFilder(path) ){
                building = 1;
                //console.log( referer.href + "/" + encodeURI(path) );
                http.get( referer.href + "/" + encodeURI(path) + '?_build_=true', function(res) {
                    var type = res.headers['middleware-type'];
                    if(type){
                        path1 = path.replace(/[^\.]+$/,type);     //对应 middleware 里面的type
                    }
                    path1 = conf.rename ? conf.rename(path1, conf.debug) : path1;
                    fs.rename( joinPath, $path.join($root, path1), function(err){
                        var fws = fs.createWriteStream( $root + path1 );
                        if(err){
                            console.log(err);
                        }else{
                            res.pipe( fws ).on('finish',function(){
                                building = 0;
                            });
                        }
                    });
                }).on('error',function(){
                    console.log( 'build error for: ' + path );
                });
            }else if(stats && stats.isDirectory && stats.isDirectory()){ // 文件夹内递归需要构建
                fs.readdir( $path.join(root, path), function(error1, files){
                    for ( var k in files) {        //对应下级目录或资源文件
                        build(path + '/' + files[k]);
                    }
                });
                return;
            }

            if( !jpegtran ){
                return; // 图片压缩工具为安装， 不进行图片压缩。
            }

            if( mime.get(path) === "image/png" ){ // 使用 optipng-bin 进行图片压缩
                building = 1;
                execFile(optipng.path, ['-out', joinPath, joinPath], function (err) {
                    building = 0;
                    if (err) {
                        console.log(err);
                    }
                });
            }else if( mime.get(path) === "image/jpeg" ){ // 使用 jpegtran-bin 进行图片压缩
                building = 1;
                execFile(jpegtran, ['-outfile', joinPath, joinPath], function (err) {
                    building = 0;
                    if (err) {
                        console.log(err);
                    }
                });
            }
        });
    };

    exec('del ' + $root + '* /s/q',function(err){
        if(!err){
            exec('xcopy ' + root.replace(/(.*?)[\\\/]$/,'$1') + ' ' + $root + ' /e/d/s', function (error) {
                if (!error) {
                    try{
                        build("");
                    }catch(e){
                        console.error("build error:");
                        console.error(e);
                    }
                }
                resp.end(JSON.stringify({
                    error: error,
                    command: 'xcopy ' + root.replace(/(.*?)[\\\/]$/,'$1') + ' ' + $root + ' /e/d/s'
                }));
            });
        }else{
            exec('rm -rf ' + $root,function(err2){
                if(!err2){
                    exec('cp -Rf ' + root + '* ' + $root,function(err3){
                        if (!err3) {
                            try{
                                build("");
                            }catch(e){
                                console.error("build error:");
                                console.error(e);
                            }
                        }
                        resp.end(JSON.stringify({
                            error: err3,
                            command: 'cp -Rf  ' + root + '* ' + $root
                        }));
                    });
                }else{
                    resp.end(JSON.stringify({
                        error: '目录不存在: ' + $root,
                        command: 'xcopy ' + root.replace(/(.*?)[\\\/]$/,'$1') + ' ' + $root + ' /e/d/s'
                    }));
                }
            });
        }
    });
};
