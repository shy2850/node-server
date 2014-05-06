var http = require('http'),
	url = require('url'),
	mime = require('../module/mime'),
	fs = require('fs');
exports.execute = function(req,resp,root,mini){
	var output = "", type, _url = url.parse( req.url );
	urls = decodeURI( _url.query ).split(/[,\?]+/);
	urls.pop();

	for (var i = 0; i < urls.length; i++) {
		if( urls[i] ){
			
			var devide = urls[i].split("."), module;
			type = devide.pop();
			module = devide.join(".");
			

			try{
				var content = fs.readFileSync( root + _url.pathname + urls[i] ).toString();
				content = content.replace( "KISSY.add(function", "KISSY.add('" + _url.pathname.replace("/js/","") + module + "',function" );
				output += content;
			}catch(e){
				console.log(e);
				console.log( root + _url.pathname + urls[i] + " is not exist" );
			}
		}
	};
	//fs.readFileSync( root + "/" + h[2],'utf-8');

	resp.writeHead(200, {"Content-Type": mime.get(type)});
    req.data.debug ? resp.end( output ) : mini.get(type)( output, resp );
}
