;
(function(){
	//chrome.extension.sendMessage({href: location.href});

	var con = document.getElementById("list-container");

	if(con){
		[].forEach.call( con.children, function(li){
			if( li.classList.contains("css") || li.classList.contains("less") ){
				var a = document.createElement("a");
				a.href = li.children[0].href + "?css-sprite";
				a.target = "_blank";
				a.className = "see-to-source";
				a.innerHTML = "css-sprite";
				li.appendChild( a );
			}
		});
	}

	if( location.search.match(/css\W*sprite/) ){
		var style = document.createElement("link");
		style.rel = "stylesheet";
		style.href = chrome.extension.getURL("style.css");
		document.body.appendChild( style );


		var css = document.body.innerText,
			reg = /url\("?([^\(\)]*?)"?\)\s*no\-repeat\s*(-?\w+)?\s*(-?\w+)?/g,
			holder = document.createElement("div"),
			replacer = [],
			map = {},
			i = 0,
			cssModel;
		holder.className = "f2e-crx-holder";
		holder.title = "img source flow";
		holder.innerHTML = '<a href="javascript:void(0);">Sprite</a><a href="javascript:void(0);">css</a>';

		document.body.appendChild(holder);
		cssModel = css.replace( reg, function(str, src, left, top){
			replacer.push({
				src: src,
				left: parseFloat(left) || 0,
				top: parseFloat(top) || 0
			});

			map[ src ] = map[ src ] || (function(src){
				var img = document.createElement("img");
				img.onerror = img.onload = function(){
					i++;
					if( i === Object.keys(map).length ){
						ready();
					}
				};
				img.src = src;
				holder.appendChild( img );
				return img;
			})(src);

			return "{{"+replacer.length+"}}";
		});


		var canvas = document.createElement("canvas");
		canvas.className = "f2e-crx-show";
		canvas.title = "canvas show";
		document.body.insertBefore( canvas, document.body.children[0] );
		var c = canvas.getContext('2d');

		function ready(){
			var w = holder.offsetWidth,
				h = holder.offsetHeight;
			canvas.width = w;
			canvas.height = h;

			c.clearRect( 0, 0, w, h );
			for(var s in map){
				c.drawImage( map[s], map[s].offsetLeft, map[s].offsetTop );
			}

			
		};

		var a1 = holder.children[0],
			a2 = holder.children[1],
			name = "f2e-sprite",
			cssResult = "";

		a1.onclick = function(e){
			var filename;

			name = window.prompt( "filename:", name );
			filename = this.download = name + ".png";
			canvas.title = canvas.download = filename;

			cssResult = cssModel.replace( /\{\{(\d+)\}\}/g, function(mat, i){
				var origin = replacer[i-1],
					img = map[ origin.src ];

				return 'url(' + filename + ') no-repeat ' 
					+ (origin.left - img.offsetLeft) + 'px ' 
					+ (origin.top - img.offsetTop) + 'px';

			});
			try{
				this.href = canvas.toDataURL("image/png");
			}catch(e){
				alert( "There're images crossdomain, \n please save png by self." );
				return false;
			}
		};

		a2.onclick = function(){
			if( !cssResult ){
				alert( "please sprite first!" );
				return false;
			}
			filename = this.download = name + ".css";
			this.href = "data:text/css;base64," + btoa( unescape( escape(cssResult).replace(/%u/g,"\\") ) );
		};
		window.onresize = ready;

	}
	
	native2ascii = function(str){
		return str.replace(/[\x00-\xff]/g, function(c){
			return escape(c).replace(/%u/,"\\").toLowerCase();
		});
	};
})();