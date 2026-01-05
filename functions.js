// Ping sever on page load to wake up Render server (doing this because of the free tier)
window.addEventListener("load", () => {
    setTimeout(() => {
        fetch("https://yougra-server.onrender.com/ping").then(() => console.log("Server warmed up")).catch(() => console.warn("Could not reach server (might still be waking up)"));
    }, 1500);
});

const settingsNav = document.getElementById("settings-nav");
const settings = document.getElementById("settings");
const closeSettings = document.getElementById("close-settings");
const dMethod = document.getElementById("d-method");
const bugReport = document.getElementById("bug-report");
const warning = document.getElementById("warning");
const immediate = document.getElementById("immediate");
const process = document.getElementById("process");
const searchO = document.getElementById("search-o");
const urlO = document.getElementById("url-o");
const searchCon = document.getElementById("search-mode");
const urlCon = document.getElementById("url-mode");

const optionsB = document.getElementById("d-options");
const searchErr = document.getElementById("search-err-msg");
const urlErr = document.getElementById("url-err-msg");
const options = document.getElementById("options");
const vidCon = document.getElementById("video-info");
const vidSet = document.getElementById("vid-o");
const audSet = document.getElementById("aud-o");

// Settings overlay UI functions

let settingsOpened = false;

function closeSet() {
    settingsNav.style.borderTop = '1px dashed #ee555';
    settingsNav.style.borderBottom = '1px dashed #ee555';
    settingsNav.style.borderRight = 'none';
    settingsNav.style.borderLeft = 'none';
    settings.style.visibility = 'hidden';
}

settingsNav.onclick = () => {
    settingsOpened = !settingsOpened;

    if (settingsOpened) {
        settingsNav.style.border = '1px dashed #e55';
        settings.style.visibility = 'visible';
    } else {
        closeSet();
    }
}

closeSettings.onclick = () => { 
    settingsOpened = false;
    closeSet();
}

containersOpened = [false, false];

