(function() {
  require.config({
    paths: {
      wfQuery: "../../node_modules/wfquery/wfQuery"
    },
    shim: {
      clock:{
        deps:["requestAFrame"]
      }
    }
  });

  require(["wfQuery"], function($) {
    $("#output").on("click", function() {
      if( !window.confirm('项目输出将首先复制所有当前根目录文件到目标目录\n请确保磁盘空间充足!') ){
        return;
      }else{
        $.ajax({
          url: '/build',
          success: function(res) {
            if (!res.error) {
              alert('复制成功：' + res.command);
            }
            else if (res.code === -1){
              if(confirm(res.error)){
                $.ajax({
                  url: '/build?_on_force_build_=true',
                  success: function ($res) {
                    alert($res.error ? ('输出失败：' + $res.error) : ('复制成功：' + $res.command));
                  },
                  error: function(){
                    alert('输出失败！')
                  }
                });
              }
            }
            else {
              alert('输出失败:' + res.error);
            }
          },
          error: function(){
            alert('输出失败！')
          }
        });
      }
    });
  });

  require(["clock"], function() {
    return window.Clock({
      holder: "clock",
      size: 100
    });
  });

}).call(this);