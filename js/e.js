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
    console.log("ε(´｡•᎑•`)っ 💕");
    setTimeout(() => {
        window.location.href = "/videos.html";
    }, 2500);
}

document.addEventListener("keydown", konamiCodeCheck);

async function fetchSongs() {
    const response = await fetch("./assets/songs.json");
    const data = await response.json();
    return data;
}

function selectRandomSong(songs, previousSong) {
    let randomIndex;
    do {
        randomIndex = Math.floor(Math.random() * songs.length);
    } while (songs[randomIndex].song === previousSong);

    return songs[randomIndex];
}

async function updateSongOfTheDay() {
    let previousSong = localStorage.getItem("previousSong");
    const now = new Date();
    const currentDay = now.getDate();
    const savedDay = localStorage.getItem("day");

    if (!savedDay || parseInt(savedDay) !== currentDay) {
        localStorage.setItem("day", currentDay);
        localStorage.setItem("changeSong", "true");
        console.log(
            "Day:" +
                localStorage.getItem("day") +
                "\nchangeSong: " +
                localStorage.getItem("changeSong")
        );
    }

    const changeSong = localStorage.getItem("changeSong");
    if (changeSong === "true") {
        const songs = await fetchSongs();
        const selectedSong = selectRandomSong(songs, previousSong);
        localStorage.setItem("previousSong", selectedSong.song);
        localStorage.setItem("changeSong", "false");
        console.log(
            "Day:" +
                localStorage.getItem("day") +
                "\nchangeSong: " +
                localStorage.getItem("changeSong")
        );
        document.getElementById("spotifyEmbed").innerHTML = selectedSong.song;
    } else {
        const songs = await fetchSongs();
        const savedSong = songs.find((song) => song.song === previousSong);
        if (savedSong) {
            document.getElementById("spotifyEmbed").innerHTML = savedSong.song;
        }
    }
}

window.addEventListener("load", updateSongOfTheDay);
