;require.config({
	paths: {
		"jquery": "jquery-min.js",
		"preFix": "prefixfree-min.js",
		"bootstrap": "bootstrap-min.js",
		"pretty": "prettify-min.js?handle=false"
	},
	shim : {
		"bootstrap":{
			deps:["jquery"]
		}
	}
});
require(["bootstrap","preFix","pretty"],function(){
	
	(function($){
		var c = $("#holder");
		$.ajax({
			url: c.attr("data-url"),
			dataType: "text",
			success: function(data){
				c.text(data);
				prettyPrint();
				$(".prettyprint li").on("mouseover",function(){
					$(this).addClass("hover");
				}).on("mouseout",function(){
					$(this).removeClass("hover");
				});
			}
		});
		

	})(jQuery);
});