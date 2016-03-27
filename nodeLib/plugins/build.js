"use strict";
var $path = require('path'),
    fs = require('fs'),
    _ = require('underscore'),
    url = require("url"),
    http = require('http'),
    exec = require('child_process').exec,
    execFile = require('child_process').execFile;

var rename = require('../common/rename');
var building = 0;
//两秒内没有新的build,则build finished
var i = 0, builded = false, l = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
setInterval(function(){
    l[i] = building;
    if( _.find(l, function(n){ return !!n; }) ){
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

var crypto = require('crypto');
function md5 (text) {
  return crypto.createHash('md5').update(text).digest('hex');
}
var tinifiedPath = $path.join(__dirname, '../../../tinified.json');
var tinified = {};
if (!fs.existsSync(tinifiedPath)) {
    fs.writeFileSync( tinifiedPath, '{}');
}
else {
    tinified = JSON.parse(fs.readFileSync(tinifiedPath));
}
var tinifyImg = function (conf, path) {
    if (conf.tinify.filter && !conf.tinify.filter(path)) {
        return;
    }
    var tinify = require('tinify');
    tinify.key = conf.tinify.key;
    var input = $path.join(conf.output, path);
    var output = $path.join(conf.root, path);
    
    var rs = fs.readFileSync(input);
    var key = md5(rs);
    if (!tinified[key] && rs.length > (conf.tinify.minSize || 60 * 1024)) {
        building = 1;
        var source = tinify.fromFile(input);
        source.toFile(output, function (err) {
            if (err) {
                console.log('tinify error:');
                console.log(err);
            }
            else {
                var res = fs.readFileSync(output);
                tinified[md5(res)] = 1;
                fs.writeFileSync(tinifiedPath, JSON.stringify(tinified));
                fs.writeFileSync(input, res);
            }
            building = 0;
        });
    }

};

var buildFile = function(pathname, conf, callback){
    building = 1;
    var pathname1 = pathname;
    var url = 'http://' + conf.hostname + '/' + decodeURI(pathname) + '?_build_=true';
    http.get(url, function(res){
        pathname1 = rename.buildRename(pathname, $path.join(conf.root, pathname), conf);
        var outputFile = $path.join(conf.output, pathname1);
        try{
            var fws = fs.createWriteStream( outputFile );
            res.pipe( fws ).on('finish',function(){
                building = 0;
                callback();
            });
        }catch(e){
            console.log(e);
        }
    }).on('error', function(e){
        console.log('build error for: ' + pathname);
        console.log(e);
        building = 0;
    });
};
exports.buildFile = buildFile;
exports.execute = function(req, resp, root, handle, conf){
    if(!req.data._on_force_build_ && conf.livereload && conf.livereload.inject) {
        resp.end(JSON.stringify({
            code: -1,
            error: '项目已经开启livereload, 是否仍然进行构建？'
        }));
        return;
    }
    if( _.find(l, function(n){ return !!n; }) ){
        console.log('building......');
        resp.end(JSON.stringify({
            error: '构建中...'
        }));
        return;
    }
    var referer = url.parse( req.headers.referer || req.url );
    root = $path.join(root, referer.pathname);
    var $root = conf.output,
        mime = req.util.mime,
        buildFilter = conf.buildFilter || function(){ return true; };

    var build = function( path ){
        var path1 = path,
            joinPath = $path.join($root, path),
            newPath = joinPath;
        var fromPath = $path.join(root, path);
        fs.stat(fromPath, function(error, stats){
            //文本类型资源通过HTTP获取, 以确保跟开发环境资源相同
            if(stats && stats.isFile && stats.isFile() && mime.isTXT(path)){
                path1 = rename.buildRename(path, $path.join(root, path), conf, needBuild);
                var needBuild = buildFilter(path1);
                // needBuild &&　console.log(path1);
                newPath = $path.join($root, path1);
                //console.log( referer.href + "/" + encodeURI(path) );
                if (needBuild) {
                    building = 1;
                    http.get( referer.href + "/" + encodeURI(path) + '?_build_=true', function(res) {
                        if(res.statusCode === 200){
                            var fws = fs.createWriteStream( newPath );
                            res.pipe( fws ).on('finish',function(){
                                building = 0;
                            });
                        }else{
                            console.log('build error for: ' + path);
                        }
                    }).on('error',function(e){
                        console.log('build error for: ' + path);
                        console.log(e);
                    });
                }
                else if (needBuild !== false){
                    fs.writeFile(newPath, fs.readFileSync(fromPath), function (err) {
                        console.log(err);
                        building = 0;
                    });
                }
            }else if(stats && stats.isDirectory && stats.isDirectory()){ // 文件夹内递归需要构建
                try {
                    fs.mkdirSync(newPath);
                }
                catch (e) {
                }
                fs.readdir(fromPath, function(error1, files){
                    for ( var k in files) {        //对应下级目录或资源文件
                        build(path + '/' + files[k]);
                    }
                });
                return;
            }

            // 使用tinify压缩图片
            if (/image\/.*/.test(mime.get(path)) && buildFilter(path) && conf.tinify){
                tinifyImg(conf, path);
            }
        });
    };
    resp.end(JSON.stringify({
        error: false,
        command: '开始构建...'
    }));
    return build('');
    // exec('del ' + $root + '* /s/q',function(err){
    exec('dir',function(err){
        if(!err){
            var bash = 'xcopy ' + root.replace(/(.*?)[\\\/]$/,'$1') + ' ' + $root + ' /e/s/y';
            exec(bash, function (error) {
                if (!error) {
                    try{
                        build("");
                    }catch(e){
                        console.error("build error:");
                        console.error(e);
                    }
                }
                console.log(error);
                resp.end(JSON.stringify({
                    error: error,
                    command: 'xcopy ' + root.replace(/(.*?)[\\\/]$/,'$1') + ' ' + $root + ' /e/s/y'
                }));
            });
        }else{
            // exec('rm -rf ' + $root + '/*',function(err2){
            exec('ls',function(err2){
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
                        error: err2,
                        command: 'xcopy ' + root.replace(/(.*?)[\\\/]$/,'$1') + ' ' + $root + ' /e/d/s'
                    }));
                }
            });
        }
    });
};
