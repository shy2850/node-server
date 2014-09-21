var fs = require("fs"),
	querystring = require("querystring");

var mini = { 
    _cssmin_: require("cssmin"), 
    js  : function(str,resp){ 
        var resu = require("uglify-js").minify(str,{fromString: true}); 
        resp.end( resu.code ); 
    }, 
    css : function(str,resp){ resp.end( mini._cssmin_(str)) }, 
    htm : function(str,resp){ resp.end( (str).replace(/\s+/g," ") ) }, 
    __  : function(str,resp){ resp.end( str ) }, 
    get : function(extType){ 
        return mini[extType] || mini.__; 
    } 
};

var middleware = {
	coffee: function(req,resp,rs,pathname,_DEBUG){
		try{ 
            var scriptStr = require("coffee-script").compile( rs ); 
            resp.writeHead(200,{"middleware-type":'js'});   //用以build输出时转换后缀名
            _DEBUG ? resp.end( scriptStr ) : mini.js(scriptStr,resp) ; 

        }catch(e){ 
            resp.writeHead(500, {"Content-Type": "text/html"}); 
            console.log(e); 
            resp.end( e + "" ); 
        } 
	},
	less: function(req,resp,rs,pathname,_DEBUG){
		try{ 
            new(require("../module/less").Parser)({ 
                paths:[ pathname.replace(/(\/[^\/]+?)$/,"") ] 
            }).parse(rs, function (err, tree) { 
                if (err) { return console.error(err) } 
                else{ 
                    resp.writeHead(200,{"middleware-type":'css'});
                    _DEBUG ? resp.end( tree.toCSS() ) : mini.css(tree.toCSS(),resp) ; 
                } 
            }); 
        }catch(e){ 
            resp.writeHead(500, {"Content-Type": "text/html"}); 
            resp.end( e + "" ); 
        } 
	}
}; 

exports.get = function(extType){
	return middleware[extType]
};

exports.mini = mini;

