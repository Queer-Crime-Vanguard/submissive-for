let sound_cache = {}

let sound_volume = -10;

function cacheSound(name, callback = () => {}) {
    let player = new Tone.Player('assets/sound/'+name+'.ogg', callback).toDestination()
    sound_cache[name] = player
    return player
}

function playSound(name, volume=0) {
    let player = sound_cache[name]

    if (player == null) {
        player = cacheSound(name, () => {player.start()})
    } else {
        player.start()
    }

    player.volume.value = sound_volume+volume

}

['typing', 'notif', 'powerup', 'consume', 'absorb3'].forEach((n) => {cacheSound(n)})