var conf = {
    root :"D:\\", //服务器索引的根目录，可配置为任意本地地址
    welcome: "",    //使用欢迎页面的文件名，为空时，表示不使用欢迎页面
    notFound: __dirname + "/../html/404.html",      //访问的资源不存在是，跳转的页面配置
    folder: __dirname + "/../html/folder.html",     //显示文件夹列表时候的配置页面
    handle: true,       //是否使用服务器模板引擎
    middleware: true,   //中间件支持, LESS/CoffeeScript 等支持
    debug: true,        //是否对js以及css文件进行简单压缩，debug:true表示不压缩
    fs_mod: true,       //是否支持文件夹列表展示
    port: 80,           //服务器监听端口
    maxConnections: 1000,    //并发处理的最大连接数
    runJs : true,
    output: "c:\\output\\",
    'nginx-http-concat':true,
    agent : {
        get:function(path){
            for (var i = 0; i < this.map.length; i++) {
                if( this.map[i].reg.test(path) ){
                    return this.map[i]
                } 
            }
        },
        map:[
            {
                reg : /xuan/,
                host: 'xuan.news.cn',
                path: function(url){return ''}
            }
        ]
    },
    expires : 0     //服务端缓存时间设置
};

var extend = function(ext){
    for(var k in conf){
        ext[k] = typeof ext[k] === 'undefined' ? conf[k] : ext[k] 
    }
    return ext
};

exports.localhost = conf;

exports['test.abc.com'] = extend({  //跟模型配置相同端口时候支持根据hosts域名使用新配置。
    root :"D:\\doc\\"
});

exports.staticConf = extend({
    root: "",
    debug: false,
    port: 2850,
    expires : 1000*60*60*24
});