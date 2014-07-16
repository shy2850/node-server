var url = require('url'),
    	fs = require('fs');
exports.execute = function(req,resp,root,handle,f){
	var _root = handle.conf.output, mime = req.util.mime;
	var build = function( path ){
		fs.stat(root+path,function(error,stats){
			if(stats && stats.isFile && stats.isFile()){
				fs.rename(root+path, _root+path, function(){

				});
			}else if(stats && stats.isDirectory && stats.isDirectory()){
				fs.readdir(root+path,function(error,files){
					for ( var i in files) {		//对应下级目录或资源文件
		        			build( path+'/'+files[i] );
					}
				});
			}else{
				console.log( error );
			}
		});
	};
	build( "" );
    	resp.end(JSON.stringify({
    		success:true
    	}));
}