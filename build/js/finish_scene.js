const pending_delay = 200;

let pending_finish = false

function finishScene() {
    console.log('pending', pending_finish)
    if (!pending_finish) {
        pending_finish = true
        document.body.dispatchEvent(new Event("finish_scene"))
    }
}

function endPending() {
    pending_finish = false
}