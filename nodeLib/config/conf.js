"use strict";
var path = require('path'),
    fs = require('fs');
var conf = {
    root: path.join(__dirname, '../../'), //服务器索引的根目录，可配置为任意本地地址
    welcome: "", //使用欢迎页面的文件名，为空时，表示不使用欢迎页面
    notFound: path.join( __dirname , "/../html/404.html" ),      //访问的资源不存在是，跳转的页面配置
    folder: path.join( __dirname , "/../html/folder.html" ),     //显示文件夹列表时候的配置页面
    handle: true,       //是否开启服务器动态脚本
    include: "\\$include\\[[\"\\s]*([^\"\\s]+)[\"\\s]*\\]",
    placeholder: "$[placeholder]",
    belong: "\\$belong\\[[\"\\s]*([^\"\\s]+)[\"\\s]*\\]",
    middleware: true,   //中间件支持, LESS/CoffeeScript 等支持
    autoprefix: false,   //autoprefixer 支持
    debug: true,        //是否对js以及css文件进行简单压缩，debug:true表示不压缩
    cdn: false,
    "fs_mod": true,       //是否支持文件夹列表展示
    port: 80,           //服务器监听端口
    maxConnections: 1000,    //并发处理的最大连接数
    runJs: true,       //是否使用服务器模板引擎
    output: "c:\\output\\",
    buildFilder: function(filePath){
        return !/\bnode_modules\b/.test( filePath );
    },
    rename: function(filename/*, debug*/){ //构建完成后是否重命名文件
        // return debug ? filename : filename.replace(/\.(js|css)$/,".min.$1");
        return filename;
    },
    'nginx-http-concat': true,
    filter: {
        get: function(){
            // console.log( arguments[0].url );  // 这个前置过滤器可以过滤所有服务端请求, 配置和agent类似
        }
    },
    agent: {},
    extend: function(o){
        var res = {};
        for( var i in this ){
            res[i] = this[i];
        }
        for( var j in o ){
            res[j] = o[j];
        }
        return res;
    },
    expires: 0     //服务端缓存时间设置
};
exports.localhost = conf.extend({});

exports.staticconf = conf.extend({ //不要删除或者修改这个服务
    host: "",
    port: 2850,
    debug: false,
    cdn: true,
    expires: 1000 * 60 * 60 * 24,
    filter: {
        get: function(req, resp){
            if( req.url.match(/^[\\\/]?(config|upload|nodeLib\/html)([\/\\])*/) ){
                resp.writeHead(403,{"content-type": "text/html"});
                resp.end('<h2 style="text-align:center">禁止访问</h2>');
                return false;
            }
        }
    }
});

var confPath = path.join( __dirname, "../../../conf.js" );
var stat = fs.existsSync( confPath );

if( !stat ){
    fs.writeFileSync( confPath, 'exports["localhost"] = ' + JSON.stringify( exports.localhost, null, 4 ) + ';\n' );
}
try{
    var $conf = require('../../../conf.js');
    for(var k in $conf){
        if( k === "staticconf" ){
            exports[k] = conf.extend.call( exports.staticconf, $conf[k] );
        }else{
            exports[k] = conf.extend( $conf[k] );
        }
    }
}catch(e){
    console.log(e);
}
