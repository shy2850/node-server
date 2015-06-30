"use strict";
var fs = require("fs"),
    mime = require("mime"),
    zlib = require("zlib"),
    cdn = require("./cdn"), // cdn模块
    cssmin = require("cssmin");
var autoprefixer;
try{
    autoprefixer = require("autoprefixer-core");
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
        return function(str, resp){
            var m;
            if( extType === "css" && resp.autoprefixer ){
                str = autoprefixer.process( str ).css;
            }
            if(!debug && (m = mini[extType]) ){
                m(str, resp);
            }else{
                out(str, resp);
            }
        };
    }
};

var middout = function(type, str, resp, debug){
    resp.writeHead(200, {
        "middleware-type": type,
        "Content-Encoding": resp.gzip ? "gzip" : "utf-8",
        "Content-Type": mime.get(type)
    });
    mini.get(type, debug)(str, resp);
};
var middleware = {
	coffee: function(req, resp, rs, pathname, DEBUG){
        var scriptStr = require("coffee-script").compile( rs );
        middout("js", scriptStr, resp, DEBUG);
    },
    less: function(req, resp, rs, pathname, DEBUG){
        require("less").render(rs, {
            paths: [ pathname.replace(/(\/[^\/]+?)$/,"") ],
            compress: !DEBUG
        }, function (err, output) {
            if (err) { throw err; }
            else{
                middout("css", output.css, resp);
            }
        });
    },
    scss: function(req, resp, rs, pathname, DEBUG){
        require('node-sass').render({
            file: pathname,
            outFile: pathname.replace(/(\.scss)$/,".css"),
            includePaths: [ pathname.replace(/(\/[^\/]+?)$/,"") ],
            outputStyle: (!DEBUG ? "compressed" : "expanded")
        }, function (err, output) {
            if (err) { throw err; }
            else{
                middout("css", output.css.toString(), resp);
            }
        });
    },
    jade: function(req, resp, rs){
        var output = require('jade').render(rs);
        middout("html", output.toString(), resp);
    },
    md: function(req, resp, rs){
        var output = require('marked')(rs + '');
        middout("html", output, resp);
    },
    mdppt: function(req, resp, rs){
        var output = require('./nodePPT/index.js')(rs + '');
        middout("html", output, resp);
    },
    ftl: function(req, resp, rs, pathname){
        resp.writeHead(200,{"middleware-type": 'html', "Content-Type": mime.get('html')});
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
                    middout("html", html, resp);
                }
                fs.unlink(tmpUrl);
            });
        });
    }
};
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
exports.mini = mini;
exports.cdn = cdn;

var middTypes = {
    coffee: "js",
    less: "css",
    scss: "css",
    jade: "html",
    md: "html",
    mdppt: "html",
    ftl: "html"
};
mime.get = function(path, fallback){
    var extType = (path + "").split(".").pop();
    return this.lookup( middTypes[extType] || path, fallback );
};
mime.isTXT = function(path, fallback){
    return /\b(php|jsp|asp|less|coffee|jade|mdppt)$/.test(path) || /\b(text|xml|javascript|json)\b/.test( this.get(path, fallback) );
};
