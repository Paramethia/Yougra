// Ping sever on page load to wake up Render server (doing this because of the free tier)
window.addEventListener("load", () => {
    setTimeout(() => {
        fetch("https://yougra-server.onrender.com/ping").then(() => console.log("Server warmed up")).catch(() => console.warn("Could not reach server (might still be waking up)"));
    }, 1500);
});

// === Setings overlay elements ===
const settingsNav = document.getElementById("settings-nav");
const settings = document.getElementById("settings");
const closeSettings = document.getElementById("close-settings");
const sets = document.querySelectorAll(".sets");
const immediate = document.getElementById("immediate");
const process = document.getElementById("process");

// === Modes elements ===
const searchO = document.getElementById("search-o");
const urlO = document.getElementById("link-o");
const searchCon = document.getElementById("search-mode");
const urlCon = document.getElementById("link-mode");

// === Search elements ===
const searchB = document.getElementById("search");
const searchErr = document.getElementById("search-err-msg");
const searchResults = document.getElementById("search-results");
const vidsCon = document.getElementById("vids");
const titleTooltip = document.getElementById("title-tp");

// === URL elements ===
    // Video elements
const findInfo = document.getElementById("find-info");
const videoErr = document.getElementById("video-err-msg");
const selection = document.getElementById("selection-msg");
const vidCon = document.getElementById("video-info");
const vdOptionsB = document.getElementById("v-d-options-b");
const vdOptions = document.getElementById("v-d-options");
const vidSet = document.getElementById("vid-o");
const audSet = document.getElementById("aud-o");

    // Playlist elements
const findPlaylist = document.getElementById("find-list");
const playlistErr = document.getElementById("playlist-err-msg");
const playCon = document.getElementById("playlist-info");
const pdOptionsB = document.getElementById("p-d-options-b");
const pdOptions = document.getElementById("p-d-options");

// === Settings overlay UI functions ===

let settingsOpened = false;

function closeSet() {
    settingsNav.style.borderTop = '1px dashed #ee555';
    settingsNav.style.borderBottom = '1px dashed #ee555';
    settingsNav.style.borderRight = 'none';
    settingsNav.style.borderLeft = 'none';
    settings.style.visibility = 'hidden';
    document.body.style.overflow = 'auto';
}

settingsNav.onclick = () => {
    settingsOpened = !settingsOpened;

    if (settingsOpened) {
        settingsNav.style.border = '1px dashed #e55';
        settings.style.visibility = 'visible';
        document.body.style.overflow = 'hidden';
    } else {
        closeSet();
    }
}

closeSettings.onclick = () => { 
    settingsOpened = false;
    closeSet();
}

containersOpened = [false, false];

sets.forEach((con, index) => {
    con.onmouseover = () => {
        con.style.background = 'rgba(238, 119, 119, 0.1)';
    }
    con.onmouseout = () => {
        if (!containersOpened[index]) con.style.background = 'none';
    }
    con.onclick = () => {
        containersOpened[index] = !containersOpened[index];

        sets.forEach((conAgain, i) => {
            if (i !== index && containersOpened[i]) {
                containersOpened[i] = false;
                conAgain.style.animation = 'minimise 1.2s ease forwards';
                conAgain.style.background = 'none';
                conAgain.style.overflow = 'hidden';
                conAgain.scrollTop = 0;
            }
        });

        if (containersOpened[index]) {
            con.style.animation = 'expand 1.2s ease forwards';
            con.style.overflow = 'auto';
        } else {
            con.style.animation = 'minimise 1.2s ease forwards';
            con.style.overflow = 'hidden';
            con.scrollTop = 0;
        } 
    } 
});

let method = localStorage.getItem("method") || "process";

if (method === "fast") immediate.style.backgroundColor = 'rgba(170, 170, 170, 0.2)';
if (method === "process") process.style.backgroundColor = 'rgba(170, 170, 170, 0.2)';

