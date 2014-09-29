require.config {
    paths: {
        "jquery": "jquery-min.js",
        "bootstrap": "bootstrap-min.js",
        "raphael"  : "raphael-min.js",
        "clock"  : "clock.js",
        "frameupload":"frameupload.js"
    },
    shim : {
        "bootstrap":{
            deps:["jquery"]
        },
        "clock" : {
            deps:["raphael"]
        }
    }
}

require ["bootstrap","frameupload"], ()->
  (($)->

    ($ "body").fadeIn(50)

    ($ "#output").on "click", ()->
      $.ajax {
        url: '/build',
        dataType: 'json',
        success: (res)->
          if res.error
            alert '输出失败'
          else 
            alert '成功：'+res.command
      }

    window.ajaxUpload  document.getElementById("ajaxUpload"),{
      success : (info,doc)->
         this.innerHTML = "上传成功"
         setTimeout ()->
            window.location.reload()
         ,1000
      ,
      begin   : ()->
         this.innerHTML = "正在上传..."
    }

  ) jQuery

require ["clock"],()->   ##时钟相关
  window.Clock {
    holder:"clock",
    size:240
  }





