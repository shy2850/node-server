var _path = require('path'),
	fs = require('fs'),
	http = require('http'),
	exec = require('child_process').exec;
exports.execute = function(req,resp,root,handle,mini,conf){
	var _root = conf.output, mime = req.util.mime, host = "http://"+req.headers.host.split(":")[0]+":"+conf.port+"/";
	var build = function( path ){
		var extType = _path.extname(path).substring(1);
		fs.stat(root+path,function(error,stats){
			if(stats && stats.isFile && stats.isFile() && mime.isTXT(extType)){
				var info = "";
				http.get(host+path, function(res) {
					res.on('data',function(data){
			           info += data;
					});
			        res.on('end',function(data){
			        	switch(extType){
			        		case 'less' : path = path.replace(/(.+?)less$/,'$1css'); break;
			        		case 'coffee' : path = path.replace(/(.+?)coffee$/,'$1js'); break;
			        	}
			            fs.writeFile(_root+path, info, function (err) {});
			        });
				});
			}else if(stats && stats.isDirectory && stats.isDirectory()){
				fs.readdir(root+path,function(error,files){
	        		for ( var i in files) {		//对应下级目录或资源文件
	        			build(path+'/'+files[i]);
					}
	        	});
			}
		});
	};

	exec('del '+_root+'* /s/q',function(err){
		if(!err){
			exec('xcopy '+root.replace(/(.*?)[\\\/]$/,'$1')+' '+_root+' /e/d/s', function (error, stdout, stderr) {
				if (!error) {
					build("");
				}
				resp.end(JSON.stringify({
					error:error,
					command: 'xcopy '+root.replace(/(.*?)[\\\/]$/,'$1')+' '+_root+' /e/d/s',
					info: 'command windows only'
				}));
			});
		}
	});
		
}