(function (win) {
    var Clock = function(o){
        var canvas = document.createElement("canvas"), r = o.size || 100,
            c= canvas.getContext('2d');
            c.strokeStyle = "#000";
            c.lineWidth = 2,
            P = Math.PI;
        var holder = document.getElementById(o.holder);
        holder.appendChild( canvas );
        canvas.width = canvas.height = r * 2;
        holder.style.width = holder.style.height = (r * 2) + "px";

        var drawLine = function(c,deg,length){
            var x = length * Math.cos(deg-P/2) + r,
                y = length * Math.sin(deg-P/2) + r;
            c.moveTo(r,r);
            c.lineTo(x,y);
            c.stroke();
        };


        function draw(){
            c.clearRect(0,0,2*r,2*r);

            //画圆
            c.lineWidth = 4;  
            c.beginPath();
            c.arc(r,r,r-2,0,Math.PI*2);
            c.closePath();
            c.stroke();
            c.save();

          
            c.beginPath();
            c.translate(r,r);  
            c.lineWidth = 2;   
            for(var i=0;i<60;i++){  //刻度
                if( i%5 ){
                    c.moveTo(.9*r, 0);
                }else{
                    c.moveTo(.8*r, 0);
                }
                c.lineTo(r, 0);
                c.rotate(Math.PI/30);
            }
            c.stroke();
            c.restore();
            c.save();

            var d = new Date(),
                h = d.getHours(),
                m = d.getMinutes(),
                s = d.getSeconds(),
                ss= s + (d.getTime() % 1000) / 1000;

            c.beginPath();
            c.lineWidth = 3;  //时针
            c.radius = 3;
            drawLine( c, P*(h/6+m/360), .5*r );
            c.lineWidth = 2;  //分针
            drawLine( c, P*(m/30+ss/1800), .7*r );
            c.lineWidth = 1;  //秒针 
            drawLine( c, P*ss/30, .85*r );

            requestAFrame(draw);
        }

        draw();
    };
    var define = win.define;
    if (define && define.amd) {
        define(function () {
            return Clock;
        });
    }
    else {
        win.Clock = Clock;
    }
})(window);
