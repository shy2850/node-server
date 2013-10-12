var favicon = __dirname + "/../../static/img/favicon.ico",
    mime = require('mime'),
    fs = require('fs');
exports.execute = function(req,resp,root,handle,f){
    console.log( "call for favicon.ico" );
    fs.readFile(favicon,function (err,data){
        if(err){
            resp.writeHead(404, {"Content-Type": mime.get("html")});
            resp.end("no favicon.ico");
        }else{
            var expires = new Date();
            expires.setFullYear( expires.getFullYear() + 1 );
            resp.writeHead(200, {
                "Content-Type": mime.get("ico"),
                "Cache-Control": "max-age=",
                "Expires": expires
            });
            resp.end(data);
        }

    });
};