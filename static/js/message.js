;require.config({
    paths: {
        "jquery": "jquery-min.js",
        "preFix": "prefixfree-min.js",
        "bootstrap": "bootstrap-min.js"
    },
    shim : {
        "bootstrap":{
            deps:["jquery"]
        }
    }
});
require(["jquery","preFix"],function(){
    (function($){
        $().ready(function() {
            $('.send').click(function() {
                setTimeout(function() {
                    $('#plate').removeClass('front').fadeTo(300,0);
                    $('#container').removeClass('beginning');
                    $('.curvable').addClass('curved');
                    setTimeout(function() {
                        $('#container').addClass('hover');
                        setTimeout(function() {
                            $('#container').addClass('fly_away_first');
                            setTimeout(function() {
                                $('#container').addClass('fly_away');
                                setTimeout(function(){
                                    $.ajax({
                                        url:"/upload",
                                        data:{
                                            message: $("#words").val()
                                        },
                                        type:"post",
                                        success: function(data){
                                            window.opener.sendOK();
                                        }
                                    });

//                                    $('#plate').addClass('front');
//                                    $('#container').removeClass('fly_away fly_away_first hover').addClass('beginning');
//                                    $('.curvable').removeClass('curved');
                                },3000);
                            }, 600);
                        }, 2000);
                    }, 2800);
                }, 200);
            });
        });
    })(jQuery);
});