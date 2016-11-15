/* global document window requestAnimationFrame */

const qs = document.querySelector.bind(document);

class Clock {
  constructor({
      time = new Date(),
      r = 100,
      holder = 'body',
      scale = window.devicePixelRatio || 2,
    } = {}) {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');

    this.canvas.style.width = this.canvas.style.height = `${r}px`;
    this.canvas.width = this.canvas.height = r * scale;

    this.renderCanvas(holder);
    this.draw(r, time);
  }

  renderCanvas(dom) {
    qs(dom).appendChild(this.canvas);
  }

  draw(r, startTime = new Date()) {
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
    for (let i = 0; i < 60; i += 1) {
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

    let time = new Date(startTime);
    time = Object.prototype.toString.call(time).slice(8, -1).toLowercase() === 'date'
           ? time
           : new Date();
    const h = time.getHours();
    const m = time.getMinutes();
    const s = time.getSeconds();
    const ss = s + ((time.getTime() % 1000) / 1000);

    this.ctx.beginPath();
    this.ctx.lineWidth = 3;  // 时针
    this.ctx.radius = 3;
    this.drawLine(Math.PI * ((h / 6) + (m / 360)), 0.5 * r, r);
    this.ctx.lineWidth = 2;  // 分针
    this.drawLine(Math.PI * ((m / 30) + (ss / 1800)), 0.7 * r, r);
    this.ctx.lineWidth = 1;  // 秒针
    this.drawLine((Math.PI * ss) / 30, 0.85 * r, r);

    window.requestAFrame(() => { this.draw(r); });
  }

  drawLine(deg, length, r) {
    const x = (length * Math.cos(deg - (Math.PI / 2))) + r;
    const y = (length * Math.sin(deg - (Math.PI / 2))) + r;
    this.ctx.moveTo(r, r);
    this.ctx.lineTo(x, y);
    this.ctx.stroke();
  }
}

export default Clock;
