var fs = require("fs"),
    mime = require("../module/mime"),
	querystring = require("querystring");

var mini = { 
    _cssmin_: require("cssmin"), 
    js  : function(str,resp){ 
        var resu = require("uglify-js").minify(str,{fromString: true});
        resp.end( resu.code ); 
    }, 
    css : function(str,resp){ resp.end( mini._cssmin_(str)) }, 
    htm : function(str,resp){ resp.end( (str).replace(/\s+/g," ") ) }, 
    get : function(extType){ 
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
	coffee: function(req,resp,rs,pathname,_DEBUG){
        var scriptStr = require("coffee-script").compile( rs ); 
        resp.writeHead(200,{"middleware-type":'js',"Content-Type": mime.get('js')});   //用以build输出时转换后缀名
        _DEBUG ? resp.end( scriptStr ) : mini.js(scriptStr,resp) ; 
	},
	less: function(req,resp,rs,pathname,_DEBUG){
        new(require("less").Parser)({ 
            paths:[ pathname.replace(/(\/[^\/]+?)$/,"") ] 
        }).parse(rs, function (err, tree) { 
            if (err) { throw err } 
            else{ 
                resp.writeHead(200,{"middleware-type":'css',"Content-Type": mime.get('css')});
                _DEBUG ? resp.end( tree.toCSS() ) : mini.css(tree.toCSS(),resp) ; 
            } 
        }); 
	},
    jade: function(req,resp,rs,pathname,_DEBUG){
        resp.writeHead(200,{"middleware-type":'html',"Content-Type": mime.get('html')});
        var output = require('jade').render(rs); 
        _DEBUG ? resp.end( output ) : mini.htm(output,resp) ;
    }
}; 

exports.get = function(extType){
	var fn = middleware[extType];
    return !fn ? !1 : function(req,resp,rs,pathname,_DEBUG){
        try{
            fn.apply(middleware,arguments);
        }catch(e){ 
            resp.writeHead(500, {"Content-Type": "text/html"}); 
            resp.end( JSON.stringify(e) ); 
        }
    }
};

exports.mini = mini;

