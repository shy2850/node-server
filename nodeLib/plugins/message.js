var http = require('http'),
	url = require('url');
exports.execute = function(req,resp,root){
	var message = req.data.message;
    console.log( new Date() + ":\t"+message );
    resp.end( JSON.stringify({
        "info": "ok"
    }));
}