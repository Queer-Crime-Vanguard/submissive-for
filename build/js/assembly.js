// atomic

let currentDestroy;

function loadScene(name, onload, ondestroy) {
    return fetch(name + ".html")
        .then((response) => {
            return response.text();
        })
        .then(insertScene(onload, ondestroy));
}

let root

function parsePage(page_source) {
    root = null
    root = document.createElement('div');
    root.innerHTML = page_source;
    return root;
}

let areq = null;

const insertScene = (onload, ondestroy) => (page_source) => {
    body = parsePage(page_source) // body -> div class slide
    body.classList.add("slide")
    let slide_container = document.getElementById("slide-container")
    let slide = slide_container.querySelector('.slide')

    /* prepare for new page */
    if (body.classList.contains('animation')) {window.cancelAnimationFrame(areq)}
    
    if (body.classList.contains('background')) {
        let bg = document.getElementById('background')
        if (bg) {slide_container.removeChild(bg)}e
        clearBg()
    }
    
    if (body.classList.contains('audio')) {document.dispatchEvent(new Event('stop_playing'))}

    /* remove */
    slide_container.removeChild(slide)
    delete slide

    /* destroy all */
    if (currentDestroy) {currentDestroy()}
    currentDestroy = ondestroy

    // ready for new `finishScene`
    endPending()

    /* insert new */
    slide_container.appendChild(body)
    return onload()
}

// scene sequence

let pages = new Array()
let currentIndex = -1;

function loadPage() {
    let new_page = pages[0]
    if (new_page) {
        return loadScene(new_page.name(), new_page.onload, new_page.ondestroy)
    }
}

function nextPage() {
    let new_page = pages[0]
    if (new_page) {
        currentIndex += 1
        saveProgress(currentIndex)
        let pageName =  new_page.name()
        console.log(pageName)
        return loadScene(pageName, new_page.onload, new_page.ondestroy)
    }
}

function setPageList(newPages) {
    pages = newPages
}

document.body.addEventListener('finish_scene', () => {
    nextPage()
})