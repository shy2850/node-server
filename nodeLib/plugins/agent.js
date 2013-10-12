var http = require('http'),
	url = require('url');
exports.execute = function(req,resp,root){
	var query = decodeURI( url.parse( req.url ).query).replace(/.*(http[s]?[:])/,"$1"), info="";
	http.get(query, function(res) {
		res.setEncoding('utf-8');
		res.on('data',function(data){
           info += data;
		});
        res.on('end',function(data){
            resp.writeHead(200, {"Content-Type": res.headers["content-type"]});
            resp.end(info);
        });

	}).on('error', function(e) {
        resp.writeHead(500, {"Content-Type": "text/html"});
	  	resp.end( e.stack.toString().replace(/\n/g,"<br>") );
	});
}