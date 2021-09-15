function emoindex(meta) {
    speaker = meta.getAttribute('speaker');
    emotion = meta.getAttribute('emotion');
    return speaker+':'+emotion;
}

function sendEmotion(isleft, emoindex) {
    ev = new CustomEvent('update_emotion', {'detail': {'isleft': isleft, 'emotion_index': emoindex}})
    document.dispatchEvent(ev);
}