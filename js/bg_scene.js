var imgl = new Image(),
    imgr = new Image();

var emotions = {};

var redraw = true;

function udpateParams() {
    var height = window.innerHeight;
    var width = window.innerWidth;
}

function preloadImages() {
    imgl.src = document.querySelector('.emotions img.left').src;
    imgr.src = document.querySelector('.emotions img.right').src;
    for (let img_node of document.querySelector('.emotions').children) {
        img = new Image();
        img.src = img_node.src;
        emotions[emoindex(img_node)] = img;
        console.log('preload', img)
    }
    imgl.onload = function () {setBg();};
}

function getEmotion(emoname) {
    img = new Image();
    src = document.querySelector(".emotions img[emotion='"+emoname+"']").src;
    img.src = src;
    return img;
}

const dividerThickness = 4;
var step = 30;
var stepOffset = 0;

var c = document.createElement('canvas');
var cl = document.createElement('canvas');
var cr = document.createElement('canvas');

var height = window.innerHeight;
var width = window.innerWidth;

function drawFrame() {
    cr.width = (width-dividerThickness)/2 + step + stepOffset;
    cr.height = height;
    crx = cr.getContext('2d');
    crx.beginPath();
    crx.moveTo(0, height);
    crx.lineTo(cr.width, height);
    crx.lineTo(cr.width, 0);
    crx.lineTo(2*step, 0);
    crx.closePath();
    crx.clip();

    c.classList.add('scene');
    c.width = width;
    c.height = height;

    cl.width = (width-dividerThickness)/2 + step - stepOffset;
    cl.height = height;
    clx = cl.getContext('2d');
    clx.beginPath();
    clx.moveTo(0, 0);
    clx.lineTo(cl.width, 0);
    clx.lineTo(cl.width-2*step, height);
    clx.lineTo(0, height);
    clx.closePath();
    clx.clip();
}

var moveX = 0;
var moveY = 0;

const drag = 40;

function draw() {
    var scale = Math.max(height/imgr.height, width/imgr.width);

    var ctx = c.getContext('2d');
    
    ctx.beginPath();
    ctx.rect(0, 0, width, height);
    ctx.fillStyle = "#152424";
    ctx.fill();

    clx.drawImage(imgl, -drag*moveX - drag, -drag*moveY - drag, imgl.width*scale+drag, height+drag);
    crx.drawImage(imgr, cr.width-(imgr.width*scale)+drag*moveX, drag*moveY, imgr.width*scale+drag, height+drag);

    ctx.drawImage(cl, 0, 0);
    ctx.drawImage(cr, width-cr.width, 0);
}

function moveBg(e) {
    var rect = e.currentTarget.getBoundingClientRect();
    moveX = (e.clientX-rect.left)/width-0.5;
    moveY = (e.clientY-rect.top)/height-0.5;
}


function setBg() {
    
    drawFrame();
    updateBG();
    
    document.body.style.width = window.innerWidth;
    document.body.style.height = window.innerHeight;

    document.body.appendChild(c);

    document.body.addEventListener("mousemove", moveBg);
    
}

function finishScene() {
    document.body.removeEventListener("mousemove", moveBg);
    redraw = false;
    bg_canvas = document.querySelector('canvas.scene');
    bg_canvas.classList.add('blured');
}

function updateEmotion(left, emoIndex) {
    img = emotions[emoIndex];
    console.log('emotion update', left, emoIndex, img);
    if (left) {
        imgl = img;
    } else {
        imgr = img;
    }
}

function updateBG() {
    draw();
    if (redraw) {requestAnimationFrame(updateBG);}
}


