"use strict";
exports.execute = function(req, resp, conf){
    if( conf.filter && typeof conf.filter.get === "function" ){
        conf.filter.get(req,resp);
    }
};
