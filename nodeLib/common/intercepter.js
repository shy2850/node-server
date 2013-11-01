var base = __dirname + "/../plugins/",
	MODULE = {
		"/js/gallery/":"combine",
		"/js/build/":"combine",
		"/js/xh/":"combine",
	};

exports.has = function(moduleName){
	var t = MODULE[moduleName];
	return  t ? require(base+t) : false;
};
