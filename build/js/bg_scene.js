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
    let resource
    if (left) {
        background_l.src = url
        resource = background_l
    } else {
        background_r.src = url
        resource = background_r
    }

    resource.onload = () => {console.log('bg'); updateScale()}
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

let lj = 0, rj = 0

var c = document.createElement('canvas');
c.classList.add('scene');

var cl = document.createElement('canvas');
var cr = document.createElement('canvas');

let drawLeft = true;

function updateFrame() {
    c.width = width;
    c.height = height;

    ctx = c.getContext('2d')

    updateScale()

    if (drawLeft) {

        cr.width = width/2 + step + stepOffset;
        cr.height = height;
        
        crx = cr.getContext('2d');
        crx.beginPath();
        crx.moveTo(0, height);
        crx.lineTo(cr.width, height);
        crx.lineTo(cr.width, 0);
        crx.lineTo(2*step, 0);
        crx.closePath();
        crx.clip();

        cl.width = width/2 + step - stepOffset;
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

const scale_eps = 0.02
var width_bl, width_sl, width_br, width_sr, t_height
const wscale = (sp) => {return sp.width*((t_height)/sp.height)}

let ctx, clx, crx

function draw1(totalTime) {
    // background
    ctx.drawImage(background_r, width-width_br, -drag, width_br, t_height);
    ctx.drawImage(background_r, drag*moveX*0.5 + width-width_br, -drag, width_br, t_height);

    // sprite
    ctx.drawImage(sprite_r, drag*moveX-drag + width-width_sr, drag*moveY*0.2-drag, width_sr, t_height)

    // foregrounds
    foreground_r.forEach((f) => {
        ctx.drawImage(f, drag*moveX*1.3 + width-width_br + rOffset, -drag, width_br, t_height);
    })
}

const drag_intensity = 0.001;

function draw2(totalTime) {
    
    // backgrounds
    clx.drawImage(background_l, -drag*moveX*0.5 - drag - lOffset, - drag, width_bl, t_height);
    crx.drawImage(background_r, drag*moveX*0.5 + cr.width-width_br + rOffset, -drag, width_br, t_height);

    // sprites
    clx.drawImage(sprite_l, -drag*moveX - drag - lOffset, -lj + -drag*moveY*0.2 - drag, width_sl, t_height);
    crx.drawImage(sprite_r, drag*moveX + rOffset - width_sr + cr.width, -rj + drag*moveY*0.2-drag, width_sr, t_height)

    // foregrounds
    foreground_l.forEach((f) => {
        clx.drawImage(f, -drag*moveX*1.3 - drag - lOffset, - drag, width_bl, t_height);
    })
    foreground_r.forEach((f) => {
        crx.drawImage(f, drag*moveX*1.3 + cr.width-width_br + rOffset, -drag, width_br, t_height);
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
    document.body.appendChild(c);

    foreground_l = new Array()
    foreground_r = new Array()

    drawLeft = left;

    updateFrame();
    if (left) {
        draw = draw2
    } else {
        draw = draw1
    }
    updateBG(0);
}


function animate_jump(left) {
    const delay_step = 25;
    const total_delay = 150;
    const amplitude = 20;

    const steps_amount = total_delay/delay_step;
    const step = amplitude/steps_amount;

    let timer, end

    if (left) {
        timer = setInterval(() => {lj += step}, delay_step)
        end = () => {lj = 0}
    } else {
        timer = setInterval(() => {rj += step}, delay_step)
        end = () => {rj = 0}
    }

    setTimeout(() => {clearInterval(timer); end()}, total_delay)
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
*/

function updateScale() {
    updateWindowParams()
    t_height = height + 2*drag
    width_br = wscale(background_r)
    width_bl = wscale(background_l)
    width_sr = wscale(sprite_r)
    width_sl = wscale(sprite_l)
}

function updateEmotion(left, emoIndex) {
    img = getEmotion(emoIndex);
    updateScale()
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
    dir = e.detail.isleft ? 1 : -1
    if (e.detail.jump) {animate_jump(e.detail.isleft)}
})

function updateBG(totalTime) {
    draw(totalTime);
    areq = requestAnimationFrame(updateBG);
}

function setBg(left = true, solid = false) {
    window.addEventListener("loaded", () => {
        if (solid) {
            initSolidBg()
        } else {
            initBg(left)
        }})
    window.addEventListener("size_update", updateFrame);
}

