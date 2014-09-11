var url  = require("url"),
	fs 	= require("fs"),
	mime = require("../module/mime");

exports.execute = function(req,resp,root,mini,conf){

	var p = url.parse( req.url ), result = "", extType = "js";
	var _root = root + p.pathname + ( p.pathname.match(/^.*?\/$/) ? '' : '/' ); 
	
	p.search.replace(/^\?*(.*?)$/,'$1').replace(/[^\,]+/g,function(match){
		var filePath = _root + match.split('?')[0];
		extType = filePath.split('.').pop();
		result += fs.readFileSync( filePath,'utf-8');
	});

	resp.writeHead(200, { 
        "Content-Type": mime.get(extType) 
    }); 
	conf.debug ? resp.end( result ) : mini.get(extType)(result,resp) ;
};
