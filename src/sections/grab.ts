import showError from '../overlays/error.ts';
import settings from '../overlays/settings.ts';
import tooltipper from '../components/tooltip.ts';
import type { Video, Playlist, Song } from '../types.ts';

const prodAPI = "api.yougra.site";

// Video elements
const videoErr = document.getElementById("video-err-msg");
const watch = document.getElementById("watch");
const selection = document.getElementById("selection-msg");
const vidCon = document.getElementById("video-info");
const vdob = document.getElementById("vdob");
const vdOptionsB = document.getElementById("v-d-options-b") as HTMLButtonElement;
const vdOptions = document.getElementById("v-d-options");
const vSelect = document.getElementById("v-select");
const aSelect = document.getElementById("a-select");
const vidSet = document.getElementById("vid-o");
const audSet = document.getElementById("aud-o");
const [vOp, vAudO, vTitle, vAuthor, vViews, vLikes, vPosted] = [
    document.getElementById("vid-o"), document.getElementById("aud-o"), 
    document.getElementById("v-title"), document.getElementById("v-author"),
    document.getElementById("v-views"), document.getElementById("v-likes"),
    document.getElementById("posted")
]
let vSize: HTMLElement;
let aSize: HTMLElement;
let qualities: HTMLSelectElement;
let metadataT: HTMLElement;
let m4aT: HTMLElement;
// Playlist elements
const playlistErr = document.getElementById("playlist-err-msg");
const playCon = document.getElementById("playlist-info");
const pdob = document.getElementById("pdob");
const pdOptionsB = document.getElementById("p-d-options-b") as HTMLButtonElement;
const pdOptions = document.getElementById("p-d-options");
const [pImg, pTitle, pAuthor, pSongCount, pSongs] = [
    document.getElementById("p-thumbnail"),
    document.getElementById("p-title"), document.getElementById("p-author"),
    document.getElementById("a-amount"), document.getElementById("songs")
] as [HTMLImageElement, HTMLElement, HTMLElement, HTMLElement, HTMLElement];

const loaders: NodeListOf<HTMLElement> = document.querySelectorAll(".grab-loader");

