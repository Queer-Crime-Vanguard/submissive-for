const stopAnimation = () => {window.cancelAnimationFrame(areq)}
const stopMusic = () => {document.dispatchEvent(new Event('stop_playing'))}

const Pages = {
    scene: (v) => {return {
        name: "scene"+v,
        onload: () => {stopAnimation(); stopMusic(); setBg(); initializeDialogue(); startVibe(); addChatListeners()},
        ondestroy: () => {removeChatListeners()}
    }},

    single: (name) => { return {
        name,
        onload: () => {stopAnimation(); stopMusic(); setBg(false); initializeDialogue(); startVibe(); addChatListeners(); document.querySelector('.slide').addEventListener("click", chatProceed)},
        ondestroy: () => {removeChatListeners()}
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
        onload: () => {stopAnimation(); stopMusic(); preloadImages(); setBg(false, true); showReflection(); playMusic('flashback', -15)}
    },

    soup_game: {
        name: "soup_game",
        onload: () => {stopAnimation(); stopMusic(); startSoupGame()}
    },

    network: (person) => { return {
        name: "network/"+person,
        onload: () => {stopMusic()}
    }}
}