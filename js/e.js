document.addEventListener("keydown", konamiCodeCheck);
document.addEventListener("keydown", hmmnewcategory);
document.addEventListener("DOMContentLoaded", async function () {
    checktitle();
    const api = "https://api.github.com/repos/mid0hub/website-api";
    const Default_gallery = document.getElementById("Gallery");
    const categorySelect = document.getElementById("categorySelect");
    const tiktokMenu = document.getElementById("tiktokMenu");
    const tiktokSelect = document.getElementById("tiktokSelect");
    let loadMoreButton = null;
    const firstcategory = categorySelect[0].value;
    const firstcategoryvideos = await getCachedVideos(firstcategory);
    displayVideosBatched(firstcategoryvideos);
    categorySelect.addEventListener("change", async function () {
        const category = categorySelect.value;

        Default_gallery.innerHTML = "";

        if (category === "tiktok") {
            switchCategory("Default_gallery");
            tiktokMenu.style.display = "block";
            resetLoadMoreButton();
            await fetchtiktok();
        } else if (category === "liked") {
            switchCategory("liked_category");
            tiktokMenu.style.display = "none";
            const videoLinks = await getCachedVideos(category);
            resetLoadMoreButton();

            displayVideosBatched(videoLinks);
        } else if (category === "saved") {
            switchCategory("saved_category");
            tiktokMenu.style.display = "none";
            const videoLinks = await getCachedVideos(category);
            resetLoadMoreButton();
            displayVideosBatched(videoLinks);
        } else {
            switchCategory("Default_gallery");
            tiktokMenu.style.display = "none";
            const videoLinks = await getCachedVideos(category);
            resetLoadMoreButton();
            displayVideosBatched(videoLinks);
        }
    });

    function switchCategory(a) {
        const container = document.querySelector(".gallery");
        if (container) {
            container.id = a;
            console.log(`Switched to ${a}.`);
        }
    }

    tiktokSelect.addEventListener("change", async function () {
        Default_gallery.innerHTML = "";
        const selecttiktok = tiktokSelect.value;
        const tiktokvideos = await getCachedVideos(`tiktok/${selecttiktok}`);
        resetLoadMoreButton();
        displayVideosBatched(tiktokvideos);
    });

    // /*});*/ //That interesting

    async function fetchtiktok() {
        const tiktoksResponse = await fetch(`${api}/contents/galery/tiktok`);
        const tiktoksData = await tiktoksResponse.json();

        const cachedTiktokers = localStorage.getItem("cachedtiktokers");

        if (!cachedTiktokers) {
            console.log(`Tiktokers is caching...`);
            localStorage.setItem(
                "cachedtiktokers",
                JSON.stringify(tiktoksData)
            );
        } else {
            if (cachedTiktokers.includes("API rate limit")) {
                console.log(
                    "Cached Tiktokers contain API rate limit message. Removing cache."
                );
                localStorage.removeItem("cachedtiktokers");
                console.log(`Tiktokers is recaching...`);
                localStorage.setItem(
                    "cachedtiktokers",
                    JSON.stringify(tiktoksData)
                );
            } else {
                const cachedCommitDate = localStorage.getItem(
                    "cachedCommitDate_tiktok"
                );
                const commitsURL = `${api}/commits`;
                const commitsResponse = await fetch(commitsURL);

                if (commitsResponse.ok) {
                    const commitsData = await commitsResponse.json();
                    const latestCommitDate = commitsData[0].commit.author.date;

                    if (cachedCommitDate !== latestCommitDate) {
                        console.log("YEEEYYY New TikTokerssss");
                        localStorage.setItem(
                            "cachedtiktokers",
                            JSON.stringify(tiktoksData)
                        );
                        localStorage.setItem(
                            "cachedCommitDate_tiktok",
                            latestCommitDate
                        );
                    } else {
                        console.log(
                            `Tiktokers:\ncachedCommitDate: ${cachedCommitDate}\nlatestCommitDate: ${latestCommitDate}`
                        );
                    }
                } else {
                    console.log(
                        `You Forbidden Github Api\nReason: github rate limit activated please try again after 1 hour\nResponse:`
                    );
                    console.log(commitsResponse);
                }
            }
        }

        const updatedCachedTiktokers = localStorage.getItem("cachedtiktokers");
        const tiktokers = JSON.parse(updatedCachedTiktokers);

        tiktokSelect.innerHTML = "";

        tiktokers.forEach((tiktoker) => {
            const tiktokOption = document.createElement("option");
            tiktokOption.value = tiktoker.name;
            tiktokOption.textContent = tiktoker.name;
            tiktokSelect.appendChild(tiktokOption);
        });

        const firstTiktok = tiktokers[0].name;
        const firstTiktokVideos = await getCachedVideos(
            `tiktok/${firstTiktok}`
        );
        displayVideosBatched(firstTiktokVideos);
    }

    async function displayVideosBatched(videoLinks) {
        if (!videoLinks) {
            return;
        }
        const batchSize = 4;
        let startIndex = 0;
        function loadNextBatch() {
            const batch = videoLinks.slice(startIndex, startIndex + batchSize);
            if (batch.length > 0) {
                displayVideos(batch);
                startIndex += batchSize;
            } else {
                loadMoreButton.style.display = "none";
            }
        }

        loadNextBatch();

        loadMoreButton = document.createElement("button");
        loadMoreButton.textContent = "Load More";
        loadMoreButton.id = "loadmorebutton";
        loadMoreButton.style.display = "block";
        loadMoreButton.style.margin = "20px auto";
        loadMoreButton.style.padding = "10px 20px";
        loadMoreButton.style.fontSize = "16px";
        loadMoreButton.addEventListener("click", function () {
            loadNextBatch();
        });
        document.body.appendChild(loadMoreButton);
    }

    async function displayVideos(videoLinks) {
        const liked = localStorage.getItem("liked") || "[]";
        const parsedliked = JSON.parse(liked);
        const saved = localStorage.getItem("saved") || "[]";
        const parsedsaved = JSON.parse(saved);

        videoLinks.forEach((videoLink) => {
            const videoContainer = document.createElement("div");
            videoContainer.classList.add("video-container");

            const videoElement = document.createElement("video");
            videoElement.controls = true;
            videoElement.style.height = "100%";
            const sourceElement = document.createElement("source");
            sourceElement.src = videoLink;
            sourceElement.type = "video/mp4";

            const isLiked = parsedliked.includes(videoLink);

            if (isLiked) {
                videoElement.setAttribute("data-liked", "true");
            }

            const issaved = parsedsaved.includes(videoLink);

            if (issaved) {
                videoElement.setAttribute("data-saved", "true");
            }

            videoElement.appendChild(sourceElement);
            videoContainer.appendChild(videoElement);

            const likeButton = document.createElement("button");
            likeButton.innerHTML = isLiked
                ? '<i class="bi bi-suit-heart-fill"></i>'
                : '<i class="bi bi-suit-heart"></i>';
            likeButton.classList.add("like-button");

            likeButton.addEventListener("click", function () {
                toggleLikeStatus(videoLink, videoElement, likeButton);
            });

            videoContainer.appendChild(likeButton);

            const savedButton = document.createElement("button");
            savedButton.innerHTML = issaved
                ? '<i class="bi bi-bookmarks-fill"></i>'
                : '<i class="bi bi-bookmarks"></i>';
            savedButton.classList.add("saved-button");

            savedButton.addEventListener("click", function () {
                toggleSavedStatus(videoLink, videoElement, savedButton);
            });

            videoContainer.appendChild(savedButton);

            Default_gallery.appendChild(videoContainer);
            checkambiance();
        });
    }

    function toggleLikeStatus(videoLink, videoElement, likeButton) {
        const liked = JSON.parse(localStorage.getItem("liked")) || [];
        const isLiked = liked.includes(videoLink);

        if (!isLiked) {
            liked.push(videoLink);
            localStorage.setItem("liked", JSON.stringify(liked));
            likeButton.innerHTML = '<i class="bi bi-suit-heart-fill"></i>';
            videoElement.setAttribute("data-liked", "true");
        } else {
            const updatedLikes = liked.filter((link) => link !== videoLink);
            localStorage.setItem("liked", JSON.stringify(updatedLikes));
            likeButton.innerHTML = '<i class="bi bi-suit-heart"></i>';
            videoElement.removeAttribute("data-liked");

            const likedCategory = document.getElementById("liked_category");
            if (likedCategory) {
                const videoContainers =
                    likedCategory.querySelectorAll(".video-container");
                videoContainers.forEach((container) => {
                    if (container.querySelector("source").src === videoLink) {
                        container.remove();
                    }
                });
            }
        }
    }

    function toggleSavedStatus(videoLink, videoElement, savedButton) {
        const saved = JSON.parse(localStorage.getItem("saved")) || [];
        const issaved = saved.includes(videoLink);

        if (!issaved) {
            saved.push(videoLink);
            localStorage.setItem("saved", JSON.stringify(saved));
            savedButton.innerHTML = '<i class="bi bi-bookmarks-fill"></i>';
            videoElement.setAttribute("data-saved", "true");
        } else {
            const updatedsaveds = saved.filter((link) => link !== videoLink);
            localStorage.setItem("saved", JSON.stringify(updatedsaveds));
            savedButton.innerHTML = '<i class="bi bi-bookmarks"></i>';
            videoElement.removeAttribute("data-saved");

            const savedCategory = document.getElementById("saved_category");
            if (savedCategory) {
                const videoContainers =
                    savedCategory.querySelectorAll(".video-container");
                videoContainers.forEach((container) => {
                    if (container.querySelector("source").src === videoLink) {
                        container.remove();
                    }
                });
            }
        }
    }

    function resetLoadMoreButton() {
        if (loadMoreButton) {
            loadMoreButton.remove();
            loadMoreButton = null;
        }
    }

    async function fetchAndCacheVideos(category) {
        if (category == "liked") {
            return JSON.parse(localStorage.getItem("liked"));
        } else if (category == "saved") {
            return JSON.parse(localStorage.getItem("saved"));
        }

        const videosFolderURL = `${api}/contents/galery/` + category;
        const commitsURL = `${api}/commits`;
        const commitsResponse = await fetch(commitsURL);
        const commitsData = await commitsResponse.json();
        const latestCommitDate = commitsData[0].commit.author.date;
        const response = await fetch(videosFolderURL);
        const data = await response.json();
        const videoLinks = data.map((item) => item.download_url);
        const cachedCommitDate = localStorage.getItem(
            "cachedCommitDate_" + category
        );

        if (!cachedCommitDate || cachedCommitDate !== latestCommitDate) {
            localStorage.setItem(
                "cached_" + category,
                JSON.stringify(videoLinks)
            );
            localStorage.setItem(
                "cachedCommitDate_" + category,
                latestCommitDate
            );
        }

        return videoLinks;
    }

    async function getCachedVideos(category) {
        if (category === "tiktok") {
            return;
        }
        if (category.includes("tiktok/")) {
            let cachedVideos = localStorage.getItem("cached_" + category);

            if (!cachedVideos) {
                console.log(`${category} is caching...`);
                cachedVideos = await fetchAndCacheVideos(category);
            } else {
                const cachedCommitDate = localStorage.getItem(
                    "cachedCommitDate_" + category
                );
                const commitsURL = `${api}/commits`;
                const commitsResponse = await fetch(commitsURL);

                if (commitsResponse.status === 403) {
                    console.log(
                        `You Forbidden Github Api\nReason: github rate limit activated please try again after 1 hour\nResponse:`
                    );
                    console.log(commitsResponse);
                    cachedVideos = JSON.parse(cachedVideos);
                    cachedVideos.reverse();
                } else {
                    const commitsData = await commitsResponse.json();
                    const latestCommitDate = commitsData[0].commit.author.date;

                    if (cachedCommitDate !== latestCommitDate) {
                        console.log("YEEEYYY New Videossss");
                        cachedVideos = await fetchAndCacheVideos(category);
                    } else {
                        console.log(
                            `Category: ${category}\ncachedCommitDate: ${cachedCommitDate}\nlatestCommitDate: ${latestCommitDate}`
                        );
                        cachedVideos = JSON.parse(cachedVideos);
                    }
                }
            }
            cachedVideos.reverse();

            return cachedVideos;
        }
        let cachedVideos = localStorage.getItem("cached_" + category);

        if (!cachedVideos) {
            console.log(`${category} is caching...`);
            cachedVideos = await fetchAndCacheVideos(category);
        } else {
            const cachedCommitDate = localStorage.getItem(
                "cachedCommitDate_" + category
            );
            const commitsURL = `${api}/commits`;
            const commitsResponse = await fetch(commitsURL);

            if (commitsResponse.status === 403) {
                console.log(
                    `You Forbidden Github Api\nReason: github rate limit activated please try again after 1 hour\nResponse:`
                );
                console.log(commitsResponse);
                cachedVideos = JSON.parse(cachedVideos);
            } else {
                const commitsData = await commitsResponse.json();
                const latestCommitDate = commitsData[0].commit.author.date;

                if (cachedCommitDate !== latestCommitDate) {
                    console.log("YEEEYYY New Videossss");
                    cachedVideos = await fetchAndCacheVideos(category);
                } else {
                    console.log(
                        `Category: ${category}\ncachedCommitDate: ${cachedCommitDate}\nlatestCommitDate: ${latestCommitDate}`
                    );
                    cachedVideos = JSON.parse(cachedVideos);
                }
            }
        }

        return cachedVideos;
    }
});

