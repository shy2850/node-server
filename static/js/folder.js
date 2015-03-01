(function() {
  require.config({
    paths: {
      wfQuery: "../../node_modules/wfquery/js/wfQuery"
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
          dataType: 'json',
          success: function(res) {
            if (res.error) {
              return alert('输出失败');
            } else {
              return alert('复制成功：' + res.command);
            }
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