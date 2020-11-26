function getNextLine() {
    return document.querySelector('.line:not(.shown)')
}

const autoplayDelay = 350;

function prepareHighlight() {
    var nextLine = getNextLine();
    document.querySelector('#highlight-box').appendChild(nextLine.cloneNode(true).children[0]);
}

function nextline() {
    var currentLine = getNextLine();
    if (currentLine) {
        var delay = showNextBubble(currentLine);
        setTimeout(() => {var nextLine = getNextLine();
                          if (nextLine && nextLine.classList.contains('left') && !nextLine.classList.contains('auto')) {
                              prepareHighlight();
                          } else {nextline();} },
                   delay+autoplayDelay);
    } else {
        finishScene();
    }
    // startBgMusic();
}

function processHighlight() {
    highlight_box = document.querySelector('#highlight-box');
    highlight_box.removeChild(highlight_box.children[0]);
    nextline();
}

function showNextBubble(lineNode) {
    meta = lineNode.querySelector('linemeta');
    
    islong = lineNode.classList.contains('long');
    isinstant = lineNode.classList.contains('instant');

    bubble = lineNode.querySelector('.bubble');
    
    lineNode.classList.add("appeared");
    var bubble_style = window.getComputedStyle(bubble, null);
    var width = bubble_style.getPropertyValue("width");
    var height = bubble_style.getPropertyValue("height");

    const microDelay = 20;
    const positioningDelay = 500;
    const typingDuration = islong ? 1700 : 600;
    const textAppearDelay = 250;
    
    if (isinstant) {
        setTimeout(() => {lineNode.classList.add("positioned");}, 20)
        setTimeout(() => {lineNode.classList.add("shown");
                          updateEmotion(lineNode.classList.contains('left'), emoindex(meta));
                         messageSound.play()}, positioningDelay)
        return positioningDelay;
    }
    
    lineNode.classList.remove("appeared");
    lineNode.classList.add("texthide")
    typingDots = document.querySelector('components .wave').cloneNode(true);
    bubble.appendChild(typingDots);
    lineNode.classList.add("typing");
    lineNode.classList.add("appeared");
    
    if (islong) {
        var playAgain = true;
        typingSound.addEventListener("ended", () => {
            if (playAgain) {
                typingSound.play()
                playAgain = false
            }
        })}
    
    setTimeout(() => {lineNode.classList.add("positioned");
                      typingSound.play();
                      var typing_bubble_style = window.getComputedStyle(bubble, null);
                      bubble.style.width = typing_bubble_style.getPropertyValue("width");
                      bubble.style.height = typing_bubble_style.getPropertyValue("height");
                      console.log(bubble.style.width, bubble.style.height)},
               microDelay)
    setTimeout(() => {lineNode.classList.add("shown");},
               positioningDelay)
    setTimeout(() => {updateEmotion(lineNode.classList.contains('left'), emoindex(meta));
                      bubble.style.width = width;
                      bubble.style.height = height;
                      lineNode.classList.remove("typing");
                      messageSound.play()},
               positioningDelay + typingDuration)
    setTimeout(() => {lineNode.classList.remove("texthide")}, 
               positioningDelay+typingDuration+textAppearDelay)

    return positioningDelay+typingDuration+textAppearDelay;
}


