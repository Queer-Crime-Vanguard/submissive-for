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

let current_branch = null

function getNextLine() {
    if (current_branch) {
        let node = current_branch.querySelector('.line:not(.shown)')
        if (node) {
            return node
        } else {
            current_branch.parentNode.classList.add('shown')
            current_branch = null
        } 
    }
    return document.querySelector('#dialogue > *:not(.shown)')
}

let player_emotion = null
function setEmotion(left, emoindex) {
    if (!left) {player_emotion = emoindex}
    sendEmotion(left, emoindex)
}

const autoplayDelay = 350;
const pauseEmotionDelay = 1600;
const pauseDelay = 2000;
const finishSceneDelay = 1000;

let optionsContainer = null;

function prepareHighlight(highlights) {
    let highlight_box = document.querySelector('#highlight-box')
    optionsContainer = document.createElement('div')
    highlights.forEach((h) => {

        if (h.classList.contains('option')) {
            let line = h.parentNode
            let branch = line.parentNode

            if (branch.tagName == 'BRANCH') {h.branch = branch}

            h.emotion = emoindex(line.querySelector('linemeta'))
            h.addEventListener('mouseover', (e) => selectOption(h))
            h.addEventListener('mouseout', (e) => selectOption(null))
            h.addEventListener('click', (e) => proceedOption(h))
        } else if (h.classList.contains('bookmark')) {
            h.addEventListener('click', (e) => proceedBookmark(highlight_box))
        } 

        optionsContainer.appendChild(h)

    })
    if (highlights.length > 1) {
        optionsContainer.classList.add('options')
        optionsContainer.children[0].classList.add('left')
        optionsContainer.children[1].classList.add('right')
    }

    highlight_box.appendChild(optionsContainer);
}

function cleanHighlight() {
    optionsContainer.parentNode.removeChild(optionsContainer)
    optionsContainer = null
}

function selectOption(option_, by_index=false) {
    let options = optionsContainer.querySelectorAll('.option')
    options.forEach((o) => {
        o.classList.remove('selected')
    })

    let option = null
    
    if (by_index) {
        if (options.length == 1) {
            option = options[option_-1]
        } else {
            option = options[option_]
        }
    } else {
        option = option_
    }

    if (option) {
        sendEmotion(false, option.emotion)
        option.classList.add('selected')
    } else {
        sendEmotion(false, player_emotion)
    }
}

function selectedOption() {
    let options = optionsContainer.querySelectorAll('.option,.bookmark')
    if (options.length == 1) {
        return options[0]
    } else {
        return optionsContainer.querySelector('.option.selected')
    }
}

function proceedBookmark(highlight_box) {
    animate_flyaway(highlight_box)
    sound('absorb3').play()
    nextline(true, false)
    cleanHighlight()
}

function proceedOption(option = null) {
    if (option) {current_branch = option.branch} 
    nextline(true)
    cleanHighlight()
}

let chatProceed = activateHighlight

function activateHighlight() {
    if (optionsContainer.classList.contains('options')) {
        let option = optionsContainer.querySelector('.option.selected')
        if (option) {proceedOption(option)}
    } else if (optionsContainer.querySelector('.bookmark')) {
        proceedBookmark(optionsContainer.parentNode)
    } else if (optionsContainer.querySelector('.option')) {
        proceedOption()
    }
}

function initiateHighlight() {
    /*highlight_box.addEventListener('click', chatProceed)*/
    document.body.onkeyup = (e) => {
        if (optionsContainer) {
            if (e.code == 'Space') {activateHighlight()}
            if (e.code == 'ArrowLeft') {selectOption(0, true)}
            if (e.code == 'ArrowRight') {selectOption(1, true)}
        }
    }
    nextline()
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
        setEmotion(left, emoindex(meta))
    })
    initiateHighlight();
}


function nextline(force_instant, show_bubble=true) {
    let currentLine = getNextLine()

    if (currentLine) {

        currentLine.classList.add('shown')

        let delay = 0

        if (currentLine.classList.contains('pause')) {
            delay = 1000;
        }
        
        if (currentLine.classList.contains('typing')) {
            delay = pauseDelay;

            typing_bubble = document.createElement('div');
            typing_bubble.classList.add('bubble');
            typing_bubble.appendChild(document.querySelector('components .wave').cloneNode(true));

            prepareHighlight([typing_bubble]);

            setTimeout(() => {
                cleanHighlight(false, false);
            }, pauseDelay)
        }

        if (currentLine.classList.contains('vibe')) {
            let meta = currentLine.querySelector('linemeta')
            sendVibe(meta.getAttribute('vibe'))
        }

        let bubble = currentLine.querySelector('.bubble');
        if (show_bubble && bubble) {
            delay = showBubble(currentLine, force_instant);
        }

        setTimeout(() => {let nextLine = getNextLine();
                        if (nextLine) {
                            let highlights = nextLine.querySelectorAll(".highlight");
                            if (highlights.length) {
                                prepareHighlight(highlights);
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
    box.style.margin = "0"
    box.style.left = rect.x + "px"
    box.style.top = rect.y + "px"
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

    if (isinstant) {
        setTimeout(() => {lineNode.classList.add("positioned");}, 20)
        setTimeout(() => {lineNode.classList.add("shown");
                          setEmotion(lineNode.classList.contains('left'), emoindex(meta));
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
    
    setTimeout(() => {setEmotion(lineNode.classList.contains('left'), emoindex(meta));
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


