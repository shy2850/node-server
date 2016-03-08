"use strict";
var url = require('url'),
    mime = require('mime'),
    fs = require('fs'),
    mini = require("./../filter/middleware").mini;

var psdTemplate = fs.readFileSync( require('path').join( __dirname, "/../html/psd.html" ), 'utf-8');

function saveAllLayers( psd, path, resp){
    try{
        fs.mkdir( path.replace(/([^\\\/]*?)\.png$/i,'$1') ,function(){
            var doc = psd.tree().export().document;
            var all = {
                width: doc.width,
                height: doc.height,
                layers: []
            };
            psd.layers.forEach(function(t, i){
                if (t.width && t.height) {
                    var name = i + '.' + t.legacyName.replace(/\W+/g,'_');
                    t.image.saveAsPng( path.replace(/([^\\\/]*?)\.png$/i,'$1/' + name + '.png') );
                    all.layers.push(function (t, name) {
                        var prop = {name: name};
                        for (var k in t) {
                            switch (typeof t[k]) {
                                case 'number':
                                case 'string':
                                case 'boolean':
                                    prop[k] = t[k];
                            }
                        }
                        return prop;
                    }(t, name));
                }
            });

            var str = JSON.stringify(all, undefined, 2);
            fs.writeFile( path.replace(/([^\\\/]*?)\.png$/i,'$1/layers.json'), str);
        });
        // var str = JSON.stringify( psd.tree().export(), undefined, 2 );
    }catch(e){
        resp.writeHead(500, {"Content-Type": "text/html"});
        resp.end( e.stack.toString().replace(/\n/g,"<br>") );
    }
}

function getPng(path, pngPath, resp, cbk){
    var psd;
    fs.readFile(pngPath, function(err, data){
        if(err){
            require('psd').open(path).then(function(p){
                psd = p;
                return p.image.saveAsPng( pngPath );
            }).then(function(){
                setTimeout(function(){
                    saveAllLayers( psd, pngPath, resp, cbk);
                },0);
                getPng(path, pngPath, resp, cbk);
            });
        }else{
            cbk();
        }
    });
}

exports.execute = function(req, resp, root, handle, config){
    var query = decodeURI( url.parse( req.url ).query).replace(/\.\w+$/, '') + '.psd',
        path = root + query,
        pngPath = path.replace(/([^\\\/]*?)\.psd$/i,'$1.png');
    fs.exists(path, function (exists) {
        if (exists) {
            getPng(path, pngPath, resp, function () {
                req.$.title = query;
                resp.writeHead(200, {'content-type': 'text/html'});
                handle.execute(req, resp, root, psdTemplate, mini, true, config);
            });
        }
        else {
            resp.writeHead(404, {"Content-Type": "text/html"});
            resp.end("psd 资源不存在");
        }
    });
};
