var base = __dirname + "/../plugins/",
	MODULE = {
		"favicon.ico" : "favicon",
		agent : "agent",
		upload: "upload",
		prettify: "prettify",
        psd: "psd"
	};

exports.get = function(moduleName){
	var t = MODULE[moduleName];
	return  t ? require(base+t) : null;
};