// atomic

function loadScene(name) {

    fetch(name)
        .then((response) => {
            return response.text();
        })
        .then(insertScene);
}

function parsePage(page_source) {
    let parser = new DOMParser();
    let doc = parser.parseFromString(page_source, 'text/html');
    return doc.body;
}

let areq = null;

function insertScene(page_source) {
    let body = parsePage(page_source) // body -> div class slide
    body.classList.add("slide")
    let slide_container = document.getElementById("slide-container")
    let slide = slide_container.querySelector('.slide')
    slide_container.removeChild(slide)
    slide_container.appendChild(body)
    if (body.classList.contains('audio')) {document.dispatchEvent(new Event('stop_playing'))}
    if (body.classList.contains('animation')) {window.cancelAnimationFrame(areq)}
    if (body.classList.contains('background')) {
        let bg = slide_container.querySelector('.background')
        if (bg) {slide_container.removeChild(bg)}
    }
    eval(body.getAttribute('onload'))
}

// scene sequence

let scenes = new Array()
let currentIndex = -1;

function nextScene() {
    currentIndex += 1
    let new_scene = scenes[currentIndex]
    console.log('loading', new_scene)
    loadScene(new_scene)
}

function loadSceneList() {
    document.getElementById("assembly-list").childNodes.forEach((n) => {
        if (n.tagName == "LI") {scenes.push(n.innerText)}
    })
}

document.body.addEventListener('finish_scene', nextScene)