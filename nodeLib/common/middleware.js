"use strict";
var mime = require("mime"),
    cssmin = require("cssmin");
var mini = {
    js  : function(str,resp){
        var resu = require("uglify-js").minify(str,{fromString: true});
        resp.end( resu.code );
    },
    css : function(str,resp){ resp.end( cssmin(str)); },
    htm : function(str,resp){ resp.end( str.replace(/\s+/g," ") ); },
    get : function(pathname){
        var extType = pathname.split('.').pop();
        return function(str,resp){
            var m = mini[extType];
            if(m){
                m(str,resp);
            }else{
                resp.end( str );
            }
        };
    }
};
var middleware = {
	coffee: function(req,resp,rs,pathname,DEBUG){
        var scriptStr = require("coffee-script").compile( rs );
        resp.writeHead(200,{"middleware-type":'js',"Content-Type": mime.get('js')});   //用以build输出时转换后缀名
        if(DEBUG){
            resp.end( scriptStr );
        }else{
            mini.js(scriptStr,resp);
        }
	},
	less: function(req,resp,rs,pathname,DEBUG){
        new(require("less").Parser)({
            paths:[ pathname.replace(/(\/[^\/]+?)$/,"") ]
        }).parse(rs, function (err, tree) {
            if (err) { throw err }
            else{
                resp.writeHead(200,{"middleware-type":'css',"Content-Type": mime.get('css')});
                if(DEBUG){
                    resp.end( tree.toCSS() );
                }else{
                    mini.css(tree.toCSS(),resp);
                }
            }
        });
	},
    jade: function(req,resp,rs){
        resp.writeHead(200,{"middleware-type":'html',"Content-Type": mime.get('html')});
        var output = require('jade').render(rs);
        resp.end( output );
    },
    md: function(req,resp,rs){
        resp.writeHead(200,{"middleware-type":'html',"Content-Type": mime.get('html')});
        var output = require( "markdown" ).markdown.toHTML(rs + '');
        resp.end( '<style>code{padding:2px 8px;background:#eee;}</style>' + output );
    }
};
exports.get = function(pathname){
    var extType = pathname.split('.').pop(),
        fn = middleware[extType];
    return !fn ? !1 : function(req,resp){
        try{
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
    }else{
        return this.lookup(path, fallback);
    }
};
mime.isTXT = function(path, fallback){
    return  /\b(php|jsp|asp|less|coffee|jade)$/.test(path) || /\b(text|xml|javascript|json)\b/.test( this.get(path, fallback) );
};
