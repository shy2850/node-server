"use strict";
var http = require('http'),
    url = require('url');
exports.execute = function(req, resp){
    var query = decodeURI( url.parse( req.url ).query),
        $url = /.*(http[s]?[:])/.test(query) ? query.replace(/.*(http[s]?[:])/,"$1") : 'http://' + req.headers.host + query;
    http.get( encodeURI( $url ), function(res) {
        resp.writeHead(res.statusCode, res.headers);
        res.setEncoding('utf-8');
        res.pipe(resp);
    }).on('error', function(e) {
        resp.writeHead(500, {"Content-Type": "text/html"});
        resp.end( e.stack.toString().replace(/\n/g,"<br>") );
    });
};
