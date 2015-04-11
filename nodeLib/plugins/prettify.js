"use strict";
var http = require('http'),
    url = require('url'),
    formidable = require('formidable'),
    fs = require('fs');
var highlight,
    $style = 'default',     //可选项:ascetic,brown_paper,dark,default,far,github,idea,ir_black,magula,school_book,sunburst,vs,zenburn
    style;
    try{
        highlight = require('highlight').Highlight;
        style = fs.readFileSync( "node_modules/highlight/lib/vendor/highlight.js/styles/" + $style + ".css",'utf-8');
    }catch(e){
        highlight = function(){ return '<h1>hightlight is required! </h1>'; };
        style = 'h1{text-align:center}';
    }
exports.execute = function(req, resp){
    if( req.method === 'POST' ){
        var form = new formidable.IncomingForm(), fields = {};
        form.on('field', function(field, value) {
            fields[field] = value;
        }).on('end',function(){
            resp.writeHead(200, {"Content-Type": "application/json"});
            resp.end( JSON.stringify({
                code: fields.code,
                output: highlight(fields.code),
                style: style
            }) );
        });
        return form.parse(req);
    }

    var query = decodeURI( url.parse( req.url ).query), data = '',
        $url = /.*(http[s]?[:])/.test(query) ? query.replace(/.*(http[s]?[:])/,"$1") : 'http://' + req.headers.host + query;
    http.get($url, function(res) {
        resp.writeHead(res.statusCode, {"Content-Type": "text/html"});
        res.setEncoding('utf-8');
        res.on('data',function(d){
            data += d;
        }).on('end',function(){
            resp.end( '<!DOCTYPE html><html><head><meta charset="UTF-8" /><title>' + $url.split('/').pop() + '</title><style>' + style + '</style></head><body><pre>' + highlight(data) + '</pre></body></html>');
        });
    }).on('error', function(e) {
        resp.writeHead(500, {"Content-Type": "text/html"});
          resp.end( e.stack.toString().replace(/\n/g,"<br>") );
    });
};
exports.parse = function(code){
    return {
        code: code,
        output: highlight(code),
        style: style
    };
};
