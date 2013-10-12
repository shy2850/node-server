var url = require('url'),
    fs = require('fs'),
    prettifyModel = __dirname + "/../html/prettify.html";
exports.execute = function(req,resp,root,handle,f){
	var $ = req.$;
	$.title = decodeURI( url.parse( req.url ).query).replace(/.*(http[s]?[:])/,"$1");
	fs.readFile(prettifyModel,function (err,data){ 
		if(err)console.log(err);
	    handle.execute(req,resp,root,data.toString(),f,true);
	});
}