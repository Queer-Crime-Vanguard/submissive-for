const storeGet = (k) => JSON.parse(localStorage.getItem(k))
const storeSet = (k, v) => localStorage.setItem(k, JSON.stringify(v))

function saveProgress(index) {
    storeSet('progress', index)
}

function loadProgress() {
    let progress = storeGet('progress')
    if (progress == null) {
        storeSet('progress', 0)
        return 0
    } else {
        return progress
    }
}

function rememberBookmark(word) {
    let bookmarks = storeGet('rememberedBookmarks')
    if (bookmarks == null) {bookmarks = new Array()}
    bookmarks.push(word)
    storeSet('rememberedBookmarks', bookmarks)
}

function researchBookmark(word) {
    let bookmarks = storeGet('researchedBookmarks')
    if (bookmarks == null) {bookmarks = new Array()}
    bookmarks.push(word)
    storeSet('researchedBookmarks', bookmarks)
}

function currentBookmarks() {
    let bookmarks = storeGet('rememberedBookmarks')
    if (bookmarks == null) {bookmarks = new Array()}
    let researchedBm = storeGet('researchedBookmarks')
    if (researchedBm == null) {researchedBm = new Array()}
    return bookmarks.map((word) => {return {word, researched: researchedBm.includes(word)}})
}