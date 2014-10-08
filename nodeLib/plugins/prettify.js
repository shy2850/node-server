var http = require('http'),
	url = require('url'),
    fs = require('fs'),
    highlight, 
    error;

var _style = 'default',	 //可选项:ascetic,brown_paper,dark,default,far,github,idea,ir_black,magula,school_book,sunburst,vs,zenburn
	style;

	try{
		highlight = require('highlight').Highlight;
		style = fs.readFileSync( "node_modules/highlight/lib/vendor/highlight.js/styles/"+_style+".css",'utf-8');
	}catch(e){
		error = e;
		highlight = function(){return '<h1>hightlight is required! </h1>'};
		style = 'h1{text-align:center}';
	}

exports.execute = function(req,resp,root,handle,f,conf){
	
	var query = decodeURI( url.parse( req.url ).query), data = '',
		_url = /.*(http[s]?[:])/.test(query)? query.replace(/.*(http[s]?[:])/,"$1") : 'http://'+req.headers.host+query;

	http.get(_url, function(res) {
		resp.writeHead(res.statusCode, {"Content-Type": "text/html"});
		res.setEncoding('utf-8');
		res.on('data',function(d){
			data += d
		}).on('end',function(){
			resp.end( '<!DOCTYPE html><html><head><meta charset="UTF-8" /><title>'+_url.split('/').pop()+'</title><style>'+style+'</style></head><body><pre>'+highlight(data)+'</pre></body></html>');
		});
	}).on('error', function(e) {
        resp.writeHead(500, {"Content-Type": "text/html"});
	  	resp.end( e.stack.toString().replace(/\n/g,"<br>") );
	});
		
}