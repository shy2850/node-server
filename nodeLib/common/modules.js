"use strict";
var base = "./../plugins/";

exports.get = function(moduleName){
	try{
		return require(base + moduleName);
	}catch(e){
		console.log(e);	// 服务端的404提示
		return null;
	}
};
