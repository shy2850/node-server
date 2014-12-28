"use strict";
var mime = require("mime"),    //MIME类型
    http = require("http"),
    fs = require("fs");

http.createServer(function(req, resp){
	var root = "",
		pathname = decodeURI(req.url).substring(1);
	fs.stat(root + pathname, function(error, stats){
		if(!error && stats && stats.isFile && stats.isFile() ){
			resp.writeHead(200, {
                "Content-Type": mime.lookup(pathname) || 'text/html'
            });
            fs.createReadStream(pathname).pipe(resp);
		}else{
			resp.writeHead(404, {
                "Content-Type": 'text/html'
            });
            resp.end("404");
		}
	});
}).listen(8888);
// http://localhost:8888/index.js
