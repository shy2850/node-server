var url = require('url'),
    fs = require('fs'),
    prettifyModel = __dirname + "/../html/prettify.html";
exports.execute = function(req,resp,root,handle,f,conf){
	var $ = req.$, 
		_url = url.parse( req.url ),
		query = decodeURI( _url.query);

	query.replace(/.*(http[:])?/,"$1");
	$.title = query;
	fs.readFile(prettifyModel,function (err,data){
		if(err)console.log(err);
	    handle.execute(req,resp,root,data.toString(),f,true,conf);
	});
}