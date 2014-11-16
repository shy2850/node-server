"use strict";
var fs = require("fs"),
	_ = require("underscore");
exports.execute = function(req, resp, root, str, mini, debug, conf){
	var belong = "$[placeholder]";
	var h = /\$belong\[(\S+)\]/.exec(str);
	try{
		if(h){
			belong = fs.readFileSync( root + "/" + h[1],'utf-8');	//读取belong文本
			str = str.replace(h[0], "" );  			//替换关键字
			str = belong.replace("$[placeholder]",str);
		}
		str = str.replace(/\$include\[(\S+)\]/g, function(match, key){
			return fs.readFileSync( root + "/" + key,'utf-8');	 //读取include文本
		});
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
