let index = 0
let refs = new Array()

function addRef(ref) {
    index += 1
    refs.push(ref)
}

const conrgatsDelay = 1500
const nextDelay = 2500

function showNext() {
    index -= 1
    let nextRef = refs[index]
    if (nextRef) {
        document.getElementById("reference-flow").prepend(nextRef)
        nextRef.classList.remove('hidden')
    } else {
        setTimeout(() => {
            sparkle(document.body)
            sendEmotion(false, "s:wonders")
        }, conrgatsDelay)

        setTimeout(() => {
            let b = document.createElement("div")
            b.classList.add("button-next")
            b.onclick = finishScene
            let p = document.createElement("p")
            p.innerText = "→"
            b.appendChild(p)
            document.getElementById("to-next").appendChild(b)
        }, nextDelay)
    }
}

class Reference extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {

        // current bookmarks

        let word = this.getAttribute('word')
        let bookmarks = currentBookmarks()
        let b = bookmarks.filter((b) => {return b.word == word})

        // rendering

        this.classList.add('hidden')

        const template = document.querySelector("template#bookmark-reference").content

        const shadowRoot = this.attachShadow({mode: 'open'})
            .appendChild(template.cloneNode(true));

        
        // open  

        const open = () => {
            this.classList.remove('hidden')
            this.classList.add('open')
            this.shadowRoot.querySelector('.bookmark-reference').classList.add('open')
        }

        // update bookmark if found
       
        if (b.length > 0) {

            if (b[0].researched) {
                // open if researched
                open()
            } else {
                // count this reference
                addRef(this)
            }
        }

        // click event

        this.addEventListener("click", () => {
            if (this.classList.contains('open') || refs.some((e) => {return e.classList.contains('click-block')})) {
                // if already opened or blocked -- ignore
            } else {
                open()
                researchBookmark(word)
                //sparkle(this)
                showNext()
            }
        })

    }
}

function updateRefs() {
    let focused = refs.some((r) => {return r.classList.contains('focus')})
    refs.forEach((r) => {
        if (!r.classList.contains('open')) {

        }
    })
}


function randint(b) {
    return Math.floor(Math.random()*b)
}

const sparkle_offset = 10;
const DESTROY_TIMEOUT = 1000;

function sparkle(elem) {
    elem.classList.add('click-block')
    console.log('sparkle!')
    let rect = elem.getBoundingClientRect();
    let canvas = document.createElement('canvas');
    let true_width = rect.right - rect.left;
    let true_height = rect.bottom - rect.top;
    canvas.width = true_width + 2*sparkle_offset;
    canvas.height = true_height + 2*sparkle_offset;
    canvas.style.left = (rect.left - sparkle_offset)+"px";
    canvas.style.top = (rect.top - sparkle_offset)+"px";
    canvas.style.zIndex = 10;
    canvas.style.position = 'absolute';
    document.body.appendChild(canvas);

    let ctx = canvas.getContext('2d');

    let particles = new Array();

    for (i=0;i<100;i++) {
        particles.push({
            x: Math.random()*true_width + sparkle_offset,
            y: Math.random()*true_height + sparkle_offset,
            color: "rgb(" + randint(256) + "," + randint(256) + "," + randint(256) + ")"
        })
    }

    let velocity = 0.002;

    let play = true;

    let prev = null;

    step = (cur) => {

        if (prev == null) {
            prev = cur
        }
        
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        particles.forEach((p) => {
            ctx.fillStyle = p.color
            ctx.fillRect(p.x, p.y, 4, 4)

            p.x += (p.x-true_width/2-sparkle_offset)*velocity*(cur-prev)
            p.y += (p.y-true_height/2-sparkle_offset)*velocity*(cur-prev)
        })

        prev = cur;
        if (play) {window.requestAnimationFrame(step)}
    }

    window.requestAnimationFrame(step)
    setTimeout(() => {
        play = false
        document.body.removeChild(canvas)
        elem.classList.remove('click-block')
    }, DESTROY_TIMEOUT)
}

customElements.define('bookmark-reference', Reference);