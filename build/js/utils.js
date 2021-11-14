function emoindex(meta) {
    speaker = meta.getAttribute('speaker');
    emotion = meta.getAttribute('emotion');
    return speaker+':'+emotion;
}

function sendEmotion(isleft, emoindex, jump = false) {
    ev = new CustomEvent('update_emotion', {'detail': {isleft, 'emotion_index': emoindex, jump}})
    document.dispatchEvent(ev);
}

function sendVibe(vibe) {
    ev = new CustomEvent('switch_vibe', {'detail': {vibe}})
    document.dispatchEvent(ev);
}