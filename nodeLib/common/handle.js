var fs = require("fs"),
	querystring = require("querystring");
exports.execute = function(req,resp,root,str,mini,debug){
	var belong = "$[placeholder]";
	var h = /(\$belong\[(\S+)\])/.exec(str);
	if(h){
		try{
			belong = fs.readFileSync( root + "/" + h[2],'utf-8');	//读取belong文本
		}catch(e){
			resp.end(e.stack.toString().replace(/\n/g,"<br>") );
		}
		str = str.replace(h[1], "" );  			//替换关键字
		str = belong.replace("$[placeholder]",str);
	}  

	while( ( temp = /(\$include\[(\S+)\])/.exec(str) ) != null){
		var vm = "";
		try{
			vm = fs.readFileSync( root + "/" + temp[2],'utf-8');	//读取include文本
		}catch(e){
			resp.end(e.stack.toString().replace(/\n/g,"<br>") );
		}
		str = str.replace( temp[1] , vm );  			//替换关键字
	}

	var result = str, postData = "", run = function(t,f){f.call(this)};

	req.addListener("data",function(d){
		postData += d;
	});

	( (req.method==="GET" || req.forward) ? run : req.addListener )("end",function(d){
		req.post = querystring.parse(postData);

		try{
			if(exports.conf.runJs){
				var x = "", strs = str.split(/<%|%>/);
				for (var i = 0; i < strs.length; i++) {		//偶数为HTML片段，奇数为js代码片段，分别处理转义符和换行
					x += (i%2 === 0) ? strs[i].replace(/\\/g,"\\\\").replace(/[']/g,"\\'") : "<%"+strs[i].replace(/[\n\r]/g," ").replace(/echo/g,'_output_+=')+"%>";
				};
				str = x.replace(/<%=/g,"'; _output_ += ").replace(/<%/g,"';").replace(/%>/g,"; _output_+='").replace(/[\n\r]/g,"\\n");
				//以上语句通过替换关键标识符，获得js执行片段。
				
				//拼装function并且执行，以获取结果。如果结果不是function，当作string输出，否则，执行function，参见demo中的login.htm。
				result = new Function("request","response", "var _o_ = null, _output_='" + str + "'; return _o_ || _output_;")(req,resp);
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
	});

		
	
};

