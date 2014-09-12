/**	
 *  基本配置参数
 **/
exports.CONF = {
    root :"D:\\WORK\\XhcmsProject\\Tomcat\\webapps\\xhcms\\xhcms_2014\\", //服务器索引的根目录，可配置为任意本地地址
    welcome: "",    //使用欢迎页面的文件名，为空时，表示不使用欢迎页面
    notFound: __dirname + "/../html/404.html",      //访问的资源不存在是，跳转的页面配置
    folder: __dirname + "/../html/folder.html",     //显示文件夹列表时候的配置页面
    handle: true,       //是否使用服务器模板引擎
    coffee: false,       //是否支持coffee-script动态解析
    less: false,         //是否支持less动态解析
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
                reg : /static/,
                host: 'localhost',
                port: 2850,
                path: function(url){
                    return url.path;
                }
            },
            {
                reg:/xuan/,
                host:'xuan.news.cn',
                port:80,
                path:function(url){
                    return '';
                }
            }
        ]
    },
    expires : 0     //服务端缓存时间设置
};

exports.staticConf = {          //不要修改
    root: "",       
    welcome: "",
    notFound: __dirname + "/../html/404.html",
    folder: __dirname + "/../html/folder.html",
    handle: true,
    coffee: true,
    less: true,
    debug: false,
    fs_mod: true,
    port: 2850,
    maxConnections: 1000,    //并发处理的最大连接数
    runJs : true,
    output: "c:\\output\\",
    agent : {
        get:function(path){
            return /baidu/.test(path) ?{
                reg : /baidu/,
                host: 'www.baidu.com',
                port: 80,
                path: function(url){
                    return '';
                }
            } : undefined
        }
    },
    expires : 1000*60*60*24     //服务端缓存时间设置
};

exports.conf1 = {          //不要修改
    root: "C:\\Users\\SHY2850\\Desktop\\temp\\",       
    welcome: "",
    notFound: __dirname + "/../html/404.html",
    folder: __dirname + "/../html/folder.html",
    handle: true,
    coffee: true,
    less: true,
    debug: false,
    fs_mod: true,
    port: 1000,
    maxConnections: 1000,    //并发处理的最大连接数
    runJs : true,
    output: "c:\\output\\",
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
                reg : /front\/json\/|front\/jsondata\/|xhmedia/,
                host: '172.18.11.129',
                port: 8080,
                path: function(url){
                    return url.path.replace(/front/,'xhmedia');
                },
                cookie:'username=shiyangyang2013'
            }
        ]         
    },
    expires : 1000*60*60*24    //服务端缓存时间设置
};

exports.conf2 = {          //不要修改
    root: "D:\\WORK\\web\\UIdesign\\集成交互项目组\\",       
    welcome: "",
    notFound: __dirname + "/../html/404.html",
    folder: __dirname + "/../html/folder.html",
    handle: true,
    coffee: true,
    less: true,
    debug: false,
    fs_mod: true,
    port: 404,
    maxConnections: 1000,    //并发处理的最大连接数
    runJs : true,
    output: "c:\\output\\",
    expires : 1000*60*60*24     //服务端缓存时间设置
};