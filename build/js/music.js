var bgmusic = new Audio('assets/music/the_legendary_theme.ogg');
bgmusic.volume = 0.5;

function startBgMusic() {
    bgmusic.play();
}

document.addEventListener("play_bg_music", startBgMusic);