immediate.onmouseover = () => { if (immediate.style.background !== 'rgba(170, 170, 170, 0.2)') immediate.style.backgroundColor = 'rgba(170, 170, 170, 0.2)' }
immediate.onmouseout = () => { if (method === "process") immediate.style.backgroundColor = '' }
immediate.onclick = () => { 
    if (method === "process") {
        process.style.backgroundColor = "";
        method = "fast";
        localStorage.setItem("method", method);
    }
}

process.onmouseover = () => { if (process.style.background !== 'rgba(170, 170, 170, 0.2)') process.style.backgroundColor = 'rgba(170, 170, 170, 0.2)' }
process.onmouseout = () => { if (method === "fast") process.style.backgroundColor = '' }
process.onclick = () => { 
    if (method === "fast") {
        immediate.style.backgroundColor = "";
        method = "process";
        localStorage.setItem("method", method);
    }
}

// === Search and Use link mode code ===

searchO.style.backgroundColor = searchCon.style.display !== "none" ? "rgba(238, 119, 119, 0.4)" : "rgba(238, 119, 119, 0.2)";

searchO.onmouseout = () => { if (searchCon.style.display === "none") searchO.style.backgroundColor = "rgba(238, 119, 119, 0.2)" }

urlO.onmouseout = () => { if (urlCon.style.display  === "none") urlO.style.backgroundColor = "rgba(238, 119, 119, 0.2)" }

searchO.onclick = () => { searchMode() }

urlO.onclick = () => { urlMode() }

function searchMode() {
    searchO.style.backgroundColor = "rgba(238, 119, 119, 0.4)";
    urlO.style.backgroundColor = "rgba(238, 119, 119, 0.2)";
    urlCon.style.display = 'none';
    searchCon.style.display = 'block';
    removeKeyEvents();
    window.addEventListener("keydown", searchKey);
}

function urlMode() {
    urlO.style.backgroundColor = "rgba(238, 119, 119, 0.4)";
    searchO.style.backgroundColor = "rgba(238, 119, 119, 0.2)";
    urlCon.style.display = 'block';
    searchCon.style.display = 'none';
    removeKeyEvents();
    window.addEventListener("keydown", videoFindKey);
    window.addEventListener("keydown", playlistFindKey);
}

// === Search section functions ===

let searchTries = 0;

