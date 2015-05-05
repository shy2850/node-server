"use strict";
var fs = require("fs"),
    mime = require("mime"),
    cssmin = require("cssmin");
var autoprefixer;
try{
    autoprefixer = require("autoprefixer-core");
}catch(e){
    autoprefixer = false;
}

var mini = {
    js: function(str, resp){
        var resu = require("uglify-js").minify(str,{fromString: true});
        resp.end( resu.code );
    },
    css: function(str, resp){ resp.end( cssmin(str)); },
    htm: function(str, resp){ resp.end( str.replace(/\s+/g," ") ); },
    get: function(pathname, debug){
        var extType = pathname.split('.').pop();
        return function(str, resp, conf){
            var m;
            if( extType === "css" && conf && conf.autoprefix && autoprefixer ){
                str = autoprefixer.process( str ).css;
            }
            if(!debug && (m = mini[extType]) ){
                m(str, resp);
            }else{
                resp.end( str );
            }
        };
    }
};
var middleware = {
	coffee: function(req, resp, rs, pathname, DEBUG){
        var scriptStr = require("coffee-script").compile( rs );
        resp.writeHead(200, {"middleware-type": 'js', "Content-Type": mime.get('js')});   //用以build输出时转换后缀名
        mini.get("js",DEBUG)(scriptStr, resp);
	},
	less: function(req, resp, rs, pathname, DEBUG){
        require("less").render(rs, {
            paths: [ pathname.replace(/(\/[^\/]+?)$/,"") ],
            compress: !DEBUG
        }, function (err, output) {
            if (err) { throw err; }
            else{
                resp.writeHead(200, {"middleware-type": 'css', "Content-Type": mime.get('css')});
                mini.get("css", DEBUG)(output.css, resp);
            }
        });
	},
    jade: function(req, resp, rs){
        resp.writeHead(200,{"middleware-type": 'html', "Content-Type": mime.get('html')});
        var output = require('jade').render(rs);
        resp.end( output );
    },
    md: function(req, resp, rs){
        resp.writeHead(200,{"middleware-type": 'html', "Content-Type": mime.get('html')});
        var output = require( "markdown" ).markdown.toHTML(rs + '');
        resp.end( '<style>code{padding:2px 8px;background:#eee;}</style>' + output );
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
                    resp.end( html );
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
            resp.writeHead(500, {"Content-Type": "text/html"});
            resp.end( JSON.stringify(e) );
        }
    };
};
exports.mini = mini;

mime.get = function(path, fallback){
    if( /\bdo$/.test(path) ){
        return this.lookup(path, fallback || "text/html");
    }else if( /\bcur$/.test(path) ){
        return "";
    }else{
        return this.lookup(path, fallback);
    }
};
mime.isTXT = function(path, fallback){
    return /\b(php|jsp|asp|less|coffee|jade)$/.test(path) || /\b(text|xml|javascript|json)\b/.test( this.get(path, fallback) );
};
