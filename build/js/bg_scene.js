let sprite_l = new Image(),
    sprite_r = new Image();

let background_l = new Image(),
    background_r = new Image()

let foreground_l = new Array(),
    foreground_r = new Array()

let source_width = 1;
let source_height = 1;

let emotions = {};

function preloadEmotions(metas) {
    metas.forEach((meta) => {
        img = new Image();
        img.src = "assets/sprites/" + meta.getAttribute('speaker') + "_" + meta.getAttribute('emotion') + ".svg"
        emotions[emoindex(meta)] = img;
    })
}

function preloadBackground(left, speaker) {
    url = "assets/backgrounds/" + speaker + "_background.svg";
    if (left) {
        background_l.src = url
    } else {
        background_r.src = url
        background_r.onload = () => {
            source_width = background_r.width;
            source_height = background_r.height;
            console.log('source size', source_width, source_height)
        }
    }
}

function addForeground(left, speaker, name) {
    if (name == null) {return}
    img = new Image()
    img.src =  "assets/backgrounds/" + speaker + "_" + name + ".svg"
    if (left) {
        foreground_l.push(img)
    } else {
        foreground_r.push(img)
    }
}

function getEmotion(emoind) {
    if (emoind in emotions) {
        return emotions[emoind];
    } else {
        img = new Image();
        img.src = "assets/sprites/" + emoind.split(':')[0] + "_" + emoind.split(':')[1] + ".svg"
        return img
    }
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

let drawLeft = true;

function updateFrame() {
    c.classList.add('scene');
    c.width = width;
    c.height = height;

    cr.width = width/2 + step + stepOffset;
    cr.height = height;
    
    let crx = cr.getContext('2d');
    crx.beginPath();
    crx.moveTo(0, height);
    crx.lineTo(cr.width, height);
    crx.lineTo(cr.width, 0);
    crx.lineTo(2*step, 0);
    crx.closePath();
    crx.clip();

    if (drawLeft) {
        cl.width = width/2 + step - stepOffset;
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
}

const drag = 20;

// scroll parallaxing 
/*
    let bubble_box = document.querySelector('#bubble-box')
    let bubble_height = parseInt(window.getComputedStyle(bubble_box).getPropertyValue('height'), 10);

    let t = -bubble_box.scrollTop/(bubble_box.scrollHeight-bubble_height+1);
    
    let moveX = t - 0.5
    let moveY = t - 0.5
*/

let scale = (sp_height) => {return (height+2*drag)/sp_height}

function draw1(totalTime) {
    let ctx = c.getContext('2d');   

    ctx.drawImage(background_r, width-(background_r.width*scale(background_r.height))+drag*moveX, drag*moveY-drag, source_width*scale(background_r.height)+drag, height+2*drag);
    ctx.drawImage(sprite_r, cr.width*2-(sprite_r.width*scale(sprite_r.height))+drag*moveX + rOffset, drag*moveY-drag, sprite_r.width*scale(sprite_r.height)+drag, height+2*drag);
}

const drag_intensity = 0.001;

function draw2(totalTime) {
    let ctx = c.getContext('2d')
    
    let clx = cl.getContext('2d')
    let crx = cr.getContext('2d')

    // backgrounds
    clx.drawImage(background_l, -drag*moveX*0.5 - drag - lOffset, - drag, source_width*scale(background_l.height)+drag, height+2*drag);
    crx.drawImage(background_r, drag*moveX*0.5 + cr.width-(background_r.width*scale(background_r.height)) + rOffset, -drag, source_width*scale(background_r.height)+drag, height+2*drag);

    // sprites
    clx.drawImage(sprite_l, -drag*moveX - drag - lOffset, -drag*moveY*0.5 - drag, sprite_l.width*scale(sprite_l.height)+drag, height+2*drag);
    crx.drawImage(sprite_r, drag*moveX + rOffset - source_width*scale(sprite_r.height)-drag + cr.width, drag*moveY*0.5-drag, source_width*scale(sprite_r.height)+drag, height+2*drag)

    // foregrounds
    foreground_l.forEach((f) => {
        clx.drawImage(f, -drag*moveX*1.3 - drag - lOffset, - drag, source_width*scale(background_l.height)+drag, height+2*drag);
    })
    foreground_r.forEach((f) => {
        crx.drawImage(f, drag*moveX*1.3 + cr.width-(background_r.width*scale(background_r.height)) + rOffset, -drag, source_width*scale(background_r.height)+drag, height+2*drag);
    })

    // draw frames
    ctx.drawImage(cl, 0, 0);
    ctx.drawImage(cr, width-cr.width, 0);

    // draw nice line
    ctx.beginPath();
    ctx.moveTo(width/2 + step, 0);
    ctx.strokeStyle = "#152424";
    ctx.lineWidth = dividerThickness;
    ctx.lineTo(width/2 - step, height);
    ctx.stroke();
}

let draw = null;

function initBg(left) {
    
    document.body.style.width = width;
    document.body.style.height = height;

    //stepOffsetAmp = document.getElementById("dialogue-box").offsetWidth*0.3

    document.body.appendChild(c);

    drawLeft = left;

    updateFrame();
    if (left) {
        draw = draw2
    } else {
        draw = draw1
    }
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
}


document.addEventListener("update_emotion", (e) => {
    updateEmotion(e.detail.isleft, e.detail.emotion_index);
})

function updateBG(totalTime) {
    draw(totalTime);
    requestAnimationFrame(updateBG);
}

function setBg(left = true) {
    window.addEventListener("loaded", () => {initBg(left)});
    window.addEventListener("size_update", updateFrame);
}

