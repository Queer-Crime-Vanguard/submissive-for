function vibe_audio(name) {
    let a = new Tone.Player('assets/music/vibes/'+name+'.mp3').toDestination();
    a.volume.value = -30
    a.volume.mute = true;

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

function playMusic(name, volume=0) {
    let a = music_audio[name]
    if (a == null) {
        a = new Tone.Player('assets/music/'+name+'.mp3').toDestination()
        a.volume.value = volume
        music_audio[name] = a
        Tone.loaded().then(() => {a.start()})
    } else {
        a.volume.value = volume
        a.start()
    }
    current_playing.push(a)
}

const crossFadeDelay = 2
const startStopDelay = 1

function startVibe() {
    Tone.loaded().then(() => {
        mus_vibes.forEach(
            (vibe) => {
                let a = vibes_audio[vibe]
                a.start()
                if (vibe == current_vibe) {
                    a.volume.value = -30
                    a.volume.mute = false
                    a.volume.rampTo(0, startStopDelay)
                }
                current_playing.push(a)
            }
        )
    });
}

function v_d(v, d) {
    return Math.max(Math.min(v + d, 1), 0)
}

function switchVibe(new_vibe) {
    vibes_audio[new_vibe].volume.rampTo(0, crossFadeDelay)
    vibes_audio[current_vibe].volume.rampTo(-30, crossFadeDelay)
    setTimeout(() => {vibes_audio[current_vibe].volume.mute = true}, crossFadeDelay)
    current_vibe = new_vibe
}

function stopPlaying() {
    current_playing.forEach((a) => {
        a.stop("+"+startStopDelay)
        a.volume.rampTo(-30, startStopDelay)
    })
    current_playing = new Array()
}

document.addEventListener("play_vibe", startVibe)
document.addEventListener("switch_vibe", (d) => {
    console.log('update vibe', d.detail.vibe)
    switchVibe(d.detail.vibe)})
document.addEventListener("stop_playing", stopPlaying)
