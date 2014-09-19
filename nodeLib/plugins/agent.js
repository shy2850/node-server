var http = require('http'),
	url = require('url');
exports.execute = function(req,resp,root){
	var query = decodeURI( url.parse( req.url ).query).replace(/.*(http[s]?[:])/,"$1"), info="";
	http.get(query, function(res) {
		res.setEncoding('utf-8');
		res.pipe(resp);
	}).on('error', function(e) {
        resp.writeHead(500, {"Content-Type": "text/html"});
	  	resp.end( e.stack.toString().replace(/\n/g,"<br>") );
	});
}