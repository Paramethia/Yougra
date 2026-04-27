// Ping sever on page load to wake up Render server (doing this because of the free tier)
window.addEventListener("load", () => {
    setTimeout(() => {
        fetch("https://yougra-server.onrender.com/ping").then(() => console.log("Server warmed up")).catch(() => console.warn("Could not reach server (might still be waking up)"));
    }, 1500);
});

// === Navigation bar elements ===
const logo = document.getElementById("logo");
const version = document.getElementById("version");

// === Setings overlay elements ===
const settingsNav = document.getElementById("settings-nav");
const settings = document.getElementById("settings");
const closeSettings = document.getElementById("close-settings");
const sets = document.querySelectorAll(".sets");
const immediate = document.getElementById("immediate");
const process = document.getElementById("process");

// === Update overlay elements ====
const update = document.getElementById("update");
const closeUpdate = document.getElementById("close-update");

// === Error overlay elements ===
const errorOverlay = document.getElementById("error");
const closeError = document.getElementById("close-error");
const errorTitle = document.getElementById("err-title");
const errorMsg = document.getElementById("err-msg");

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
const pListsCon = document.getElementById("plists");

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

// === Other UI elements ===
const titleTooltip = document.getElementById("title-tp");

// === Navigation bar UI function ===

logo.onclick = () => { 
    logo.style.animation = "y-shake 0.4s linear";
    setTimeout(() => { logo.style.animation = "" }, 500 );
    searchMode() 
}

version.onclick = () => { 
    version.style.animation = "shrink-slide-right 1s linear forwards";
    update.style.visibility = "visible";
}

closeUpdate.onclick = () => {
    update.style.visibility = "hidden";
}

// === Settings overlay UI functions ===

settingsNav.onmouseover = () => { settingsNav.style.color = '#e55' }
settingsNav.onmouseout = () => { if (settings.style.visibility === "hidden") settingsNav.style.color = 'white' }

function closeSet() {
    settings.style.visibility = 'hidden';
    settingsNav.style.color = 'white';
    document.body.style.overflow = 'auto';
}

settingsNav.onclick = () => {
    if (settings.style.visibility === "hidden") {
        settings.style.visibility = 'visible';
        document.body.style.overflow = 'hidden';
    } else {
        closeSet();
    }
}

