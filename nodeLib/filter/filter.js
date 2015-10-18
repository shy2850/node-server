"use strict";
exports.execute = function(req, resp, conf){
    if( conf.filter && typeof conf.filter.get === "function" ){
        return conf.filter.get(req,resp);
    }
};