async function search() {
    const searchInput = document.getElementById("search-val").value;

    if (!searchInput) {
        searchErr.innerText = "Type something!!";
        setTimeout(() => { searchErr.innerText = "" }, 3400 );
        return
    }

    searchB.innerText = "Searching...";
    searchB.disabled = true;

    const response = await fetch("https://api.yougra.site/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: searchInput })
    }).catch(() => {
        searchB.innerText = "Search";
        searchB.disabled = false;
        searchTries++;
        switch (searchTries) {
            case 1: searchErr.innerText = "Could not search. Try again?"; break;
            case 2: searchErr.innerText = "Maybe it's your internet?"; break;
            case 3: searchErr.innerText = "There might be something wrong going on with the app"; break;
            case 4: searchErr.innerText = "Did you even try to reload?"; break;
            default: searchErr.innerText = "Just try again later, man"; break;
        }
        setTimeout(() => { searchErr.innerText = "" }, searchTries === 3 ? 5000 : 4000 );
        return
    });;

    searchB.innerText = "Search";
    searchB.disabled = false;

    const videos = await response.json();

    if (videos.length === 0) {
        searchErr.innerText = "Could not find anything. Check if you have no typo";
        setTimeout(() => { searchErr.innerText = "" }, 5200 );
        return
    }

    videos.forEach(video => {
        const image = new Image();
        image.onload = image.onerror = async () => { await image.decode() }
        image.src = video.thumbnail;
    });

    vidsCon.innerHTML = videos.map((video) => { 
        return `
            <div class="video">
                <div style="position: relative">
                    <img src="${video.thumbnail}" />
                    <span id="duration">${video.duration}</span>
                </div>
                <h4 class="v-title">${video.title.length < 29 ? video.title : video.title.slice(0, 28).trimEnd() + "..."}</h4>
                <h6>${video.author}</h6> <font color="#909090">|</font> <span id="views">${video.views}</span>
                <span class="share"><svg width="17" height="17" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" fill="#aaa"><g id="Layer_2" data-name="Layer 2"><g id="invisible_box" data-name="invisible box"><rect width="48" height="48" fill="none"/></g><g id="Q3_icons" data-name="Q3 icons"><path d="M31.2,14.2,41,24.1l-9.8,9.8V26.8L27,27c-6.8.3-12,1-16.1,2.4,3.6-3.8,9.3-6.8,16.7-7.5l3.6-.3V14.2M28.3,6a1.2,1.2,0,0,0-1.1,1.3V17.9C12,19.4,2.2,29.8,2,40.3c0,.6.2,1,.6,1s.7-.3,1.1-1.1c2.4-5.4,7.8-8.5,23.5-9.2v9.7A1.2,1.2,0,0,0,28.3,42a.9.9,0,0,0,.8-.4L45.6,25.1a1.5,1.5,0,0,0,0-2L29.1,6.4a.9.9,0,0,0-.8-.4Z"/></g></g></svg></span>
            </div>
        `;
    }).join("");

    searchResults.style.display = "block";

    const vidCons = document.querySelectorAll(".video");

    vidCons.forEach((vidCon, index) => { 
        vidCon.onclick = (e) => {
            e.stopPropagation();
            document.getElementById("vid-link").value = videos[index].url;
            urlMode();
            fetchVideo();
        }
    });

    const vTitles = document.querySelectorAll(".v-title");
    const titleTooltip = document.getElementById("title-tp");

    vTitles.forEach((title, index) => {
        title.addEventListener("mousemove", (e) => {
            titleTooltip.innerText = videos[index].title;
            titleTooltip.style.top = `${e.clientY - 35}px`;
            titleTooltip.style.left = `${e.clientX - 17}px`;
            titleTooltip.style.visibility = "visible";
        })
        title.addEventListener("mouseleave", () => titleTooltip.style.visibility = "hidden" )
    });

    const shareButtons = document.querySelectorAll(".share");

    shareButtons.forEach((shareB, index) => {
        shareB.onclick = (e) => {
            e.stopPropagation();
            shareB.style.animation = 'border-light-up 0.4s ease';
            setTimeout(() => { shareB.style.animation = 'none' }, 400 );
            navigator.clipboard.writeText(videos[index].url);
        }
    });
}

function removeKeyEvents() {
    window.removeEventListener("keydown", searchKey);
    window.removeEventListener("keydkown", videoFindKey);
    window.removeEventListener("keydown", playlistFindKey);
}

function searchKey(event) { if (event.key === "Enter") search() }

window.addEventListener("keydown", searchKey);
 
// === Link section functions ===

function validURL(url) {
    return (
        /^https?:\/\/(www\.)?(youtube|music\.youtube)\.com\/watch\?v=/.test(url) ||
        /^https?:\/\/youtu\.be\//.test(url) ||
        /^https?:\/\/(www\.)?(youtube|music\.youtube)\.com\/shorts\//.test(url)
    );
}

let pdo = false;

vdOptions.style.display = "none";
pdOptions.style.display = "none";

document.addEventListener("click", event => {
    if (vdOptions.style.display === "block" && !vdOptions.contains(event.target) && event.target !== vdOptionsB && event.target !== document.getElementById('dots')) {
        vdOptionsB.style.background = '#2a2a2a';
        vdOptions.style.display = 'none';
    } else if (pdo && !pdOptions.contains(event.target) && event.target !== pdOptionsB && event.target !== document.getElementById('dots')) {
        togglePdownloadOptions();
    }
});

vdOptionsB.onmouseover = () => { vdOptionsB.style.background = '#3f3f3f' }
vdOptionsB.onmouseout = () => { if (vdOptions.style.display !== "block") vdOptionsB.style.background = '#2a2a2a' }
pdOptionsB.onmouseover = () => { pdOptionsB.style.background = '#3f3f3f' }
pdOptionsB.onmouseout = () => { if (pdOptions.style.display !== "block") pdOptionsB.style.background = '#2a2a2a' }

