(function(){

    /**
     * getById
     * @param id
     * @returns {Node}
     */
    var $ = function(id){
        switch(id.charAt(0)){
            case "#" : return document.getElementById( id.substring(1) );

            default : return document.getElementsByTagName(id);
        }
    };
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


    var btn_file = {
        /**
         *
         * @param dom
         * @param options   { success:function(){},begin:function(){} }
         */
        ajaxUpload : function(dom,options){

            options = options || {
                success : new Function(),
                begin   : new Function()
            };

            var fileFrame = $("#ajaxFrame");

            var baseCSS = {    //根据原 input:file 的盒模型 定位新创建的标签
                width   : dom.offsetWidth,
                height  : dom.offsetHeight,
//                lineHeight  : dom.clientHeight,
                left    : dom.offsetLeft,
                top     : dom.offsetTop
            };

            css(fileFrame,baseCSS);

            var doc = fileFrame.contentDocument;       //标准的iframe.document获取
            doc = doc || document.frames["ajaxFrame"].document;                  //IE6-7-8的 iframe.document获取

            fileFrame.onload = function(){
                var d = this.contentDocument || document.frames["ajaxFrame"].document;

                if( typeof options.success  === "function" ){
                    try{
                        options.success.call(dom,new Function("return " + d.body.innerHTML )(), this.contentDocument);
                    }catch(e){
                        //
                    }
                }
            };

            function onbegin(){
                var input = doc.getElementsByTagName("input")[0];
                if(!input){
                    setTimeout(onbegin,100);
                }else{

                    css(input,{
                        width   : dom.offsetWidth,
                        height  : dom.offsetHeight
                    });

                    input.onchange = function(){
                        if( typeof options.begin  === "function" ){
                            options.begin.call(dom);
                        }
                        doc.getElementById("submit").click();
                    };
                }
            }

            onbegin();

        }
    };

    window.ajaxUpload = btn_file.ajaxUpload;

})();