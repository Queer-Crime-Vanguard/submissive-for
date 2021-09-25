let refs = new Array()

class Reference extends HTMLElement {
    constructor() {
        super();

        setTimeout(() => {
            console.log("pew")
            const template = document.body
                .querySelector("template")
                .content;
            const shadowRoot = this.attachShadow({mode: 'open'})
                .appendChild(template.cloneNode(true));
        }, 100)

        refs.push(this);
        
        this.addEventListener("click", () => {
            if (this.classList.contains('open') || refs.some((e) => {return e.classList.contains('click-block')})) {
                
            } else {
                this.classList.add('open')
                this.shadowRoot.querySelector('.bookmark-reference').classList.add('open')
                sparkle(this);
            }
        })
        console.log("constructed")
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
const DESTROY_TIMEOUT = 1500;

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