"use strict";
var fs = require('fs');
var path = require('path');
var middleware = require("../filter/middleware");
var types = middleware.middTypes;
var middlewareRename = Object.keys(types).map(function(key){
    return {
        withBuild: true,
        reg: new RegExp("\\.(" + key + ")$"),
        release: "." + types[key]
    }
});
var crypto = require('crypto');
var md5ReplaceReg = /(\w+)(\.\w+)$/;
function md5 (text) {
  return crypto.createHash('md5').update(text).digest('hex');
}

var renameReg = /\$rename\[([^\]]+)\]/g;

// 修改 $rename[sourceUrl] 内容
exports.execute = function(req, resp, root, str, mini, debug, conf){
    var build = req.data._build_;
    var renameMap = conf.renameMap || [];
    var reg = conf.renameReg || renameReg;

    if(build){
        if(conf.middleware){
            renameMap = renameMap.concat(middlewareRename);
        }
        return str.replace(reg, function(all, p){
            var temp = p + "";
            renameMap.forEach(function(r){
                if(r.withBuild === 'md5'){
                    if(temp.match(r.reg)){
                        var fileName = path.join(root, temp.match(/^\//) ? temp : path.join(req.$.title.replace(/[^\/\\]+$/, ''), temp));
                        var fileStr = fs.readFileSync(fileName).toString();
                        temp = temp.replace(md5ReplaceReg, '$1_' + md5(fileStr).substring(0,7) + '$2');
                    }
                }else{
                    temp = temp.replace(r.reg, r.release);
                }
            });
            return temp;
        });

    }else{
        return str.replace(renameReg, '$1');
    }
};

exports.buildRename = function (pathname, sourceUrl, conf) {
    var renameMap = conf.renameMap || [];
    var renamePath = pathname;
    if(conf.middleware){
        renameMap = renameMap.concat(middlewareRename);
    }
    renameMap.filter(function (r) {
        return r.withBuild;
    }).forEach(function (r) {
        if(r.withBuild === 'md5' && renamePath.match(r.reg)){
            var fileStr = fs.readFileSync(sourceUrl).toString();
            renamePath = renamePath.replace(md5ReplaceReg, '$1_' + md5(fileStr).substring(0,7) + '$2');
        }else{
            renamePath = renamePath.replace(r.reg, r.release);
            if(pathname !== renamePath) {
                // console.log(pathname + "\n" + renamePath);
            }
        }
    });
    return renamePath;
};
