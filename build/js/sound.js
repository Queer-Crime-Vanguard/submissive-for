let sound_cache = {}

function sound(name) {
    let cached = sound_cache[name]
    let res = null;
    if (cached == null) {
        res = new Audio('assets/sound/'+name+'.ogg')
        res.volume = 0.5
        sound_cache[name] = res
    } else {
        res = cached
    }
    return res
}

['typing', 'notif', 'powerup', 'consume', 'absorb3'].forEach((n) => {sound(n)})