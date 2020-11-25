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

    bubble = lineNode.querySelector('.bubble');
    
    lineNode.classList.add("appeared");
    var bubble_style = window.getComputedStyle(bubble, null);
    var width = bubble_style.getPropertyValue("width");
    var height = bubble_style.getPropertyValue("height");
    
    if (isinstant) {
        setTimeout(() => {lineNode.classList.add("positioned");}, 20)
        setTimeout(() => {lineNode.classList.add("shown");
                          updateEmotion(lineNode.classList.contains('left'), emoindex(meta));
                         messageSound.play()}, 500)
        return;
    }
    
    lineNode.classList.remove("appeared");
    lineNode.classList.add("texthide")
    typingDots = document.querySelector('components .wave').cloneNode(true);
    bubble.appendChild(typingDots);
    lineNode.classList.add("typing");
    lineNode.classList.add("appeared");

    const microDelay = 20;
    const positioningDelay = 500;
    const typingDuration = islong ? 1700 : 600;
    const textAppearDelay = 250;
    
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
}