export default {
    init() {
        const grabQ = new URL(window.location.href).searchParams.get("v") || new URL(window.location.href).searchParams.get("c");
        if (grabQ) {
            let type;
            if (new URL(window.location.href).searchParams.get("v")) type = "v"
            if (new URL(window.location.href).searchParams.get("c")) type = "c"
            if (type === "v") {
                this.video.id = grabQ;
                this.video.fetch();
            } else if (type === "c") {
                this.playlist.id = grabQ;
                this.playlist.fetch();
            }
        }

        if (vdob && vdOptions && pdob && pdOptions) {
            vdOptions.style.display = "none";
            pdOptions.style.display = "none";

            document.addEventListener("click", event => {
                if (!(event.target instanceof Node)) return
                if (vdOptions.style.display === "block" && !vdOptions.contains(event.target) && event.target !== vdob) {
                    vdOptionsB.style.background = '#2a2a2a';
                    vdOptions.style.display = 'none';
                } else if (pdOptions.style.display === "block" && !pdOptions.contains(event.target) && event.target !== pdob) {
                    pdOptionsB.style.background = '#2a2a2a';
                    pdOptions.style.display = 'none';
                }
            });

            vdob.onmouseover = () => { vdOptionsB.style.background = '#3f3f3f' }
            vdob.onmouseout = () => { if (vdOptions.style.display !== "block") vdOptionsB.style.background = '#2a2a2a' }
            vdob.onclick = () => {
                if (!vdOptions) return
                if (vdOptions.style.display === "none") {
                    vdOptionsB.style.background = '#3f3f3f';
                    vdOptions.style.display = 'block';
                } else {
                    vdOptionsB.style.background = '#2a2a2a';
                    vdOptions.style.display = 'none';
                }
            }
            pdob.onmouseover = () => { pdOptionsB.style.background = '#3f3f3f' }
            pdob.onmouseout = () => { if (pdOptions.style.display !== "block") pdOptionsB.style.background = '#2a2a2a' }
            pdob.onclick = () => {
                if (!pdOptions) return
                if (pdOptions.style.display === "none") {
                    pdOptionsB.style.background = '#3f3f3f';
                    pdOptions.style.display = 'block';
                } else {
                    pdOptionsB.style.background = '#2a2a2a';
                    pdOptions.style.display = 'none';
                }
            }
        }

        if (vSelect && aSelect && vidSet && audSet) {
            vSelect.onmouseover = () => { vSelect.style.background = '#5d5d5d' }
            vSelect.onmouseout = () => { if (this.video.format !== 'video') vSelect.style.background = '#3f3f3f' }
            vSelect.onclick = () => {
                if (this.video.format === 'audio') {
                    this.video.format = 'video';
                    vSelect.style.background = '#5d5d5d';
                    aSelect.style.background = '#3f3f3f';
                    vidSet.style.display = 'block';
                    audSet.style.display = 'none';
                }
            }

            aSelect.onmouseover = () => { aSelect.style.background = '#5d5d5d' }
            aSelect.onmouseout = () => { if (this.video.format !== 'audio') aSelect.style.background = '#3f3f3f' }
            aSelect.onclick = () => {
                if (this.video.format === 'video') {
                    this.video.format = 'audio';
                    aSelect.style.background = '#5d5d5d';
                    vSelect.style.background = '#3f3f3f';
                    audSet.style.display = 'block';
                    vidSet.style.display = 'none';
                }
            }
        }
    },
    video: {
        format: "video",
        id: "",
        tries: 0,
        async fetch() {
            if (!videoErr || !vidCon || !watch || !loaders[0] || !selection || !vSelect || !aSelect || !vidSet || !audSet) {
                showError("Failed to render video", "1 or more video element(s) missing")
                return
            }
            const id = this.id;

            if (!id && videoErr) {
                videoErr.innerText = "Where the video ID, dawg?";
                setTimeout(() => { videoErr.innerText = "" }, 3000 );
                return
            }

            loaders[0].style.display = "flex";
            vidCon.style.display = "none";

            function formatTime(seconds: number) {
                const hours = Math.floor(seconds / 3600);
                const mins = Math.floor((seconds % 3600) / 60);
                const secs = seconds % 60;

                if (hours) return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`

                return `${mins}:${secs.toString().padStart(2, "0")}`;
            }

            try {
                const response = await fetch(`https://${prodAPI}/video`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id })
                });

                if (!response) throw new Error("No response recieved")
                const data = await response.json();
                if (!response.ok && data.errorTitle && data.errorMessage) {
                    showError(data.errorTitle, data.errorMessage)
                    return
                }
                const video: Video = data;

                const numFormat = window.innerWidth > 355 || screen.width > 355 ? new Intl.NumberFormat('fr-FR') : new Intl.NumberFormat('en', { notation: 'compact' });

                video.views = numFormat.format(Number(video.views));
                video.likes = numFormat.format(Number(video.likes));
                
                const videoFormats = video.formats.filter(vF => vF.type === 'videoonly' && vF.qualityLabel !== '144p');
                videoFormats.reverse();
                const defaultVidO = videoFormats.find(vid => vid.qualityLabel === "480p") || videoFormats.find(vid => vid.qualityLabel === "360p") || videoFormats.find(vid => vid.qualityLabel === "240p");
                const audioFormats = video.formats.filter(aF => aF.type === 'audioonly');
                const selectedAudio = audioFormats.pop();

                function fullSize(vS: string | number, aS: string | number) {
                    vS = parseInt(String(vS));
                    aS = parseInt(String(aS));
                    return Math.round(vS + aS);
                }

                if (!vOp || !vAudO || !vTitle || !vAuthor || !vViews || !vLikes || !vPosted) {
                    showError("Failed to show video", "Some elements are missing");
                    return
                }

                loaders[0].style.display = "none";
                vidCon.style.display = "block";

                let metadata = video.song && video.lengthSeconds < 900 ? true : false;
                let extension = "mp3";

                watch.innerHTML = `
                    <img id="v-thumbnail" src="${video.thumbnail}" alt="Youtube video thumbnail" />
                    <span id="play"><i class="fa-solid fa-play"></i> watch</span>
                    <span id="length">${formatTime(video.lengthSeconds)}</span>
                `;

                if (defaultVidO && selectedAudio) {
                    vOp.innerHTML = `
                        <p style="font-size: 14px;">File size ~ <span id="v-size">${fullSize(defaultVidO.size, selectedAudio.size)}mb</span></p>
                        <select id="qualities">
                            ${videoFormats.map(vid => { return `<option value="${vid.qualityLabel}">${vid.qualityLabel}</option>` })}
                        </select>
                    `;
                    vAudO.innerHTML = `
                        <p style="font-size: 14px;">File size ~ <span id="a-size">${(parseFloat(String(selectedAudio.size)) + 1.4).toFixed(2)}mb</span></p>
                        <p id="metadata" style="font-size: 14px;">Metadata <i class="fa-solid fa-toggle-${metadata ? 'on' : 'off'}"></i>
                        <p id="m4a" style="font-size: 14px;">.m4a <i class="fa-solid fa-toggle-${extension !== "mp3" ? 'on' : 'off'}"></i>
                    `;
                }
                
                vTitle.innerText = video.title;
                vAuthor.innerHTML = `<strong>@${video.author.name}</strong> `;
                vAuthor.onclick = () => { window.open(video.author.url, '_blank') };
                vViews.innerHTML = `<i class="fa-regular fa-eye"></i> ${video.views}`;
                vLikes.innerHTML = `<i class="fa-regular fa-thumbs-up"></i> ${video.likes}`;
                vPosted.innerHTML = `<i class="fa-regular fa-calendar"></i> ${window.innerWidth > 355 || screen.width > 355 ? video.pDate.exact : video.pDate.relative}`;
                const vPlay = document.getElementById("play");
                if (!vPlay) throw new Error("Play button missing for video")
                vPlay.onclick = () => {
                    watch.innerHTML = "";

                    const iframe = document.createElement("iframe");
                    iframe.src = `https://www.youtube.com/embed/${video.id}`;
                    iframe.title = data.title || "YouTube video player";
                    iframe.frameBorder = "0";
                    iframe.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share");
                    iframe.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
                    iframe.setAttribute("allowfullscreen", "true");
                    iframe.style.aspectRatio = "16 / 9";

                    watch.appendChild(iframe);
                }
                
                selection.innerText = `Selected ${this.format}`;
                selection.style.visibility = "visible";
                selection.style.animation = "appear 2s linear";

                this.format = data.song ? "audio" : "video";
                selection.innerText = `Selected ${this.format}`;

                [vSize, aSize, qualities, metadataT, m4aT] = [
                    document.getElementById("v-size"), document.getElementById("a-size"), document.getElementById("qualities"), document.getElementById("metadata"), document.getElementById("m4a")
                ] as [HTMLElement, HTMLElement, HTMLSelectElement, HTMLElement, HTMLElement];
                if (!aSize || !qualities || !metadataT || !defaultVidO || !selectedAudio) {
                    console.warn("Format update could not apply visually. Some required elements/variables missing");
                    return
                }

                if (this.format === 'audio') {
                    aSelect.style.background = '#5d5d5d';
                    vSelect.style.background = '#3f3f3f';
                    audSet.style.display = 'block';
                    vidSet.style.display = 'none';
                } else {
                    vSelect.style.background = '#5d5d5d';
                    aSelect.style.background = '#3f3f3f';
                    vidSet.style.display = 'block';
                    audSet.style.display = 'none';
                }

                setTimeout(() => { 
                    selection.style.animation = "disappear 1s linear forwards";
                    setTimeout(() => { selection.style.visibility = "hidden" }, 1100 );
                }, 4400);

                qualities.value = defaultVidO.qualityLabel;
                let itag = defaultVidO.itag;

                qualities.addEventListener('change', () => {
                    const currentVideo = videoFormats.find(q => q.qualityLabel === qualities.value);
                    if (!currentVideo) return
                    vSize.innerText = `${fullSize(currentVideo.size, selectedAudio.size)}mb`;
                    itag = currentVideo.itag;
                });

                const togI = [document.querySelector("#metadata > i"), document.querySelector("#m4a > i")];

                metadataT.onclick = () => {
                    if (!metadata) {
                        togI[0]?.classList.replace("fa-toggle-off", "fa-toggle-on");
                        metadata = true;
                    } else {
                        togI[0]?.classList.replace("fa-toggle-on", "fa-toggle-off");
                        metadata = false;
                    } 
                }
                m4aT.onclick = () => {
                    if (extension === "mp3") {
                        togI[1]?.classList.replace("fa-toggle-off", "fa-toggle-on");
                        extension = "m4a";
                    } else if (extension === "m4a") {
                        togI[1]?.classList.replace("fa-toggle-on", "fa-toggle-off");
                        extension = "mp3";
                    }
                }

                const downloadBtn = document.getElementById("download") as HTMLButtonElement;
                const progressText = document.getElementById("progress-txt");
                const progressBar = document.getElementById("progress-bar");
                const progress = document.getElementById("progress");

                if (!progressText || !progressBar || !progress) {
                    console.warn("Could not find video download elements. Downloading won't work right now.");
                    return
                }

                downloadBtn.onclick = async () => {
                    downloadBtn.disabled = true;
                    downloadBtn.style.filter = "brightness(80%)";
                    progress.style.width = "0%";
        
                    try {
                        if (this.format === "audio") {
                            progressText.innerText = "Wait for it...";
                            const res = await fetch(`https://${prodAPI}/download-a?id=${id}&metadata=${metadata}`);

                            if (!res.ok) {
                                const resJ = await res.json();
                                downloadBtn.disabled = false;
                                downloadBtn.style.filter = "brightness(100%)";
                                progressText.innerText = "";
                                showError(resJ.errorTitle, resJ.errorMessage);
                                return
                            }

                            const contentLength = res.headers.get("content-length");
                            const total = contentLength ? parseInt(contentLength) : 0;

                            if (!res.body) throw new Error("The resonse has no readable body")
                            
                            const reader = res.body.getReader();
                            let received = 0;
                            let chunks: BlobPart[] = [];

                            progressText.innerText = "Downloading...";
                            if (contentLength) progressBar.style.display = "block";

                            while (true) {
                                const { done } = await reader.read();

                                if (done) break;

                                if (total) {
                                    const percent = (received / total) * 100;

                                    progress.style.width = `${percent}%`;
                                    downloadBtn.innerText = `${Math.floor(percent)}%`;
                                    progressText.innerText = `Downloading - ${(received / 1024 / 1024).toFixed(2)}MB / ${(total / 1024 / 1024).toFixed(2)}MB`;
                                } else {
                                    // fallback if no content-length
                                    progressText.innerText = `Downloading - ${(received / 1024 / 1024).toFixed(2)}MB / ${parseFloat(String(selectedAudio.size)) + 1.4}MB`; // Approximate total size
                                }
                            }

                            function cleanAudioTitle(title: string) {
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
                            const downloadURL = window.URL.createObjectURL(blob);

                            const a = document.createElement("a");
                            a.href = downloadURL;
                            a.download = `${cleanAudioTitle(data.title)}.${extension}`;
                            document.body.appendChild(a);
                            a.click();
                            a.remove();

                            window.URL.revokeObjectURL(downloadURL);

                            // Finish writing file
                            // await writable.close(); (Beta 2)

                            // reset UI
                            setTimeout(() => {
                                downloadBtn.innerText = "Download";
                                downloadBtn.disabled = false;
                                downloadBtn.style.filter = "brightness(100%)";
                                progressText.innerText = "";
                                progressBar.style.display = "none";
                            }, 500);
                        } else if (this.format === "video") {
                            if (settings.method === "immediate") {
                                window.location.href = `https://${prodAPI}/immediate-download?id=${id}&itag=${itag}`;
                                setTimeout(() => {
                                    downloadBtn.disabled = false;
                                    downloadBtn.style.filter = "brightness(100%)";
                                }, 15000);
                                return
                            }

                            const ws = new WebSocket(`wss://${prodAPI}`);
                            const format = this.format;
                            let downloaded = false;

                            ws.onopen = () => {
                                console.log('WebSocket connected.');
                                ws.send(JSON.stringify({ id, format, itag }));
                                downloadBtn.innerText = "0%";
                                progressText.innerText = "Wait for it...";
                                progressBar.style.display = "block";
                            };

                            ws.onmessage = (event) => {
                                const message = JSON.parse(event.data);
                                
                                if (message.errorTitle && message.errorMessage) {
                                    showError(message.errorTitle, message.errorMessage);
                                    progressText.innerText = message.error;
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
                                    progressText.innerText = message.downloaded !== message.total ? `Collecting ${message.fType} - ${message.downloaded || 0}mb / ${message.total}mb` : "Merging... (progress may not show at times)";
                                }

                                if (message.status === "merging") {
                                    downloadBtn.innerText = `${Math.round(message.progress) || 0}%`;
                                    progressText.innerText = `Merging...`;
                                    progress.style.backgroundColor = '#e55';
                                    progress.style.width = `${Math.round(message.progress) || 0}%`;
                                }

                                if (message.status === 'complete') {
                                    downloaded = true;
                                    // Trigger the file download via a new request

                                    window.location.href = `https://${prodAPI}${message.path}`;
                                    
                                    // Reset UI after a short delay
                                    setTimeout(() => {
                                        downloadBtn.innerText = "Download";
                                        downloadBtn.disabled = false;
                                        downloadBtn.style.filter = "brightness(100%)";
                                        progressBar.style.display = "none";
                                        progressText.innerText = "";
                                        progress.style.backgroundColor = '#f5353c';
                                    }, 500);
                                    ws.close();
                                }
                            }

                            ws.onclose = () => {
                                console.log('WebSocket disconnected.');
                                if (!downloaded) {
                                    downloadBtn.innerText = "Download";
                                    downloadBtn.disabled = false;
                                    downloadBtn.style.filter = "brightness(100%)";
                                    progressBar.style.display = "none";
                                    progressText.innerText = "Download failed or cancelled.";
                                    setTimeout(() => { progressText.innerText = "" }, 4000);
                                }
                            };
                        }
                    } catch (err) {
                        progressText.innerText = "Download failed. Try again.";
                        setTimeout(() => { progressText.innerText = "" }, 4000);
                        console.error("Error occured while downloading: \n", err);
                    }
                }
            } catch (err) {
                loaders[0].style.display = "none";
                vidCon.style.display = "none";
                this.tries++;
                switch (this.tries) {
                    case 1: videoErr.innerText = "Could not fetch video. Try again?"; break;
                    case 2: videoErr.innerText = "Maybe it's your internet?"; break;
                    case 3: videoErr.innerText = "There might be something wrong going on with the app"; break;
                    case 4: videoErr.innerText = "Did you even try to reload?"; break;
                    default: videoErr.innerText = "Just try again later, man"; break;
                }
                setTimeout(() => { videoErr.innerText = "" }, this.tries === 3 ? 5000 : 4000);
                console.error("Error occured while fetching video: \n", err);
            }
        }
    },
    playlist: {
        options: {},
        id: "",
        downloading: false,
        tries: 0,
        async fetch() {
            if (!playlistErr || !playCon || !loaders[1] || !pImg || !pTitle || !pAuthor || !pSongCount || !pSongs) {
                showError("Failed to render playlist", "1 or more video element(s) missing")
                return
            }

            if (this.downloading) {
                playlistErr.innerText = "Can't fetch while already downloading";
                setTimeout(() => { playlistErr.innerText = "" }, 3400 );
                return
            }

            const id = this.id;

            if (!id) {
                playlistErr.innerText = "Where's the collection ID, dawg?";
                setTimeout(() => { playlistErr.innerText = "" }, 3400 );
                return
            }

            loaders[1].style.display = "flex";
            playCon.style.display = "none";

            try {
                const response = await fetch(`https://${prodAPI}/playlist`, { 
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id }) 
                })

                const rData = await response.json();
                if (rData.errorTitle && rData.errorMessage) {
                    showError(rData.errorTitle, rData.errorMessage);
                    return
                }

                if (!rData.songs.length) {
                    console.warn(`No songs were served for ${rData.title} ${rData.type.toLowerCase()}...`);
                    showError("Empty data", `No songs were served for this ${rData.type.toLowerCase()}. Retry or try a different one?`);            
                    return
                }

                const playlist: Playlist = rData;

                const multipleArtists = playlist.author.includes(",");
                let artists: string[];

                if (multipleArtists) artists = playlist.author.split(",")

                const escapeQuery = (value: string) => value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

                const aRemove = document.getElementById("a-remove");
                let album;
                if (playlist.type === "Album" && settings.moreMD) {
                    if (aRemove) aRemove.style.display = "none";
                    const query = `releasegroup:"${escapeQuery(playlist.title)}" AND ` + `artist:"${escapeQuery(playlist.author)}"`;
                    const params = new URLSearchParams({ query, fmt: "json", limit: "5"});

                    const mbRes = await fetch(`https://musicbrainz.org/ws/2/release-group?${params}`, {
                        headers: {
                            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.3"
                        }
                    });

                    if (!response.ok) {
                        console.warn("MusicBrainz lookup failed:", mbRes.status);
                        return;
                    }

                    const data = await mbRes.json();

                    album = data["release-groups"]?.[0];
                } else if (playlist.type === "Playlist" && aRemove) { aRemove.style.display = "block" }

                let artwork: string | null | undefined = null;
                let year = "";

                interface CoverArtImage {
                    front?: boolean;
                    approved?: boolean;
                    types?: string[];
                    image: string;
                    thumbnails?: {
                        small: string;
                        large: string;
                    };
                }

                if (album) {
                    const artRes = await fetch(`https://coverartarchive.org/release-group/${album.id}`);

                    if (artRes.ok) {
                        const artData: { images?: CoverArtImage[];} = await artRes.json();

                        const images = artData.images ?? [];

                        // Prefer the designated front cover.
                        const cover = images.find(image => image.front) ?? images.find(image => image.types?.includes("Front"));

                        if (cover) {
                            // Prefer the 500px || 250px thumbnail; otherwise use the original.
                            artwork = cover.thumbnails?.large || cover.thumbnails?.small || cover.image;

                            // Avoid mixed-content problems on HTTPS websites.
                            if (artwork) artwork = artwork.replace(/^http:/, "https:");
                            console.log("Found higher quality cover art:", artwork);
                        }
                    } else if (artRes.status !== 404) {
                        console.warn("Cover Art Archive request failed:", artRes.status);
                    }
                    year = album["first-release-date"]?.slice(0, 4);
                    console.log("Found release year:", year);
                }

                loaders[1].style.display = "none";
                playCon.style.display = "block";
                
                function cleanSongTitle(title: string | undefined) {
                    const promoKeywords = /(official|music|video|visualizer|lyrics?|lyric\s*video|audio|hd|4k|mv|performance|live|remaster(ed)?)/i;
                    const featureKeywords = /(feat\.?|ft\.?|featuring)/i;

                    if (title) {
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
                    } else return ""
                }
                
                playlist.songs.forEach((song) => {
                    if (!song.title.includes("-") && !song.title.includes("–")) return
                    if (song.title.toLowerCase().includes(song.author.toLowerCase()) || song.title.toLowerCase().includes(playlist.author.toLowerCase())) {
                        song.title = cleanSongTitle(song.title.split(/[-–]/)[1])
                    } else if (multipleArtists) {
                        artists.forEach(artist => {
                            if (song.title.includes(artist.trim())) song.title = cleanSongTitle(song.title.split(/[-–]/)[1])
                        })
                    }
                });

                function cleanPlaylistTitle(title: string) {
                    return title
                        .replace(/[\(\[]?\b(full|official)\s+(album|ep)\b[\)\]]?/gi, "")
                        .replace(/\s{2,}/g, " ")
                        .replace(/[\(\[]\s*[\)\]]/g, "")
                        .trim();
                }
                playlist.title = cleanPlaylistTitle(playlist.title);
                
                let maxCtitle = 65;
                if (screen.width <= 380 || window.innerWidth <= 380) {
                    maxCtitle = 25
                } else if (screen.width <= 450 || window.innerWidth <= 450) {
                    maxCtitle = 30
                } else if (screen.width <= 790 || window.innerWidth <= 790) {
                    maxCtitle = 37
                } else if (screen.width <= 1070 || window.innerWidth <= 1070) maxCtitle = 45

                let maxCauthor = 28;

                if (screen.width <= 450 || window.innerWidth <= 450) {
                    maxCauthor = 8
                } else if (screen.width <= 755 || window.innerWidth <= 755)  { maxCauthor = 17 }

                let maxStitle = 25;

                if (screen.width <= 350 || window.innerWidth <= 350) {
                    maxStitle = 12
                } else if (screen.width <= 390 || window.innerWidth <= 390) {
                    maxStitle = 17
                } else if (screen.width <= 450 || window.innerWidth <= 440) maxStitle = 21

                let maxSartist = 20;

                if (screen.width <= 755 || window.innerWidth <= 755) {
                    maxSartist = 10
                } else if (screen.width <= 820 || window.innerWidth <= 820) maxSartist = 14

                const cType = document.getElementById("c-type");
                if (playlist.type === "Album") {
                    if (playlist.songs.length < 3) {
                        playlist.type = "Single";
                    } else if (playlist.songs.length <= 6) {
                        playlist.type = "EP";
                    }
                }

                if (cType) cType.innerHTML = `Collection type ~ <font color="#e66">${playlist.type}</font>`;
                let removeAuthor = playlist.type === "Playlist";
                if (aRemove) {
                    const iTag = document.querySelector("#a-remove > i");
                    aRemove.onclick = () => {
                        if (removeAuthor) {
                            iTag?.classList.replace("fa-toggle-on", "fa-toggle-off");
                            removeAuthor = false;
                        } else {
                            iTag?.classList.replace("fa-toggle-off", "fa-toggle-on");
                            removeAuthor = true;
                        }
                    }
                }

                pImg.src = artwork ? artwork : playlist.thumbnail;
                pTitle.innerText = playlist.title.length > maxCtitle ? playlist.title.slice(0, maxCtitle).trimEnd() + "..." : playlist.title;
                pAuthor.innerHTML = `<i class="fa-regular fa-user"></i>${playlist.author.length > maxCauthor ? playlist.author.slice(0, maxCauthor).trimEnd() + "..." : playlist.author}`;
                pSongCount.innerHTML = `<strong>Audio ~</strong> ${playlist.songs.length}`;
                pSongs.innerHTML = playlist.songs.map((song, index) => {
                    return `
                        <div id="s">
                        <div class="progress"></div>
                        <span class="s-number">${index + 1}</span>
                        <div class="song">
                            <span id="s-name" class="s-name">${song.title.length > maxStitle ? song.title.slice(0, maxStitle).trimEnd() + "..." : song.title}</span>
                            <span id="s-author" class="s-author">${song.author.length > maxSartist ? song.author.slice(0, maxSartist).trimEnd() + "+" : song.author}</span>
                            <span id="s-duration">${song.duration}</span>
                        </div>
                        </div>
                    `
                }).join("");

                const songCons: NodeListOf<HTMLElement> = document.querySelectorAll(".song");
                const songIndexes: NodeListOf<HTMLElement> = document.querySelectorAll(".s-number");
                const songNames: NodeListOf<HTMLElement> = document.querySelectorAll('.s-name');
                const songArtists: NodeListOf<HTMLElement> = document.querySelectorAll(".s-author");
                const songProgress: NodeListOf<HTMLElement> = document.querySelectorAll(".progress");

                songCons.forEach((songEl, index) => {
                    const [song, songIndex, songProg] = [playlist.songs[index], songIndexes[index], songProgress[index]]
                    if (!song || !songIndex || !songProg)  {
                        showError("Failed to start download for song", "Song or elements missing");
                        return
                    }
                    songEl.onclick = async () => {
                        await downloadSong(song, index, playlist, songProg, songIndex);

                        // reset after done
                        setTimeout(() => {
                            this.downloading = false;
                            songProg.style.width = "0";
                            songProg.style.display = "none";
                        }, 500);
                    }
                });

                tooltipper(songNames, playlist.songs);
                tooltipper(songArtists, playlist.songs);

                let downloading: boolean = this.downloading;
                async function downloadSong(song: Song, index: number, playlist: Playlist, songProgress: HTMLElement, songIndex: HTMLElement) {
                    try {
                        downloading = true;
                        songProgress.style.display = "block";
                        songIndex.style.color = "#e55";

                        const collection = {
                            title: encodeURIComponent(playlist.title),
                            artist: removeAuthor ? "" : encodeURIComponent(playlist.author),
                            coverImage: encodeURIComponent(artwork ? artwork : playlist.thumbnail),
                            release: year ? year : "",
                            type: playlist.type,
                            tracks: { index: index + 1, total: playlist.songs.length }
                        };

                        if (song.author.toLowerCase().includes(collection.artist.toLowerCase())) song.author = collection.artist
                        
                        const res = await fetch(`https://${prodAPI}/download-a?id=${song.id}&sArtist=${encodeURIComponent(song.author)}&sTitle=${encodeURIComponent(song.title)}&playlist=${JSON.stringify(collection)}`);

                        if (!res.ok) {
                            const resJ = await res.json();
                            downloading = false;
                            showError(resJ.errorTitle, resJ.errorMessage);
                            songIndex.style.color = "lightgray";
                            songProgress.style.display = "none";
                            return;
                        }

                        const contentLength = res.headers.get("content-length");
                        const total = contentLength ? parseInt(contentLength) : 0;

                        if (!res.body) throw new Error("No response body received");
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
                                songProgress.style.width = `${percent}%`;
                            }
                        }
                        songProgress.style.width = "100%";

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
                        downloading = false;
                        showError("Failed to download song", String(err));
                        songIndex.style.color = "lightgray";
                        songProgress.style.display = "none";
                    }
                }

                const downloadBtn = document.getElementById("download-all") as HTMLButtonElement;

                downloadBtn.onclick = async function downloadRecurringly() {
                    downloadBtn.disabled = true;
                    downloadBtn.style.filter = "brightness(80%)";

                    for (let i = 0; i < playlist.songs.length; i++) {
                        const [song, songIndex, songProg] = [playlist.songs[i], songIndexes[i], songProgress[i]];
                        if (!song || !songIndex || !songProg)  {
                            showError("Failed to start download for song", "Song or elements missing");
                            return
                        }
                        const nums = song.duration.split(":");
                        if (nums.length >= 3) {
                            console.warn("Audio is too long. Likely does not belong in collection. Skipping...");
                            continue
                        }
                        await downloadSong(song, i, playlist, songProg, songIndex);

                        // reset progress after each
                        songProg.style.width = "0";
                        songProg.style.display = "none";
                        songProg.style.color = "";

                        // small delay so browser breathes
                        await new Promise(res => setTimeout(res, 300));
                    }

                    downloading = false;
                    downloadBtn.disabled = false;
                    downloadBtn.style.filter = "brightness(100%)";
                };
            } catch (error) {
                loaders[1].style.display = "none";
                playCon.style.display = "none";
                this.tries++;
                switch (this.tries) {
                    case 1: playlistErr.innerText = "Could not fetch playlist. Try again?"; break;
                    case 2: playlistErr.innerText = "Maybe it's your internet?"; break;
                    case 3: playlistErr.innerText = "Make sure the playlist is not private"; break;
                    case 4: playlistErr.innerText = "There might be something wrong going on with the app"; break;
                    case 5: playlistErr.innerText = "Did you even try to reload?"; break;
                    default: playlistErr.innerText = "Just try again later, man"; break;
                }
                setTimeout(() => { playlistErr.innerText = "" }, this.tries === 3 ? 5000 : 4000);
                console.error("Error occured while fetching playlist:", error);
            }
        }
    }
}