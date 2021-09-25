function bg_audio(name) {
    let a = new Audio('assets/music/'+name+'.mp3')
    a.volume = 0;
    a.loop = true;
    return a
}

let mus_vibes = ['basic', 'nervous', 'insight', 'calm']

let bgmusic = {
    basic: bg_audio('basic'),
    nervous: bg_audio('nervous'),
    insight: bg_audio('insight'),
    calm: bg_audio('calm')
}

let current_vibe = 'basic';

let started = false;

function startBgMusic() {
    if (!started) {
        mus_vibes.forEach(
            (vibe) => {
                bgmusic[vibe].play()
                if (vibe == current_vibe) {bgmusic[vibe].volume = 1}
            }
        )
        started = true;
    }
}

const crossFadeLength = 3000;
const fadeStep = 0.02;

function v_d(v, d) {
    return Math.max(Math.min(v + d, 1), 0)
}

function switchVibe(new_vibe) {
    let crossfade = true;
    setInterval(() => {
        if (crossfade) {
            bgmusic[current_vibe].volume = v_d(bgmusic[current_vibe].volume, -fadeStep)
            bgmusic[new_vibe].volume = v_d(bgmusic[new_vibe].volume, fadeStep)
        }
    }, crossFadeLength*fadeStep)
    setTimeout(() => {
        crossfade = false;
        bgmusic[current_vibe].volume = 0;
        bgmusic[new_vibe].volume = 1;
        current_vibe = new_vibe
    }, crossFadeLength)
}

document.addEventListener("play_bg_music", startBgMusic);
document.addEventListener("switch_vibe", (d) => {
    console.log('update vibe', d.detail.vibe)
    switchVibe(d.detail.vibe)})
