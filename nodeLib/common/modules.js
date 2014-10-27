"use strict";
var base = "./../plugins/";

exports.get = function(moduleName){
	try{
		return require(base + moduleName);
	}catch(e){
		return null;
	}
};