/*
==========================
		Settings
==========================
*/
const settingsButton = document.getElementById("settingsButton");
const settingsModal = document.getElementById("settingsModal");
const ambianceToggleSwitch = document.getElementById("ambianceToggleSwitch");
const changeTitleInput = document.getElementById("newTitle");
const resetTitleButton = document.getElementById("resettitle");
const desc1 = document.getElementById("desc1");
function checkambiance() {
    const isAmbianceMode = localStorage.getItem("ambianceMode");
    if (isAmbianceMode && isAmbianceMode === "true") {
        ambianceToggleSwitch.checked = true;
        document
            .querySelectorAll(".video-container")
            .forEach(function (videoContainer) {
                videoContainer.style.boxShadow = "0 0 20px rgb(255, 255, 255)";
            });
    }
}

function checktitle() {
    const title = localStorage.getItem("title");
    if (title) {
        if (title.trim() === "") {
            desc1.textContent = "ε(´｡•᎑•`)っ 💕";
            localStorage.setItem("title", desc1.textContent);
        } else {
            desc1.textContent = title;
        }
    }
}

ambianceToggleSwitch.addEventListener("change", function () {
    if (ambianceToggleSwitch.checked) {
        document
            .querySelectorAll(".video-container")
            .forEach(function (videoContainer) {
                videoContainer.style.boxShadow = "0 0 20px rgb(255, 255, 255)";
            });
        localStorage.setItem("ambianceMode", "true");
    } else {
        document
            .querySelectorAll(".video-container")
            .forEach(function (videoContainer) {
                videoContainer.style.boxShadow = "0 0 20px rgb(0, 0, 0)";
            });
        localStorage.setItem("ambianceMode", "false");
    }
});

