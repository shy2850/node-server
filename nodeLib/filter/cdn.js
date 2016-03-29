"use strict";
var _ = require("underscore");
var map = {}, hosts = [];
exports.execute = function( req, resp, stats ) {
    var k = resp.cdnPath,
        source = map[k],
        mt = +stats.mtime;
    if( !source ){
        return false;
    }else if( source.mtime < mt ){
        return false;
    }else{
        var t = req.headers["if-modified-since"];
        if ( t && new Date(mt).toUTCString() === t ) {
            resp.writeHead(304, "Not Modified");
            resp.end();
        }else{
            var conf = resp.util.conf;
            var version = resp.util.version;
            var expires = new Date();
            expires.setTime( expires.getTime() + (conf.expires || 0) );
            resp.writeHead(200, {
                "Content-Encoding": resp.gzip ? "gzip" : "utf-8",
                "Content-Type": req.util.mime.get(k.split("?")[0]),
                "Expires": expires.toUTCString(),
                "Server": version
            });
            resp.end( source.data );
        }
        return true;
    }
};

exports.set = function(resp, v, mtime){
    var k = resp.cdnPath;
    for (var i = 0; i < hosts.length; i++) {
        if( k.indexOf(hosts[i]) === 0 ){
            return;
        }
    }
    map[ k ] = {
        mtime: mtime || +new Date(),
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
