"use strict";
var http = require('http'),
    url = require('url');
function doRequest(request, response, option, path){
  var location = url.parse(path),
      headers = {   //拼接headers数据，只处理必要的
          "user-agent": request.headers["user-agent"],
          "content-type": request.headers["content-type"],
          cookie: option.cookie || request.headers.cookie,   //很多站点都是通过cookie进行SSO认证,可以自己在浏览器模拟
          host: option.host,
          accept: request.headers.accept
      };
      if( request.method === "POST" ){
          headers["content-length"] = request.headers["content-length"];
      }
      var param = {    // 处理转发参数
          reg: option.reg,
          host: option.host || request.$.host,
          port: option.port || 80,
          path: option.path ? option.path(location) : location.path,
        method: request.method,
       headers: headers
      };
  return http.request(param,function(res){
        response.writeHead(res.statusCode, res.headers);
        res.pipe(response);
    }).on('error',function(err){
        response.writeHead(408, {"Content-Type": "text/html"});
        response.end( JSON.stringify({
            code: 408,
            param: param,
            info: 'timeout or no-response',
            err: err
        }, null, 4) );
    });
}
exports.execute = function(request, response, option, path){
  var req = doRequest(request, response, option, path);
  request.on('data', function(chunk) {
      req.write( chunk );  //提交POST数据
  }).on('end', function() {
      req.end();
  });
};
