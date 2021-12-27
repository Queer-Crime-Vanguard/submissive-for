const stopAnimation = () => {window.cancelAnimationFrame(areq)}
const stopMusic = () => {document.dispatchEvent(new Event('stop_playing'))}

// to be implemented in queer communism
const destroyGender = () => {}

// already implemented
const embraceYourBecoming = () => {console.log(
    `It doesn't matter 
    What you create 
    If you have no fun 
    Pretty girl 
    Put down your pen 
    Come over here 
    I'll show you how its done 
    https://youtu.be/ANmL7LvNzdw
`)}


const Pages = {
    queerdisaster: {
        name: () => {return "roditel3/"+(1+Math.floor(Math.random()*18))},
        onload: () => {embraceYourBecoming()},
        ondestroy: () => {destroyGender();}
    }
}