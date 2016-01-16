"use strict";
var path = require('path'),
    fs = require('fs');
var conf = {
    root: path.join(__dirname, '../../'), //服务器索引的根目录，可配置为任意本地地址
    port: 80,           //服务器监听端口
    handle: true,       //是否开启服务器动态脚本 （基本的include/belong/模板引擎/压缩功能等均依赖此配置）
    runJs: true,        //是否使用服务器模板引擎
    uploadFile: false,  //是否开启文件上传保存
    middleware: true,   //中间件支持, LESS/CoffeeScript 等支持
    autoprefixer: false,//autoprefixer 支持
    babel: false,       //babel解析js
    debug: true,        //是否对js以及css文件进行简单压缩，debug:true表示不压缩
    cdn: false,         //针对线上运行服务器配置, 缓存资源到运行内存减少硬盘IO
    "fs_mod": true,     //是否支持文件夹列表展示
    welcome: "", //使用欢迎页面的文件名，不为空时，fs_mod可能失效
    notFound: path.join( __dirname , "/../html/404.html" ),      //访问的资源不存在时跳转的页面配置
    folder: path.join( __dirname , "/../html/folder.html" ),     //显示文件夹列表时候的配置页面
    include: "\\$include\\[[\"\\s]*([^\"\\s]+)[\"\\s]*\\]",
    placeholder: "$[placeholder]",
    belong: "\\$belong\\[[\"\\s]*([^\"\\s]+)[\"\\s]*\\]",
    livereload: false,  //是否监听文件变化刷新网页, 详细配置如下
    // 支持映射关联文件构建
    /*
    livereload: {
        inject: function(pathname){
            // 只在html文件中插入livereload代码
            return pathname.match(/\.html/);
        },
        relative: function(pathname){
            var root = conf.root;
            if(pathname.match(/layout\.html/)){
                // 如果是layout.html修改， pages文件夹下面所有管理的文件都需要修改。
                return fs.readdirSync(path.join(root, 'pages'))
                .map(function(filename){
                    return 'pages/' + filename;
                });
            }
        }        
    },
    */
    maxConnections: 1000,    //并发处理的最大连接数
    output: "c:\\output\\",
    buildFilter: function(filePath){
        return !/\bnode_modules\b/.test( filePath );
    },
    renameMap: [    //  html页面中使用$rename[]的资源修改, 如果配置了withBuild属性将在构建时候对文件进行对应重命名, 
    /*
        {
            reg: /^\//, // 把绝对路径都改成带域名的
            release: "http://localhost/"
        },
        {   // renameMap 过滤管道
            // 依次匹配正则进行替换, 
            // 所有配置的正则都会经过, 
            // 最后还会附加中间件(如:less)的rename
            reg: /src\/css\/([\w\-]+)/,  
            release: "dist/css/$1",
            withBuild: true
        },
        {
            // 添加MD5重命名文件
            // 凡是添加了 withBuild 参数均被构建环节使用
            reg: /^[^\\\/].*\.css$/,
            withBuild: 'md5'
        }
    */
    ],
    'nginx-http-concat': true,  // 支持
    filter: {
        get: function(/*req, resp*/){
            // console.log( arguments[0].url );  // 这个前置过滤器可以过滤所有服务端请求
        }
    },
    agent: {},  // 代理复杂配置，匹配路径从另外服务器获取资源并可以修改响应信息
    /*
    agent: {
        get: function(path){
            if( path.match(/node-server/) ){
                return {
                    host: "raw.githubusercontent.com",
                    port: 443,
                    setHeaders: function(headers){
                        delete headers['x-frame-options']
                    }
                }
            }
        }
    },
    */
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
    port: 2850,
    debug: false,
    cdn: true,
    expires: 1000 * 60 * 60 * 24,
    filter: {
        get1: function(req, resp){
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
    fs.writeFileSync( confPath, 'exports["localhost"] = ' + JSON.stringify( {
        root: conf.root,
        port: conf.port,
        output: conf.output
    }, null, 4 ) + ';\n' );
}
try{
    var $conf = require('../../../conf.js');
    for(var k in $conf){
        if( k === "setup" ){
            exports.setup = $conf[k];
        }
        else if( k === "staticconf" ){
            exports[k] = conf.extend.call( exports.staticconf, $conf[k] );
        }else{
            exports[k] = conf.extend( $conf[k] );
        }
    }
}catch(e){
    console.log("配置文件错误，使用默认配置！");
}
