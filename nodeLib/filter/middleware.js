"use strict";
var fs = require("fs"),
    mime = require("mime"),
    path = require("path"),
    _ = require("underscore"),
    zlib = require("zlib"),
    cdn = require("./cdn"), // cdn模块
    cssmin = require("cssmin");

var livereload_code = require("uglify-js")
    .minify(
        fs.readFileSync(
            path.join( __dirname, '../../static/js/livereload.js')
        ).toString(),{
            fromString: true
        }).code;

var postcss, autoprefixer;
try{
    postcss = require("postcss");
    autoprefixer = require("autoprefixer");
}catch(e){
    autoprefixer = false;
}

var out = function(str, resp){
    if( resp.gzip ){
        zlib.gzip(str, function(err, decoded){
            if(err){
                console.log( err );
            }
            cdn.set( resp, decoded );
            resp.end( decoded );
        });
    }else{
        cdn.set( resp, str );
        resp.end( str );
    }
},
mini = {
    js: function(str, resp){
        var resu = require("uglify-js").minify(str,{fromString: true});
        out( resu.code, resp );
    },
    css: function(str, resp){
        var $css = cssmin(str);
        out( $css, resp );
    },
    get: function(pathname, debug){
        var extType = pathname.split('.').pop();
        var mimeType = mime.get(pathname);
        return function(str, resp){
            var m;
            var conf = resp.util.conf;
            if("text/css" === mimeType && resp.autoprefixer && autoprefixer){
                if(autoprefixer){
                    postcss([ autoprefixer({inline:false,browsers: ['> 1%', 'IE 7']}) ]).process(str).then(function (result) {
                        result.warnings().forEach(function (warn) {
                            console.warn(warn.toString());
                        });
                        if(!debug && (m = mini[extType]) ){
                            m(result.css, resp);
                        }else{
                            out(result.css, resp);
                        }
                    });
                }else{
                    console.error("autoprefixer-core 未安装, 自动前缀插件不可用！");
                }
            }else{
                if(conf.babel && "application/javascript" === mimeType){
                    str = require("babel").transform(str, _.extend({}, conf.babel, {
                        sourceRoot: pathname
                    })).code;
                }
                if(resp.data.listen || conf.livereload && conf.livereload.inject && conf.livereload.inject(pathname)){
                    str = str + '<script data-host="' + conf.host + '">' + livereload_code + '</script>';
                }
                if(!debug && (m = mini[extType]) ){
                    m(str, resp);
                }else{
                    out(str, resp);
                }
            }
        };
    }
};

var middout = function(type, str, resp, debug){
    resp.writeHead(200, {
        "Content-Encoding": resp.gzip ? "gzip" : "utf-8",
        "Content-Type": mime.get(type)
    });
    mini.get(type, debug)(str, resp);
};
var middleware = {
};
var middTypes = {
};
exports.mini = mini;
exports.cdn = cdn;
exports.get = function(pathname){
    var extType = pathname.split('.').pop(),
        fn = middleware[extType];
    return !fn ? !1 : function(req, resp, rs){
        try{
            if(typeof req.util.conf.middleware.get === "function"){
                arguments[2] = req.util.conf.middleware.get(rs,req,resp) || rs;
            }
            fn.apply(middleware,arguments);
        }catch(e){
            console.log(e);
            resp.writeHead(500, {"Content-Type": "text/html"});
            resp.end( JSON.stringify(e) );
        }
    };
};

var register = function (ext, type, render) {
    middTypes[ext] = type;
    middleware[ext] = function(req, resp, rs, pathname, DEBUG){
        if (!render) {
            return middout(type, rs, resp, DEBUG);
        }

        var resultStr = render.call({
            out: function (str){
                middout(type, str, resp, DEBUG);
            }
        }, req, resp, rs, pathname, DEBUG);
        if (typeof resultStr === 'string') {
            middout(type, resultStr, resp, DEBUG);
        }
    };

};

register('less', 'css', function(req, resp, rs, pathname, DEBUG){
    var out = this.out;
    require("less").render(rs, {
        paths: [ pathname.replace(/(\/[^\/]+?)$/,"") ],
        compress: !DEBUG
    }, function (err, output) {
        if (err) { throw err; }
        else{
            out(output.css);
        }
    });
});

register('scss', 'css', function(req, resp, rs, pathname, DEBUG){
    var out = this.out;
    require('node-sass').render({
        file: pathname,
        outFile: pathname.replace(/(\.scss)$/,".css"),
        includePaths: [ pathname.replace(/(\/[^\/]+?)$/,"") ],
        outputStyle: (!DEBUG ? "compressed" : "expanded")
    }, function (err, output) {
        if (err) { throw err; }
        else{
            out(output.css.toString());
        }
    });
});

register('jade', 'html', function(req, resp, rs, pathname, DEBUG){
    var output = require('jade').render(rs, {pretty: true});
    this.out(output.toString());
});
register('md', 'html', function(req, resp, rs, pathname, DEBUG){
    var output = require('marked')(rs + '');
    this.out('<meta charset="utf-8"/>' + output);
});
register('mdppt', 'html', function(req, resp, rs, pathname, DEBUG){
    var mdppt = require('mdppt');
    mdppt.cfg.base = req.util.staticServer + '/node_modules/mdppt/assets/';
    var output = mdppt(rs + '');
    this.out(output);
});
register('coffee', 'js', function(req, resp, rs, pathname, DEBUG){
    var scriptStr = require("coffee-script").compile( rs );
    this.out(scriptStr);
});
register('ftl', 'html', function(req, resp, rs, pathname, DEBUG){
    var out = this.out;
    var Freemarker = require('freemarker.js');
    var fm = new Freemarker({
        viewRoot: req.util.conf.root,
        options: {}
    });
    var dataObj = JSON.parse( fs.readFileSync( pathname.replace(/\.ftl/,".json") ) ),
        tmp = req.$.title + '.tmp',
        tmpUrl = req.util.conf.root + tmp;
    fs.writeFile( tmpUrl, rs, function(err){
        if(err){
            throw err;
        }
        fm.render( tmp, dataObj, function(err1, html) {
            if(err1){
                throw err1;
            }else{
                out(html);
            }
            fs.unlink(tmpUrl);
        });
    });
});

exports.middTypes = middTypes;
exports.middleware = middleware;
exports.register = register;

mime.get = function(path, fallback){
    var extType = (path + "").split(".").pop();
    return this.lookup( middTypes[extType] || path, fallback );
};
mime.isTXT = function(path, fallback){
    return /\b(php|jsp|asp)$/.test(path) || /\b(text|xml|javascript|json)\b/.test( this.get(path, fallback) );
};
