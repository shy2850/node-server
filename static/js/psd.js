require.config({
    paths: {
         wfQuery: "../../node_modules/wfquery/wfQuery"
    }
});

define('psd/init', ['wfQuery', 'requestAFrame'], function ($, R) {
    var Z_INDEX = 10000;
    var prefix = document.title.replace(/\.psd$/,'/');
    var main = $('#main');
    var items = main.children();
    var base = items.eq(0);
    var canvas = items[1];
    var imgs = items.eq(2);
    var download = items[3];
    var c = canvas.getContext('2d');

    download.download = prefix.replace(/^(.*?)([^\/]+)\/$/, '$2.png');

    return {
        execute: function (psd) {
            var size = {
                width: psd.width,
                height: psd.height
            }
            
            main.css(size);
            imgs.css(size);
            download.style.zIndex = Z_INDEX;
            canvas.width = size.width;
            canvas.height = size.height;

            download.onclick = function () {
                c.clearRect(0, 0, size.width, size.height);
                imgs.children().each(function () {
                    var img = $(this);
                    c.drawImage(this, img.css('left'), img.css('top'));
                });
                this.href = canvas.toDataURL("image/png");
            };

            $(document).on('keydown', function (e) {
            	switch (e.keyCode) {
            		case 83:
            			if (e.ctrlKey) {
            				e.preventDefault();
            				download.click();
            			}
            			break;
            	}
            });

            var target = [];
            var client = {};
            var mousedown = false;
            imgs.on('contextmenu', 'img', function (e) {
                var init = $(this).data('init');
                $(this).css(init);
                mousedown = false;
                e.preventDefault();
            }).on('click', 'img', function (e) {
                if (mousedown) {
                    target = [];
                    $(e.target).trigger('blur');
                }
                else {
                    target = [e.target];
                }
                client = {
                    x: e.clientX,
                    y: e.clientY
                };
                mousedown = !mousedown;
            }).on('mousemove', function (e) {
                var current = {
                    x: e.clientX,
                    y: e.clientY
                };
                if (mousedown && target.length) {
                    for (var i = 0; i < target.length; i++) {
                        var t = $(target[i]);
                        var left = t.css('left');
                        var top = t.css('top');
                        t.css({
                            left: left + current.x - client.x,
                            top: top + current.y - client.y
                        });
                    }
                }
                client = current;
                e.preventDefault();
            }).on('keydown', 'img',  function (e) {
                var t = $(this);
                var left = t.css('left');
                var top = t.css('top');
                var init = t.data('init');
                switch (e.keyCode) {
                    case 27:t.css(init);break;
                    case 8:
                    case 46: t.remove();break;
                    case 37: t.css({left: left - 1});break;
                    case 38: t.css({top: top - 1});break;
                    case 39: t.css({left: left + 1});break;
                    case 40: t.css({top: top + 1});break;
                }
            });

            for (var i = 0; i < psd.layers.length; i++) {
                (function (layer, index) {
                    R.addTimeout('img-' + index, function () {
                         if (layer.visible) {
                             imgs.prepend($('<img tabindex="-1" src="' + prefix + layer.name + '.png" alt="'+layer.legacyName
                                 +'" data-init=\'{"left":'+layer.left+',"top":'+layer.top+'}\'>').css({
                                 left: layer.left,
                                 top: layer.top,
                                 zIndex: Z_INDEX - layer.rows,
                                 opacity: (layer.opacity + 1) / 256
                             }));
                         }
                         return false;
                    }, index * 100 / 3);
                })(psd.layers[i], i);
            }
        }
    }
});

define('psd', ['wfQuery', 'psd/init'], function ($, init) {
    var title = document.title;
    var pkg = title.replace(/\.psd/, '');
    var json = pkg + '/layers.json';

    $.ajax({
        url: json,
        dataType: 'json',
        success: function (psd) {
            init.execute(psd);
        },
        error: function (xhr, e) {
            console.log(e);
            alert('PSD文件解析未完成, 请稍后再试');
        }
    });
});
require(['psd']);