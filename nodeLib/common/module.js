var base = __dirname + "/../plugins/",
	MODULE = {
		"favicon.ico" : "favicon",
		agent : "agent",
		upload: "upload",
        	message: "message",
		prettify: "prettify",
        	psd: "psd",
        	build: "build"
	};

exports.get = function(moduleName){
	var t = MODULE[moduleName];
	return  t ? require(base+t) : null;
};