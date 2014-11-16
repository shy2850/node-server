"use strict";
var path = require('path');
var conf = {
    root: "D:\\", //服务器索引的根目录，可配置为任意本地地址
    welcome: "", //使用欢迎页面的文件名，为空时，表示不使用欢迎页面
    notFound: path.join( __dirname , "/../html/404.html" ),      //访问的资源不存在是，跳转的页面配置
    folder: path.join( __dirname , "/../html/folder.html" ),     //显示文件夹列表时候的配置页面
    handle: true,       //是否开启服务器动态脚本
    middleware: true,   //中间件支持, LESS/CoffeeScript 等支持
    debug: true,        //是否对js以及css文件进行简单压缩，debug:true表示不压缩
    "fs_mod": true,       //是否支持文件夹列表展示
    port: 80,           //服务器监听端口
    maxConnections: 1000,    //并发处理的最大连接数
    runJs: true,       //是否使用服务器模板引擎
    output: "c:\\output\\",
    buildFilder: function(filePath){
        return !/\bnode_modules\b/.test( filePath );
    },
    'nginx-http-concat': true,
    agent: {
        get: function(path){
            for (var i = 0; i < this.map.length; i++) {
                if( this.map[i].reg.test(path) ){
                    return this.map[i];
                }
            }
        },
        map: [
            {
                reg: /\b(js|icons)\b/, //路径中若符合正则且映射不到内容，获取远程数据
                host: 'shy2850.sturgeon.mopaas.com'
            },
            {
                reg: /\.js$/,
                path: function(url){
                    return url.path.replace(/(.*?)(\.min)?\.js$/,'$1.coffee');
                }
            },
            {
                reg: /\.css$/,
                path: function(url){
                    return url.path.replace(/(.*?)(\.min)?\.css$/,'$1.less');
                }
            },
            {
                reg: /\.html$/,
                path: function(url){
                    return url.path.replace(/(.*?)\.html$/,'$1.jade');
                }
            }
        ]
    },
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
exports.localhost = conf.extend({
    root: ''
});

exports.staticconf = conf.extend({ //不要删除或者修改这个服务
    root: "",
    port: 2850,
    debug: false,
    expires: 1000 * 60 * 60 * 24
});
try{
    var $conf = require('../../../conf.js');
    for(var k in $conf){
        exports[k] = conf.extend( $conf[k] );
    }
}catch(e){

}
