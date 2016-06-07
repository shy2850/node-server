"use strict";
var $path = require('path'),
    fs = require('fs'),
    _ = require('underscore'),
    url = require("url"),
    http = require('http'),
    exec = require('child_process').exec,
    execFile = require('child_process').execFile;
var FtpClient= require('ftp');

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
                console.trace(err);
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
            console.trace(e);
        }
    }).on('error', function(e){
        console.log('build error for: ' + pathname);
        console.trace(e);
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
        buildInterval = conf.buildInterval || 10,
        mime = req.util.mime,
        buildFilter = conf.buildFilter || function(){ return true; };

    var ftpClient;

    var build = function( path ){
        var joinPath = $path.join($root, path);
        var fromPath = $path.join(root, path);

        // 先获取真实构建目录, 在判断是否构建, 根目录需要直接返回 needBuild:true
        var path1 = rename.buildRename(path, fromPath, conf);
        var needBuild = !path ? true : buildFilter(path1);
        // needBuild &&　console.trace(path1);
        if (needBuild === false) {
            // 如果路径匹配直接是false, 就不再构建了
            return;
        }
        var newPath = $path.join($root, path1);

        fs.stat(fromPath, function(error, stats){
            //文本类型资源通过HTTP获取, 以确保跟开发环境资源相同
            if(stats && stats.isFile && stats.isFile()){
                //console.trace( referer.href + "/" + encodeURI(path) );
                if (mime.isTXT(path) && needBuild) {
                    building = 1;
                    http.get( referer.href + "/" + encodeURI(path) + '?_build_=true', function(res) {
                        if(res.statusCode === 200){
                            var fws = fs.createWriteStream( newPath );
                            res.pipe( fws ).on('finish',function(){
                                building = 0;
                                if (ftpClient) {
                                    console.trace('uploading...\t' + path1);
                                    ftpClient.put(newPath, $path.join(ftpClient.root, path1), function (e) {
                                        console.trace((e ? '!upload error\t' : 'upload success\t') + path1);
                                        ftpClient.end();
                                    });
                                }
                            });
                        }else{
                            console.log('build error for: ' + path);
                        }
                    }).on('error',function(e){
                        console.log('build error for: ' + path);
                        console.trace(e);
                    });
                }
                else {
                    building = 1;
                    // fs.writeFile(newPath, fs.readFileSync(fromPath), function (err) {
                    //     building = 0;
                    // });
                    var readable = fs.createReadStream( fromPath );
                    // 创建写入流
                    var writable = fs.createWriteStream( newPath );   
                    // 通过管道来传输流
                    readable.pipe( writable ).on('finish', function (err) {
                        if (err) {
                            console.error(err);
                        }
                        building = 0;
                        if (ftpClient) {
                            console.trace('uploading...\t' + path1);
                            ftpClient.put(newPath, $path.join(ftpClient.root, path1), function (e) {
                                console.trace((e ? '!upload error\t' : 'upload success\t') + path1);
                                ftpClient.end();
                            });
                        }
                        // 使用tinify压缩图片
                        if (/image\/.*/.test(mime.get(path)) && buildFilter(path) && conf.tinify){
                            tinifyImg(conf, path);
                        }
                    });
                }
            }else if(stats && stats.isDirectory && stats.isDirectory()){ // 文件夹内递归需要构建
                try {
                    fs.mkdirSync(newPath);
                }
                catch (e) {
                    // console.error(e);
                }
                // 区分FTP上传和普通构建；
                if (ftpClient) {
                    ftpClient.mkdir($path.join(ftpClient.root, path1), function (e) {
                        fs.readdir(fromPath, function(error1, files){
                            files.forEach(function (file, i) {
                                setTimeout(function () {
                                    build(path + '/' + file);
                                }, buildInterval * i);
                                // 增加buildInterval配置参数, 项目需要构建的资源文件过多
                                // 时候可以考虑设置, 防止http并发太大导致构建失败
                            });
                        });
                    });
                }
                else {
                    fs.readdir(fromPath, function(error1, files){
                        files.forEach(function (file, i) {
                            setTimeout(function () {
                                build(path + '/' + file);
                            }, buildInterval * i);
                            // 增加buildInterval配置参数, 项目需要构建的资源文件过多
                            // 时候可以考虑设置, 防止http并发太大导致构建失败
                        });
                    });
                }
                return;
            }
                
        });
    };

    if (conf.outftp) {
        ftpClient = new FtpClient();
        ftpClient.connect(conf.outftp);
        ftpClient.root = conf.outftp.path || '/wwwroot/';
        ftpClient.on('ready', function (e) {
            build('');
            resp.end(JSON.stringify({
                command: '开始构建并进行FTP上传...'
            }));
        }).on('error', function (e) {
            console.trace(e);
            resp.end(JSON.stringify({
                error: 'FTP上传配置有误...'
            }));
        }).on('end', function () {
            console.trace('\nftp upload finished!\n');
        });
    }
    else {
        build('');
        resp.end(JSON.stringify({
            command: '开始构建...'
        }));
    }

    
};
