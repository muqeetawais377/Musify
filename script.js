let currentSong = new Audio();
let songs;
let currentFolder;
let play = document.getElementById("play");
let previous = document.getElementById("previous");
let forward = document.getElementById("forward");

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

async function getSongs(folder) {
    currentFolder = folder;
    try {
        let res = await fetch(`${folder}/songs.json`);
        songs = await res.json();
        songs = songs.map(s => `${folder}/${s}`);
    } catch (err) {
        songs = [];
    }

    let songUL = document.querySelector(".songsList ul");
    songUL.innerHTML = "";
    for (const song of songs) {
        let fileName = decodeURIComponent(song.split("/").pop());
        songUL.innerHTML += `<li>
            <img src="images/music.svg" alt="">
            <div class="info">
                <div>${fileName}</div>
                <div>Muqeet</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="playButton" src="images/play.svg" alt="">
            </div>
        </li>`;
    }

    Array.from(songUL.getElementsByTagName("li")).forEach((e, i) => e.addEventListener("click", () => playMusic(songs[i])));
    return songs;
}

const playMusic = (track, pause = false) => {
    currentSong.src = `${track}`;
    if (!pause) {
        currentSong.play();
        play.src = "images/pause.svg";
    }
    let cleanName = decodeURIComponent(track.split("/").pop());
    document.querySelector(".songinfo").innerHTML = cleanName;
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

async function displayAlbums() {
    try {
        let res = await fetch(`songs/index.json`);
        let data = await res.json();
        let albums = data.albums;

        let cardContainer = document.querySelector(".cardContainer");
        cardContainer.innerHTML = "";

        for (const folder of albums) {
            let infoRes = await fetch(`songs/${folder}/info.json`);
            let info = await infoRes.json();

            cardContainer.innerHTML += `<div data-folder="${folder}" class="card">
                <div class="play-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                        <g transform="translate(0,-75)">
                            <path fill="#000000" d="M187.2 100.9C174.8 94.1 159.8 94.4 147.6 101.6C135.4 108.8 128 121.9 128 136L128 504C128 518.1 135.5 531.2 147.6 538.4C159.7 545.6 174.8 545.9 187.2 539.1L523.2 355.1C536 348.1 544 334.6 544 320C544 305.4 536 291.9 523.2 284.9L187.2 100.9z"/>
                        </g>
                    </svg>
                </div>
                <img src="songs/${folder}/cover.jpeg" alt="">
                <h2>${info.title}</h2>
                <p>${info.description}</p>
            </div>`;
        }

        Array.from(document.getElementsByClassName("card")).forEach(e => {
            e.addEventListener("click", async item => {
                songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
                playMusic(songs[0]);
            });
        });

    } catch (err) {
        console.error("Error fetching index.json or albums:", err);
    }
}

async function main() {
    await displayAlbums();

    let firstCard = document.querySelector(".card");
    if (firstCard) {
        let firstFolder = firstCard.dataset.folder;
        songs = await getSongs(`songs/${firstFolder}`);
        playMusic(songs[0], true);
    }

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "images/pause.svg";
        } else {
            currentSong.pause();
            play.src = "images/play.svg";
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML =
            `${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    document.querySelector(".hamburger").addEventListener("click", () => { document.querySelector(".left").style.left = "0" });
    document.querySelector(".closehamburger").addEventListener("click", () => { document.querySelector(".left").style.left = "-120%" });

    function normalizePath(path) {
        return decodeURIComponent(path).replace(window.location.origin + "/", "");
    }
    
    forward.addEventListener("click", () => {
        currentSong.pause();
        let currentPath = normalizePath(currentSong.src);
        let index = songs.findIndex(s => normalizePath(s) === currentPath);
        if (index < songs.length - 1) playMusic(songs[index + 1]);
    });
    
    previous.addEventListener("click", () => {
        currentSong.pause();
        let currentPath = normalizePath(currentSong.src);
        let index = songs.findIndex(s => normalizePath(s) === currentPath);
        if (index > 0) playMusic(songs[index - 1]);
    });

    document.querySelector(".range input").addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
    });

    document.querySelector(".volume>img").addEventListener("click", (e) => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = "images/mute.svg";
            currentSong.volume = 0;
            document.querySelector(".range input").value = 0;
        } else {
            e.target.src = "images/volume.svg";
            currentSong.volume = 0.1;
            document.querySelector(".range input").value = 10;
        }
    });
}

main();
