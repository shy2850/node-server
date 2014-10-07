var http = require('http'),
	url = require('url'),
	fs = require('fs');
exports.execute = function(req,resp,root,handle,f,conf){
	var query = decodeURI( url.parse( req.url ).query),
		_url = /.*(http[s]?[:])/.test(query)? query.replace(/.*(http[s]?[:])/,"$1") : 'http://'+req.headers.host+query;
	
	http.get(_url, function(res) {
		resp.writeHead(res.statusCode, res.headers);
		res.setEncoding('utf-8');
		res.pipe(resp);
	}).on('error', function(e) {
        resp.writeHead(500, {"Content-Type": "text/html"});
	  	resp.end( e.stack.toString().replace(/\n/g,"<br>") );
	});
		
}