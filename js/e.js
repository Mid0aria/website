//made with love .
const konamiCode = [
    "ArrowUp",
    "ArrowUp",
    "ArrowDown",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "ArrowLeft",
    "ArrowRight",
    "b",
    "a",
];
let konamiCodePosition = 0;

function konamiCodeCheck(event) {
    if (
        event.key.toLowerCase() === konamiCode[konamiCodePosition].toLowerCase()
    ) {
        konamiCodePosition++;
        if (konamiCodePosition === konamiCode.length) {
            activateEasterEgg();
            konamiCodePosition = 0;
        }
    } else {
        konamiCodePosition = 0;
    }
}

function activateEasterEgg() {
    document.getElementById("desc1").innerHTML = "You Found";
    document.getElementById("desc2").innerHTML = "The Secret!";
    document.getElementById("desc3").innerHTML = "Congratulations!";
    console.log("Easter Egg activated!");
    setTimeout(() => {
        window.location.href = "/videos.html";
    }, 2500);
}

document.addEventListener("keydown", konamiCodeCheck);
