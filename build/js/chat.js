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
        let node = current_branch.querySelector('.line:not(.taken)')
        if (node) {
            return node
        } else {
            current_branch.parentNode.classList.add('shown')
            current_branch = null
        } 
    }
    return document.querySelector('#dialogue > *:not(.taken)')
}

let player_emotion = null
function setEmotion(left, emoindex, jump = false) {
    if (!left) {player_emotion = emoindex}
    sendEmotion(left, emoindex, jump)
}

const autoplayDelay = 500;
const pauseEmotionDelay = 1600;
const pauseDelay = 2000;
const finishSceneDelay = 1000;

let optionsContainer = null;

function setBubbleBoxHeight() {
    let dialogue_box = document.getElementById("dialogue-box")
    let bubble_box = document.getElementById("bubble-box")
    
    let dh = parseInt(window.getComputedStyle(dialogue_box).height, 10)
    let by = parseInt(window.getComputedStyle(bubble_box).bottom, 10)

    bubble_box.style.height = (dh-by + "px");
}

function prepareHighlight(highlights) {
    let highlight_box = document.getElementById('highlight-box')
    optionsContainer = document.createElement('div')

    setBubbleBoxHeight()

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

window.addEventListener("size_update", setBubbleBoxHeight)

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
            option = options[0]
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
    rememberBookmark(highlight_box.innerText)
    sound('absorb3').play()
    nextline(true)
    cleanHighlight()
}

function proceedOption(option = null) {
    if (option) {current_branch = option.branch} 
    nextline(true)
    cleanHighlight()
}

const chatProceed = () => {activateHighlight(true)}

function activateHighlight(ignore_selection = false) {
    let option
    if (ignore_selection) {
        option = optionsContainer.querySelector('.option')
    } else {
        option = optionsContainer.querySelector('.option.selected')
    }
    if (option) {
        proceedOption(option)
    } else if (optionsContainer.querySelector('.bookmark')) {
        proceedBookmark(optionsContainer.parentNode)
    } 
    /* else if (optionsContainer.querySelector('.option')) {
        proceedOption()
    } */
}

document.body.onkeyup = (e) => {
    if (optionsContainer) {
        if (e.code == 'Space') {activateHighlight()}
        if (e.code == 'ArrowLeft') {selectOption(0, true)}
        if (e.code == 'ArrowRight') {selectOption(1, true)}
    } else {
        if (e.code == 'Space') {
            const lineNode = currentLineNode
            if (lineNode.classList.contains('shown')) {
                clearTimeout(nextLineTimeout)
                nextline(true)
            }
            jumpToBubbleFinal(lineNode)
        }
    }
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
    nextline(true)
}

let nextLineTimeout

function nextline(force_instant=false) {

    let bind = true

    const currentLine = getNextLine()

    if (currentLine) {
        let delay = 0

        let highlights = currentLine.querySelectorAll(".highlight")
        let bookmark = currentLine.querySelector(".bookmark")
        let bubble = currentLine.querySelector('.bubble')

        if (highlights.length) {
            prepareHighlight(highlights);
            bind = false
        }

        if (currentLine.classList.contains('pause')) {
            delay = 1000;
        }
        
        if (currentLine.classList.contains('typing') && !force_instant) {
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

        if (highlights.length || bookmark) {
            bind = false
        } else {
            if (bubble) {delay = showBubble(currentLine, force_instant)}
        }

        if (bind) {
            currentLine.classList.add('taken')
            nextLineTimeout = setTimeout(nextline, delay+autoplayDelay);
        }
            
    } else {
        setTimeout(finishScene, finishSceneDelay)
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

let currentLineNode
let poisitioned_TO, shown_TO, notif_TO, text_appear_TO

const microDelay = 20;
const positioningDelay = 500;
const typingDurationLong = 1700
const typingDurationShort = 600;
const textAppearDelay = 250;

function showBubble(currentLine, force_instant, additional_delay = 0) {

    currentLineNode = currentLine.cloneNode(true);

    const lineNode = currentLineNode

    const bubble = lineNode.querySelector('.bubble');
    const meta = lineNode.querySelector('linemeta');
    const highlight = lineNode.querySelector('.highlight');

    const bubble_box = document.querySelector('#bubble-box');
    bubble_box.insertBefore(lineNode, bubble_box.firstChild);

    if (highlight) {lineNode.removeChild(highlight)}
     
    const islong = lineNode.classList.contains('pause');
    const isinstant = lineNode.classList.contains('instant') || force_instant;
    
    const jump = lineNode.classList.contains('jump')

    lineNode.classList.add("appeared");
    const bubble_style = window.getComputedStyle(bubble, null);
    const b_width = bubble_style.getPropertyValue("width");
    const b_height = bubble_style.getPropertyValue("height");

    if (isinstant) {
        positioned_TO = setTimeout(() => {
                          if (lineNode.classList.contains('blocked')) {return}
                          lineNode.classList.add("positioned")
                          setEmotion(lineNode.classList.contains('left'), emoindex(meta), jump)
                          lineNode.classList.add('notified')
                          sound('notif').play()
                          lineNode.classList.add("shown");
                          currentLine.classList.add('shown')
                         },
                        additional_delay+microDelay)
        return additional_delay+microDelay;
    }
    
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

    positioned_TO = setTimeout(() => {
                      if (lineNode.classList.contains('blocked')) {return}
                      lineNode.classList.add("positioned");
                      sound('typing').play()
                      setEmotion(lineNode.classList.contains('left'), emoindex(meta), jump)
                      var typing_bubble_style = window.getComputedStyle(bubble, null);
                      bubble.style.width = typing_bubble_style.getPropertyValue("width");
                      bubble.style.height = typing_bubble_style.getPropertyValue("height");
                      }, additional_delay + microDelay)
    
    shown_TO = setTimeout(() => {
        if (lineNode.classList.contains('blocked')) {return}
        currentLine.classList.add('shown')
        lineNode.classList.add("shown");
    }, additional_delay+positioningDelay)
    
    const typingDuration = islong ? typingDurationLong : typingDurationShort

    notif_TO = setTimeout(() => {
                      if (lineNode.classList.contains('blocked')) {return}
                      bubble.style.width = b_width;
                      bubble.style.height = b_height;
                      lineNode.classList.remove("typing");
                      lineNode.classList.add('notified')
                      sound('notif').play()
    }, additional_delay + positioningDelay + typingDuration)
    
    text_appear_TO = setTimeout(() => {
        if (lineNode.classList.contains('blocked')) {return}
        bubble.style.width = null
        bubble.style.height = null
        lineNode.classList.remove("texthide");
        bubble.scrollIntoView();
    }, additional_delay + positioningDelay + typingDuration + textAppearDelay)

    return additional_delay+positioningDelay+typingDuration+textAppearDelay;
}


function jumpToBubbleFinal(node) {

    node.classList.add('blocked')

    const lineNode = node

    // selecting bubble and meta
    const bubble = lineNode.querySelector('.bubble');
    const meta = lineNode.querySelector('linemeta');

    // final visible state
    lineNode.classList.add("shown");
    bubble.style.width = null
    bubble.style.height = null
    lineNode.classList.remove("typing");
    sound('typing').pause()
    sound('typing').currentTime = 0
    lineNode.classList.remove("texthide");
    bubble.scrollIntoView();
    

    // playing notif if have not
    if (!lineNode.classList.contains('notified')) {
        lineNode.classList.add('notified')
        sound('notif').play()
    }

    // update emotion
    let jump = lineNode.classList.contains('jump')
    setEmotion(lineNode.classList.contains('left'), emoindex(meta), jump)
}