changeTitleInput.addEventListener("input", function () {
    desc1.textContent = changeTitleInput.value;
    localStorage.setItem("title", desc1.textContent);
});
resetTitleButton.addEventListener("click", function () {
    desc1.textContent = "ε(´｡•᎑•`)っ 💕";
    localStorage.setItem("title", desc1.textContent);
});

settingsButton.addEventListener("click", function () {
    settingsModal.style.display = "block";
});

function closeModal() {
    settingsModal.style.display = "none";
}

/*
==========================
		konamicode
==========================
*/
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
            document.getElementById("desc1").innerHTML =
                "You Found The Secret! , again , Congratulations!";
            console.log("Easter Egg activated!");
            setTimeout(() => {
                window.location.href = "/fuksci.html";
            }, 2500);
            konamiCodePosition = 0;
        }
    } else {
        konamiCodePosition = 0;
    }
}

/*
==========================
		NewCategory
==========================
*/

const newcategorykeys = [
    "ArrowLeft",
    "ArrowLeft",
    "ArrowRight",
    "ArrowRight",
    "ArrowUp",
    "ArrowUp",
    "ArrowDown",
    "ArrowDown",
    "q",
    "w",
    "e",
];
let newcategorykeyposition = 0;

function hmmnewcategory(event) {
    if (
        event.key.toLowerCase() ===
        newcategorykeys[newcategorykeyposition].toLowerCase()
    ) {
        newcategorykeyposition++;

        if (newcategorykeyposition === newcategorykeys.length) {
            console.log("Hmm new category... interesting");

            localStorage.setItem("newCategorys", true);

            const categorySelect = document.getElementById("categorySelect");

            const tiktokOption = categorySelect.querySelector(
                'option[value="tiktok"]'
            );
            const instagramOption = categorySelect.querySelector(
                'option[value="instagram"]'
            );
            if (!tiktokOption) {
                const newOption = document.createElement("option");
                newOption.value = "tiktok";
                newOption.textContent = "💃 tiktok 💃";
                categorySelect.appendChild(newOption);
                console.log("tiktok category added!");
            }
            /*
            if (!instagramOption) {
                const newOption = document.createElement("option");
                newOption.value = "instagram";
                newOption.textContent = "🔴 instagram 🟡";
                categorySelect.appendChild(newOption);
                console.log("instagram category added!");
            }*/
            newcategorykeyposition = 0;
        }
    } else {
        newcategorykeyposition = 0;
    }
}

const newCategorys = localStorage.getItem("newCategorys");
if (newCategorys !== null && newCategorys === "true") {
    const categorySelect = document.getElementById("categorySelect");
    const tiktokOption = categorySelect.querySelector('option[value="tiktok"]');
    // const instagramOption = categorySelect.querySelector('option[value="instagram"]');
    if (!tiktokOption) {
        const newOption = document.createElement("option");
        newOption.value = "tiktok";
        newOption.textContent = "💃 tiktok 💃";
        categorySelect.appendChild(newOption);
        console.log("tiktok category added!");
    } /*
    if (!instagramOption) {
        const newOption = document.createElement("option");
        newOption.value = "instagram";
        newOption.textContent = "🔴 instagram 🟡";
        categorySelect.appendChild(newOption);
        console.log("instagram category added!");
    }*/
}

document.addEventListener("keydown", hmmnewcategory);
