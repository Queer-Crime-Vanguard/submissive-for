function vibe_audio(name) {
    let a = new Audio('assets/music/vibes/'+name+'.mp3')
    a.volume = 0;
    a.loop = true;
    return a
}

let current_playing = new Array();

let mus_vibes = ['basic', 'nervous', 'insight', 'calm']

let vibes_audio = {
    basic: vibe_audio('basic'),
    nervous: vibe_audio('nervous'),
    insight: vibe_audio('insight'),
    calm: vibe_audio('calm')
}

let current_vibe = 'basic';

let music_audio = {}

function playMusic(name, volume=1) {
    let a = music_audio[name]
    if (a == null) {
        a = new Audio('assets/music/'+name+'.mp3')
        music_audio[name] = a
    }
    current_playing.push(a)
    a.volume = volume
    a.play()
}

function startVibe() {
    mus_vibes.forEach(
        (vibe) => {
            let a = vibes_audio[vibe]
            a.play()
            if (vibe == current_vibe) {a.volume = 1}
            current_playing.push(a)
        }
    )
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
            vibes_audio[current_vibe].volume = v_d(vibes_audio[current_vibe].volume, -fadeStep)
            vibes_audio[new_vibe].volume = v_d(vibes_audio[new_vibe].volume, fadeStep)
        }
    }, crossFadeLength*fadeStep)
    setTimeout(() => {
        crossfade = false;
        vibes_audio[current_vibe].volume = 0;
        vibes_audio[new_vibe].volume = 1;
        current_vibe = new_vibe
    }, crossFadeLength)
}

function stopPlaying() {
    current_playing.forEach((a) => {a.pause()})
    current_playing = new Array()
}

document.addEventListener("play_vibe", startVibe)
document.addEventListener("switch_vibe", (d) => {
    console.log('update vibe', d.detail.vibe)
    switchVibe(d.detail.vibe)})
document.addEventListener("stop_playing", stopPlaying)
