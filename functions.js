// Ping sever on page load to wake up Render server (doing this because of the free tier)
window.addEventListener("load", () => {
    setTimeout(() => {
        fetch("https://api.yougra.site/ping").then(() => console.log("Server warmed up")).catch(() => console.warn("Could not reach server (might still be waking up)"));
    }, 1500);
});

const helpNav = document.getElementById("help-nav");
const helpCon = document.querySelector(".help");
const closeHelpB = document.getElementById("close-help");
const urlHelp = document.querySelector(".url-help");
const bugReport = document.querySelector(".bug-report");
const warning = document.querySelector(".warning");
const errMsg = document.getElementById("err-msg");
const optionsB = document.getElementById("d-options");
const options = document.querySelector(".options");
const vidCon = document.querySelector(".video-info");
const vidSet = document.getElementById("vid-o");
const audSet = document.getElementById("aud-o");

let helpConOpened = false;

function closeHelp() {
    helpNav.style.borderTop = '1px dashed #ee555';
    helpNav.style.borderBottom = '1px dashed #ee555';
    helpNav.style.borderRight = 'none';
    helpNav.style.borderLeft = 'none';
    helpCon.style.visibility = 'hidden';
}

helpNav.onclick = () => {
    helpConOpened = !helpConOpened;

    if (helpConOpened) {
        helpNav.style.border = '1px dashed #e55';
        helpCon.style.visibility = 'visible';
    } else {
        closeHelp();
    }
}

closeHelpB.onclick = () => { 
    helpConOpened = false;
    closeHelp() 
}

containersOpened = [false, false];

[urlHelp, bugReport, warning].forEach((con, index) => {
    con.onmouseover = () => {
        con.style.background = 'rgba(238, 119, 119, 0.1)';
    }
    con.onmouseout = () => {
        if (!containersOpened[index]) con.style.background = 'none';
    }
    con.onclick = () => {
        containersOpened[index] = !containersOpened[index];

        [urlHelp, bugReport, warning].forEach((conAgain, i) => {
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

vidSet.onmouseover = () => { vidSet.style.background = '#5f5f5f' }
vidSet.onmouseout = () => { if (format !== 'video') vidSet.style.background = '#3f3f3f' }
vidSet.onclick = () => {
    if (format === 'audio')
    format = 'video';
    vidSet.style.background = '#5f5f5f';
    audSet.style.background = '#3f3f3f';
    document.getElementById("v-size").style.display = 'inline';
    document.getElementById("a-size").style.display = 'none';
    document.getElementById("qualities").style.display = 'inline-block';
}

audSet.onmouseover = () => { audSet.style.background = '#5f5f5f' }
audSet.onmouseout = () => { if (format !== 'audio')audSet.style.background = '#3f3f3f' }
audSet.onclick = () => {
    if (format === 'video')
    format = 'audio';
    audSet.style.background = '#5f5f5f';
    vidSet.style.background = '#3f3f3f';
    document.getElementById("v-size").style.display = 'none';
    document.getElementById("a-size").style.display = 'inline';
    document.getElementById("qualities").style.display = 'none';
}

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
        
        const response = await fetch("https://api.yougra.site/api/info", {
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

        document.querySelector(".loader").style.display = "none";
        document.querySelector(".v").style.display = "block";
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
        const progress = document.querySelector(".progress");
        downloadBtn.onclick = async () => {
            downloadBtn.disabled = true;
            downloadBtn.style.filter = "brightness(90%)";
            progress.style.width = "0%";

            try {
                if (format === "audio") {
                    // Trigger download via native browser stream
                    window.location.href = `https://api.yougra.site/api/download-a?url=${encodeURIComponent(url)}`;

                    setTimeout(() => {
                        downloadBtn.disabled = false;
                        downloadBtn.style.filter = "brightness(100%)";
                    }, 4450)
                } else if (format === "video") {
                    const size = parseInt(document.getElementById("v-size").innerText);
                    if (size >= 5000) {
                        progressText.innerText = "Woahhh you can't download a video that's 5GB or larger just yet. Try lower quality";
                        return
                    }

                    const ws = new WebSocket('wss://yougra-server.onrender.com');
                    let processed = false;

                    ws.onopen = () => {
                        console.log('WebSocket connected.');
                        ws.send(JSON.stringify({ url, itag }));
                        downloadBtn.innerText = "0%";
                        progressText.innerText = "Wait for it...";
                        document.querySelector(".progress-bar").style.display = "block";
                    };

                    ws.onmessage = (event) => {
                        const message = JSON.parse(event.data);
                        
                        if (message.error) {
                            progressText.innerText = message.error;
                            downloadBtn.disabled = false;
                            downloadBtn.style.filter = "brightness(100%)";
                            setTimeout(() => { progressText.innerText = "" }, 4000);
                            ws.close();
                            return;
                        }

                        if (message.progress) {
                            downloadBtn.innerText = `${Math.floor(message.progress)}%`;
                            progress.style.width = `${message.progress}%`;
                            progressText.innerText = message.downloaded === message.total ? "Merging..." : `Collecting ${message.collecting} - ${message.downloaded}mb / ${message.total}mb`;
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
                                document.querySelector(".progress-bar").style.display = "none";
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
                            document.querySelector(".progress-bar").style.display = "none";
                            progressText.innerText = "Processing failed or cancelled.";
                            setTimeout(() => { progressText.innerText = "" }, 4000);
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
        document.querySelector(".v").style.display = "none";
        vidCon.style.display = "none";
        setTimeout(() => { errMsg.innerText = "" }, 7000);
        console.error("Error occured while fetching video: \n", err);
    } finally {
        document.getElementById("check-info").disabled = false;
    }
}