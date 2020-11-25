function nextline() {
    currentLine = document.querySelector('.line:not(.shown)')
    if (currentLine) {
        showNextBubble(currentLine);
    } else {
        finishScene();
    }
    // startBgMusic();
}

function showNextBubble(lineNode) {
    meta = lineNode.querySelector('linemeta');
    islong = lineNode.classList.contains('long');
    isinstant = lineNode.classList.contains('instant');

    typingDots = document.querySelector('components .wave').cloneNode(true);
    lineNode.querySelector('.bubble').appendChild(typingDots);
    if (!isinstant) {lineNode.classList.add("typing");}
    lineNode.classList.add("appeared")
    
    setTimeout(() => {lineNode.classList.add("positioned");
                      if (!isinstant) {typingSound.play();} }, 20)
    setTimeout(() => {lineNode.classList.add("shown");}, 500)
    if (islong) {
        setTimeout(() => {typingSound.currentTime = 0;
                          typingSound.play();}, 1200)
        setTimeout(() => {updateEmotion(lineNode.classList.contains('left'), emoindex(meta));}, 2200)
        setTimeout(() => {lineNode.classList.remove("typing");}, 2300)
    } else if (!isinstant) {
        setTimeout(() => {updateEmotion(lineNode.classList.contains('left'), emoindex(meta));}, 1100)
        setTimeout(() => {lineNode.classList.remove("typing");}, 1200)
    }
}


