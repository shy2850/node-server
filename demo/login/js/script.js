
;//工具和扩展
(function($){
	/**
	*	模拟下拉框选择，格式如下：
	*	<ul id="list">
    *       <li><a class="select" href="javascript:void(0);" data-value="userName">用户名</a></li>
    *       <li><a href="javascript:void(0);" data-value="mail">邮箱</a></li>
    *       <li><a href="javascript:void(0);" data-value="xinhuaId">炫ID</a></li>
    *   </ul>
    *	目标数据存储：
	*   <input type="hidden" name="select" value="userName" id="target"/>
	*	事件触发和数据显示：
	*	<a class="account-bid" id="el">用户名</a>
	*/
	$.fn.selectM = function(list,target){
		var $list = $(list),$this = this;
		$(document).on("click",function(e){
			if( e.target !== $this[0] ){
				$list.hide();
			}
		});
		$(this).on("click",function(){
			$list.toggle();
		});
		$("a[data-value]",$list).on("click",function(){
			$(target).val( $(this).attr("data-value") );
			$this.html($(this).html());
			$list.hide();
		});
	};
})(jQuery);


//页面事件绑定。
(function($){
	//随机背景图：
	$("#loginbg").attr({"src":"http://tmisc.home.news.cn/login/images/loginbg" + ( parseInt(Math.random()*7) + 1 )+".png"});

	//刷新验证码：
	$("#change_register_identify,.identify-change").on("click",function(){
		$("#identify").attr({ "src":"http://login.home.news.cn/captcha.do?random=" + Math.random() }); //验证码保持动态刷新
        $("#register_identify").attr({ "src":"http://login.home.news.cn/rcaptcha.do?random=" + Math.random() }); //验证码保持动态刷新
	}).trigger("click");


	//注册页弹出：
	$("#login-register,#passer").on("click",function(){
		$("#xuan-register").fadeIn();
		//$("#xuan-register :text").filter(":visible").val("");
	});
	//注册页关闭：
	$("#register-cancel").on("click",function(){
		$("#xuan-register").hide();
	});

	//账号类型选择:
	$("#account-bid").selectM("#account-list","#selectOpt");

	
	var ajax_id = function(nic){
		$("#getXuanID").css({color:"#ccc",cursor:"default"}).off();
		if( $("#register_name").is(":disabled") )return;
		$.ajax({
			url : "/agent?http://login.home.news.cn/profile/xuanid.do?",
			data: {o:$("[name='o']").val()},
			dataType:"json",
			success:function(data){
				if(200==data.code){
					$("#register_name").val(data.desc).trigger("blur").attr({disabled:true});
					$("[name='hrn']").val(data.desc);
					if(nic){$("#nick_name").val( $("[name='hrn']").val() );}
				}else{
					alert(data.desc);
				}
			}
		});
	};
	//获取系统提供的炫ID
	$("#getXuanID").one("click",function(){
		ajax_id();
	});

	//以炫ID作为昵称:
	$("#niccXuanID").on("click",function(){
		ajax_id(true);
		$("#nick_name").val( $("[name='hrn']").val()).blur();
	});



})(jQuery);


