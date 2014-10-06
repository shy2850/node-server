var http = require('http'),
	url = require('url'),
	fs = require('fs');
exports.execute = function(req,resp,root,handle,f,conf){
	var query = decodeURI( url.parse( req.url ).query);
		_url = /.*(http[s]?[:])/.test(query)? query.replace(/.*(http[s]?[:])/,"$1"): null;
	if(_url){
		http.get(_url, function(res) {
			res.setEncoding('utf-8');
			res.pipe(resp);
		}).on('error', function(e) {
	        resp.writeHead(500, {"Content-Type": "text/html"});
		  	resp.end( e.stack.toString().replace(/\n/g,"<br>") );
		});
	}else{
		fs.readFile(root+query.split('?')[0],function (err,data){
	        if(err)console.log(err);
	        new handle.execute(req,resp,root,data.toString(),f,true,conf);
	    });
	}
		
}