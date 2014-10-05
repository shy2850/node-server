/**
 * 将指定标签[a或者button,input:button模拟为文件选择按钮, 选择完成的文件可以通过iframe上传]
 * @author shiyangyang
 * @version 0.9.0
 * @module frameUpload
 * @since Chrome opera firefox & IE7+
 */
define(function(require, exports, module){
	var uri = module.uri, iframeUri = uri.replace('index.js','upload.html'), index = 0;
	/**
     * CSS赋值
     * @param dom 操作的dom
     * @param style   将要赋值的属性列表
     */
    var css = function(dom,style){
        for(var k in style){
            var v = style[k];
            if( /width|height|left|right|top|bottom|size|radius/i.test(k) && /^\d+$/.test(v) ){
                v += "px";      //含有这些字符串的style属性名支持一下纯数字写法
            }
            dom.style[k] = v;
            if( k === "opacity" ){
                dom.style.filter = "alpha(opacity=" + (v*100) + ")";    //兼容一下IE的半透明效果
            }
        }
    };

    /**
     * @param el 渲染按钮
     * @param change 修改file值触发
     * @param 
     */
    var Upload = function(opt){
    	var _index = index++;
    	var _this = this;
    	var dom = this.el = opt.el, uri = opt.src || iframeUri;
    	var style = {    //根据指定按钮 的盒模型 定位新创建的标签
            width   : dom.offsetWidth,
            height  : dom.offsetHeight,
            left    : dom.offsetLeft,
            top     : dom.offsetTop,
            border	: 0,
            position: 'absolute',
            opacity	: 0
        };
    	var frame = this.frame = (function(){
    		var frame = document.createElement('iframe');
    		frame.id = frame.name = "ajaxFrame-" + _index;
    		frame.src = uri;
    		css(frame,style);
    		return frame;
    	})();

    	dom.parentNode.appendChild( frame );	//将iframe添加到指定按钮父标签下。

        require(['requestAFrame'],function(R){

            R.addTimeout(frame.id,function(){
                var doc = frame.contentDocument || document.frames["ajaxFrame-"+_index].document;
                var input = doc.getElementById('upload');
                if(input && !input.getAttribute('ajax-init') ){

                    var form = input.parentNode;
                    form.action = opt.action;
                    _this.submit = function(){
                        if( !input.value ){
                            throw new Error('需要选择文件');
                        }
                        var xhr;
                        if( opt.ajax && (xhr = window.XMLHttpRequest ? new XMLHttpRequest() : {}).upload ){        //支持ajax2.0直接的文件上传带进度
                            xhr.upload.addEventListener('progress',opt.onprocess); 
                            xhr.onreadystatechange = function(e){
                                if (xhr.readyState == 4){
                                    var json;
                                    try{
                                        json = JSON.parse(xhr.responseText)
                                    }catch(e){
                                        // is not a JSON result       
                                    }
                                    opt.afterUpload.call(frame,json,xhr);
                                }    
                            };
                            var formdata = new FormData(form);
                            xhr.open("POST", opt.action, true);
                            xhr.send(formdata);
                        }else{          //普通的表单文件上传需要刷新页面
                            frame.onload = function(){
                                var doc_ = frame.contentDocument || document.frames["ajaxFrame-"+_index].document;
                                if( typeof opt.afterUpload === 'function' ){
                                    try{
                                        opt.afterUpload.call(frame, new Function("return "+doc_.body.innerHTML.replace(/[\r\n]+/,""))() );
                                    }catch(e){
                                        alert(e);
                                    }
                                } 
                                frame.onload = null;
                                frame.src = uri;
                            };
                            form.submit();
                        }
                            
                    };

                    input.submit = _this.submit;
                    for(var e in opt){  //事件绑定,所有on开始的key都绑定到input上面
                        if( 0 === e.indexOf("on") && typeof opt[e] === 'function' ){
                            input[e] = opt[e];
                        }
                    } 

                    input.setAttribute('ajax-init','true');
                    (typeof opt.ready === 'function') && opt.ready.call(input)
                }
            });
        });

    };

    return Upload;

});