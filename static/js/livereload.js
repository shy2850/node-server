(function(){
	var host = document.scripts[document.scripts.length - 1].getAttribute('data-host');
	var src = 'http://' + (host || location.host) + '/livereload?mtime={mtime}&t={t}&callback={callback}';
	var param = {
		mtime: 0,
		t: +new Date,
		callback: 'f2eserver_livereload'
	};

	function jsonp(){
		var js = document.createElement('script');

		js.onload = function(){
			document.body.removeChild(js);
		};

		js.onerror = function(){
			document.body.removeChild(js);
			setTimeout(jsonp, 3000);
		};

		document.body.appendChild(js);
		param.t = +new Date;
		js.src = src.replace(/\{(\w+)\}/g, function(all, k){return param[k]});
		
	}

	window[param.callback] = function(time){
		if( param.mtime && param.mtime !== +time){
			location.reload();
		}else{
			param.mtime = time;
			jsonp();
		}	
	};

	setTimeout(jsonp, 0);
})();