function toggleVdownloadOptions() {
    if (vdOptions.style.display === "none") { 
        vdOptionsB.style.background = '#3f3f3f';
        vdOptions.style.display = 'block';
    } else {
        vdOptionsB.style.background = '#2a2a2a';
        vdOptions.style.display = 'none';
    }
}
function togglePdownloadOptions() {
    if (pdOptions.style.display === "none") { 
        pdOptionsB.style.background = '#3f3f3f';
        pdOptions.style.display = 'block';
        setTimeout(() => { pdo = true }, 150);
    } else {
        pdOptionsB.style.background = '#2a2a2a';
        pdOptions.style.display = 'none';
        pdo = false;
    }
}

let format = 'video';

vidSet.onmouseover = () => { vidSet.style.background = '#5d5d5d' }
vidSet.onmouseout = () => { if (format !== 'video') vidSet.style.background = '#3f3f3f' }
vidSet.onclick = () => {
    if (format === 'audio')
    format = 'video';
    vidSet.style.background = '#5d5d5d';
    audSet.style.background = '#3f3f3f';
    document.getElementById("v-size").style.display = 'inline';
    document.getElementById("a-size").style.display = 'none';
    document.getElementById("qualities").style.display = 'inline-block';
}

audSet.onmouseover = () => { audSet.style.background = '#5d5d5d' }
audSet.onmouseout = () => { if (format !== 'audio')audSet.style.background = '#3f3f3f' }
audSet.onclick = () => {
    if (format === 'video')
    format = 'audio';
    audSet.style.background = '#5d5d5d';
    vidSet.style.background = '#3f3f3f';
    document.getElementById("v-size").style.display = 'none';
    document.getElementById("a-size").style.display = 'inline';
    document.getElementById("qualities").style.display = 'none';
}

function videoFindKey(event) { if (event.key === "Enter") fetchVideo() }

let fvTries = 0;