//表单相关
(function($){
	var agent = "/agent?";

	//统一的表单提示
	$.form.settings = {
		initTip: function(input, defaultTip) {
            input.next(".tips")
                .html(defaultTip || "&nbsp;");
        },
        validTip: function(input, errorInfo, defaultTip) {
            if (errorInfo) {
                input.next(".tips")
                    .removeClass('ok')
                    .addClass("err")
                    .html(errorInfo);
            } else {
                input.next(".tips")
                    .removeClass('err')
                    .addClass("ok")
                    .html(defaultTip || "&nbsp;");
            }
        }
    };

    //输入框的聚焦提示
    $("#xuan-register input").on("focus",function(){
    	$(this).next(".tips").attr({"class":"tips"})
                    .html( $(this).validAttr("defaultTip") || "&nbsp;" );
    });

    var lowcase = function(input){
    	var val = input.val().toLowerCase();
		input.val( val );
		return val;
	};

    //验证参数绑定
    $.form.render({
    	//注册字段校验
    	"#register_name":{
    		before:lowcase,
    		defaultTip:"登录账号由英文和数字组成6-26位。",
    		errorTip:"登录账号由英文和数字组成6-26位。",
    		regexp:/^\w{6,26}$/,
    		validFun:function(v){
    			var vR = {errorInfo:""};
    			$.ajax({
    				url: agent+"http://login.home.news.cn/profile/passportCheck.do?",
    				data:{name:"userName",value:v,type:"json",t:new Date().getTime()},
    				dataType:"json",
    				success:function(data){
    					if(data.code == 1101){
	    					vR.errorInfo = data.desc;
    					}
    				},
    				async:false
    			});
    			return vR;
    		}
    	},
    	"#nick_name":{
    		defaultTip:"请输入昵称",
    		errorTip:"请输入昵称",
    		validFun:function(v){
    			var vR = {errorInfo:""};
    			$.ajax({
    				url: agent+"http://login.home.news.cn/profile/passportCheck.do?",
    				data:{name:"nickName",value:v,type:"json",t:new Date().getTime()},
    				dataType:"json",
    				success:function(data){
    					if(data.code == 1101){
	    					vR.errorInfo = data.desc;
	    					var html='推荐您选用以下昵称<ul style="margin-top:5px;line-height:20px">';
                            var newNickName;
                            for(i=0;i<data.nnList.length;i++){
                                newNickName = v+data.nnList[i];
                                html+='<li><input type="radio" id="nn'+i+'" name="nnList" value="'+newNickName+'"> <label for="nn'+i+'">'+newNickName+'</label></li>';
                            }
                            html+="</ul>";
                            $("#nnListDiv").html(html);
                            $("#xuan-register").height(660);
    					}
    				},
    				async:false
    			});
    			return vR;
    		}
    	},
		"#register_pass":{
			defaultTip:"6到16个字符,不能全为字母或数字。",
			lenTip:"需要6到16个字符。",
			errorTip:"密码不能全为字母或数字。",
			minlen:6,
			maxlen:16,
			regexp:/[^A-Za-z0-9]+/,
			option:"keyup blur"
		},
		"#register_pass1":{
			defaultTip:"再次输入你设置的密码。",
			validFun:function(v){
				var vR = {errorInfo:""};
				if( v != $("#register_pass").val() ){
					vR.errorInfo = "两次密码输入不一致!";
				}
				return vR;
			}
		},
		"#register_email":{
			defaultTip:"用于召回密码等服务。",
			errorTip:"邮箱格式不正确",
			type:"email",
			validFun:function(v){
				var vR = {errorInfo:""};
    			$.ajax({
    				url: agent+"http://login.home.news.cn//profile/passportCheck.do?",
    				data:{name:"email",value:v,type:"json",t:new Date().getTime()},
    				dataType:"json",
    				success:function(data){
    					if(data.code == 1101){
	    					vR.errorInfo = data.desc;
    					}
    				},
    				async:false
    			});
    			return vR;
			}
		},
		"#agree_input":{
			option:"click",
			end:function(input){
				if( !input.attr("checked") ){
					input.vReturn = "需要同意新华网协议才能注册。"
					alert("需要同意新华网协议才能注册。");
				}
			}
		},
		"#register_code":{
			defaultTip: "正确输入验证码。", 
			errorTip: "正确输入验证码。", 
			regexp:/^[A-Za-z0-9]{4,5}$/
		},

		//登录字段校验
		"#user_name":{ 
			before:lowcase,
			option:"valid",
			requiredTip:"用户名需要填写!",
    		regexp:/^\w{4,26}$/,
    		errorTip:"登录账号由英文和数字组成6-26位"
		},
		"#pass":{ 
			option:"valid",
			requiredTip:"密码需要填写!" 
		},
		"#code":{ 
			option:"valid",
			requiredTip:"验证码需要填写!",
			regexp: /^[A-Za-z0-9]{4,5}$/,
			errorTip:"请输入正确的验证码"
		}
    },{
    	required:true,
    	option:"blur"
    });

	//绑定注册表单的批量验证
	$("#register-form").on("submit",function(){
		return $(this).formValid("input");
	});

	//绑定登录表单的批量验证
	$("#login-form").on("submit",function(){
		return $(this).formValid(":visible",{
			interrupt:true 	//遇到第一个错误即停止继续
		},{
			validTip:function(input,vReturn){
				if(vReturn){
					alert(vReturn);
				}
			}
		});
	});




	//点选系统推荐的昵称：
	$("#nnListDiv").delegate(":radio","click",function(e){
		$("#nick_name").val(this.value);
	});

	$(function(){
		if(location.hash=="#register"){
            $("#xuan-register").show();
            $("#register_name").focus();
        }
	})


})(jQuery);