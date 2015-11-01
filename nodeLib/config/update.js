"use strict";
var http = require('http'),
    https = require('https'),
    path = require('path'),
    fs = require('fs');

var loadJSON = function( url, callback ){
    var json, HTTP = url.match(/^https\:\/\//) ? https : http;
    callback = typeof callback === 'function' ? callback : function(){};

    if( url.match(/^https?\:\/\//) ){
        try{
            HTTP.get( url, function(res){
                var data = '';
                res.on('data',function(d){
                    data += d;
                }).on('end',function(){
                    try{
                        json = JSON.parse(data);
                        return callback( undefined, json );
                    }catch(e){
                        return callback( e );
                    }
                });
            }).on('error', function(e) {
                return callback( e );
            });
        }catch(e){
            return callback( e );
        }
    }else{
        fs.readFile( url, function(err, data){
            try{
                json = JSON.parse(data);
                return callback( err, json );
            }catch(e){
                return callback( err || e );
            }
        });
    }
};

exports.execute = function(server){
    loadJSON( path.join( __dirname , '../../package.json' ), function(err, json){
        if(err){
            console.log(err);
        }
        var version = json.version, init = false;
        function lookforupdate(){
            loadJSON( 'https://raw.githubusercontent.com/shy2850/node-server/master/package.json', function(err1, json1){
                if(err1){
                    return;
                }
                if( version !== json1.version ){
                    server.needUpdate = true;
                }
                if(!init){
                    init = !init;
                    console.log( server.needUpdate ? 'Your f2e-server is need-update!' : 'Your f2e-server is already up-to-date!' );
                }
            });
            setTimeout( lookforupdate, 1000 * 60 * 30 );
        }
        lookforupdate();
    });

};
