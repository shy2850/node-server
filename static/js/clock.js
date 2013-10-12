window.Clock = (function(o) {
    var arrow1, arrow2, arrow3, bg, bgSrc, el, r, rs, w, w2;
    w = o.size;
    w2 = w / 2;
    el = document.getElementById(o.holder);
    bgSrc = el.getAttribute("data-clock");
    el.style.width = w + "px";
    el.style.height = w + "px";
    r = Raphael(o.holder, w, w);
    Raphael.getColor.reset();
    rs = r.set();
    bg = r.image(bgSrc, 0, 0, w, w);
    arrow3 = r.rect(w2 - w / 80, w2 - w / 15, w / 40, w * 2 / 5, w / 40).attr({
        fill: "#000",
        stroke: "none"
    });
    arrow2 = r.rect(w2 - w / 72, w2 - w / 20, w / 36, w / 3, w / 36).attr({
        fill: "#000",
        stroke: "none"
    });
    arrow1 = r.rect(w2 - w / 48, w2 - w / 25, w / 24, w / 5, w / 24).attr({
        fill: "#000",
        stroke: "none"
    });
    rs.push(bg);
    rs.push(arrow1);
    rs.push(arrow2);
    rs.push(arrow3);
    return setInterval(function() {
        var d, h, m, s;
        d = new Date();
        h = (d.getHours() % 12 * 30 + 180) % 360 + d.getMinutes() / 2;
        m = (d.getMinutes() * 6 + 180) % 360;
        s = (d.getSeconds() * 6 + 180) % 360;
        if (h === 0) {
            arrow1.attr({
                transform: "r0 " + w2 + " " + w2
            });
        } else {
            arrow1.animate({
                transform: "r" + h + " " + w2 + " " + w2
            }, 600, "jswing");
        }
        if (m === 0) {
            arrow2.attr({
                transform: "r0 " + w2 + " " + w2
            });
        } else {
            arrow2.animate({
                transform: "r" + m + " " + w2 + " " + w2
            }, 600, "jswing");
        }
        if (s === 0) {
            return arrow3.attr({
                transform: "r0 " + w2 + " " + w2
            });
        } else {
            return arrow3.animate({
                transform: "r" + s + " " + w2 + " " + w2
            }, 400, "bounce");
        }
    }, 1000);
});
