"use strict";
var fs = require("fs"),
    mime = require("mime");

exports.execute = function(req, resp, conf){
    if( conf.filter && typeof conf.filter.get === "function" ){
        conf.filter.get(req,resp);
    }
};

exports.check = function(pathname, mtime, req, resp){
    var times = 0, t = Number(mtime);
    function check(){
        fs.stat(pathname, function(error, stats){
            if(error){
                resp.writeHead(500, {"Content-Type": mime.get(".json")});
                resp.end(JSON.stringify(error));
            }else if(!t || t !== +stats.mtime || times >= 60){
                resp.writeHead(200, {"Content-Type": mime.get(".json")});
                resp.end(JSON.stringify({
                    modify: !!t && t !== +stats.mtime,
                    mtime: +stats.mtime
                }));
            }else{
                times++;
                setTimeout(check,1000);
            }
        });
    }
    check();
};