closeSettings.onclick = () => { 
    settings.style.visibility = 'hidden';
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

// === Error overlay UI functions ===

closeError.onclick = () => { errorOverlay.style.visibility = 'hidden' }

function showError(eT = "Server error", eM = "Something is wrong with the server :(") {
    errorOverlay.style.visibility = "visible";
    errorTitle.innerText = eT;
    errorMsg.innerText = eM;
}

// === Text switch UI code ===

const switchTexts = document.querySelectorAll(".switch");
let sE = document.getElementById("search-val");
const placeholders = ["Enter video/song title or creator name", "Enter playlist/album title or artist name"];

setInterval(() => {
    switchTexts[0].innerText === "song or video" ? switchTexts[0].innerText = "playlist or album" : switchTexts[0].innerText = "song or video"
    switchTexts[1].innerText === "playlist" ? switchTexts[1].innerText = "album" : switchTexts[1].innerText = "playlist"
    switchTexts.forEach(switchText => switchText.style.animation = "appear 0.5s linear");
    sE.placeholder === placeholders[0] ? sE.placeholder = placeholders[1] : sE.placeholder = placeholders[0]
    setTimeout(() => { switchTexts.forEach(switchText => switchText.style.animation = "") }, 1000 )
}, 10000 )

// === Tooltip shortcut UI code ===

function toolTipper(titleElements, items) {
    titleElements.forEach((titleE, index) => {
        titleE.addEventListener("mousemove", (e) => {
            const title = items[index].title;
            titleTooltip.innerText = title;
            titleTooltip.style.top = `${e.clientY - 35}px`;
            titleTooltip.style.left = `${e.clientX - 17}px`;
            titleTooltip.style.visibility = "visible";
        })
        titleE.addEventListener("mouseleave", () => titleTooltip.style.visibility = "hidden" )
    });
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

function removeKeyEvents() {
    window.removeEventListener("keydown", searchKey);
    window.removeEventListener("keydown", videoFindKey);
    window.removeEventListener("keydown", playlistFindKey);
}

// === Videos/Songs or Playlists/Albums toggle code

const vors = document.getElementById("v/s");
const pora = document.getElementById("p/a");
const vids = document.getElementById("vids");
const plists = document.getElementById("plists");

vors.onmouseover = () => { vors.style.backgroundColor = "rgba(150, 150, 150, 0.3)" }
pora.onmouseover = () => { pora.style.backgroundColor = "rgba(150, 150, 150, 0.3)" }
vors.onmouseout = () => { if (vids.style.display === "none") vors.style.backgroundColor = "rgba(150, 150, 150, 0.1)" }
pora.onmouseout = () => { if (plists.style.display === "none") pora.style.backgroundColor = "rgba(150, 150, 150, 0.1)" }

vors.onclick = () => { vids.style.display === "none" ? vids.style.display = "flex" : vids.style.display = "none" }
pora.onclick = () => { plists.style.display === "none" ? plists.style.display = "flex" : plists.style.display = "none" }

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

    const resData = await response.json();
    if (resData.errorTitle && resData.errorMessage) showError(resData.errorTitle, resData.errorMessage);

    const videos = resData.videos;
    const playlists = resData.playlists;

    if (!videos.length && !playlists.length) {
        searchErr.innerText = "Could not find anything. Check if you have no typo";
        setTimeout(() => { searchErr.innerText = "" }, 5200 );
        return
    }
    
    vidsCon.innerHTML = videos.map((video) => { 
        return `
            <div class="video">
                <div style="min-height: 150px; min-width: 200px; position: relative; border: 1px dashed #303030; border-radius: 5px; background: radial-gradient(#e55, #202020)">
                    <img src="${video.thumbnail}" />
                    <span id="duration">${video.duration}</span>
                </div>
                <h4 class="v-title">${video.title.length < 29 ? video.title : video.title.slice(0, 28).trimEnd() + "..."}</h4>
                <h6>${video.author}</h6> <font color="#909090">|</font> <span id="views">${video.views}</span>
                <span class="v-share"><svg width="17" height="17" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" fill="#aaa"><g id="Layer_2" data-name="Layer 2"><g id="invisible_box" data-name="invisible box"><rect width="48" height="48" fill="none"/></g><g id="Q3_icons" data-name="Q3 icons"><path d="M31.2,14.2,41,24.1l-9.8,9.8V26.8L27,27c-6.8.3-12,1-16.1,2.4,3.6-3.8,9.3-6.8,16.7-7.5l3.6-.3V14.2M28.3,6a1.2,1.2,0,0,0-1.1,1.3V17.9C12,19.4,2.2,29.8,2,40.3c0,.6.2,1,.6,1s.7-.3,1.1-1.1c2.4-5.4,7.8-8.5,23.5-9.2v9.7A1.2,1.2,0,0,0,28.3,42a.9.9,0,0,0,.8-.4L45.6,25.1a1.5,1.5,0,0,0,0-2L29.1,6.4a.9.9,0,0,0-.8-.4Z"/></g></g></svg></span>
            </div>
        `;
    }).join("");

    if (playlists.length && pListsCon) {
        pListsCon.innerHTML = playlists.map((playlist) => {
            return `
                <div class="playlist">
                    <div style="min-height: 150px; min-width: 200px; position: relative; border: 1px dashed #303030; border-radius: 5px; background: radial-gradient(#e55, #202020)">
                        <center><img src="${playlist.thumbnail}" ${playlist.type === "Album" ? 'style="width: 55%"' : ""}/></center>
                        <svg id="plist-icon" fill="rgba(235, 74, 74, 0.6)" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="28px" height="28px" viewBox="0 0 476.91 476.909" xml:space="preserve" stroke="#aaa"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <path d="M62.802,142.287h121.682c4.45,0,10.95-3.805,13.32-7.999l24.816-41.066H62.802C28.12,93.222,0,121.342,0,156.026v20.779 C13.266,156.086,36.425,142.287,62.802,142.287z"></path> <path d="M414.105,67.708H266.913c-8.681,0-19.151,6.125-23.399,13.685l-7.147,11.828l-28.489,47.157 c-4.246,7.558-14.719,13.684-23.393,13.684H62.802C28.12,154.062,0,182.183,0,216.865v115.794v13.737 c0,34.685,28.12,62.805,62.802,62.805h351.303c34.685,0,62.805-28.12,62.805-62.805v-13.737V156.026v-25.515 C476.91,95.829,448.79,67.708,414.105,67.708z M208.372,335.332h163.952c4.34,0,7.851,3.515,7.851,7.851 c0,4.349-3.511,7.851-7.851,7.851H208.372c-4.332,0-7.851-3.502-7.851-7.851C200.521,338.847,204.04,335.332,208.372,335.332z M200.521,301.762c0-4.344,3.519-7.851,7.851-7.851h163.952c4.34,0,7.851,3.507,7.851,7.851c0,4.341-3.511,7.851-7.851,7.851 H208.372C204.04,309.612,200.521,306.103,200.521,301.762z M380.19,216.52c0,4.332-3.526,7.851-7.85,7.851H250.659 c-4.332,0-7.847-3.519-7.847-7.851c0-4.334,3.515-7.851,7.847-7.851H372.34C376.664,208.669,380.19,212.186,380.19,216.52z M372.34,252.491c4.323,0,7.85,3.502,7.85,7.85c0,4.341-3.526,7.852-7.85,7.852H208.372c-4.332,0-7.851-3.511-7.851-7.852 c0-4.348,3.519-7.85,7.851-7.85H372.34z M128.618,305.337c10.395-6.052,21.512-8.007,30.413-6.288v-67.912V208.82v-6.899h6.904 h10.047h35.53c3.817,0,6.899,3.092,6.899,6.899v15.409c0,3.815-3.09,6.901-6.899,6.901h-35.53v87.636h-0.088 c-0.571,10.552-8.752,22.466-21.919,30.132c-17.829,10.379-37.956,9.028-44.955-2.989 C102.017,333.878,110.791,315.716,128.618,305.337z"></path> </g> </g> </g></svg>
                    </div>
                    <h4 class="p-title">${playlist.title.length < 29 ? playlist.title : playlist.title.slice(0, 28).trimEnd() + "..."}</h4>
                    <h6>${playlist.type}</h6> <font color="#909090">|</font> <span id="items">${playlist.itemCount}</span>
                    <span class="p-share"><svg width="17" height="17" viewBox="0 0 48 48" fill="#aaa" xmlns="http://www.w3.org/2000/svg"><g id="Layer_2" data-name="Layer 2"><g id="invisible_box" data-name="invisible box"><rect width="48" height="48" fill="none"/></g><g id="Q3_icons" data-name="Q3 icons"><path d="M31.2,14.2,41,24.1l-9.8,9.8V26.8L27,27c-6.8.3-12,1-16.1,2.4,3.6-3.8,9.3-6.8,16.7-7.5l3.6-.3V14.2M28.3,6a1.2,1.2,0,0,0-1.1,1.3V17.9C12,19.4,2.2,29.8,2,40.3c0,.6.2,1,.6,1s.7-.3,1.1-1.1c2.4-5.4,7.8-8.5,23.5-9.2v9.7A1.2,1.2,0,0,0,28.3,42a.9.9,0,0,0,.8-.4L45.6,25.1a1.5,1.5,0,0,0,0-2L29.1,6.4a.9.9,0,0,0-.8-.4Z"/></g></g></svg></span>
                </div>
            `;
        }).join("");
    }

    searchResults.style.display = "block";

    if (!playlists.length) {
        [vors, pora].forEach(element => element.style.display = "none")
        vids.style.display = "flex";
        plists.style.display = "none";
    } else {
        [vors, pora].forEach(element => element.style.display = "block")
        vids.style.display = "none";
    }

    const vidCons = document.querySelectorAll(".video");
    const plistCons = document.querySelectorAll(".playlist");

    vidCons.forEach((vidCon, index) => { 
        vidCon.onclick = (e) => {
            e.stopPropagation();
            document.getElementById("vid-link").value = videos[index].url;
            urlMode();
            fetchVideo();
        }
    });
    if (playlists.length && plistCons) {
        plistCons.forEach((plistCon, index) => { 
            plistCon.onclick = (e) => {
                e.stopPropagation();
                document.getElementById("playlist-link").value = playlists[index].url;
                urlMode();
                fetchPlaylist();
            }
        });
    }

    toolTipper(document.querySelectorAll(".v-title"), videos);
    if (playlists.length) toolTipper(document.querySelectorAll(".p-title"), playlists);

    const videoShares = document.querySelectorAll(".v-share");
    const playlistShares = document.querySelectorAll(".p-share");

    videoShares.forEach((shareB, index) => {
        shareB.onclick = (e) => {
            e.stopPropagation();
            shareB.style.animation = 'border-light-up 0.4s ease';
            setTimeout(() => { shareB.style.animation = 'none' }, 400 );
            navigator.clipboard.writeText(videos[index].url);
        }
    });
    if (playlistShares) {
        playlistShares.forEach((shareB, index) => {
            shareB.onclick = (e) => {
                e.stopPropagation();
                shareB.style.animation = 'border-light-up 0.4s ease';
                setTimeout(() => { shareB.style.animation = 'none' }, 400 );
                navigator.clipboard.writeText(playlists[index].url);
            }
        });
    }
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
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours) return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`

        return `${mins}:${secs.toString().padStart(2, "0")}`;
    }

    try {
        findInfo.innerText = "Finding...";
        findInfo.disabled = true;
        
        const response = await fetch("https://api.yougra.site/get-info", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url })
        });

        const data = await response.json();
        if (data.errorTitle && data.errorMessage) {
            showError(data.errorTitle, data.errorMessage)
            return
        }

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
                    // Trigger download via native browser stream & an ancor tag
                    progressText.innerText = "Wait for it...";
                    const res = await fetch(`https://api.yougra.site/download-a?url=${encodeURIComponent(url)}`);

                    if (!res.ok) {
                        const resJ = await res.json();
                        downloadBtn.disabled = false;
                        downloadBtn.style.filter = "brightness(100%)";
                        showError(resJ.errorTitle, resJ.errorMessage);
                        return
                    }

                    const contentLength = res.headers.get("content-length");
                    const total = contentLength ? parseInt(contentLength) : 0;

                    const reader = res.body.getReader();
                    let received = 0;
                    const chunks = [];

                    progressText.innerText = "Downloading...";
                    document.getElementById("progress-bar").style.display = "block";

                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;

                        chunks.push(value);
                        received += value.length;

                        if (total) {
                            const percent = (received / total) * 100;

                            progress.style.width = `${percent}%`;
                            downloadBtn.innerText = `${Math.floor(percent)}%`;
                            progressText.innerText = `${(received / 1024 / 1024).toFixed(2)}mb / ${(total / 1024 / 1024).toFixed(2)}mb`;
                        } else {
                            // fallback if no content-length
                            progressText.innerText = `${(received / 1024 / 1024).toFixed(2)}mb downloaded`;
                        }
                    }

                    function cleanAudioTitle(title) {
                        const promoKeywords = /(official|video|visualizer|lyrics?|lyric\s*video|audio|hd|4k|mv|performance|live|remaster(ed)?)/i;
                        const featureKeywords = /(feat\.?|ft\.?|featuring)/i;

                        return title
                        .replace(/[^\w\s\-\(\)\[\]\&\.\+\!\%\#\$\@\_\=\'\,\;]/g, "")
                        .replace(/\(([^)]*)\)/g, (match, inner) => {
                            if (featureKeywords.test(inner)) return match
                            return promoKeywords.test(inner) ? "" : match
                        })
                        .replace(/\[([^\]]*)\]/g, (match, inner) => {
                            if (featureKeywords.test(inner)) return match
                            return promoKeywords.test(inner) ? "" : match
                        })
                        .replace(/\s*[-–|]\s*(official.*|lyrics.*|audio.*|video.*)$/i, "")
                        .replace(/\s+/g, " ")
                        .trim()
                    }

                    // combine into blob AFTER download completes
                    const blob = new Blob(chunks);
                    const downloadUrl = window.URL.createObjectURL(blob);

                    const a = document.createElement("a");
                    a.href = downloadUrl;
                    a.download = `${cleanAudioTitle(data.title)}.mp3`;

                    document.body.appendChild(a);
                    a.click();
                    a.remove();

                    window.URL.revokeObjectURL(downloadUrl);

                    // reset UI
                    setTimeout(() => {
                        downloadBtn.innerText = "Download";
                        downloadBtn.disabled = false;
                        downloadBtn.style.filter = "brightness(100%)";
                        progressText.innerText = "";
                        document.getElementById("progress-bar").style.display = "none";
                    }, 500);
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
                        downloadBtn.disabled = false;
                        downloadBtn.style.filter = "brightness(100%)";
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
                        
                        if (message.errorTitle && message.errorMessage) {
                            showError(message.errorTitle, message.errorMessage);
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
        findInfo.innerText = "Find it";
        findInfo.disabled = false;
    }
}

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
        findPlaylist.innerText = "Finding...";
        findPlaylist.disabled = true;

        const response = await fetch("https://api.yougra.site/playlist", { 
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url }) 
        })

        const rData = await response.json();
        if (rData.errorTitle && rData.errorMessage) {
            showError(rData.errorTitle, rData.errorMessage)
            return
        }

        if (!rData.songs.length) {
            console.warn("No songs were served. Retrying request...");
            findPlaylist.disabled = false;
            fetchPlaylist();
            return
        }

        const multipleArtists = rData.author.includes(",");
        let artists;

        if (multipleArtists) artists = rData.author.split(",");

        function cleanSongTitle(title) {
            const promoKeywords = /(official|music|video|visualizer|lyrics?|lyric\s*video|audio|hd|4k|mv|performance|live|remaster(ed)?)/i;
            const featureKeywords = /(feat\.?|ft\.?|featuring)/i;

            return title
            .replace(/\(([^)]*)\)/g, (match, inner) => {
                if (featureKeywords.test(inner)) return match
                return promoKeywords.test(inner) ? "" : match
            })
            .replace(/\[([^\]]*)\]/g, (match, inner) => {
                if (featureKeywords.test(inner)) return match
                return promoKeywords.test(inner) ? "" : match
            })
            .replace(/\s*[-–|]\s*(official.*|lyrics.*|audio.*|video.*)$/i, "")
            .replace(/\s+/g, " ")
            .trim()
        }

        rData.songs.forEach((song, index) => {
            if (song.title.toLowerCase().includes(song.author.toLowerCase()) || song.title.toLowerCase().includes(rData.author.toLowerCase())) {
                rData.songs[index].title = cleanSongTitle(song.title.split("-")[1])
            } else if (multipleArtists) {
                artists.forEach(artist => {
                    if (song.title.includes(artist.trim())) rData.songs[index].title = cleanSongTitle(song.title.split("-")[1])
                })
            }
        });

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
                <span class="s-number">${index + 1}</span>
                <div class="song">
                    <span id="s-name" class="s-name">${song.title.length < 25 ? song.title : song.title.slice(0, 24).trimEnd() + "..."}</span>
                    <span id="s-author">${song.author}</span>
                    <span id="s-duration">${song.duration}</span>
                </div>
                </div>
            `
        }).join("");

        const songCons = document.querySelectorAll(".song");
        const songIndexes = document.querySelectorAll(".s-number");
        const songProgress = document.querySelectorAll(".progress");
        let songDownloading = false;

        songCons.forEach((songEl, index) => {
            songEl.onclick = async () => {
                if (!songDownloading) {
                    await downloadSong(rData.songs[index], index, rData, songProgress, songIndexes);

                    // reset after done
                    setTimeout(() => {
                        songDownloading = false;
                        songProgress[index].style.width = "0";
                        songProgress[index].style.display = "none";
                    }, 500);
                }
            }
        });

        toolTipper(document.querySelectorAll('.s-name'), rData.songs)

        async function downloadSong(song, index, rData, songProgress, songIndexes) {
            try {
                songDownloading = true;
                songProgress[index].style.display = "block";
                songIndexes[index].style.color = "#e55";

                const album = {
                    title: encodeURIComponent(rData.title),
                    artist: rData.author,
                    coverImage: encodeURIComponent(rData.thumbnail),
                    tracks: { index: index + 1, total: rData.songs.length }
                };

                if (song.author.toLowerCase().includes(album.artist.toLowerCase())) song.author = album.artist

                const res = await fetch(`https://api.yougra.site/download-a?url=${encodeURIComponent(song.url)}&sArtist=${song.author}&playlist=${JSON.stringify(album)}`);

                if (!res.ok) {
                    const resJ = await res.json();
                    showError(resJ.errorTitle, resJ.errorMessage);
                    songProgress[index].style.display = "none";
                    return;
                }

                const contentLength = res.headers.get("content-length");
                const total = contentLength ? parseInt(contentLength) : 0;

                const reader = res.body.getReader();
                let received = 0;
                const chunks = [];

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    chunks.push(value);
                    received += value.length;

                    if (total) {
                        const percent = (received / total) * 100;
                        songProgress[index].style.width = `${percent}%`;
                    }
                }
                songProgress[index].style.width = "100%";

                const blob = new Blob(chunks);
                const downloadUrl = URL.createObjectURL(blob);

                const a = document.createElement("a");
                a.href = downloadUrl;
                a.download = `${song.title}.mp3`;
                document.body.appendChild(a);
                a.click();
                a.remove();

                URL.revokeObjectURL(downloadUrl);
            } catch (err) {
                console.error("Song download failed:", err);
                showError("Failed to download song", err);
                songProgress[index].style.display = "none";
            }
        }

        const downloadBtn = document.getElementById("download-all");

        downloadBtn.onclick = async function downloadRecurringly() {
            downloadBtn.disabled = true;
            downloadBtn.style.filter = "brightness(80%)";

            for (let i = 0; i < rData.songs.length; i++) {
                await downloadSong(rData.songs[i], i, rData, songProgress, songIndexes);

                // reset Progress after each
                songProgress[i].style.width = "0";
                songProgress[i].style.display = "none";

                // small delay so browser breathes
                await new Promise(res => setTimeout(res, 500));
            }

            downloadBtn.disabled = false;
            downloadBtn.style.filter = "brightness(100%)";
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
        findPlaylist.innerText = "Find it";
        findPlaylist.disabled = false;
    }
}