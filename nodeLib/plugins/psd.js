var url = require('url'),
    fs = require('fs'),
    psdModel = __dirname + "/../html/psd.html";
exports.execute = function(req,resp,root,handle,f,conf){
    var $ = req.$;
    $.title = decodeURI( url.parse( req.url ).query).replace(/.*(http[s]?[:])/,"$1");
    fs.readFile(psdModel,function (err,data){
        if(err)console.log(err);
        handle.execute(req,resp,root,data.toString(),f,true,conf);
    });
}