"use strict";
var fs = require("fs"),
	path = require("path"),
	_ = require("underscore");
exports.execute = function(req, resp, root, str, mini, debug, conf){
	var belong = conf.placeholder,
		include = new RegExp(conf.include),
		pathname = path.join(root, req.$.title).replace(/[^\\\/]+$/,"");
	var h = new RegExp(conf.belong).exec(str),
		inc;

	try{
		if(h){
			belong = fs.readFileSync( /^[\/\\]/.test(h[1]) ? path.join(root,h[1]) : path.join(pathname,h[1]), 'utf-8' );	//读取belong文本
			str = str.replace(h[0], "" );  			//替换关键字
			str = belong.replace("$[placeholder]",str);
		}
		while( ( inc = str.match(include) ) ){
			str = str.replace( inc[0], fs.readFileSync( /^[\/\\]/.test(inc[1]) ? path.join(root,inc[1]) : path.join(pathname,inc[1]),'utf-8') );
		}

		var result = str;
		if(conf.runJs){		//完全使用underscore内置template引擎
			var compiled = _.template(str);
			result = compiled({request: req, response: resp, require: require});
		}
		switch(typeof result){
			case "function": result(); return;
			case "string":
			default :
				if( debug ) {
					resp.end( result );
				}else{
					mini(result,resp);
				}
		}
	}catch(e){
		resp.writeHead(500, {"Content-Type": "text/html"});
		resp.end( e.stack.toString().replace(/\n/g,"<br>") );
	}
};
