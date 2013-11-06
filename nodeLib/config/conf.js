/**	
 *  基本配置参数
 **/
exports.CONF = {
    root:"",
//    root: "D:\\WORK\\web\\webDevelop\\space\\trunk",       //服务器索引的根目录，可配置为任意本地地址
    welcome: "",    //使用欢迎页面的文件名，为空时，表示不使用欢迎页面
    notFound: __dirname + "/../html/404.html",      //访问的资源不存在是，跳转的页面配置
    folder: __dirname + "/../html/folder.html",     //显示文件夹列表时候的配置页面
    handle: true,       //是否使用服务器模板引擎
    coffee: true,       //是否支持coffee-script动态解析
    less: true,         //是否支持less动态解析
    debug: true,        //是否对js以及css文件进行简单压缩，debug:true表示不压缩
    fs_mod: true,       //是否支持文件夹列表展示
    port: 8080,           //服务器监听端口
    maxConnections: 1000,    //并发处理的最大连接数
    runJs : true,
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
    expires : 1000*60*60*24     //服务端缓存时间设置
};

