"use strict";
var mime = require('mime'),
    fs = require('fs'),
    path = require('path'),
    formidable = require('formidable'),
    mini = require("./../common/middleware").mini;
var uploadBase = fs.readFileSync( path.join( __dirname, "/../html/upload.html" ),'utf-8'),
    uploadModel = path.join( __dirname, "/../html/uploadOK.html");
exports.execute = function(req, resp, root, handle, conf, modelPath){
	var form = new formidable.IncomingForm(),
        files = [],
        fields = {};
    if(req.type === 'GET' || req.data.iframe){
        resp.writeHead(200, {'content-type': mime.get("html")});
        resp.end(uploadBase);
    }
    try{
        form.uploadDir = req.data.uploadUrl ? ( root + "/" + req.data.uploadUrl + "/" ) : path.join( __dirname, "/../../static/" ); //上传路径
        uploadModel = req.data.target ? (root + "/" + req.data.target) : (modelPath || uploadModel);
        form.on('field', function(field, value) {
            fields[field] = value;
        })
            .on('file', function(field, file) {
                if( file.size ){
                    files.push({name: field, file: file});
                }
            })
            .on('end', function() {
                files.map(function(file){
                    fs.rename(file.file.path, form.uploadDir + file.file.name, function (err) {
                        if(err){ throw err; }
                    });
                });
                req.post = fields;
                req.files = files;
                var extType = path.extname(uploadModel).substring(1);
                fs.readFile(uploadModel, function(err, data){
                    if(err){
                        throw err;
                    }
                    resp.writeHead(200, {'content-type': mime.get(extType)});
                    req.forward = true;
                    handle.execute.call(req,req,resp,root,data.toString(),mini.get(extType),true,conf);
                });
            });
        form.parse(req);
    }catch(e){
        resp.writeHead(500, {"Content-Type": "text/html"});
        resp.end( e.toString().replace(/\n/g,"<br>") );
    }
};
