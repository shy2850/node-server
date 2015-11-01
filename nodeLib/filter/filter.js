"use strict";
exports.execute = function(req, resp, conf){
    // buildFilter 加入请求头信息
    if (typeof conf.buildFilter === "function" && !conf.buildFilter(req.url)) {
        req.url += (req.url.match(/\?/) ? "&" : "?") + "handle=false";
    }
    if( conf.filter && typeof conf.filter.get === "function" ){
        var result = conf.filter.get(req,resp);
        return result;
    }
};
