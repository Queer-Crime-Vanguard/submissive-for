// small method for choosing random element of array
Array.prototype.sample = function(){
    return this[Math.floor(Math.random()*this.length)];
}

let game_canvas = document.createElement('canvas')
game_canvas.classList.add("minigame")

let context = game_canvas.getContext('2d');

let alph_tiles_img = new Image();
alph_tiles_img.src = "assets/minigames/soup/alphabet.png";

let fly_sprite = new Image();
fly_sprite.src = "assets/minigames/soup/fly.png";

let sound_wrong = new Audio("assets/sound/wrong.ogg");
sound_wrong.volume = 0.2;
let sound_fail = new Audio("assets/sound/buzz.ogg")

let sound_win = new Audio("assets/sound/win.ogg")

//create a synth and connect it to the main output (your speakers)
const synth = new Tone.Synth().toDestination();

const total_alph = 32;

const alph_width = 50;
const alph_height = 67;

let fly_height = 0;
fly_sprite.onload = () => {fly_height = alph_width/(fly_sprite.width) * fly_sprite.height;}

const offset_x = 30;
const offset_y = 30;

const wallRepulsionSoften = 0.7;

const baseVelocity = 35;
const initialAmplitude = 4;
const smoothDec = (velocity) => {
    let k = 0.02;
    let dv = Math.max(velocity-baseVelocity, 0);
    return (dv*k)*(dv*k);
}

const spoonRepulsion = 5;

const spoonRadialSpeed = 0.3;

// words utilites

const alphabet = 'абвгдежзийклмнопрстуфхцчшщъыьэюя';

const goodWords = ['виктимблейминг']

// word mechanics

let letters = new Array
let total_letters = 20;

let goodWord;
let found_letters;

let fail_meter;
let fail;

let clickUpdate

let positionate_letters = () => {
    let n = 0

    let spiral = Math.min(width, height)/2;

    const spiral_turns = 6;
    const start_offset = 10;


    letters.forEach((l) => {
        n += 1
        let r = spiral*((n+start_offset)/(total_letters+start_offset));
        let d = (n/total_letters)*2*Math.PI*spiral_turns;
        let home_pos_x = width/2 + r*Math.cos(d);
        let home_pos_y = height/2 + r*Math.sin(d);

        l.home_pos_x = home_pos_x
        l.pos_x = home_pos_x

        l.home_pos_y = home_pos_y
        l.pos_y = home_pos_y
    })
}

let loadgame = () => {
    fail = 0;
    fail_meter = 0;


    // choose words
    if (goodWords.length) {
        goodWord = goodWords[0]
        goodWords.splice(0, 1)
    } else {
        setTimeout(finishScene, 1500)
        return
    }


    found_letters = [];

    // generate letters
    let spiral = Math.min(width, height)/2;
    letters = new Array

    let generate_letter = (char) => {
        let i = alphabet.indexOf(char);
        let sprite = new Sprite(alph_tiles_img, 11, 3, total_alph);
        sprite.setFrame(i);

        // start positioning
        let home_pos_x = -100
        let home_pos_y = -100
        
        letters.push({
            char,
            sprite,
            home_pos_x,
            home_pos_y,
            'pos_x': home_pos_x,
            'pos_y': home_pos_y,
            'deg_offset': Math.random()*2*Math.PI,
            noise : new perlinNoise3d(),
            'display': 'normal'
        })

        positionate_letters()
    }

    // collect all letters which would be generated

    let all_chars = []

    for (c of goodWord) {
        all_chars.push(c)
    }

    // add junk

    let remaining_letters = [];

    for (c of alphabet) {
        if (!goodWord.includes(c)) {remaining_letters.push(c)}
    }

    for (let t = 0; t < total_letters-goodWord.length; t += 1) {
        all_chars.push(remaining_letters.sample())
    }

    // shuffle and generate

    for (let count = 0; count < total_letters; count += 1) {
        rand_i = Math.floor(Math.random()*(total_letters-count));
        character = all_chars.splice(rand_i, 1)[0];
        generate_letter(character);
    }

}

