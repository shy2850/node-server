var fs = require("fs"),
	querystring = require("querystring");
exports.execute = function(req,resp,root,str,mini,debug,conf){
	var belong = "$[placeholder]";
	var h = /\$belong\[(\S+)\]/.exec(str);
	try{
		if(h){
			belong = fs.readFileSync( root + "/" + h[1],'utf-8');	//读取belong文本
			str = str.replace(h[0], "" );  			//替换关键字
			str = belong.replace("$[placeholder]",str);
		}  

		str = str.replace(/\$include\[(\S+)\]/g,function(match,key){
			return fs.readFileSync( root + "/" + key,'utf-8');	 //读取include文本
		});

		var result = str;
	
		if(conf.runJs){
			var x = "", strs = str.split(/<%|%>/);
			for (var i = 0; i < strs.length; i++) {		//偶数为HTML片段，奇数为js代码片段，分别处理转义符和换行
				x += (i%2 === 0) ? strs[i].replace(/(\/\/.*?)/g,'').replace(/\\/g,"\\\\").replace(/[']/g,"\\'") : "<%"+strs[i].replace(/[\n\r]/g," ").replace(/echo/g,'_output_+=')+"%>";
			};
			str = x.replace(/<%=/g,"'; _output_ += ").replace(/<%/g,"';").replace(/%>/g,"; _output_+='").replace(/[\n\r]+/g,"\\n");
			//以上语句通过替换关键标识符，获得js执行片段。
			
			//拼装function并且执行，以获取结果。如果结果不是function，当作string输出，否则，执行function，参见demo中的login.htm。
			try{
				result = new Function("request","response","require", "var _o_ = null, _output_='" + str + "'; return _o_ || _output_;")(req,resp,require);
			}catch(ex){
				console.log( req.$.title + '模板执行异常！' );
			}
		}

		switch(typeof result){
			case "function": result(); return;
			case "string":  
			default : debug ? resp.end( result ) : mini(result,resp);
		}
	}catch(e){
		resp.writeHead(500, {"Content-Type": "text/html"});
		resp.end( e.stack.toString().replace(/\n/g,"<br>") );
	}

		
	
};

