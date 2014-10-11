"use strict";
var fs = require('fs'),
    http = require('http'),
    url = require('url'),
    path = require('path'),
    upload = require('./upload');

var configPath = path.join( __dirname, "/../html/config.html" );

exports.execute = function(req,resp,root,handle,conf){

    if( req.method === "POST" ){ 
        console.log( 'config' );
        upload.execute(req,resp,root,handle,conf,configPath);
    }else{
        resp.writeHead(200, {'content-type': 'text/html'});
        handle.execute(req,resp,root, fs.readFileSync( configPath, 'utf-8'), null, true, conf);
    }

};