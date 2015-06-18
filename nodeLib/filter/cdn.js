var fs = require("fs"),
	_ = require("underscore");

var map = {}, hosts = [];
exports.execute = function( req, resp, stats ) {
	var k = resp.cdn_path,
		source = map[k];
	if( !source ){
		return false;
	}else if( source.mtime < +stats.mtime ){
		return false;
	}else{
		if (req.headers["if-modified-since"] && +stats.mtime == req.headers["if-modified-since"]) {
		    resp.writeHead(304, "Not Modified");
		    resp.end();
		}else{
			resp.end( source.data );
		}
		return true;
	}
};

exports.set = function(resp, v, mtime){
	var k = resp.cdn_path;
	for (var i = 0; i < hosts.length; i++) {
		if( k.indexOf(hosts[i]) === 0 ){
			return;
		}
	};
	map[ k ] = {
		mtime: mtime || +new Date,
		data: v
	};
};

exports.disabled = function(host){
	hosts.push( host );
	map = _.filter(map, function(v,k){
		return k.indexOf(k) !== 0;
	});
};

exports.enable = function(host){
	hosts = _.filter(hosts, function(h){
		return h !== host;
	});
};