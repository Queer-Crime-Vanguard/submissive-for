var c = document.createElement('canvas');

var frameArray = [];
var totalFrames = 0;
var currentFrameIndex = 0;
var currentFrame = null;

function preloadImages() {
    bg = document.querySelector('components #background');
    frameInterval = bg.getAttribute("interval") || 1000;
    document.querySelectorAll('components #background img').forEach(
        img => {
            new_img = new Image();
            new_img.src = img.src;
            console.log("preload", img.src);
            frameArray.push(new_img);
            totalFrames += 1;
            }
    );
}

function drawSolid(totalTime) {
    let frameNum = Math.floor(totalTime/frameInterval)
    let frameIndex = frameNum % totalFrames
    let currentFrame = frameArray[frameIndex]

    console.log(totalTime, frameNum, frameIndex, currentFrame)

    var scale = Math.max((height+2*drag)/currentFrame.height, (width+2*drag)/currentFrame.width);

    var ctx = c.getContext('2d');

    ctx.canvas.width = width;
    ctx.canvas.height = height;
    
    ctx.beginPath();
    ctx.rect(0, 0, width, height);
    ctx.fillStyle = "#152424";
    ctx.fill();

    ctx.drawImage(currentFrame, -drag*moveX - drag, -drag*moveY - drag, currentFrame.width*scale, height+2*drag);
}

function initSolidBg() {
    draw = drawSolid

    preloadImages();

    c.classList.add("scene");
    
    updateBG(0);
    document.body.style.width = window.innerWidth;
    document.body.style.height = window.innerHeight;

    document.body.appendChild(c);
    
}
