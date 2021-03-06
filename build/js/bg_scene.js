let sprite_l, sprite_r

let background_l, background_r

let foreground_l, foreground_r

let overlapMode = false

let drawLeft

let emotions = {}

let c, cl, cr
let ctx, clx, crx

cl = document.createElement('canvas')
cr = document.createElement('canvas')

crx = cr.getContext('2d')
clx = cl.getContext('2d')

function clearBg() {
    //c = document.createElement('canvas')

    sprite_l = new Image()
    sprite_r = new Image()

    background_l = new Image()
    background_r = new Image()

    foreground_l = new Array()
    foreground_r = new Array()
}

function preloadEmotions(metas) {
    emotions = null
    emotions = {}
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

    resource.onload = () => {updateScale()}
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

const slopeTg = 0.1
let slopeStep

let stepOffset = 0;
let stepOffsetAmp
const offset_delay = 300;

const side_offset = 50;

var lOffset = side_offset;
var rOffset = side_offset;

let lj = 0, rj = 0

function updateFrame() {
    c.width = width;
    c.height = height;

    ctx = c.getContext('2d')
    ctx.strokeStyle = "#152424";
    ctx.lineWidth = dividerThickness;

    updateScale()

    if (drawLeft) {

        cr.width = Math.max(width/2 + slopeStep - stepOffset, 1);
        cr.height = height;

        crx.beginPath();
        crx.moveTo(0, height);
        crx.lineTo(cr.width, height);
        crx.lineTo(cr.width, 0);
        crx.lineTo(2*slopeStep, 0);
        crx.closePath();
        crx.clip();

        cl.width = Math.max(width/2 + slopeStep + stepOffset, 1);
        cl.height = height;

        clx.beginPath();
        clx.moveTo(0, 0);
        clx.lineTo(cl.width, 0);
        clx.lineTo(cl.width-2*slopeStep, height);
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

function draw1(totalTime) {
    // background
    ctx.drawImage(background_r, 0, -drag, width_br, t_height);
    ctx.drawImage(background_r, drag*moveX*0.5 + width-width_br + widthPenalty/2, -drag, width_br, t_height);

    // sprite
    ctx.drawImage(sprite_r, drag*moveX-drag + width-width_sr + widthPenalty/2, drag*moveY*0.2-drag, width_sr, t_height)

    // foregrounds
    foreground_r.forEach((f) => {
        ctx.drawImage(f, drag*moveX*1.3 + width-width_br + widthPenalty/2, -drag, width_br, t_height);
    })
}

const drag_intensity = 0.001;

function draw2(totalTime) {
    
    // backgrounds
    clx.drawImage(background_l, -drag*moveX*0.5 - drag - lOffset - widthPenalty/2, - drag, width_bl, t_height);
    crx.drawImage(background_r, drag*moveX*0.5 + cr.width-width_br + rOffset + widthPenalty/2, -drag, width_br, t_height);

    // sprites
    clx.drawImage(sprite_l, -drag*moveX - drag - lOffset - widthPenalty/2, -lj + -drag*moveY*0.2 - drag, width_sl, t_height);
    crx.drawImage(sprite_r, drag*moveX + rOffset - width_sr + cr.width + widthPenalty/2, -rj + drag*moveY*0.2-drag, width_sr, t_height)

    
    // foregrounds
    foreground_l.forEach((f) => {
        clx.drawImage(f, -drag*moveX*1.3 - drag - lOffset - widthPenalty/2, - drag, width_bl, t_height);
    })
    foreground_r.forEach((f) => {
        crx.drawImage(f, drag*moveX*1.3 + cr.width-width_br + rOffset + widthPenalty/2, -drag, width_br, t_height);
    })
    

    // draw frames
    ctx.drawImage(cl, 0, 0);
    ctx.drawImage(cr, width-cr.width, 0);

    // draw nice line
    ctx.beginPath();
    ctx.moveTo(width/2 + slopeStep + stepOffset, 0);
    ctx.lineTo(width/2 - slopeStep + stepOffset, height);
    ctx.stroke();   
}

let draw = null;

function initBg(left, solid) {
    /*
 
    */

    c = document.querySelector("canvas#background")
    if (c == null) {
        let container = document.getElementById("slide-container")
        if (container == null) {
            container = document.body
        }
        c = document.createElement('canvas')
        c.setAttribute('id', 'background')
        container.appendChild(c)
    }
    c.setAttribute('class', 'scene')
    ctx = c.getContext('2d')

    drawLeft = left

    updateFrame();

    if (solid) {
        draw = drawSolid
    } else if (left) {
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

let widthPenalty = 0

const spriteCharacterProportion = 0.4

let hideLeft = false
let dir = 0

const minOffsetAmp = 100

function updateScale() {
    updateWindowParams()
    t_height = height + 2*drag
    width_br = wscale(background_r)
    width_bl = wscale(background_l)
    width_sr = wscale(sprite_r)
    width_sl = wscale(sprite_l)

    slopeStep = height*slopeTg

    let characterNeededSpace = spriteCharacterProportion*width_sr
    let freeSideSpace = width/2 - slopeStep

    widthPenalty = Math.max(0, characterNeededSpace-width)

    // step offset amplitude for enough sprite space
    stepOffsetAmp = Math.max(characterNeededSpace-freeSideSpace, 0) || 0
    if (stepOffsetAmp < minOffsetAmp) {stepOffsetAmp = 0}

    // fix stepOffset on updateScale
    stepOffset = Math.sign(stepOffset)*Math.min(Math.abs(stepOffset), stepOffsetAmp)

    overlapMode = stepOffsetAmp > 0

    if (hideLeft) {stepOffsetAmp = width/2 + slopeStep}
}

function updateEmotion(left, emoIndex) {
    img = getEmotion(emoIndex);
    updateScale()
    if (left) {
        sprite_l = img;
    } else {
        sprite_r = img;
    }
}

let prevTime = 0

function moveOffset(totalTime) {

    let _step = stepOffsetAmp*(totalTime - prevTime)/offset_delay

    stepOffset += dir*_step

/*
    const target = dir*stepOffsetAmp

    const stepAmount = 10;
    const step = (target-stepOffset)/stepAmount

    let timer = setInterval(() => {
        stepOffset = dir*Math.min(dir*(stepOffset+step), stepOffsetAmp)
        updateFrame()
    }, offset_delay/stepAmount);

    setTimeout(() => {
        clearInterval(timer)
        stepOffset = target
        updateFrame()
    }, offset_delay)
*/

    updateFrame()
}

document.addEventListener("update_emotion", (e) => {
    updateEmotion(e.detail.isleft, e.detail.emotion_index);
    dir = e.detail.isleft ? 1 : -1
    if (e.detail.jump) {animate_jump(e.detail.isleft)}
})

function updateBG(totalTime) {
    if (dir*stepOffset < stepOffsetAmp) {moveOffset(totalTime)}
    draw(totalTime)
    prevTime = totalTime
    areq = requestAnimationFrame(updateBG);
}

function setBg(left = true, solid = false) {
    clearBg()
    initBg(left, solid)
    window.addEventListener("size_update", updateFrame);
}

