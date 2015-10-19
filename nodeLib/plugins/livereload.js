"use strict";
var chokidar = require('chokidar');
var mime = require('mime');
var _ = require('underscore');
var roots = {};
var timeStramp = +new Date();

var watcher = chokidar.watch('.', {
    ignored: /[\/\\]\./
});
watcher.on('change', function(event, path){
    timeStramp = +new Date();
});

exports.execute = function(req, resp, root, handle, conf){
    if(!roots[root]){
        roots[root] = true;
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
