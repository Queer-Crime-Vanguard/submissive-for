const storeGet = (k) => JSON.parse(localStorage.getItem(k))
const storeSet = (k, v) => localStorage.setItem(k, JSON.stringify(v))

function rememberBookmark(word) {
    console.log('remember', word)
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
    console.log(bookmarks, researchedBm)
    return bookmarks.map((word) => {return {word, researched: researchedBm.includes(word)}})
}