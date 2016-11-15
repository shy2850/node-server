'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* global document window requestAnimationFrame */

var qs = document.querySelector.bind(document);

var Clock = function () {
  function Clock() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$time = _ref.time,
        time = _ref$time === undefined ? new Date() : _ref$time,
        _ref$r = _ref.r,
        r = _ref$r === undefined ? 100 : _ref$r,
        _ref$holder = _ref.holder,
        holder = _ref$holder === undefined ? 'body' : _ref$holder,
        _ref$scale = _ref.scale,
        scale = _ref$scale === undefined ? window.devicePixelRatio || 2 : _ref$scale;

    _classCallCheck(this, Clock);

    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');

    this.canvas.style.width = this.canvas.style.height = r + 'px';
    this.canvas.width = this.canvas.height = r * scale;

    this.renderCanvas(holder);
    this.draw(r, time);
  }

  _createClass(Clock, [{
    key: 'renderCanvas',
    value: function renderCanvas(dom) {
      qs(dom).appendChild(this.canvas);
    }
  }, {
    key: 'draw',
    value: function draw(r) {
      var _this = this;

      var startTime = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new Date();

      this.ctx.clearRect(0, 0, 2 * r, 2 * r);

      // 画圆
      this.ctx.lineWidth = 4;
      this.ctx.beginPath();
      this.ctx.arc(r, r, r - 2, 0, Math.PI * 2);
      this.ctx.closePath();
      this.ctx.stroke();
      this.ctx.save();

      this.ctx.beginPath();
      this.ctx.translate(r, r);
      this.ctx.lineWidth = 2;
      // 刻度
      for (var i = 0; i < 60; i += 1) {
        if (i % 5) {
          this.ctx.moveTo(0.9 * r, 0);
        } else {
          this.ctx.moveTo(0.8 * r, 0);
        }
        this.ctx.lineTo(r, 0);
        this.ctx.rotate(Math.PI / 30);
      }
      this.ctx.stroke();
      this.ctx.restore();
      this.ctx.save();

      var time = new Date(startTime);
      time = Object.prototype.toString.call(time).slice(8, -1).toLowerCase() === 'date' ? time : new Date();
      var h = time.getHours();
      var m = time.getMinutes();
      var s = time.getSeconds();
      var ss = s + time.getTime() % 1000 / 1000;

      this.ctx.beginPath();
      this.ctx.lineWidth = 3; // 时针
      this.ctx.radius = 3;
      this.drawLine(Math.PI * (h / 6 + m / 360), 0.5 * r, r);
      this.ctx.lineWidth = 2; // 分针
      this.drawLine(Math.PI * (m / 30 + ss / 1800), 0.7 * r, r);
      this.ctx.lineWidth = 1; // 秒针
      this.drawLine(Math.PI * ss / 30, 0.85 * r, r);

      window.requestAFrame(function () {
        _this.draw(r);
      });
    }
  }, {
    key: 'drawLine',
    value: function drawLine(deg, length, r) {
      var x = length * Math.cos(deg - Math.PI / 2) + r;
      var y = length * Math.sin(deg - Math.PI / 2) + r;
      this.ctx.moveTo(r, r);
      this.ctx.lineTo(x, y);
      this.ctx.stroke();
    }
  }]);

  return Clock;
}();

// export default Clock;

window.Clock = Clock;
