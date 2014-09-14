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

localStorge = @.localStorage
require ["bootstrap","frameupload"], ()->
  (($)->
    ($ "#switch-icon").on "click", ()->
      ($ "#list-container").toggleClass "big"
      if localStorge
        localStorge.iconStyle = ($ "#list-container").attr("class")

    if localStorge
       ($ "#list-container").addClass localStorge.iconStyle

    ($ "body").fadeIn(50)

    ($ ".txt").on "contextmenu", ()->
      if (confirm "使用高亮工具查看文档？\n确定：工具查看文件；\n取消：直接打开。")
        open "/prettify?#{this.href}?handle=false"
        false
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





