"use strict";
var middleware = require("../filter/middleware");
var types = middleware.middTypes;
var middlewareRename = Object.keys(types).map(function(key){
    return {
        reg: new RegExp("\\.(" + key + ")$"),
        release: "." + types[key]
    }
});

var renameReg = /\$rename\[([^\]]+)\]/g;

exports.execute = function(req, resp, root, str, mini, debug, conf){
    var build = req.data._build_;
    var renameMap = conf.renameMap || [];

    if(build){
        if(conf.middleware){
            renameMap = renameMap.concat(middlewareRename);
        }
        return str.replace(renameReg, function(all, path){
            var temp = path + "";
            renameMap.forEach(function(r){
                temp = temp.replace(r.reg, r.release);
            });
            return temp;
        });

    }else{
        return str.replace(renameReg, '$1');
    }
};