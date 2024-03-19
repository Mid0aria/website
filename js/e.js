document.addEventListener("keydown", konamiCodeCheck);
document.addEventListener("keydown", hmmnewcategory);
document.addEventListener("DOMContentLoaded", async function () {
    const api = "https://api.github.com/repos/mid0hub/website-api";
    const videoGallery = document.getElementById("videoGallery");
    const categorySelect = document.getElementById("categorySelect");
    const tiktokMenu = document.getElementById("tiktokMenu");
    const tiktokSelect = document.getElementById("tiktokSelect");
    let loadMoreButton = null;
    const firstcategory = categorySelect[0].value;
    const firstcategoryvideos = await getCachedVideos(firstcategory);
    displayVideosBatched(firstcategoryvideos);
    //categorys
    categorySelect.addEventListener("change", async function () {
        const category = categorySelect.value;

        videoGallery.innerHTML = "";

        if (category === "tiktok") {
            resetLoadMoreButton();
            switchCategory("videoGallery");
            tiktokMenu.style.display = "block";
            await fetchtiktok();
        } else if (category === "liked") {
            resetLoadMoreButton();
            switchCategory("liked_category");
            tiktokMenu.style.display = "none";
            const videoLinks = await getCachedVideos(category);
            displayVideosBatched(videoLinks);
        } else if (category === "saved") {
            resetLoadMoreButton();
            switchCategory("saved_category");
            tiktokMenu.style.display = "none";
            const videoLinks = await getCachedVideos(category);
            displayVideosBatched(videoLinks);
        } else {
            resetLoadMoreButton();
            switchCategory("videoGallery");
            tiktokMenu.style.display = "none";
            const videoLinks = await getCachedVideos(category);
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

    //tiktok
    tiktokSelect.addEventListener("change", async function () {
        videoGallery.innerHTML = "";
        resetLoadMoreButton();
        const selecttiktok = tiktokSelect.value;
        const tiktokvideos = await getCachedVideos(`tiktok/${selecttiktok}`);
        displayVideosBatched(tiktokvideos);
    });

    // });

    async function fetchtiktok() {
        const tiktoksResponse = await fetch(`${api}/contents/videos/tiktok`);

        const tiktoksData = await tiktoksResponse.json();

        const cachedTiktokers = localStorage.getItem("cachedtiktokers");

        if (!cachedTiktokers) {
            console.log(`Tiktokers is caching...`);
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
        const likedVideos = localStorage.getItem("liked_videos") || "[]";
        const parsedLikedVideos = JSON.parse(likedVideos);
        const savedVideos = localStorage.getItem("saved_videos") || "[]";
        const parsedsavedVideos = JSON.parse(savedVideos);

        videoLinks.forEach((videoLink) => {
            const videoContainer = document.createElement("div");
            videoContainer.classList.add("video-container");

            const videoElement = document.createElement("video");
            videoElement.controls = true;
            videoElement.style.height = "100%";
            const sourceElement = document.createElement("source");
            sourceElement.src = videoLink;
            sourceElement.type = "video/mp4";

            const isLiked = parsedLikedVideos.includes(videoLink);

            if (isLiked) {
                videoElement.setAttribute("data-liked", "true");
            }

            const issaved = parsedsavedVideos.includes(videoLink);

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

            videoGallery.appendChild(videoContainer);
        });
    }

    function toggleLikeStatus(videoLink, videoElement, likeButton) {
        const likedVideos =
            JSON.parse(localStorage.getItem("liked_videos")) || [];
        const isLiked = likedVideos.includes(videoLink);

        if (!isLiked) {
            likedVideos.push(videoLink);
            localStorage.setItem("liked_videos", JSON.stringify(likedVideos));
            likeButton.innerHTML = '<i class="bi bi-suit-heart-fill"></i>';
            videoElement.setAttribute("data-liked", "true");
        } else {
            const updatedLikes = likedVideos.filter(
                (link) => link !== videoLink
            );
            localStorage.setItem("liked_videos", JSON.stringify(updatedLikes));
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
        const savedVideos =
            JSON.parse(localStorage.getItem("saved_videos")) || [];
        const issaved = savedVideos.includes(videoLink);

        if (!issaved) {
            savedVideos.push(videoLink);
            localStorage.setItem("saved_videos", JSON.stringify(savedVideos));
            savedButton.innerHTML = '<i class="bi bi-bookmarks-fill"></i>';
            videoElement.setAttribute("data-saved", "true");
        } else {
            const updatedsaveds = savedVideos.filter(
                (link) => link !== videoLink
            );
            localStorage.setItem("saved_videos", JSON.stringify(updatedsaveds));
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
            return JSON.parse(localStorage.getItem("liked_videos"));
        }
        if (category == "saved") {
            return JSON.parse(localStorage.getItem("saved_videos"));
        }
        const videosFolderURL = `${api}/contents/videos/` + category;

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
                "cachedVideos_" + category,
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
            let cachedVideos = localStorage.getItem("cachedVideos_" + category);

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
        let cachedVideos = localStorage.getItem("cachedVideos_" + category);

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

            localStorage.setItem("tiktokCategory", true);

            const categorySelect = document.getElementById("categorySelect");

            const tiktokOption = categorySelect.querySelector(
                'option[value="tiktok"]'
            );
            if (!tiktokOption) {
                const newOption = document.createElement("option");
                newOption.value = "tiktok";
                newOption.textContent = "💃 tiktok 💃";
                categorySelect.appendChild(newOption);
                console.log("tiktok category added!");
            }
            newcategorykeyposition = 0;
        }
    } else {
        newcategorykeyposition = 0;
    }
}

const tiktokCategory = localStorage.getItem("tiktokCategory");
if (tiktokCategory !== null && tiktokCategory === "true") {
    const categorySelect = document.getElementById("categorySelect");
    const tiktokOption = categorySelect.querySelector('option[value="tiktok"]');
    if (!tiktokOption) {
        const newOption = document.createElement("option");
        newOption.value = "tiktok";
        newOption.textContent = "💃 tiktok 💃";
        categorySelect.appendChild(newOption);
        console.log("tiktok category added!");
    }
}

document.addEventListener("keydown", hmmnewcategory);
