var height = window.innerHeight;
var width = window.innerWidth;

function updateWindowParams() {
    height = window.innerHeight;
    width = window.innerWidth;
}

var mouseOffsetX = 0;
var mouseOffsetY = 0;

var moveX = 0;
var moveY = 0;

function trackMouse(e) {
    var rect = e.currentTarget.getBoundingClientRect();
    mouseOffsetX = e.clientX-rect.left;
    mouseOffsetY = e.clientY-rect.top;
    moveX = 2 * mouseOffsetX/width  - 1;
    moveY = 2 * mouseOffsetY/height - 1;
}

function setTrack() {
    window.addEventListener("resize", updateWindowParams);
    document.body.addEventListener("mousemove", trackMouse);
}
