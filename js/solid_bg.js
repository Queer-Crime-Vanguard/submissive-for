var c = document.createElement('canvas');

const drag = 30;

var img = new Image();

function preloadImages() {
    img.src = document.querySelector('components img').src;
}

function draw() {
    var scale = Math.max((height+2*drag)/img.height, (width+2*drag)/img.width);

    var ctx = c.getContext('2d');

    ctx.canvas.width = width;
    ctx.canvas.height = height;
    
    ctx.beginPath();
    ctx.rect(0, 0, width, height);
    ctx.fillStyle = "#152424";
    ctx.fill();

    ctx.drawImage(img, -drag*moveX - drag, -drag*moveY - drag, img.width*scale, height+2*drag);
}

function setBg() {
    c.classList.add("scene");
    
    updateBG();
    
    document.body.style.width = window.innerWidth;
    document.body.style.height = window.innerHeight;

    document.body.appendChild(c);
    
}

function updateBG() {
    draw();
    requestAnimationFrame(updateBG);
}
