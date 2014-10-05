(function() {
  require.config({
    paths: {
      "jquery": "jquery.min",
      "bootstrap": "bootstrap.min",
      "raphael": "raphael.min",
      "frame-upload":"frame-upload/index"
    },
    shim: {
      "bootstrap": {
        deps: ["jquery"]
      },
      "clock": {
        deps: ["raphael"]
      },
      "frame-upload":{
        deps: ["requestAFrame"]
      }
    }
  });

  require(["bootstrap"], function() {
    var $ = jQuery;
    $("#output").on("click", function() {
      return $.ajax({
        url: '/build',
        dataType: 'json',
        success: function(res) {
          if (res.error) {
            return alert('输出失败');
          } else {
            return alert('成功：' + res.command);
          }
        }
      });
    });
  });

  require(["frame-upload"],function(FrameUpload){
    var el = document.getElementById('ajaxUpload');
    new FrameUpload({
      el: el,
      src: "/upload",
      action: "/upload?iframe=true&uploadUrl="+document.title,
      onchange: function(){
        el.innerHTML = '上传中...';
        this.submit();
      },
      afterUpload: function(data){
        if(data.length){
          alert( '上传成功' );
          window.location.reload();
        }
      },
      ready: function(){
        this.setAttribute("multiple","multiple");
      }
    });
  });

  require(["clock"], function() {
    return window.Clock({
      holder: "clock",
      size: 240
    });
  });

}).call(this);