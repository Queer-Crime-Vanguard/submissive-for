class ExtRef extends HTMLAnchorElement {
    constructor() {
      // Always call super first in constructor
      super();
  
      this.setAttribute('target', '_blank')
      this.setAttribute('href', this.innerText)
    }
  }
  
// Define the new element
customElements.define('ext-ref', ExtRef, {extends: 'a'});

function getNextLine() {
    return document.querySelector('#dialogue .line:not(.shown):not(.init)')
}

const autoplayDelay = 350;
const pauseEmotionDelay = 1600;
const pauseDelay = 2000;
const finishSceneDelay = 1000;

function prepareHighlight(highlight, activate, with_bookmark) {
    let highlight_box = document.querySelector('#highlight-box')
    highlight_box.appendChild(highlight);
    if (activate) {highlight_box.classList.add('activated')}
    if (with_bookmark) {highlight_box.classList.add('with_bookmark');}
}

let chatProceed = () => processHighlight(true)

function initiateHighlight() {
    let highlight_box = document.querySelector('#highlight-box')
    highlight_box.addEventListener('click', chatProceed)
    document.body.onkeyup = (e) => {
        if (e.code == 'Space') {chatProceed()}
    }
    let highlight = getNextLine().querySelector(".highlight")
    prepareHighlight(highlight, true, false)
}

function setBubbleColor(left, color) {
    if (color == null) {return}
    let pref = left ? 'left' : 'right'

    let root = document.documentElement
    root.style.setProperty('--' + pref + '-bubble-color', "#"+color)
    console.log(color)
}

function initializeDialogue() {
    preloadEmotions(document.querySelectorAll("#dialogue linemeta"))
    document.querySelectorAll('#dialogue .line.init').forEach((line) => {
        let meta = line.querySelector('linemeta')
        let left = line.classList.contains('left')
        let speaker = meta.getAttribute('speaker')
        preloadBackground(left, speaker)
        setBubbleColor(left, meta.getAttribute('bubble_color'))
        addForeground(left, speaker, meta.getAttribute('foreground'))
        sendEmotion(left, emoindex(meta))
    })
    initiateHighlight();
}


function nextline(force_instant) {
    var currentLine = getNextLine();
    if (currentLine) {

        let bubble = currentLine.querySelector('.bubble');
        let delay = 0;

        if (bubble) {
            delay = showBubble(currentLine, force_instant);
        } else {
            currentLine.classList.add('shown');

            if (currentLine.classList.contains('pause')) {
                delay = 1000;
            }
            
            if (currentLine.classList.contains('typing')) {

                delay = pauseDelay;

                typing_bubble = document.createElement('div');
                typing_bubble.classList.add('bubble');
                typing_bubble.appendChild(document.querySelector('components .wave').cloneNode(true));

                prepareHighlight(typing_bubble, false, false);

                setTimeout(() => {
                    processHighlight(false, false);
                }, pauseDelay)
            }

            if (currentLine.classList.contains('vibe')) {
                let meta = currentLine.querySelector('linemeta')
                sendVibe(meta.getAttribute('vibe'))
            }
        }

        setTimeout(() => {let nextLine = getNextLine();
                        if (nextLine) {
                            let highlight = nextLine.querySelector(".highlight");
                            if (highlight) {
                                prepareHighlight(highlight, true, highlight.classList.contains('bookmark'));
                            } else {
                                nextline(false);
                            }
                        } else {
                            setTimeout(finishScene, finishSceneDelay)
                        }},
                   1.5*delay+autoplayDelay);
    }
}

function animate_flyaway(node, duration=500) {
    let rect = node.getBoundingClientRect()
    box = node.cloneNode(deep=true)
    box.style.position = 'absolute'
    box.style.width = rect.right - rect.left
    box.style.height = rect.bottom - rect.tops
    box.style.left = rect.left
    box.style.top = rect.top
    box.style.transition = "all " + duration + "ms" + " ease-out"
    box.style.opacity = "1"
    box.style.transform = "translateX(0)"
    document.body.appendChild(box)
    setTimeout(() => {
        box.style.transform = "translateX(20em)"
        box.style.opacity = "0"
    }, 10)
    setTimeout(() => {document.body.removeChild(box)}, duration)
}

function processHighlight(by_click, go_nextline=true) {
    let highlight_box = document.querySelector('#highlight-box');
    if (by_click && !highlight_box.classList.contains('activated')) {return}
    highlight_box.removeChild(highlight_box.children[0]);
    if (highlight_box.classList.contains('with_bookmark')) {
        animate_flyaway(highlight_box)
        sound('absorb3').play()
    }
    highlight_box.classList.remove("activated");
    highlight_box.classList.remove("with_bookmark");
    if (go_nextline) {return nextline(by_click)}
}

function showBubble(currentLine, force_instant) {
    let lineNode = currentLine.cloneNode(true);
    let bubble = lineNode.querySelector('.bubble');
    let meta = lineNode.querySelector('linemeta');
    let highlight = lineNode.querySelector('.highlight');

    let bubble_box = document.querySelector('#bubble-box');
    bubble_box.insertBefore(lineNode, bubble_box.firstChild);

    if (highlight) {lineNode.removeChild(highlight);}
     
    let islong = lineNode.classList.contains('pause');
    let isinstant = lineNode.classList.contains('instant') || force_instant;
    
    lineNode.classList.add("appeared");
    var bubble_style = window.getComputedStyle(bubble, null);
    let b_width = bubble_style.getPropertyValue("width");
    let b_height = bubble_style.getPropertyValue("height");

    const microDelay = 20;
    const positioningDelay = 500;
    const typingDuration = islong ? 1700 : 600;
    const textAppearDelay = 250;
    
    currentLine.classList.add('shown')

    if (isinstant) {
        setTimeout(() => {lineNode.classList.add("positioned");}, 20)
        setTimeout(() => {lineNode.classList.add("shown");
                          sendEmotion(lineNode.classList.contains('left'), emoindex(meta));
                         sound('notif').play()}, positioningDelay)
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
        sound('typing').addEventListener("ended", () => {
            if (playAgain) {
                sound('typing').play()
                playAgain = false
            }
        })}

    dialogue.scrollTop = dialogue.scrollHeight;

    setTimeout(() => {lineNode.classList.add("positioned");
                      sound('typing').play()
                      var typing_bubble_style = window.getComputedStyle(bubble, null);
                      bubble.style.width = typing_bubble_style.getPropertyValue("width");
                      bubble.style.height = typing_bubble_style.getPropertyValue("height");
                      }, microDelay)
    
    setTimeout(() => {
        lineNode.classList.add("shown");
    }, positioningDelay)
    
    setTimeout(() => {sendEmotion(lineNode.classList.contains('left'), emoindex(meta));
                      bubble.style.width = b_width;
                      bubble.style.height = b_height;
                      lineNode.classList.remove("typing");
                      sound('notif').play()
    }, positioningDelay + typingDuration)
    
    setTimeout(() => {
        bubble.style.width = null
        bubble.style.height = null
        lineNode.classList.remove("texthide");
        bubble.scrollIntoView();
    }, positioningDelay+typingDuration+textAppearDelay)

    return positioningDelay+typingDuration+textAppearDelay;
}


