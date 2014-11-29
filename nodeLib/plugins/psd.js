"use strict";
var url = require('url'),
    mime = require('mime'),
    fs = require('fs');

function saveAllLayers( psd, path, resp){
    try{
        fs.mkdir( path.replace(/([^\\\/]*?)\.png$/i,'$1') ,function(){
            psd.layers.forEach(function(t, i){
                t.image.saveAsPng( path.replace(/([^\\\/]*?)\.png$/i,'$1/' + i + '.' + t.legacyName.replace(/\W+/g,'_') + '.png') );
            });
        });
        var str = JSON.stringify( psd.tree().export(), undefined, 2 ); //JSON.stringify(psd.layers, undefined, 4);
        fs.writeFile( path.replace(/([^\\\/]*?)\.png$/i,'$1/layers.json'), str);
    }catch(e){
        resp.writeHead(500, {"Content-Type": "text/html"});
        resp.end( e.stack.toString().replace(/\n/g,"<br>") );
    }
}

function getPng(path, pngPath, resp){
    var psd;
    fs.readFile(pngPath, function(err, data){
        if(err){
            require('psd').open(path).then(function(p){
                psd = p;
                return p.image.saveAsPng( pngPath );
            }).then(function(){
                setTimeout(function(){
                    saveAllLayers( psd, pngPath, resp);
                },0);
                getPng(path, pngPath, resp);
            });
        }else{
            resp.writeHead(200, {
                "Content-Type": mime.get('png')
            });
            resp.end(data);
        }
    });
}

exports.execute = function(req, resp, root){
    var path = root + decodeURI( url.parse( req.url ).query),
        pngPath = path.replace(/([^\\\/]*?)\.psd$/i,'$1.png');

    getPng(path, pngPath, resp);
};
