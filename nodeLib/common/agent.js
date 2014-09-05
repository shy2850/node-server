var http = require('http'),
    url = require('url'),
    formidable = require('formidable');

exports.execute = function(request,response,option,path){

  if('POST' === request.method){  //拼接POST数据
    var form = new formidable.IncomingForm(), fields = [];
    
    form.on('field', function(field, value) {
        fields.push( field+'='+encodeURIComponent(value) );
    }).on('end', function() {
      var req = doRequest(request,response,option,path);
      req.write( fields.join('&') );  //提交PSOT数据
      req.end();
    });
    form.parse(request);  //使用formidable模块开发
  }else{
    doRequest(request,response,option,path).end();  //GET请求直接提交数据
  }
};

function doRequest(request,response,option,path){
  var location = url.parse(path), data = '';
  return http.request({    // 处理转发参数   
        reg  : option.reg,
        host : option.host,
        port : option.port,
        path : option.path(location),
      method : request.method,
     headers : {          //拼接headers数据，只处理必要的
        "user-agent":request.headers["user-agent"],
        "content-type":request.headers["content-type"],
        cookie: option.cookie || request.headers.cookie,   //很多站点都是通过cookie进行SSO认证,可以自己在浏览器模拟
        host: option.host+':'+option.port,
        accept: request.headers.accept
      }
    },function(res){
        response.writeHead(res.statusCode, res.headers);
        res.on('data', function (chunk) {
            data += chunk
        }).on('end',function(){
            response.end( data );
        }).on('error',function(e){
            console.log(e)
        });
    });
}