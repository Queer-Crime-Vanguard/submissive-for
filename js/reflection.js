function showReflection() {
    current = document.querySelector(".reflection.visible")
    if (current) {current.classList.remove("visible")
                  current.classList.add("shown")}
    newref = document.querySelector(".reflection:not(.shown)")
    if (newref)
        {newref.classList.add("visible")}
    else {document.querySelector("#reflection-box").style.display = "none";}
}
