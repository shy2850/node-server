var http = require('http'),
    util = require('util'),
    mime = require('../module/mime'),
    fs = require('fs'),
    uploadBase = fs.readFileSync( __dirname + "/../html/upload.html",'utf-8'),
    uploadModel = __dirname + "/../html/uploadOK.html",
    formidable = require('formidable');
exports.execute = function(req,resp,root,handle,f,conf){
	var form = new formidable.IncomingForm(),
        files = [],
        fields = {};
    if(req.type=='GET' || req.data.iframe){
        resp.writeHead(200, {'content-type': mime.get("html")});
        resp.end(uploadBase);
    }
    try{
        form.uploadDir = req.data.uploadUrl ? ( root + "/" + req.data.uploadUrl + "/" ) : ( __dirname + "/../../static/" ); //上传路径
        uploadModel = req.data.target ? (root + "/" + req.data.target) : uploadModel;

        form.on('field', function(field, value) {
            fields[field] = value;
        })
            .on('file', function(field, file) {
                files.push({name: field, file:file});
            })
            .on('end', function() {
                for (var i = 0; i < files.length; i++) {
                    var f = files[i].file;
                    fs.rename(f.path, form.uploadDir+f.name, function (err) {
                        if (err) throw err;
                    });
                };

                req.post = fields;
                req.files = files;

                fs.readFile(uploadModel,function (err,data){
                    if(err){
                        console.log(err);
                    }
                    resp.writeHead(200, {'content-type': mime.get("html")});
                    req.forward = true;
                    handle.execute(req,resp,root,data.toString(),f,true,conf);
                });

            });
        form.parse(req);
    }catch(e){
        resp.writeHead(500, {"Content-Type": "text/html"});
        resp.end( e.toString().replace(/\n/g,"<br>") );
    }

}
