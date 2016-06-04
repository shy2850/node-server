"use strict";
var chokidar = require('chokidar');
var mime = require('mime');
var http = require('http');
var _ = require('underscore');
var build = require('./build');

var confs = {};
var timeStramp = +new Date();

var watcher = chokidar.watch(null, {
    ignored: /[\/\\]\./
});

var listenner = function(path){
    var conf;
    for(var root in confs){
        if(!path.indexOf(root)){
            conf = confs[root];
        }
    }
    if(conf && conf.livereload){
        if (!path.indexOf(conf.root)) {
            var pathname = path.replace(conf.root, '');
            build.buildFile(pathname, conf, function(){
                timeStramp = +new Date();
            });

            var mapSource;
            if(conf.livereload.relative && (mapSource = conf.livereload.relative(pathname)) ){
                if(({}).toString.call(mapSource) === "[object Array]"){
                    mapSource.forEach(function(p){
                        build.buildFile(p, conf, function(){
                            timeStramp = +new Date();
                        });
                    });
                }
            }
        }
    }else{
        timeStramp = +new Date();
    }
};
watcher.on('change', function(path){
    console.trace('changed: ' + decodeURI(path));
    listenner(path);
}).on('add', listenner);

exports.execute = function(req, resp, root, handle, $conf){
    if(!confs[root]){
        confs[root] = $conf;
        watcher.add(root);
    }
    var times = 0, t = Number(req.data.mtime);
    function fn(){
        if(timeStramp === t){
            times++;
            if(times < 60){
                setTimeout(fn, 500);
                return;
            }
        }
        resp.writeHead(200, {"Content-Type": mime.get('.js')});
        resp.end( (req.data.callback || 'callback') + '(' + timeStramp + ');' )
    }
    fn();
};
