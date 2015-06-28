"use strict";
var path = require('path'),
    mime = require('mime'),
    fs = require('fs');
var favicon = path.join( __dirname , "/../../static/img/favicon.ico" );
exports.execute = function(req, resp){
    console.log( "call for favicon.ico" );
    if( req.headers["if-modified-since"] ){
        resp.writeHead(304, "Not Modified");
        resp.end();
        return;
    }
    fs.readFile(favicon, function (err, data){
        if(err){
            resp.writeHead(404, {"Content-Type": mime.get("html")});
            resp.end("no favicon.ico");
        }else{
            var expires = new Date();
            expires.setHours( expires.getHours() + 2 );
            resp.writeHead(200, {
                "Content-Type": mime.get("ico"),
                "Content-Length": data.length,
                "Cache-Control": "max-age=7200",
                "Last-Modified": new Date( "2015/06/28" ).toGMTString(),
                "Expires": expires.toGMTString()
            });
            resp.end(data);
        }

    });
};
