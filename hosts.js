var CONF = require("./nodeLib/config/conf"),
	fs = require('fs'),
	hosts = [];

for(var k in CONF){ hosts.push(k) }

//hosts写入, windows only, 可能需要管理员权限
var hostsString = '127.0.0.1  ' + hosts.join(' '),
    hostsPath = 'C:\\Windows\\System32\\drivers\\etc\\hosts'; 
if( process.argv[2] == 'reset' ){
	fs.rename(hostsPath+'.bak',hostsPath, function(err){
		if(err){
			console.log( err );
		}else{
			console.log( 'reset hosts successfully' );
		}
	});
}else{
	fs.stat(hostsPath+'.bak',function(error,stat){
		if( stat && stat.isFile && stat.isFile() ){
			console.log( '\nhosts.bak is existed.  run: ' );
			console.warn( '  "node hosts reset"' );
		}else{
			var hostsBak = fs.readFileSync( hostsPath ).toString().replace(/[\n\r]?127\.0\.0\.1[\s\S]+/g,'');
			fs.rename(hostsPath, hostsPath+'.bak', function(err){
			    if( err ){
			    	console.log( err );
			    }else{
			    	fs.writeFile(hostsPath, hostsBak + '\n' + hostsString, function(err){
			    		console.log( '  hosts backup in hosts.bak and Instead of new local-hosts config' );
			    	});
			    }
			});
		}
	});
}
	
