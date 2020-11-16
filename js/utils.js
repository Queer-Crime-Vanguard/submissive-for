function emoindex(meta) {
    speaker = meta.getAttribute('speaker');
    emotion = meta.getAttribute('emotion');
    return speaker+':'+emotion;
}
