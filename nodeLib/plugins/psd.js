"use strict";
var url = require('url'),
    mime = require('mime'),
    fs = require('fs');
exports.execute = function(req, resp, root){
    var path = root + decodeURI( url.parse( req.url ).query),
        pngPath = path.replace(/^(.*?)\.psd$/i,'$1' + '.png');
    try{
        require('psd').open(path).then(function(psd){
            return psd.image.saveAsPng( pngPath );
        }).then(function(){
            fs.readFile(pngPath, function(err, data){
                if(err){
                    console.log( err );
                }
                resp.writeHead(200, {
                    "Content-Type": mime.get('png')
                });
                resp.end(data);
            });
        });
    }catch(e){
        resp.writeHead(500, {"Content-Type": "text/html"});
        resp.end( e.stack.toString().replace(/\n/g,"<br>") );
    }
};
