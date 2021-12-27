let gradient = null;

class GradientAnimation {
  constructor() {
    this.cnv        = document.querySelector(`canvas.bg`);
    this.ctx        = this.cnv.getContext(`2d`);

    this.circlesNum = 25;
    this.minRadius  = 350;
    this.maxRadius  = 450;
    this.speed      = .02;
    
    (window.onresize = () => {
      this.setCanvasSize();
      this.createCircles();
    })();
    this.drawAnimation();

  }
  setCanvasSize() {
    this.w = this.cnv.width  = innerWidth * devicePixelRatio;
    this.h = this.cnv.height = innerHeight * devicePixelRatio;
    this.ctx.scale(devicePixelRatio, devicePixelRatio)
  }
  createCircles() {
    this.circles = [];
    for (let i = 0 ; i < this.circlesNum ; ++i) {
      this.circles.push(new Circle(this.w, this.h, this.minRadius, this.maxRadius));
    }
    //this.circles.push(new GuidedCircle(this.maxRadius))
  }
  drawCircles() {
    this.circles.forEach(circle => circle.draw(this.ctx, this.speed));
  }
  clearCanvas() {
    this.ctx.clearRect(0, 0, this.w, this.h); 
  }
  drawAnimation() {
    this.clearCanvas();
    this.drawCircles();
    areq = window.requestAnimationFrame(() => this.drawAnimation());
  }
}

const colors = ["#bf1765", "#3eedcd", "#beed3e", "#a930ff", "#ff8e2b", "#27f2d7"]

class Circle {
  constructor(w, h, minR, maxR) {
    this.x = Math.random() * w;
    this.y = Math.random() * h;
    this.angle  = Math.random() * Math.PI * 2;
    this.radius = Math.random() * (maxR - minR) + minR;
    this.firstColor  = colors[Math.floor(colors.length*Math.random())];
    this.secondColor = colors[Math.floor(colors.length*Math.random())] + "00";
  }
  draw(ctx, speed) {
    this.angle += speed;
    const x = this.x + Math.cos(this.angle) * 200;
    const y = this.y + Math.sin(this.angle) * 200;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, this.radius);
          gradient.addColorStop(0, this.firstColor);
          gradient.addColorStop(1, this.secondColor);

    ctx.globalCompositeOperation = `new-content`;
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, this.radius, 0, Math.PI * 2);
    ctx.fill(); 
  }
}

class GuidedCircle {
    constructor(radius) {
      this.radius = radius;
      this.firstColor  = colors[Math.floor(colors.length*Math.random())] + "77";
      this.secondColor = colors[Math.floor(colors.length*Math.random())] + "00";
    }
    draw(ctx, speed) {
      const x = mouseOffsetX
      const y = mouseOffsetY

      const gradient = ctx.createRadialGradient(x, y, 0, x, y, this.radius);
            gradient.addColorStop(0, this.firstColor);
            gradient.addColorStop(1, this.secondColor);
  
      ctx.globalCompositeOperation = `overlay`;
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, this.radius, 0, Math.PI * 2);
      ctx.fill(); 
    }
  }

startGradient = () => {
  gradient = new GradientAnimation();
}
