const stopAnimation = () => {window.cancelAnimationFrame(areq)}
const stopMusic = () => {document.dispatchEvent(new Event('stop_playing'))}

const Pages = {
    scene: (v) => {return {
        name: "scene"+v,
        onload: () => {stopAnimation(); stopMusic(); setBg(); initializeDialogue(); startVibe()}
    }},

    single: (name) => { return {
        name,
        onload: () => {stopAnimation(); stopMusic(); window.cancelAnimationFrame(areq); setBg(false); initializeDialogue(); startVibe(); document.querySelector('.slide').addEventListener("click", chatProceed)}
    }},

    bookmarks: {
        name: "bookmarks",
        onload: () => {stopAnimation(); setBg(false); preloadBackground(false, 's'); addForeground(false, 's', 'laptop'); sendEmotion(false, 's:neutral'); showNext()}
    },

    trigger_warning: {
        name: "trigger_warning",
        onload: () => {}
    },

    flashback: {
        name: "flashback",
        onload: () => {stopAnimation(); stopMusic(); window.cancelAnimationFrame(areq); preloadImages(); setBg(false, true); showReflection(); playMusic('flashback')}
    },

    soup_game: {
        name: "soup_game",
        onload: () => {stopAnimation(); stopMusic(); startSoupGame()}
    },

    network: (person) => { return {
        name: "network/"+person,
        onload: () => {}
    }}
}