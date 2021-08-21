var sprite_l = new Image(),
    sprite_r = new Image();

var background_l = new Image(),
    background_r = new Image()

var emotions = {};

let source_width = 1;
let source_height = 1;

function preloadImages() {
    background_l.src = document.querySelector('#background .left').src;
    background_r.src = document.querySelector('#background .right').src;
    background_l.onload = function () {
        source_width = background_l.width;
        source_height = background_l.height;
        setBg();
    };
}

function getEmotion(emoindex) {
    img = new Image();
    speaker_emotion = emoindex.split(":")
    img.src = "assets/sprites/" + speaker_emotion[0] + "_" + speaker_emotion[1] + ".svg";
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
    var scale = (height+2*drag)/background_r.height;

    let ctx = c.getContext('2d');
    
    ctx.beginPath();
    ctx.rect(0, 0, width, height);
    ctx.fillStyle = "#152424";
    ctx.fill();
    
    let clx = cl.getContext('2d');
    let crx = cr.getContext('2d');
    clx.drawImage(background_l, -drag*moveX - drag - lOffset, -drag*moveY - drag, source_width*scale+drag, height+2*drag);
    crx.drawImage(background_r, cr.width-(background_r.width*scale)+drag*moveX + rOffset, drag*moveY-drag, source_width*scale+drag, height+2*drag);
    //clx.drawImage(sprite_l, -drag*moveX - drag - lOffset, -drag*moveY - drag, source_width*scale+drag, height+2*drag);
    //crx.drawImage(sprite_r, cr.width-(background_r.width*scale)+drag*moveX + rOffset, drag*moveY-drag, source_width*scale+drag, height+2*drag);

    clx.drawImage(sprite_l, 0, 0);
    crx.drawImage(sprite_r, 0, 0);

    console.log(sprite_l);
    
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
    img = getEmotion(emoIndex);
    console.log('emotion update', left, emoIndex, img);
    if (left) {
        sprite_l = img;
        /*
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
        */
    } else {
        sprite_r = img;
        /*
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
        */
    }
    drawFrame();
}


document.addEventListener("update_emotion", (e) => {
    updateEmotion(e.detail.isleft, e.detail.emotion_index);
})


function updateBG() {
    draw();
    requestAnimationFrame(updateBG);
}

function setBg() {
    window.addEventListener("loaded", initBg);
    window.addEventListener("size_update", drawFrame);
}

