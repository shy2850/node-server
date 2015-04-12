"use strict";
var fs = require("fs"),
    path = require("path"),
    exec = require('child_process').exec;
exports.execute = function(req, resp){

    var o = req.data,
        w = o.w || 300,
        h = o.h || 200,
        bgColor = o.bg || "666666",
        fontColor = o.fc || "999999";

    exec( 'java f2e/Draw ' + [w,h,bgColor,fontColor].join(" "), function(err){
        if( !err ){
            var rs = fs.createReadStream( path.join(__dirname,"../../f2e/temp.jpg") );
            rs.pipe(resp);
        }else{
            resp.writeHead(500, {"Content-Type": "text/html"});
            resp.end( err.stack.toString().replace(/\n/g,"<br>") );
        }
    });

};
