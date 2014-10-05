window.requestAFrame = (function () {
	return  window.requestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			window.oRequestAnimationFrame ||
			function (fn) {
				return window.setTimeout(fn, 1000/60); 
			};
})();
(function (root, factory) {

  if (typeof define === 'function' && define.amd) {
    define(factory);
  } else {
    root.RequestAFrame = factory();
  }

}(this,function(require, exports, module) {
	var _timeoutQueue = {}, index = 0, countdowns = [];
	exports = exports || {};
	/**
	 * 按照指定key添加轮训事件 【首次添加一般不会立即执行】
	 * k	: 轮询事件的key
	 * fn 	: 要轮训的事件	return false; 
	 * timer: 轮训间隔,单位ms, 默认是200, 只支持 1000/60 的倍数
	 * times: 轮询事件执行次数, 达到指定次数后清除
	**/
	exports.addTimeout = function(k,fn,timer,times){
		fn.timer = Math.floor( (timer||200) * 60 / 1000);
		fn.times = times || Infinity;
		_timeoutQueue[k] = fn;
	};
	/**
	 * 按照指定key清除轮训事件 
	**/
	exports.deleteTimeout = function(k){
		delete _timeoutQueue[k];
	};

	/**
	 * 增加一个倒计时效果
	 * @param
	 */
	exports.countdown = function(opt){
		opt = opt || {};
		function _parse(_t){
			return {
				dd : _t / 86400000 | 0,
				hh : (_t / 3600000 | 0) % 24,
				mm : (_t / 60000 | 0) % 60,
				ss : (_t / 1000 | 0) % 60,
				tt  : (_t / 100 | 0) % 10
			}
		}

		if( opt.el && opt.timeout && opt.attr && ( typeof opt.el[opt.attr] !== 'undefined') ){
			
			if( [].toString.call(opt.timeout) === "[object Date]" ){
				opt.timeout = opt.timeout.getTime() - new Date().getTime();
			}

			opt.format = opt.format || 'dd天hh时mm分ss秒tt';
			countdowns.push(opt);
			if(countdowns.length === 1){
				exports.addTimeout('_countdown_',function(){
					for (var i = 0; i < countdowns.length; i++) {
						(function(i,cd){
							var m = _parse(cd.timeout);
 							cd.el[cd.attr] = cd.format.replace(/dd|hh|mm|ss|tt/g,function(k){
 								return m[k];
 							});
							cd.timeout -= 100;
							if( cd.timeout < 0 ){
								delete countdowns[i];
							}
						})(i,countdowns[i]);
					};
				},100);
			}			
		}
	};

	function queueTimeout(){
		for(var i in _timeoutQueue){
			var fn = _timeoutQueue[i];
			if( index % fn.timer === 0 ){	//如果按照时间轮训到了，执行代码
				if( !fn.times-- ){			//如果可执行次数为0, 移除方法
					delete _timeoutQueue[i];
				}else{
					var _r = fn();	
					if(_r === false){
						delete _timeoutQueue[i];
					}
				}
			}
		}
		requestAFrame(queueTimeout);
		index = ( index + 1) % (18000) ; //最高时隔5分钟
	}

	queueTimeout();	

	return exports;
}));
