function getNextLine() {
    return document.querySelector('.line:not(.shown)')
}

const autoplayDelay = 350;
const pauseEmotionDelay = 1600;
const pauseDelay = 4000;

function prepareHighlight(bubble, activate) {
    highlight_box = document.querySelector('#highlight-box')
    highlight_box.addEventListener('click', () => {
        processHighlight(true);
        document.dispatchEvent(new Event('play_bg_music')); })
    highlight_box.appendChild(bubble);
    if (activate) {highlight_box.classList.add('activated');}
}

function initiateHighlight() {
    prepareHighlight(getNextLine().children[0].cloneNode(true), true);
}

function sendEmotion(isleft, emoindex) {
    ev = new CustomEvent('update_emotion', {'detail': {'isleft': isleft, 'emotion_index': emoindex}})
    document.dispatchEvent(ev);
}

function nextline(force_instant) {
    var currentLine = getNextLine();
    if (currentLine) {
        if (currentLine.classList.contains('pause')) {
            currentLine.classList.add('shown');
            var bubble = document.createElement('div');
            bubble.classList.add('bubble');
            bubble.appendChild(document.querySelector('components .wave').cloneNode(true));
            prepareHighlight(bubble, false);
            setTimeout(() => {
                sendEmotion(currentLine.classList.contains('left'), emoindex(currentLine.querySelector('linemeta'))); 
            }, pauseEmotionDelay)
            setTimeout(() => {
                processHighlight(false);
            }, pauseDelay);
            return
        }
        var delay = showNextBubble(currentLine, force_instant);
        setTimeout(() => {var nextLine = getNextLine();
                          if (nextLine && nextLine.classList.contains('highlight')) {
                              prepareHighlight(nextLine.children[0].cloneNode(true), true);
                          } else {nextline(false);} },
                   1.5*delay+autoplayDelay);
    } else {
        finishScene();
    }
}

function processHighlight(by_click) {
    highlight_box = document.querySelector('#highlight-box');
    highlight_box.removeChild(highlight_box.children[0]);
    highlight_box.classList.remove("activated");
    nextline(by_click);
}

function showNextBubble(lineNode, force_instant) {
    meta = lineNode.querySelector('linemeta');
    
    islong = lineNode.classList.contains('long');
    isinstant = lineNode.classList.contains('instant') || force_instant;

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
                          sendEmotion(lineNode.classList.contains('left'), emoindex(meta));
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
    setTimeout(() => {sendEmotion(lineNode.classList.contains('left'), emoindex(meta));
                      bubble.style.width = width;
                      bubble.style.height = height;
                      lineNode.classList.remove("typing");
                      messageSound.play()},
               positioningDelay + typingDuration)
    setTimeout(() => {lineNode.classList.remove("texthide")}, 
               positioningDelay+typingDuration+textAppearDelay)

    return positioningDelay+typingDuration+textAppearDelay;
}