function start() {

    const note = (i) => {
        let nc = String.fromCharCode(97 + i%7);
        let no = (Math.floor((i+5)/7)+4).toString();
        return nc.toUpperCase()+no;
    }

    // interact with letter

    let interact = (letter) => {
        if (goodWord.includes(letter.char)) {
            let i = goodWord.indexOf(letter.char);
            console.log(note(i))
            synth.triggerAttackRelease(note(i), "8n");
            found_letters.push(letter.char)
            letter.display = 'success'
            updateUI();
            if (win) {
                congrat = () => {playSound('win')}
                setTimeout(congrat, 700);
                setTimeout(restart_game, 1700);
            }
        } else {
            letter.display = 'wrong'
            fail_meter += 1
            if (fail_meter >= 5) {
                playSound('buzz')
                fail = true;
                fail_meter = 0;
                setTimeout(restart_game, 1700);
            } else {
                playSound('wrong', -5)
            }
        }
    }

    const rad_amp = 50;
    const rad_freq = 0.1;

    const deg_velocity_amp = 0.2;
    const deg_velocity_freq = 0.1;

    const noisyMove = (totalTime) => {
        for (let letter of letters) {

            let rad = rad_amp*letter.noise.get(rad_freq*totalTime, 0);
            let deg_velocity = deg_velocity_amp*(letter.noise.get(0, deg_velocity_freq*totalTime)-0.5);

            letter.pos_x = letter.home_pos_x + rad*Math.cos(deg_velocity*totalTime + letter.deg_offset);
            letter.pos_y = letter.home_pos_y + rad*Math.sin(deg_velocity*totalTime + letter.deg_offset);
        }
    }

    const amp = 50;
    const normal_freq = 0.2;
    const fail_freq = 5;

    const noisyMoveSimple = (totalTime) => {
        let freq
        if (fail) {
            freq = fail_freq
        } else {
            freq = normal_freq
        }

        for (let letter of letters) {

            letter.pos_x = letter.home_pos_x + amp*(letter.noise.get(freq*totalTime, 0)-0.5);
            letter.pos_y = letter.home_pos_y + amp*(letter.noise.get(0, freq*totalTime)-0.5);
        }
    }

    // rendring

    const drawFrame = () => {
        context.clearRect(0, 0, width, height);
        for (let letter of letters) {
            switch (letter.display) {
                case 'normal':
                    context.drawImage(letter.sprite.frame,
                                letter.pos_x, 
                                letter.pos_y, 
                                alph_width,
                                alph_height);
                    break
                case 'wrong':
                    context.drawImage(fly_sprite,
                                letter.pos_x, 
                                letter.pos_y,
                                alph_width,
                                fly_height);
                    break
            }
            
        }
    }

    // update cycle

    let prev_ts = null;
    
    const step = (ts) => {
        if (prev_ts) {
            delta = (ts - prev_ts)/1000;
        } else {
            delta = 0;
        }
        prev_ts = ts;
        // updatePhysics(delta);
        noisyMoveSimple(ts/1000);
        drawFrame();
        window.requestAnimationFrame(step);
    }

    window.requestAnimationFrame(step);
    loadgame();
    console.log(goodWord)
    updateUI();

    // catch clicks

    touched = (letter, x, y) => 
        (letter.pos_x < x && x < letter.pos_x + alph_width) &&
        (letter.pos_y < y && y < letter.pos_y + alph_height)

    clickUpdate = (e) => {
        let x = e.pageX
        let y = e.pageY

        for (let letter of letters) {
            if (letter.display == 'normal' && touched(letter, x, y)) {
                interact(letter);
                break;
            }
        }
    }

}

function addCanvasClickListener() {
    game_canvas.addEventListener('click', clickUpdate)
}

const restart_game = () => {
    loadgame();
    updateUI();
}

let win = false;

let word_panel
const updateUI = () => {
    show = []
    win = true;
    for (c of goodWord) {
        if (found_letters.includes(c)) {
            show.push(c)
        } else {
            show.push('_')
            win = false
        }
    }
    
    if (win) {
            word_panel.classList.add("win")
    } else {
        word_panel.classList.remove('win')
    }
    word_panel.innerHTML = show.join(" ")
}

// resize canvas and game start

// add canvas to DOM

function startSoupGame() {

    // UI for word

    word_panel = document.createElement('div');
    word_panel.classList.add('word-panel');

    let container = document.querySelector("#slide-container .slide")
    if (container == null) {container = document.body}

    container.appendChild(word_panel);

    // lottie

    document.getElementById('background').remove()    

    let bg_container = document.createElement("div")
    bg_container.setAttribute("id", "background")

    container.appendChild(bg_container)

    lottie.loadAnimation({
        container: bg_container, // the dom element that will contain the animation
        renderer: 'canvas',
        loop: true,
        autoplay: true,
        path: 'assets/minigames/soup/soup_animation.json', // the path to the animation json
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        }
    });

    window.addEventListener("size_update", () => {
        game_canvas.width = width;
        game_canvas.height = height;

        lottie.resize()

        positionate_letters()
    })

    game_canvas.width = width;
    game_canvas.height = height;
    positionate_letters()

    start()

    container.appendChild(game_canvas)
}

function hideInstruction() {
    document.getElementById("trigger-warning-box").classList.add('hidden')
    addCanvasClickListener()
}