var width, height;

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
    updateWindowParams();
    window.dispatchEvent(new Event("loaded"))
    window.dispatchEvent(new Event("size_update"))
    window.addEventListener("resize", () => {
        updateWindowParams();
        window.dispatchEvent(new Event("size_update"))
    });
    document.body.addEventListener("mousemove", trackMouse)
}