[dMethod, bugReport, warning].forEach((con, index) => {
    con.onmouseover = () => {
        con.style.background = 'rgba(238, 119, 119, 0.1)';
    }
    con.onmouseout = () => {
        if (!containersOpened[index]) con.style.background = 'none';
    }
    con.onclick = () => {
        containersOpened[index] = !containersOpened[index];

        [dMethod, bugReport, warning].forEach((conAgain, i) => {
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

// Search and Use link state code

searchO.style.backgroundColor = searchCon.style.display !== "none" ? "rgba(238, 119, 119, 0.4)" : "rgba(238, 119, 119, 0.2)";

//searchO.onmouseover = () => { if (searchCon.style.display === "block") searchO.style.backgroundColor = "rgba(238, 119, 119, 0.3)" }
searchO.onmouseout = () => { if (searchCon.style.display === "none") searchO.style.backgroundColor = "rgba(238, 119, 119, 0.2)" }

//urlO.onmouseover = () => { if (urlCon.style.display === "block") urlO.style.backgroundColor = "rgba(238, 119, 119, 0.3)" }
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
    window.addEventListener("keydown", urlFindKey);
}

// Search function

const searchB = document.getElementById("search");
const searchInput = document.getElementById("search-val");

async function search() {
    if (!searchInput.value) {
        searchErr.innerText = "Type something!!";
        setTimeout(() => { searchErr.innerText = "" }, 3400 );
        return
    }

    searchB.innerText = "Searching...";
    searchB.disabled = true;

    const response = await fetch("https://api.yougra.site/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: searchInput.value })
    });

    searchB.innerText = "Search";
    searchB.disabled = false;

    const videos = await response.json();

    if (videos.length === 0) {
        searchErr.innerText = "Could not find anything. Check if you have no typo";
        setTimeout(() => { searchErr.innerText = "" }, 5200 );
        return
    }

    const searchResults = document.getElementById("search-results");
    const vidsCon = document.getElementById("vids");
    searchResults.style.display = "block";

    vidsCon.innerHTML = videos.map((video) => { 
        return `
            <div class="video">
                <img src="${video.thumbnail}" />
                <span id="duration">${video.duration}</span>
                <h4>${video.title.length < 29 ? video.title : video.title.slice(0, 28) + "..."}</h4>
                <h6>${video.author}</h6> <font color="#909090">|</font> <span id="views">${video.views}</span>
                <span class="share"><svg width="17" height="17" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" fill="#aaa"><g id="Layer_2" data-name="Layer 2"><g id="invisible_box" data-name="invisible box"><rect width="48" height="48" fill="none"/></g><g id="Q3_icons" data-name="Q3 icons"><path d="M31.2,14.2,41,24.1l-9.8,9.8V26.8L27,27c-6.8.3-12,1-16.1,2.4,3.6-3.8,9.3-6.8,16.7-7.5l3.6-.3V14.2M28.3,6a1.2,1.2,0,0,0-1.1,1.3V17.9C12,19.4,2.2,29.8,2,40.3c0,.6.2,1,.6,1s.7-.3,1.1-1.1c2.4-5.4,7.8-8.5,23.5-9.2v9.7A1.2,1.2,0,0,0,28.3,42a.9.9,0,0,0,.8-.4L45.6,25.1a1.5,1.5,0,0,0,0-2L29.1,6.4a.9.9,0,0,0-.8-.4Z"/></g></g></svg></span>
            </div>
        `;
    }).join("");

    const vidCons = document.querySelectorAll(".video");

    vidCons.forEach((vidCon, index) => { 
        vidCon.onclick = (e) => {
            e.stopPropagation();
            document.getElementById("vid-link").value = videos[index].url;
            urlMode();
            fetchVideo();
        }
    })

    const shareButtons = document.querySelectorAll(".share");

    shareButtons.forEach((shareB, index) => {
        shareB.onclick = (e) => {
            e.stopPropagation();
            shareB.style.animation = 'border-light-up 0.4s ease';
            setTimeout(() => { shareB.style.animation = 'none' }, 400 );
            navigator.clipboard.writeText(videos[index].url);
        }
    })
}

function removeKeyEvents() {
    window.removeEventListener("keydown", searchKey);
    window.removeEventListener("keydkown", urlFindKey);
}

function searchKey(event) { if (event.key === "Enter") search() }

window.addEventListener("keydown", searchKey);
 
// URL functions

function validURL(url) {
    return (
        /^https?:\/\/(www\.)?(youtube|music\.youtube)\.com\/watch\?v=/.test(url) ||
        /^https?:\/\/youtu\.be\//.test(url) ||
        /^https?:\/\/(www\.)?(youtube|music\.youtube)\.com\/shorts\//.test(url)
    );
}

let dOptionsOpened = false;

document.addEventListener("click", event => {
    if (dOptionsOpened && !options.contains(event.target) && event.target !== document.getElementById('d-option') && event.target !== document.getElementById('dots')) {
        optionsB.style.background = '#2a2a2a';
        options.style.display = 'none';
        dOptionsOpened = false;
    }
});

optionsB.onmouseover = () => { optionsB.style.background = '#3f3f3f' }
optionsB.onmouseout = () => { if (!dOptionsOpened) optionsB.style.background = '#2a2a2a'; }
optionsB.onclick = () => {
    dOptionsOpened = !dOptionsOpened;
    if (dOptionsOpened) { 
        optionsB.style.background = '#3f3f3f';
        options.style.display = 'block' 
    } else {
        optionsB.style.background = '#2a2a2a';
        options.style.display = 'none'
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

function urlFindKey(event) { if (event.key === "Enter") fetchVideo() }

async function fetchVideo() {
    const url = document.getElementById("vid-link").value;
    
    if (!url) {
        errMsg.innerText = "Where's the URL, dawg?";
        setTimeout(() => { errMsg.innerText = "" }, 3000 );
        return;
    }

    if (!validURL(url)) {
        errMsg.innerText = "That's not a valid YouTube URL";
        setTimeout(() => { errMsg.innerText = "" }, 4500 );
        return;
    }

    vidCon.style.display = "inline-block";

    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    }

    try {
        document.getElementById("check-info").disabled = true;
        
        const response = await fetch("https://api.yougra.site/get-info", { //https://api.yougra.site
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url })
        });

        const data = await response.json();
        if (data.error) {
            errMsg.innerText = data.error;
            setTimeout(() => { errMsg.innerText = "" }, 3000);
            return;
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

        document.getElementById("loader").style.display = "none";
        document.getElementById("v").style.display = "block";
        document.getElementById("thumbnail").src = data.thumbnail;
        document.getElementById("length").innerHTML = formatTime(data.lengthSeconds);
        document.getElementById("vid-o").innerHTML = `
            <p>Video <span id="v-size">${fullSize(defaultVidO.size, selectedAudio.size)}mb</span></p>
            <select id="qualities">
                ${ videoFormats.map(vid => { return `<option value="${vid.qualityLabel}">${vid.qualityLabel}</option>` })}
            </select>
        `;
        document.getElementById("aud-o").innerHTML = `<p>Audio <span id="a-size">${selectedAudio.size}</span></p>`;
        document.getElementById("title").innerText = data.title;
        document.getElementById("video-author").innerHTML = `<strong>Poster ~</strong> ${data.author}`;
        document.getElementById("posted").innerHTML = `<strong>Posted ~</strong> ${data.publishDate}`;
        document.getElementById("views").innerHTML = `<strong>Views ~</strong> ${views}`;
        document.getElementById("likes").innerHTML = `<strong>Likes ~</strong> ${likes}`;

        if (format === 'audio') {
            audSet.style.background = '#5f5f5f';
            vidSet.style.background = '#3f3f3f';
            document.getElementById("v-size").style.display = 'none';
            document.getElementById("a-size").style.display = 'inline';
            document.getElementById("qualities").style.display = 'none';
        }

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
            downloadBtn.style.filter = "brightness(90%)";
            progress.style.width = "0%";

            try {
                if (format === "audio") {
                    // Trigger download via native browser stream
                    window.location.href = `https://api.yougra.site/download-a?url=${encodeURIComponent(url)}`;

                    setTimeout(() => {
                        downloadBtn.disabled = false;
                        downloadBtn.style.filter = "brightness(100%)";
                    }, 4450)
                } else if (format === "video") {
                    if (method === "fast") {
                        window.location.href = `https://api.yougra.site/fast-download?url=${encodeURIComponent(url)}&itag=${itag}`;
                        setTimeout(() => {
                            downloadBtn.disabled = false;
                            downloadBtn.style.filter = "brightness(100%)";
                        }, 4450);
                        return
                    }

                    const size = parseInt(document.getElementById("v-size").innerText);
                    if (size > 5000) {
                        progressText.innerText = "Can't download a video larger than 500mb currently. Because I'm poor. Try lower quality";
                        return
                    }

                    const ws = new WebSocket('wss://yougra-server.onrender.com'); //api.yougra.site
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

                        if (message.progress) {
                            downloadBtn.innerText = `${Math.floor(message.progress)}%`;
                            progress.style.backgroundColor = '#f5353c';
                            progress.style.width = `${message.progress}%`;
                            progressText.innerText = message.downloaded === message.total ? "Merging..." : `Collecting ${message.collecting} - ${message.downloaded}mb / ${message.total}mb`;
                        }

                        if (message.merging) {
                            downloadBtn.innerText = "Wait";
                            progressText.innerText = `Merging - ${Math.round(message.progress)}%`;
                            progress.style.backgroundColor = '#e55';
                            progress.style.width = `${Math.round(message.progress)}%`;
                        }

                        if (message.status === 'complete') {
                            processed = true;
                            // Trigger the file download via a new request
                            window.location.href = `https://api.yougra.site${message.path}`; //https://api.yougra.site
                            
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
        errMsg.innerText = "Error fetching video info";
        document.getElementById("v").style.display = "none";
        vidCon.style.display = "none";
        setTimeout(() => { errMsg.innerText = "" }, 7000);
        console.error("Error occured while fetching video: \n", err);
    } finally {
        document.getElementById("check-info").disabled = false;
    }
}