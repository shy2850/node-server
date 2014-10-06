var url = require('url'),
    mime = require('../module/mime'),
    fs = require('fs'),
    PSD = require('psd');
exports.execute = function(req,resp,root,handle,f,conf){
    var path = root+decodeURI( url.parse( req.url ).query),
    	pngPath = path.replace(/^(.*?)\.psd$/i,'$1'+'.png');
    PSD.open(path).then(function(psd){
        return psd.image.saveAsPng( pngPath );
    }).then(function(){
    	fs.readFile(pngPath ,function (err,data){ 
    		if(err){
    			console.log( err );
    		}

	    	resp.writeHead(200, { 
	            "Content-Type": mime.get('png')
	        }); 

	        resp.end(data);
    	});
    	
    });
}