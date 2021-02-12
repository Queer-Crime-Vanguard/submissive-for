var imgl = new Image(),
    imgr = new Image();

var emotions = {};

var redraw = true;

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

var stepOffsetAmp = 80;

const side_offset = 60;
const offset_delay = 300;

var lOffset = side_offset;
var rOffset = side_offset;

var c = document.createElement('canvas');
var cl = document.createElement('canvas');
var cr = document.createElement('canvas');

function drawFrame() {
    c.classList.add('scene');
    c.width = width;
    c.height = height;

    cr.width = (width-dividerThickness)/2 + step + stepOffset;
    cr.height = height;
    
    let crx = cr.getContext('2d');
    crx.beginPath();
    crx.moveTo(0, height);
    crx.lineTo(cr.width, height);
    crx.lineTo(cr.width, 0);
    crx.lineTo(2*step, 0);
    crx.closePath();
    crx.clip();

    cl.width = (width-dividerThickness)/2 + step - stepOffset;
    cl.height = height;
    
    let clx = cl.getContext('2d');
    clx.beginPath();
    clx.moveTo(0, 0);
    clx.lineTo(cl.width, 0);
    clx.lineTo(cl.width-2*step, height);
    clx.lineTo(0, height);
    clx.closePath();
    clx.clip();
}

const drag = 20;

function draw() {
    var scale = (height+2*drag)/imgr.height;

    let ctx = c.getContext('2d');
    
    ctx.beginPath();
    ctx.rect(0, 0, width, height);
    ctx.fillStyle = "#152424";
    ctx.fill();
    
    let clx = cl.getContext('2d');
    let crx = cr.getContext('2d');
    clx.drawImage(imgl, -drag*moveX - drag - lOffset, -drag*moveY - drag, img.width*scale+drag, height+2*drag);
    crx.drawImage(imgr, cr.width-(imgr.width*scale)+drag*moveX + rOffset, drag*moveY-drag, img.width*scale+drag, height+2*drag);
    
    ctx.drawImage(cl, 0, 0);
    ctx.drawImage(cr, width-cr.width, 0);
}


function initBg() {
    
    document.body.style.width = width;
    document.body.style.height = height;

    stepOffsetAmp = document.getElementById("dialogue-box").offsetWidth*0.3

    document.body.appendChild(c);

    drawFrame();
    updateBG();
    
}

function blurScene() {
    redraw = false;
    bg_canvas = document.querySelector('canvas.scene');
    bg_canvas.classList.add('blured');
}

function varyValue(value, dest, delay) {
    const delay_step = 50;
    const v_step = (dest-value)*delay_step/delay;
    let timer = setInterval(() => {value += v_step}, delay_step);
    setTimeout(() => {clearInterval(timer); value = dest;}, delay);
}

function animate(onProgress, duration) {

  let start = performance.now();

  requestAnimationFrame(function animate(time) {
    let timeFraction = (time - start) / duration;
    if (timeFraction > 1) timeFraction = 1;

    
    onProgress(timeFraction);

    if (timeFraction <= 1) {
      requestAnimationFrame(animate);
    }

  });
}

function updateEmotion(left, emoIndex) {
    img = emotions[emoIndex];
    console.log('emotion update', left, emoIndex, img);
    if (left) {
        imgl = img;
        stepOffset = -stepOffsetAmp;
        animate((progress) => {
            const start = lOffset;
            const dest = 0;
            lOffset = start + (dest-start)*progress
        }, offset_delay);
        animate((progress) => {
            const start = rOffset;
            const dest = side_offset;
            rOffset = start + (dest-start)*progress
        }, offset_delay);
    } else {
        imgr = img;
        stepOffset = stepOffsetAmp;
        animate((progress) => {
            const start = lOffset;
            const dest = side_offset;
            lOffset = start + (dest-start)*progress
        }, offset_delay);
        animate((progress) => {
            const start = rOffset;
            const dest = 0;
            rOffset = start + (dest-start)*progress
        }, offset_delay);
    }
    drawFrame();
}


document.addEventListener("update_emotion", (e) => {
    updateEmotion(e.detail.isleft, e.detail.emotion_index);
})


function updateBG() {
    draw();
    if (redraw) {requestAnimationFrame(updateBG);}
}

function setBg() {
    window.addEventListener("loaded", initBg);
    window.addEventListener("size_update", drawFrame);
}

