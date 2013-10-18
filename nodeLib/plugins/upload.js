var http = require('http'),
    util = require('util'),
    mime = require('mime'),
    fs = require('fs'),
    uploadBase = __dirname + "/../html/upload.html",
    uploadModel = __dirname + "/../html/uploadOK.html",
    formidable = require('formidable');
exports.execute = function(req,resp,root,handle,f){
	var form = new formidable.IncomingForm(),
        files = [],
        fields = [];
    if(req.method === "GET"){
        fs.readFile(uploadBase,function (err,data){
            resp.writeHead(200, {'content-type': mime.get("html")});
            handle.execute(req,resp,root,data.toString(),f,true);
        });
    }
    try{
        form.uploadDir = req.data.uploadUrl ? ( root + "/" + req.data.uploadUrl + "/" ) : ( __dirname + "/../../_upload/" ); //上传路径

        form.on('field', function(field, value) {
            fields.push({name: field, value: value});
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

                var $ = req.$;
                $.info = JSON.stringify({
                    fields:fields,
                    files: files,
                    code: 200
                });

                fs.readFile(uploadModel,function (err,data){
                    if(err){
                        console.log(err);
                    }
                    resp.writeHead(200, {'content-type': mime.get("html")});
                    req.forward = true;
                    handle.execute(req,resp,root,data.toString(),f,true);
                });

            });
        form.parse(req);
    }catch(e){
        resp.writeHead(500, {"Content-Type": "text/html"});
        resp.end( e.toString().replace(/\n/g,"<br>") );
    }

}