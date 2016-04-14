"use strict";
var base = "./../plugins/";

exports.get = function(moduleName){
	try{
		return require(base + moduleName);
	}catch(e){
		console.log(e);
		return null;
	}
};