async function fetchVideo() {
    const url = document.getElementById("vid-link").value;

    if (!url) {
        videoErr.innerText = "Where's the link, dawg?";
        setTimeout(() => { videoErr.innerText = "" }, 3000 );
        return;
    }

    if (!validURL(url)) {
        videoErr.innerText = "That's not a valid YouTube link";
        setTimeout(() => { videoErr.innerText = "" }, 4500 );
        return;
    }

    vidCon.style.display = "inline-block";

    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    }

    try {
        findInfo.disabled = true;
        
        const response = await fetch("https://api.yougra.site/get-info", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url })
        });

        const data = await response.json();

        const views = new Intl.NumberFormat('fr-FR').format(data.viewCount);
        const likes = new Intl.NumberFormat('fr-FR').format(data.likeCount);

        const videoFormats = data.qualities.filter(vF => vF.type === 'videoonly' && vF.qualityLabel !== '144p');
        videoFormats.reverse();
        const defaultVidO = videoFormats.find(vid => vid.qualityLabel === "480p") || videoFormats.find(vid => vid.qualityLabel === "360p");
        const audioFormats = data.qualities.filter(aF => aF.type === 'audioonly');
        const selectedAudio = audioFormats.pop();

        function fullSize(vS, aS) {
            vS = Number(vS.replace("mb", ""));
            aS = Number(aS.replace("mb", ""));
            return Math.round(vS + aS)
        }

        document.getElementById("loader-1").style.display = "none";
        document.getElementById("v").style.display = "block";
        document.getElementById("v-thumbnail").src = data.thumbnail;
        document.getElementById("length").innerHTML = formatTime(data.lengthSeconds);
        document.getElementById("vid-o").innerHTML = `
            <p>Video <span id="v-size">${fullSize(defaultVidO.size, selectedAudio.size)}mb</span></p>
            <select id="qualities">
                ${ videoFormats.map(vid => { return `<option value="${vid.qualityLabel}">${vid.qualityLabel}</option>` })}
            </select>
        `;
        document.getElementById("aud-o").innerHTML = `<p>Audio <span id="a-size">${selectedAudio.size}</span></p>`;
        document.getElementById("v-title").innerText = data.title;
        document.getElementById("v-author").innerHTML = `<strong>Poster ~</strong> ${data.author}`;
        document.getElementById("posted").innerHTML = `<strong>Posted ~</strong> ${data.publishDate}`;
        document.getElementById("views").innerHTML = `<strong>Views ~</strong> ${views}`;
        document.getElementById("likes").innerHTML = `<strong>Likes ~</strong> ${likes}`;

        selection.innerText = `Selected ${format}`;
        selection.style.visibility = "visible";
        selection.style.animation = "appear 2s linear";

        format = data.song ? "audio" : "video";
        selection.innerText = `Selected ${format}`;

        if (format === 'audio') {
            audSet.style.background = '#5d5d5d';
            vidSet.style.background = '#3f3f3f';
            document.getElementById("v-size").style.display = 'none';
            document.getElementById("a-size").style.display = 'inline';
            document.getElementById("qualities").style.display = 'none';
        } else {
            vidSet.style.background = '#5d5d5d';
            audSet.style.background = '#3f3f3f';
            document.getElementById("v-size").style.display = 'inline';
            document.getElementById("a-size").style.display = 'none';
            document.getElementById("qualities").style.display = 'inline-block';
        }

        setTimeout(() => { 
            selection.style.animation = "disappear 1s linear forwards";
            setTimeout(() => { selection.style.visibility = "hidden" }, 1100 );
        }, 4400);

        const qualities = document.getElementById("qualities");
        
        qualities.value = defaultVidO.qualityLabel;
        let itag = defaultVidO.itag;

        qualities.addEventListener('change', () => {
            const currentVideo = videoFormats.find(q => q.qualityLabel === qualities.value);
            document.getElementById("v-size").innerText = `${fullSize(currentVideo.size, selectedAudio.size)}mb`;
            itag = currentVideo.itag;
        });

        const downloadBtn = document.getElementById("download");
        const progressText = document.getElementById("progress-txt");
        const progress = document.getElementById("progress");
        downloadBtn.onclick = async () => {
            downloadBtn.disabled = true;
            downloadBtn.style.filter = "brightness(80%)";
            progress.style.width = "0%";

            try {
                if (format === "audio") {
                    // Trigger download via native browser stream
                    window.location.href = `https://api.yougra.site/download-a?url=${encodeURIComponent(url)}`;

                    setTimeout(() => {
                        downloadBtn.disabled = false;
                        downloadBtn.style.filter = "brightness(100%)";
                    }, 10000 + parseFloat(selectedAudio.size) * 1000)
                } else if (format === "video") {
                    if (method === "fast") {
                        window.location.href = `https://api.yougra.site/fast-download?url=${encodeURIComponent(url)}&itag=${itag}`;
                        setTimeout(() => {
                            downloadBtn.disabled = false;
                            downloadBtn.style.filter = "brightness(100%)";
                        }, 15000);
                        return
                    }

                    const size = parseInt(document.getElementById("v-size").innerText);
                    if (size > 5000) {
                        progressText.innerText = "You can't download a video larger than 5GB with processing.";
                        return
                    }

                    const ws = new WebSocket('wss://api.yougra.site');
                    let processed = false;

                    ws.onopen = () => {
                        console.log('WebSocket connected.');
                        ws.send(JSON.stringify({ url, itag }));
                        downloadBtn.innerText = "0%";
                        progressText.innerText = "Wait for it...";
                        document.getElementById("progress-bar").style.display = "block";
                    };

                    ws.onmessage = (event) => {
                        const message = JSON.parse(event.data);
                        
                        if (message.error) {
                            progressText.innerText = "Processing failed. Try with a different video.";
                            downloadBtn.disabled = false;
                            downloadBtn.style.filter = "brightness(100%)";
                            setTimeout(() => { progressText.innerText = "" }, 4000);
                            ws.close();
                            return;
                        }

                        if (message.status === "downloading") {
                            downloadBtn.innerText = `${Math.floor(message.progress) || 0}%`;
                            progress.style.backgroundColor = '#f5353c';
                            progress.style.width = `${message.progress}%`;
                            progressText.innerText = `Collecting ${message.fType} - ${message.downloaded || 0}mb / ${message.total}mb`;
                        }

                        if (message.status === "merging") {
                            downloadBtn.innerText = "Wait";
                            progressText.innerText = `Merging...`;
                            progress.style.backgroundColor = '#e55';
                            progress.style.width = `${Math.round(message.progress) || 0}%`;
                        }

                        if (message.status === 'complete') {
                            processed = true;
                            // Trigger the file download via a new request
                            window.location.href = `https://api.yougra.site${message.path}`;
                            
                            // Reset UI after a short delay
                            setTimeout(() => {
                                downloadBtn.innerText = "Download";
                                downloadBtn.disabled = false;
                                downloadBtn.style.filter = "brightness(100%)";
                                document.getElementById("progress-bar").style.display = "none";
                                progressText.innerText = "";
                            }, 500);
                            ws.close();
                        }
                    }

                    ws.onclose = () => {
                        console.log('WebSocket disconnected.');
                        if (!processed) {
                            downloadBtn.innerText = "Download";
                            downloadBtn.disabled = false;
                            downloadBtn.style.filter = "brightness(100%)";
                            document.getElementById("progress-bar").style.display = "none";
                            progressText.innerText = "Error occured while merging";
                            setTimeout(() => { progressText.innerText = "" }, 8700);
                        }
                    }
                }
            } catch (err) {
                progressText.innerText = "Download failed. Try again.";
                setTimeout(() => { progressText.innerText = "" }, 4000);
                console.error("Error occured while downloading: \n", err);
            }
        }
    } catch (err) {
        document.getElementById("v").style.display = "none";
        vidCon.style.display = "none";
        fvTries++;
        switch (fvTries) {
            case 1: videoErr.innerText = "Could not fetch video. Try again?"; break;
            case 2: videoErr.innerText = "Maybe it's your internet?"; break;
            case 3: videoErr.innerText = "There might be something wrong going on with the app"; break;
            case 4: videoErr.innerText = "Did you even try to reload?"; break;
            default: videoErr.innerText = "Just try again later, man"; break;
        }
        setTimeout(() => { videoErr.innerText = "" }, fvTries === 3 ? 5000 : 4000);
        console.error("Error occured while fetching video: \n", err);
    } finally {
        findInfo.disabled = false;
    }
}

