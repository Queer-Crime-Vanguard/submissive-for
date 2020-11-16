function nextline() {
    currentLine = document.querySelector('.line:not(.shown)')
    if (currentLine) {
        showNextBubble(currentLine);
        meta = currentLine.children[0].children[1];
        updateEmotion(currentLine.classList.contains('left'), emoindex(meta));
    }
    
}

function showNextBubble(lineNode) {
    lineNode.classList.add("appeared")
    setTimeout(() => {lineNode.classList.add("positioned");}, 20)
    setTimeout(() => {lineNode.classList.add("shown");}, 500)
}


