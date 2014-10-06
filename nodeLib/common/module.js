var base = __dirname + "/../plugins/";

exports.get = function(moduleName){
	try{
		return require(base+moduleName);
	}catch(e){
		return null;
	}
};