const pora = document.getElementById("p-or-a");

setInterval(() => {
    pora.innerText === "playlist" ? pora.innerText = "album" : pora.innerText = "playlist"
    pora.style.animation = "appear 0.5s linear";
    setTimeout(() => { pora.style.animation = "" }, 1000 )
}, 10000 )

function playlistFindKey(event) { if (event.key === "Enter") fetchPlaylist() }

let fpTries = 0;

async function fetchPlaylist() {
    const url = document.getElementById("playlist-link").value;

    if (!url) {
        playlistErr.innerText = "Where's the link, dawg?";
        setTimeout(() => { playlistErr.innerText = "" }, 3400 );
        return
    }

    if (!url.includes("playlist?") || !url.includes("list=")) {
        playlistErr.innerText = "That's not a valid YouTube playlist link";
        setTimeout(() => { playlistErr.innerText = "" }, 4000 );
        return;
    }

    playCon.style.display = "block";

    try {
        findPlaylist.disabled = true;

        const response = await fetch("https://api.yougra.site/playlist", { 
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url }) 
        })

        const rData = await response.json();

        if (!rData.songs.length) {
            console.warn("No songs were served. Retrying request...");
            findPlaylist.disabled = false;
            fetchPlaylist();
            return
        }

        let maxText = 65;
        if (screen.width <= 450 || window.innerWidth <= 450) {
            maxText = 30
        } else if (screen.width <= 790 || window.innerWidth <= 790) {
            maxText = 37
        } else if (screen.width <= 1070 || window.innerWidth <= 1070) maxText = 45

        document.getElementById("loader-2").style.display = "none";
        document.getElementById("p").style.display = "block";
        document.getElementById("p-thumbnail").src = rData.thumbnail;
        document.getElementById("p-title").innerText = rData.title.length > maxText ? rData.title.slice(0, maxText).trimEnd() + "..." : rData.title;
        document.getElementById("p-author").innerHTML = `<strong>By ~</strong> ${rData.author}`;
        document.getElementById("a-amount").innerHTML = `<strong>Audio ~</strong> ${rData.songs.length}`;
        document.getElementById("songs").innerHTML = rData.songs.map((song, index) => {
            return `
                <div id="s">
                <div class="progress"></div>
                <span id="s-number">${index + 1}</span>
                <div class="song">
                    <span id="s-name" class="s-name">${song.title.length < 25 ? song.title : song.title.slice(0, 24).trimEnd() + "..."}</span>
                    <span id="s-author">${song.author}</span>
                    <span id="s-duration">${song.duration}</span>
                </div>
                </div>
            `
        }).join("");

        const songCons = document.querySelectorAll(".song");
        const songNames = document.querySelectorAll('.s-name');
        const songProgress = document.querySelectorAll(".progress");
        const onGoingDownloads = [];
        for (let i = 0; i < rData.songs.length; i++) {
            onGoingDownloads.push('');
        }

        songCons.forEach((song, index) => {
            song.onclick = () => {
                if (!onGoingDownloads.includes("going")) {
                    songProgress[index].style.display = "block";
                    const songURL = rData.songs[index].url;
                    const songArtist = rData.songs[index].author;
                    const album = {
                        title: rData.title,
                        artist: rData.author,
                        coverImage: rData.thumbnail.replaceAll("&", "^"),
                        tracks: { index: index + 1, total: rData.songs.length }
                    }
                    const audioDownloadURL = `https://api.yougra.site/download-a?url=${songURL}&sArtist=${songArtist}&playlist=${JSON.stringify(album)}`;
                    window.location.href = audioDownloadURL;
                    onGoingDownloads[index] = "going";
                    let seconds = 0;
                    const timer = setInterval(() => {
                        if (seconds === 10) {
                            songProgress[index].style.width = "0";
                            songProgress[index].style.display = "none";
                            onGoingDownloads[index] = "";
                            clearInterval(timer);
                            return
                        }
                        seconds++
                        songProgress[index].style.width = `${seconds * 10}%`;
                    }, 1000);
                }
            }
        });

        songNames.forEach((title, index) => {
            title.addEventListener("mousemove", (e) => {
                titleTooltip.innerText = rData.songs[index].title;
                titleTooltip.style.top = `${e.clientY - 35}px`;
                titleTooltip.style.left = `${e.clientX - 17}px`;
                titleTooltip.style.visibility = "visible";
            })
            title.addEventListener("mouseleave", () => titleTooltip.style.visibility = "hidden" )
        });

        const downloadBtn = document.getElementById("download-all");

        downloadBtn.onclick = function downloadRecurringly() {
            downloadBtn.disabled = true;
            downloadBtn.style.filter = "brightness(80%)";
            let currentSong = 0;
            songCons[currentSong].onclick();
            const downloads = setInterval(() => {
                if (currentSong === rData.songs.length - 1) {
                    downloadBtn.disabled = false;
                    downloadBtn.style.filter = "brightness(100%)";
                    clearInterval(downloads);
                    return
                }
                currentSong++;
                songCons[currentSong].onclick();
            }, 12000)
        }
    } catch (error) {
        playCon.style.display = "none";
        document.getElementById("p").style.display = "none";
        fpTries++;
        switch (fpTries) {
            case 1: playlistErr.innerText = "Could not fetch playlist. Try again?"; break;
            case 2: playlistErr.innerText = "Maybe it's your internet?"; break;
            case 3: playlistErr.innerText = "Make sure the playlist is not private"; break;
            case 4: playlistErr.innerText = "There might be something wrong going on with the app"; break;
            case 5: playlistErr.innerText = "Did you even try to reload?"; break;
            default: playlistErr.innerText = "Just try again later, man"; break;
        }
        setTimeout(() => { playlistErr.innerText = "" }, fpTries === 3 ? 5000 : 4000);
        console.error("Error occured while fetching playlist:", error);
    } finally {
        findPlaylist.disabled = false;
    }
}