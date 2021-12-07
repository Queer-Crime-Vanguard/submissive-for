// atomic

function loadScene(name, callback) {
    return fetch(name + ".html")
        .then((response) => {
            return response.text();
        })
        .then(insertScene(callback));
}

let root

function parsePage(page_source) {
    root = null
    root = document.createElement('div');
    root.innerHTML = page_source;
    console.log(root)
    return root;
}

let areq = null;

const insertScene = (callback) => (page_source) => {
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

    /* insert new */
    slide_container.appendChild(body)
    return callback()
}

// scene sequence

let pages = new Array()
let currentIndex = -1;

function nextPage() {
    currentIndex += 1
    let new_page = pages[currentIndex]
    console.log('loading', new_page.name)
    return loadScene(new_page.name, new_page.onload)
}

function setPageList(newPages) {
    pages = newPages
}

document.body.addEventListener('finish_scene', () => {
    nextPage().then(endPending)
})