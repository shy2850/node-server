"use strict";
var http = require('http'),
    https = require('https'),
    url = require('url'),
    fs = require('fs');
var _ = require('underscore');
var hostReg = /(https?\:\/\/)[^\/]+/;
var cookies = {};

function doRequest(request, response, option, path, fws){
  var pathUrl = url.parse(path);
  var protocol = option.protocol || "http";
  var originHost = request.headers.host;
  var headers = {
      cookie: (option.mutiple ? cookies[option.host] : request.headers.cookie) || "",
      host: option.host || request.headers.host,
  };

  if(request.headers.origin){
      headers.origin = request.headers.origin.replace(hostReg, protocol + "://" + headers.host)
  }
  if(request.headers.referer){
      headers.referer = request.headers.referer.replace(hostReg, protocol + "://" + headers.host)
  }

  _.extend(request.headers, headers);
  var param = {    // 处理转发参数
      host: headers.host,
      port: option.port || 80,
      path: option.path ? option.path(pathUrl) : pathUrl.path,
    method: request.method,
   headers: request.headers
  };

  return ( option.port === 443 ? https : http ).request(param, function(res){
        var ck = res.headers["set-cookie"],
            hck = cookies[option.host];
        if(ck && option.mutiple ){ // 远程cookie同步
          [].slice.call(ck).forEach(function(item){
            var m = item.split(";")[0],
                key = m.split("=")[0],
                reg = new RegExp('\\b' + key + '=[^;]*');
            if( reg.test(hck) ){
              hck = hck.replace(reg,m);
            }else{
              hck += ";" + m;
            }
          });
          cookies[option.host] = hck;
        }
        if( res.statusCode === 302 ){ // 对于远程服务的302转发中的域名部分修改成本地域名
          res.headers.location = res.headers.location.replace( /(https?:\/\/)[^\\\/]+/, "http://" + originHost );
        }
        response.writeHead(res.statusCode, res.headers);
        res.pipe(response);
        if(fws){
          res.on('data',function(chunk){
            fws.write(chunk);
          }).on('end',function(){
            fws.end();
          });
        }
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

var mkdirs = function(dirpath, mode, callback) {
  fs.exists(dirpath, function(exists) {
    if(exists) {
      callback();
    } else {
      //尝试创建父目录，然后再创建当前目录
      mkdirs(require('path').dirname(dirpath), mode, function(){
        try{
          fs.mkdirSync(dirpath, mode);
        }catch(e){
        }
        callback();
      });
    }
  });
};

exports.execute = function(request, response, option, path){

  var fws = null;
  if( option.save === true ){
    var root = request.util.conf.root,
        dir = root + path.replace( /^(.*?)[^\\\/]+$/, "$1"),
        filename = root + path;

    if( fs.existsSync(dir) ){
        fws = fs.createWriteStream( filename.replace(/[?]+.*$/,"") );
    }else{
        try{
          mkdirs(dir,{},function(){
            //fws = fs.createWriteStream( filename.replace(/[?]+.*$/,"") );
          });
        }catch(e){
          console.log(e);
        }
    }
  }

  var req = doRequest(request, response, option, path, fws);
  request.on('data', function(chunk) {
      req.write( chunk );  //提交POST数据
  }).on('end', function() {
      req.end();
  });
};
