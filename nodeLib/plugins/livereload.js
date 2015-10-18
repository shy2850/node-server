"use strict";
var watch = require('watch');
var mime = require('mime');
var roots = {};

exports.execute = function(req, resp, root){
    if(!roots[root]){
        roots[root] = +new Date();
        watch.watchTree(root, function(){
            roots[root] = +new Date();
        });
    }

    var times = 0, t = Number(req.data.mtime);
    (function(){
        var fn = arguments.callee;
        if(roots[root] === t){
            times++;
            if(times < 60){
                setTimeout(fn, 500);
                return;
            }
        }
        resp.writeHead(200, {"Content-Type": mime.get('.js')});
        resp.end( (req.data.callback || 'callback') + '(' + roots[root] + ');' )
    })();
};
