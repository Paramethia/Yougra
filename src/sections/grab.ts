import recents from '../components/recents.ts';
import createNotification from '../components/notification.ts';
import showError from '../overlays/error.ts';
import settings from '../overlays/settings.ts';
import tooltipper from '../components/tooltip.ts';
import { route } from '../components/sidebar.ts';
import type { SearchVideo, SearchPlaylist, Video, Playlist, Media } from '../types.ts';

const domain = window.location.href.split("/")[2];
const apiHost = location.hostname === "localhost" ? "localhost:4480" : "api.yougra.site";
const wsProtocol = location.protocol === "https:" ? "wss:" : "ws:";

// Video elements
const watch = document.getElementById("watch");
const selection = document.getElementById("selection-msg");
const vidCon = document.getElementById("video-info");
const vdob = document.getElementById("vdob");
const vdOptionsB = document.getElementById("v-d-options-b") as HTMLButtonElement;
const vdOptions = document.getElementById("v-d-options");
const vSelect: NodeListOf<HTMLElement> = document.querySelectorAll(".v-select");
const aSelect: NodeListOf<HTMLElement> = document.querySelectorAll(".a-select");
const doTT: NodeListOf<HTMLElement> = document.querySelectorAll(".do-tt");
const [vOp, aOp, vTitle, vAuthor, vViews, vLikes, vPosted] = [
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
const playCon = document.getElementById("playlist-info");
const pdob = document.getElementById("pdob");
const pdOptionsB = document.getElementById("p-d-options-b") as HTMLButtonElement;
const pdOptions = document.getElementById("p-d-options");
const [vOpt, aOpt, pImg, pTitle, pAuthor, pMediaCount, pSongs, pVideos] = [
    document.getElementById("vid-op"), document.getElementById("aud-op"),
    document.getElementById("p-thumbnail"), document.getElementById("p-title"), 
    document.getElementById("p-author"), document.getElementById("m-amount"), 
    document.getElementById("songs"), document.querySelector("#playlist-info #videos")
] as [HTMLElement, HTMLElement, HTMLImageElement, HTMLElement, HTMLElement, HTMLElement, HTMLElement, HTMLElement];

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

        if (recents.video.stored && recents.video.element) {
            const recentVideos: SearchVideo[] = JSON.parse(recents.video.stored).reverse();
            if(!grabQ) recents.video.element.style.display = "block";
            recents.video.element.innerHTML = `
                <h3>Recently grabbed videos</h3>
                <div style="display:flex">
                ${recentVideos.map((video) => { 
                    return `
                    <div class="video">
                        <div style="min-height: 150px; min-width: 250px; position: relative; border: 1px dashed #303030; border-radius: 5px; background: radial-gradient(#e55, #202020)">
                            <img src="${video.thumbnail}" loading="lazy" />
                            <span id="duration">${video.duration}</span>
                        </div>
                        <h4 class="v-title" title="${video.title}">${video.title.length < 25 ? video.title : video.title.slice(0, 24).trimEnd() + "..."}</h4>
                        <h6 class="v-author">${video.author.name}</h6>
                        <span class="v-share"><svg width="17" height="17" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" fill="#aaa"><g id="Layer_2" data-name="Layer 2"><g id="invisible_box" data-name="invisible box"><rect width="48" height="48" fill="none"/></g><g id="Q3_icons" data-name="Q3 icons"><path d="M31.2,14.2,41,24.1l-9.8,9.8V26.8L27,27c-6.8.3-12,1-16.1,2.4,3.6-3.8,9.3-6.8,16.7-7.5l3.6-.3V14.2M28.3,6a1.2,1.2,0,0,0-1.1,1.3V17.9C12,19.4,2.2,29.8,2,40.3c0,.6.2,1,.6,1s.7-.3,1.1-1.1c2.4-5.4,7.8-8.5,23.5-9.2v9.7A1.2,1.2,0,0,0,28.3,42a.9.9,0,0,0,.8-.4L45.6,25.1a1.5,1.5,0,0,0,0-2L29.1,6.4a.9.9,0,0,0-.8-.4Z"/></g></g></svg></span>
                    </div>
                `}).join("")}
                </div>
            `;
            const videos: NodeListOf<HTMLElement> = document.querySelectorAll("#recent-videos .video");

            videos.forEach((author, index) => {
                author.onclick = () => {
                    history.pushState({}, "", `/grab?v=${recentVideos[index]?.id}`);
                    this.video.id = recentVideos[index]!.id;
                    this.video.fetch();
                }
            })

            const vidShares: NodeListOf<HTMLElement> = document.querySelectorAll("#recent-videos .v-share");

            vidShares.forEach((shareB, index) => {
                const video = recentVideos[index];
                if (!video) return
                shareB.onclick = (e: MouseEvent) => {
                    e.stopPropagation();
                    shareB.style.animation = 'border-light-up 0.4s ease';
                    setTimeout(() => { shareB.style.animation = 'none' }, 400 );
                    navigator.clipboard.writeText(`${domain}/grab?v=${video.id}`);
                }
            });
        }
        if (recents.collection.stored && recents.collection.element) {
            const recentCollections: SearchPlaylist[] = JSON.parse(recents.collection.stored).reverse();
            if(!grabQ) recents.collection.element.style.display = "block";
            recents.collection.element.innerHTML = `
                <h3>Recently grabbed collections</h3>
                <div style="display:flex">
                ${recentCollections.map((collection) => { 
                    return `
                    <div class="playlist">
                        <div style="min-height: 150px; min-width: 200px; position: relative; border: 1px dashed #303030; border-radius: 5px; background: radial-gradient(#e55, #202020)">
                            <center><img src="${collection.thumbnail}" loading="lazy" ${collection.type !== "Playlist"? 'style="width: 55%"' : ""}/></center>
                            <svg id="plist-icon" fill="rgba(235, 74, 74, 0.6)" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="28px" height="28px" viewBox="0 0 476.91 476.909" xml:space="preserve" stroke="#aaa">
                                <g>
                                    <g>
                                    <path d="M62.802,142.287h121.682c4.45,0,10.95-3.805,13.32-7.999l24.816-41.066H62.802C28.12,93.222,0,121.342,0,156.026v20.779 C13.266,156.086,36.425,142.287,62.802,142.287z" />
                                    <path d="M414.105,67.708H266.913c-8.681,0-19.151,6.125-23.399,13.685l-7.147,11.828l-28.489,47.157 c-4.246,7.558-14.719,13.684-23.393,13.684H62.802C28.12,154.062,0,182.183,0,216.865v115.794v13.737 c0,34.685,28.12,62.805,62.802,62.805h351.303c34.685,0,62.805-28.12,62.805-62.805v-13.737V156.026v-25.515 C476.91,95.829,448.79,67.708,414.105,67.708z M208.372,335.332h163.952c4.34,0,7.851,3.515,7.851,7.851 c0,4.349-3.511,7.851-7.851,7.851H208.372c-4.332,0-7.851-3.502-7.851-7.851C200.521,338.847,204.04,335.332,208.372,335.332zM200.521,301.762c0-4.344,3.519-7.851,7.851-7.851h163.952c4.34,0,7.851,3.507,7.851,7.851c0,4.341-3.511,7.851-7.851,7.851 H208.372C204.04,309.612,200.521,306.103,200.521,301.762z M380.19,216.52c0,4.332-3.526,7.851-7.85,7.851H250.659 c-4.332,0-7.847-3.519-7.847-7.851c0-4.334,3.515-7.851,7.847-7.851H372.34C376.664,208.669,380.19,212.186,380.19,216.52z M372.34,252.491c4.323,0,7.85,3.502,7.85,7.85c0,4.341-3.526,7.852-7.85,7.852H208.372c-4.332,0-7.851-3.511-7.851-7.852 c0-4.348,3.519-7.85,7.851-7.85H372.34z M128.618,305.337c10.395-6.052,21.512-8.007,30.413-6.288v-67.912V208.82v-6.899h6.904 h10.047h35.53c3.817,0,6.899,3.092,6.899,6.899v15.409c0,3.815-3.09,6.901-6.899,6.901h-35.53v87.636h-0.088 c-0.571,10.552-8.752,22.466-21.919,30.132c-17.829,10.379-37.956,9.028-44.955-2.989 C102.017,333.878,110.791,315.716,128.618,305.337z"/>
                                    </g>
                                </g> 
                            </svg>
                        </div>
                        <h4 class="p-title" title="${collection.title}">${collection.title.length < 29 ? collection.title : collection.title.slice(0, 28).trimEnd() + "..."}</h4>
                        <h6>${collection.type}</h6> <font color="#909090">|</font> <span id="items">${collection.itemCount}</span>
                        <span class="p-share"><svg width="17" height="17" viewBox="0 0 48 48" fill="#aaa" xmlns="http://www.w3.org/2000/svg"><g id="Layer_2" data-name="Layer 2"><g id="invisible_box" data-name="invisible box"><rect width="48" height="48" fill="none"/></g><g id="Q3_icons" data-name="Q3 icons"><path d="M31.2,14.2,41,24.1l-9.8,9.8V26.8L27,27c-6.8.3-12,1-16.1,2.4,3.6-3.8,9.3-6.8,16.7-7.5l3.6-.3V14.2M28.3,6a1.2,1.2,0,0,0-1.1,1.3V17.9C12,19.4,2.2,29.8,2,40.3c0,.6.2,1,.6,1s.7-.3,1.1-1.1c2.4-5.4,7.8-8.5,23.5-9.2v9.7A1.2,1.2,0,0,0,28.3,42a.9.9,0,0,0,.8-.4L45.6,25.1a1.5,1.5,0,0,0,0-2L29.1,6.4a.9.9,0,0,0-.8-.4Z"/></g></g></svg></span>
                    </div>
                `}).join("")}
                </div>
            `;
            const collections: NodeListOf<HTMLElement> = document.querySelectorAll("#recent-collections .playlist");

            collections.forEach((author, index) => {
                author.onclick = () => {
                    history.pushState({}, "", `/grab?c=${recentCollections[index]?.id}`);
                    this.playlist.id = recentCollections[index]!.id;
                    this.playlist.fetch();
                }
            })

            const collShares: NodeListOf<HTMLElement> = document.querySelectorAll("#recent-collections .p-share");

            collShares.forEach((shareB, index) => {
                const collection = recentCollections[index];
                if (!collection) return
                shareB.onclick = (e: MouseEvent) => {
                    e.stopPropagation();
                    shareB.style.animation = 'border-light-up 0.4s ease';
                    setTimeout(() => { shareB.style.animation = 'none' }, 400 );
                    navigator.clipboard.writeText(`${domain}/grab?c=${collection.id}`);
                }
            });
        }

        if (vdob && vdOptions && pdob && pdOptions && doTT[0]) {
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

            vdob.onmouseover = () => { 
                vdOptionsB.style.background = '#3f3f3f';
                doTT[0]!.style.animation = 'appear 0.3s ease forwards';
            }
            vdob.onmouseout = () => { 
                if (vdOptions.style.display !== "block") vdOptionsB.style.background = '#2a2a2a'
                doTT[0]!.style.animation = 'disappear 0.2s ease forwards';
            }
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
            pdob.onmouseover = () => { 
                pdOptionsB.style.background = '#3f3f3f';
                doTT[1]!.style.animation = 'appear 0.3s ease forwards';
            }
            pdob.onmouseout = () => { 
                if (pdOptions.style.display !== "block") pdOptionsB.style.background = '#2a2a2a'
                doTT[1]!.style.animation = 'disappear 0.2s ease forwards';
            }
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

        if (vSelect && aSelect && vOp && vOpt && aOp && aOpt && pMediaCount && pSongs && pVideos) {
            const audConS = [aOp, aOpt];
            const vidConS = [vOp, vOpt];

            vSelect.forEach((select, index) => {
                select.onmouseover = () => { select.style.background = '#5d5d5d' }
                select.onmouseout = () => { 
                    const format = !index ? this.video.format : this.playlist.format;
                    if (format !== 'video') select.style.background = '#3f3f3f' 
                }
                select.onclick = () => {
                    if (this.playlist.downloading) return
                    const format = !index ? this.video.format : this.playlist.format;
                    if (format === 'audio') !index ? this.video.format = 'video' : this.playlist.format = 'video'
                    select.style.background = '#5d5d5d';
                    if (aSelect[index]) aSelect[index].style.background = '#3f3f3f';
                    if (vidConS[index]) vidConS[index].style.display = 'block';
                    if (audConS[index]) audConS[index].style.display = 'none';
                    if (pMediaCount) pMediaCount.innerHTML = pMediaCount.innerHTML.replace("Audio", "Videos");
                    pSongs.style.display = "none";
                    pVideos.style.display = "block";
                }
            })

            aSelect.forEach((select, index) => {
                select.onmouseover = () => { select.style.background = '#5d5d5d' }
                select.onmouseout = () => { 
                    const format = !index ? this.video.format : this.playlist.format;
                    if (format !== 'audio') select.style.background = '#3f3f3f' 
                }
                select.onclick = () => {
                    if (this.playlist.downloading) return
                    const format = !index ? this.video.format : this.playlist.format;
                    if (format === 'video') {
                        !index ? this.video.format = 'audio' : this.playlist.format = 'audio'
                        select.style.background = '#5d5d5d';
                        if (vSelect[index]) vSelect[index].style.background = '#3f3f3f';
                        if (audConS[index]) audConS[index].style.display = 'block';
                        if (vidConS[index]) vidConS[index].style.display = 'none';
                        if (pMediaCount) pMediaCount.innerHTML = pMediaCount.innerHTML.replace("Videos", "Audio");
                        pSongs.style.display = "block";
                        pVideos.style.display = "none";
                    }
                }
            })
        }
    },
    video: {
        format: "video",
        id: "",
        tries: 0,
        async fetch() {
            if (!vidCon || !watch || !loaders[1] || !selection || !vOp || !aOp) {
                showError("Failed to render video", "1 or more video element(s) missing")
                return
            }
            const id = this.id;

            if (!id) {
                createNotification("Cannot grab video", "No video ID given from URL", "error");
                return
            }

            if (recents.video.element) recents.video.element.style.display = "none";
            loaders[1].style.display = "flex";
            vidCon.style.display = "none";

            function formatTime(seconds: number) {
                const hours = Math.floor(seconds / 3600);
                const mins = Math.floor((seconds % 3600) / 60);
                const secs = seconds % 60;

                if (hours) return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`

                return `${mins}:${secs.toString().padStart(2, "0")}`;
            }

            try {
                const response = await fetch(`${location.protocol}//${apiHost}/video`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id })
                });

                if (!response) throw new Error("No response recieved")

                const rData = await response.json();

                if (!response.ok && rData.errorTitle && rData.errorMessage) {
                    if (recents.video.element && recents.video.stored) recents.video.element.style.display = "block";
                    loaders[1].style.display = "none";
                    showError(rData.errorTitle, rData.errorMessage);
                    return
                }

                const video: Video = rData;

                recents.video.set({
                    id: video.id,
                    title: video.title,
                    author: video.author,
                    thumbnail: video.thumbnail,
                    duration: `${formatTime(video.lengthSeconds)}`,
                })

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

                if (!vOp || !aOp || !vTitle || !vAuthor || !vViews || !vLikes || !vPosted) {
                    showError("Failed to show video", "Some elements are missing");
                    return
                }

                loaders[1].style.display = "none";
                vidCon.style.display = "block";

                let metadata = video.song && video.lengthSeconds < 900 ? true : false;
                let extension = "mp3";

                function goToAuthor(authorID: string) {
                    history.pushState({}, "", `/author?id=${authorID}`);
                    route.author();
                }

                watch.innerHTML = `
                    <img id="v-thumbnail" src="${video.thumbnail}" alt="Youtube video thumbnail" />
                    <span id="play"><i class="fa-solid fa-play"></i> Play</span>
                    <span id="length">${formatTime(video.lengthSeconds)}</span>
                `;

                if (defaultVidO && selectedAudio) {
                    vOp.innerHTML = `
                        <p style="font-size: 14px;">File size ~ <span id="v-size">${fullSize(defaultVidO.size, selectedAudio.size)}mb</span></p>
                        <select id="qualities">
                            ${videoFormats.map(vid => { return `<option value="${vid.qualityLabel}">${vid.qualityLabel}</option>` })}
                        </select>
                    `;
                    aOp.innerHTML = `
                        <p style="font-size: 14px;">File size ~ <span id="a-size">${(parseFloat(String(selectedAudio.size)) + 1.4).toFixed(2)}mb</span></p>
                        <p id="metadata" style="font-size: 14px;">Metadata <i class="fa-solid fa-toggle-${metadata ? 'on' : 'off'}"></i>
                        <p id="m4a" style="font-size: 14px;">.m4a <i class="fa-solid fa-toggle-${extension !== "mp3" ? 'on' : 'off'}"></i>
                    `;
                }
                
                vTitle.innerText = video.title;
                vAuthor.innerHTML = `<strong><i class="fa-solid fa-user"></i>${video.author.name}</strong> `;
                vAuthor.onclick = () => { goToAuthor(video.author.id) };
                vViews.innerHTML = `<i class="fa-regular fa-eye"></i> ${video.views}`;
                vLikes.innerHTML = `<i class="fa-regular fa-thumbs-up"></i> ${video.likes}`;
                vPosted.innerHTML = `<i class="fa-regular fa-calendar"></i> ${window.innerWidth > 355 || screen.width > 355 ? video.pDate.exact : video.pDate.relative}`;
                const vPlay = document.getElementById("play");
                if (!vPlay) throw new Error("Play button missing for video")
                vPlay.onclick = () => {
                    watch.innerHTML = "";

                    const iframe = document.createElement("iframe");
                    iframe.src = `https://www.youtube.com/embed/${video.id}`;
                    iframe.title = video.title || "YouTube video player";
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

                this.format = video.song ? "audio" : "video";
                selection.innerText = `Selected ${this.format}`;

                [vSize, aSize, qualities, metadataT, m4aT] = [
                    document.getElementById("v-size"), document.getElementById("a-size"), document.getElementById("qualities"), document.getElementById("metadata"), document.getElementById("m4a")
                ] as [HTMLElement, HTMLElement, HTMLSelectElement, HTMLElement, HTMLElement];

                if (!aSize || !qualities || !metadataT || !defaultVidO || !selectedAudio) {
                    console.warn("Format update could not apply visually. Some required elements/variables missing");
                    return
                }

                if (this.format === 'audio') {
                    if (aSelect[0]) aSelect[0].style.background = '#5d5d5d'
                    if (vSelect[0]) vSelect[0].style.background = '#3f3f3f'
                    aOp.style.display = 'block';
                    vOp.style.display = 'none';
                } else {
                    if (vSelect[0]) vSelect[0].style.background = '#5d5d5d'
                    if (aSelect[0]) aSelect[0].style.background = '#3f3f3f'
                    vOp.style.display = 'block';
                    aOp.style.display = 'none';
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
                            progressText.innerText = "Preparing audio...";
                            progressBar.style.display = "block";

                            const ws = new WebSocket(`${wsProtocol}//${apiHost}/audio`);

                            ws.onopen = () => {
                                ws.send(JSON.stringify({ id, metadata, }));
                            };

                            ws.onmessage = event => {
                                const res = JSON.parse(event.data);

                                switch (res.status) {
                                    case "":
                                        progressText.innerText = "Hmm...";
                                        break;

                                    case "writing": {
                                        const received = res.downloaded / 1024 / 1024;

                                        if (res.total) {
                                            const total = res.total / 1024 / 1024;
                                            const percent = res.progress;

                                            progress.style.backgroundColor = '#f5353c';
                                            progress.style.width = `${percent}%`;
                                            downloadBtn.innerText = `${Math.floor(percent)}%`;

                                            progressText.innerText = `Writing audio - ${received.toFixed(2)}mb / ${total.toFixed(2)}mb`;
                                        } else {
                                            progressText.innerText = `Writing audio - ${received.toFixed(2)}mb`;
                                        }

                                        break;
                                    }

                                    case "encoding": {
                                        const percent = res.progress;

                                        progress.style.backgroundColor = '#e55';
                                        progress.style.width = `${percent}%`;
                                        downloadBtn.innerText = `${Math.floor(percent)}%`;
                                        progressText.innerText =`Encoding to MP3...`;

                                        break;
                                    }

                                    case "complete":
                                        progressText.innerText = "Preparing download...";
                                        break;

                                    case "path": {
                                        // Trigger native browser download
                                        window.location.href = `${location.protocol}//${apiHost}${res.path}`;
                                        createNotification("Audio download started", "Your audio is done processing", "success");
                                        ws.close();
                                        break;
                                    }

                                    case "error":
                                        ws.close();
                                        showError("Failed to download audio", res.message);
                                    break;
                                }
                            };

                            ws.onclose = () => {
                                downloadBtn.innerText = "Download";
                                downloadBtn.disabled = false;
                                downloadBtn.style.filter = "brightness(100%)";
                                progressText.innerText = "";
                                progressBar.style.display = "none";
                                progress.style.backgroundColor = '#f5353c';
                            };

                            ws.onerror = error => {
                                console.error("Audio WebSocket error:", error);
                                ws.close();
                                showError("Connection error", "Could not connect to the audio download server.");
                            };
                        } else if (this.format === "video") {
                            if (settings.method === "immediate") {
                                window.location.href = `${location.protocol}//${apiHost}/immediate-download?id=${id}&itag=${itag}`;
                                setTimeout(() => {
                                    downloadBtn.disabled = false;
                                    downloadBtn.style.filter = "brightness(100%)";
                                }, 15000);
                                return
                            }

                            const size = parseInt(vSize.innerText);
                            if (size > 5000) {
                                downloadBtn.disabled = false;
                                downloadBtn.style.filter = "brightness(100%)";
                                progressText.innerText = "You can't download a video larger than 5GB with processing.";
                                return
                            }

                            const ws = new WebSocket(`${wsProtocol}//${apiHost}/video`);
                            let downloaded = false;

                            ws.onopen = () => {
                                ws.send(JSON.stringify({ id, itag }));
                                downloadBtn.innerText = "0%";
                                progressText.innerText = "Preparing video...";
                                progressBar.style.display = "block";
                            };

                            ws.onmessage = (event) => {
                                const res = JSON.parse(event.data);
                                
                                if (res.errorTitle && res.errorMessage) {
                                    showError(res.errorTitle, res.errorMessage);
                                    progressText.innerText = res.error;
                                    downloadBtn.disabled = false; 
                                    downloadBtn.style.filter = "brightness(100%)";
                                    setTimeout(() => { progressText.innerText = "" }, 4000);
                                    ws.close();
                                    return;
                                }

                                if (res.status === "downloading") {
                                    downloadBtn.innerText = `${Math.floor(res.progress) || 0}%`;
                                    progress.style.backgroundColor = '#f5353c';
                                    progress.style.width = `${res.progress}%`;
                                    progressText.innerText = res.downloaded !== res.total ? `Writing ${res.fType} - ${res.downloaded || 0}mb / ${res.total}mb` : "Merging... (progress may not show at times)";
                                }

                                if (res.status === "merging") {
                                    downloadBtn.innerText = `${Math.round(res.progress) || 0}%`;
                                    progressText.innerText = `Merging...`;
                                    progress.style.backgroundColor = '#e55';
                                    progress.style.width = `${Math.round(res.progress) || 0}%`;
                                }

                                if (res.status === 'complete') {
                                    downloaded = true;

                                    // Trigger the file download via a new request
                                    window.location.href = `${location.protocol}//${apiHost}${res.path}`;
                                    
                                    // Reset UI after a short delay
                                    setTimeout(() => {
                                        downloadBtn.innerText = "Download";
                                        downloadBtn.disabled = false;
                                        downloadBtn.style.filter = "brightness(100%)";
                                        progressBar.style.display = "none";
                                        progressText.innerText = "";
                                        progress.style.backgroundColor = '#f5353c';
                                    }, 500);
                                    createNotification("Video download started", "Your video is done processing", "success");
                                    ws.close();
                                }
                            }

                            ws.onclose = () => {
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
                if (recents.video.element && recents.video.stored) recents.video.element.style.display = "block";
                loaders[1].style.display = "none";
                vidCon.style.display = "none";
                this.tries++;
                switch (this.tries) {
                    case 1: createNotification("Grabbing error", "Could not fetch video. Try again?", "error"); break;
                    case 2: createNotification("Grab error", "Maybe it's your internet?", "error"); break;
                    case 3: createNotification("Grab error", "There might be something wrong wit the server", "error"); break;
                    case 4: createNotification("Grabbing error", "Did you even try to reload?", "error"); break;
                    default: createNotification("Grabbing error", "Just try again later, man", "error"); break;
                }
                console.error("Error occured while fetching video: \n", err);
            }
        }
    },
    playlist: {
        format: "audio",
        id: "",
        downloading: false,
        tries: 0,
        async fetch() {
            if (!playCon || !loaders[2] || !pImg || !pTitle || !pAuthor || !pMediaCount || !pSongs || !pVideos) {
                showError("Failed to render playlist", "1 or more video element(s) missing")
                return
            }

            if (this.downloading) {
                createNotification("Not allowed!!", "Can't grab while already downloading", "info");
                return
            }

            const id = this.id;

            if (!id) {
                createNotification("Cannot grab collection", "No collection ID given from the URL", "error");
                return
            }

            if (recents.collection.element) recents.collection.element.style.display = "none"
            loaders[2].style.display = "flex";
            playCon.style.display = "none";

            try {
                const response = await fetch(`${location.protocol}//${apiHost}/playlist`, { 
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id }) 
                })

                const rData = await response.json();
                if (rData.errorTitle && rData.errorMessage) {
                    if (recents.collection.element && recents.collection.stored) recents.collection.element.style.display = "block"
                    loaders[2].style.display = "none";
                    showError(rData.errorTitle, rData.errorMessage);
                    return
                }

                if (!rData.media.length) {
                    if (recents.collection.element && recents.collection.stored) recents.collection.element.style.display = "block"
                    loaders[2].style.display = "none";
                    console.warn(`No media was served for ${rData.title} ${rData.type.toLowerCase()}...`);
                    showError("Empty data", `No media was served for this ${rData.type.toLowerCase()}. Retry or try a different one?`);
                    return
                }

                const playlist: Playlist = rData;

                const multipleArtists = playlist.author.includes(",");
                let artists: string[];

                if (multipleArtists) artists = playlist.author.split(",")

                const escapeQuery = (value: string) => value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

                const aRemove = document.getElementById("a-remove");
                if (playlist.type === "Album" && aRemove) aRemove.style.display = "none";
                let album;
                if (playlist.type === "Album" && settings.moreMD) {
                    if (aRemove) aRemove.style.display = "none";
                    const query = `releasegroup:"${escapeQuery(playlist.title)}" AND ` + `artist:"${escapeQuery(playlist.author)}"`;
                    const params = new URLSearchParams({
                        query,
                        fmt: "json",
                        limit: "5",
                        inc: "genres"
                    });


                    const mbRes = await fetch(`https://musicbrainz.org/ws/2/release-group?${params}`, {
                        headers: {
                            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.3"
                        }
                    });

                    if (!mbRes.ok) {
                        console.warn("MusicBrainz lookup failed:", mbRes.status);
                        createNotification("No extra data", "Could not retrieve more data for metadata 🥲", "warn");
                    }

                    const data = await mbRes.json();

                    album = data["release-groups"]?.[0];
                } else if (playlist.type === "Playlist" && aRemove) { aRemove.style.display = "block" }

                let year = "";
                let genre = "";

                if (album) {
                    year = album["first-release-date"]?.slice(0, 4);
                    console.log("Found release year:", year);
                    if (album.tags) {
                        interface Tag {
                            name: string,
                            count?: number
                        }
                        const tags: Tag[] = album.tags;
                        genre = Array.isArray(album?.tags) ? tags.map(tag => (typeof tag === 'object' ? tag?.name : tag)).filter(Boolean).join('; ') : (album?.tags || "");
                        console.log("Found genre(s):", genre);
                    } else createNotification("No genre detected", "Could not find genre for metadata", "warn")
                }

                recents.collection.set({
                    id: this.id,
                    title: playlist.title,
                    thumbnail: playlist.thumbnail,
                    type: playlist.type,
                    itemCount: `${playlist.media.length} ${playlist.type === "Playlist" ? "videos" : "songs"}`
                });

                loaders[2].style.display = "none";
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
                
                playlist.media.forEach((song) => {
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

                let maxMtitle = 25;

                if (screen.width <= 350 || window.innerWidth <= 350) {
                    maxMtitle = 12
                } else if (screen.width <= 390 || window.innerWidth <= 390) {
                    maxMtitle = 17
                } else if (screen.width <= 450 || window.innerWidth <= 440) maxMtitle = 21

                let maxMauthor = 20;

                if (screen.width <= 755 || window.innerWidth <= 755) {
                    maxMauthor = 10
                } else if (screen.width <= 820 || window.innerWidth <= 820) maxMauthor = 14

                const cType = document.getElementById("c-type");
                if (playlist.type === "Album") {
                    if (playlist.media.length < 3) {
                        playlist.type = "Single";
                    } else if (playlist.media.length <= 6) {
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

                pImg.src = playlist.thumbnail;
                pTitle.innerText = playlist.title.length > maxCtitle ? playlist.title.slice(0, maxCtitle).trimEnd() + "..." : playlist.title;
                pAuthor.innerHTML = `<i class="fa-regular fa-user"></i>${playlist.author.length > maxCauthor ? playlist.author.slice(0, maxCauthor).trimEnd() + "..." : playlist.author}`;
                pMediaCount.innerHTML = `<strong>Audio ~</strong> ${playlist.media.length}`;
                pSongs.innerHTML = playlist.media.map((song, index) => {
                    return `
                        <div id="s">
                        <div class="s-d-progress"></div>
                        <span class="s-number">${index + 1}</span>
                        <div class="song">
                            <span id="s-name" class="s-name">${song.title.length > maxMtitle ? song.title.slice(0, maxMtitle).trimEnd() + "..." : song.title}</span>
                            <span id="s-author" class="s-author">${song.author.length > maxMauthor ? song.author.slice(0, maxMauthor).trimEnd() + "+" : song.author}</span>
                            <span id="s-duration">${song.duration}</span>
                        </div>
                        </div>
                    `
                }).join("");
                pVideos.innerHTML = playlist.media.map((video, index) => {
                    return `
                        <div class="video">
                            <span class="v-number">${index + 1}</span>
                            <div id="v-thumbnail">
                                <img src="${video.thumbnail}" alt="${video.title}" loading="lazy" />
                                <span id="v-duration">${video.duration}</span>
                            </div>

                            <div id="v-info">
                                <p id="v-name" class="v-name" title="${video.title}">${video.title.length > maxMtitle ? video.title.slice(0, maxMtitle).trimEnd() + "..." : video.title}</p>
                                <p id="v-author" class="v-author">${video.author.length > maxMauthor ? video.author.slice(0, maxMauthor).trimEnd() + "+" : video.author}</p>
                            </div>

                            <div class="v-d-prog-bar"><div class="v-d-progress"></div></div>
                            <span class="v-d-prog-txt"></div>
                        </div>
                    `
                }).join("");

                const songCons: NodeListOf<HTMLElement> = document.querySelectorAll(".song");
                const songIndexes: NodeListOf<HTMLElement> = document.querySelectorAll(".s-number");
                const songNames: NodeListOf<HTMLElement> = document.querySelectorAll('.s-name');
                const songArtists: NodeListOf<HTMLElement> = document.querySelectorAll(".s-author");
                const songProgress: NodeListOf<HTMLElement> = document.querySelectorAll(".s-d-progress");

                let mediaDownloading = false;

                songCons.forEach((songEl, index) => {
                    const [song, songIndex, songProg] = [playlist.media[index], songIndexes[index], songProgress[index]]
                    if (!song || !songIndex || !songProg)  {
                        showError("Failed to start download for song", "Song or elements missing");
                        return
                    }
                    songEl.onclick = async () => {
                        if (mediaDownloading) return
                        await downloadSong(song, index, playlist, songProg, songIndex);

                        // reset after done
                        setTimeout(() => {
                            this.downloading = false;
                            mediaDownloading = false;
                            songProg.style.width = "0";
                            songProg.style.display = "none";
                        }, 500);
                    }
                });

                const vidCons: NodeListOf<HTMLElement> = document.querySelectorAll("#playlist-info .video");
                const vidIndexes: NodeListOf<HTMLElement> = document.querySelectorAll(".v-number");
                const vidProgBars: NodeListOf<HTMLElement> = document.querySelectorAll(".v-d-prog-bar");
                const vidProgress: NodeListOf<HTMLElement> = document.querySelectorAll(".v-d-progress");
                const vidProgTxts: NodeListOf<HTMLElement> = document.querySelectorAll(".v-d-prog-txt");

                vidCons.forEach((vidEl, index) => {
                    const [vid, vidIndex, vidProgBar, vidProg, vidProgTxt] = [playlist.media[index], vidIndexes[index], vidProgBars[index], vidProgress[index], vidProgTxts[index]]
                    if (!vid || !vidIndex || !vidProgBar || !vidProg || !vidProgTxt)  {
                        showError("Failed to start download for video", "Video or elements missing");
                        return
                    }
                    vidEl.onclick = async () => {
                        await downloadVideo(vid, vidProgBar, vidProg, vidIndex, vidProgTxt);
                    }
                });

                tooltipper(songNames, playlist.media);
                tooltipper(songArtists, playlist.media);

                let downloading: boolean = this.downloading;
                async function downloadSong(song: Media, index: number, playlist: Playlist, songProgress: HTMLElement, songIndex: HTMLElement) {
                    return new Promise<void>((resolve, reject) => {
                        downloading = true;
                        mediaDownloading;
                        songProgress.style.display = "block";
                        songProgress.style.width = "0%";
                        songIndex.style.color = "#e55";

                        // Prepare collection metadata
                        const collection = {
                            title: playlist.title,
                            artist: removeAuthor ? "" : playlist.author,
                            coverImage: playlist.thumbnail,
                            release: year || "",
                            genre: genre || "",
                            type: playlist.type,
                            tracks: {
                                index: index + 1,
                                total: playlist.media.length
                            }
                        };

                        // Determine the individual song's artist
                        let songArtist = song.author;

                        if (collection.artist && songArtist.toLowerCase().includes(collection.artist.toLowerCase())) songArtist = collection.artist

                        const ws = new WebSocket(`${wsProtocol}//${apiHost}/audio`);

                        let finished = false;

                        const resetUI = () => {
                            downloading = false;
                            mediaDownloading;
                            songProgress.style.display = "none";
                            songProgress.style.width = "0%";
                            songIndex.innerText = String(index + 1);
                        };

                        const fail = (title: string, message: string) => {
                            if (finished) return;

                            finished = true;
                            ws.close();

                            resetUI();
                            songIndex.style.color = "lightgray";
                            showError(title, message);

                            reject(new Error(message));
                        };

                        ws.onopen = () => {
                            ws.send(JSON.stringify({
                                id: song.id,
                                sArtist: songArtist,
                                sTitle: song.title,
                                playlist: JSON.stringify(collection)
                            }));
                        };

                        ws.onmessage = event => {
                            const res = JSON.parse(event.data);

                            switch (res.status) {
                                case "preparing":
                                    songProgress.style.width = "0%";
                                    break;

                                case "writing": {
                                    const received = res.downloaded / 1024 / 1024;

                                    if (res.total) {
                                        const total = res.total / 1024 / 1024;
                                        const percent = res.progress;

                                        songProgress.style.width = `${percent}%`;
                                    }

                                    break;
                                }

                                case "encoding": {
                                    const percent = res.progress;
                                    songIndex.innerText = `${Math.floor(percent)}%`;

                                    break;
                                }

                                case "complete":
                                    songProgress.style.width = "100%";
                                    break;

                                case "path": {
                                    if (finished) break;

                                    finished = true;
                                    window.location.href = `${location.protocol}//${apiHost}${res.path}`;

                                    createNotification(`Audio ${index + 1} download started`, "Your audio is done processing", "success");
                                    ws.close();

                                    resetUI();
                                    resolve();
                                    break;
                                }

                                case "error": 
                                    fail("Failed to download song", res.message || "An unexpected error occurred.");
                                    break;
                            }
                        }

                        ws.onerror = error => {
                            console.error("Audio WebSocket error:", error);

                            fail("Connection error", "Could not connect to the audio download server.");
                        };

                        ws.onclose = () => {
                            if (!finished) {
                                fail("Connection lost", "The audio download connection was unexpectedly closed.");
                            }
                        };
                    });
                }

                async function downloadVideo(video: Media, vidProgBar: HTMLElement, vidProgress: HTMLElement, vidIndex: HTMLElement, vidProgTxt: HTMLElement): Promise<void> {
                    return new Promise<void>((resolve, reject) => {
                        try {
                            downloading = true;
                            mediaDownloading = true;
                            vidProgBar.style.display = "block";
                            vidIndex.style.color = "#e55";

                            const ws = new WebSocket(`${wsProtocol}//${apiHost}/video`);
                            let downloaded = false;

                            const qualityEl = document.querySelector("#vid-op select") as HTMLSelectElement;
                            const vQuality = qualityEl.value;

                            ws.onopen = () => {
                                ws.send(JSON.stringify({ id: video.id, vQuality }));
                            };

                            ws.onmessage = (event) => {
                                const res = JSON.parse(event.data);
                                
                                if (res.errorTitle && res.errorMessage) {
                                    showError(res.errorTitle, res.errorMessage);
                                    downloading = false;
                                    mediaDownloading = false;
                                    vidIndex.style.color = "lightgray";
                                    vidProgBar.style.display = "none";
                                    ws.close();
                                    reject(new Error(res.errorMessage || res.error));
                                    return;
                                }

                                if (res.status === "downloading") {
                                    const [downloaded, total] = [Math.round(res.downloaded || 0), Math.round(res.total)];
                                    vidProgress.style.backgroundColor = 'rgba(238, 55, 55, 0.4)';
                                    vidProgress.style.width = `${res.progress}%`;
                                    vidProgTxt.innerText = `${downloaded}mb / ${total}mb`;
                                }

                                if (res.status === "merging") {
                                    vidProgress.style.backgroundColor = 'rgba(238, 85, 85, 0.4)';
                                    vidProgress.style.width = `${Math.round(res.progress) || 0}%`;
                                    vidProgTxt.innerText = `Merging (${Math.round(res.progress)}%)`;
                                }

                                if (res.status === 'complete') {
                                    downloading = false;
                                    mediaDownloading = false;
                                    downloaded = true;

                                    window.location.href = `${location.protocol}//${apiHost}${res.path}`;

                                    setTimeout(() => {
                                        vidProgBar.style.display = "none";
                                        vidProgress.style.backgroundColor = 'rgba(238, 85, 85, 0.4)';
                                        vidProgTxt.innerText = "";
                                    }, 500);
                                    createNotification(`Video ${vidIndex.innerText} download started`, "Your video is done processing", "success");
                                    ws.close();
                                    resolve();
                                }
                            }

                            ws.onclose = () => {
                                if (!downloaded) {
                                    vidProgBar.style.display = "none";
                                    vidProgress.style.backgroundColor = 'rgba(238, 85, 85, 0.4)';
                                    vidProgTxt.innerText = "";
                                    reject(new Error("Video download interrupted"));
                                }
                            };
                        } catch (err) {
                            console.error("Video download failed:", err);
                            showError("Failed to download video", String(err));
                            mediaDownloading = false;
                            downloading = false;
                            vidIndex.style.color = "lightgray";
                            vidProgBar.style.display = "none";
                            vidProgTxt.innerText = "";
                        }
                    });
                }

                const downloadBtn = document.getElementById("download-all") as HTMLButtonElement;

                downloadBtn.onclick = async function downloadRecurringly() {
                    let format = pMediaCount.innerHTML.includes("Videos") ? "video" : "audio"
                    downloadBtn.disabled = true;
                    downloadBtn.style.filter = "brightness(80%)";

                    for (let i = 0; i < playlist.media.length; i++) {
                        const [song, songIndex, songProg] = [playlist.media[i], songIndexes[i], songProgress[i]];
                        const [vid, vidIndex, vidProgBar, vidProg, vidProgTxt] = [playlist.media[i], vidIndexes[i], vidProgBars[i], vidProgress[i], vidProgTxts[i]]
                        if (format === "audio") {
                            if (!song || !songIndex || !songProg)  {
                                showError("Failed to start download for song", "Song or elements missing");
                                return
                            }
                        
                            const nums = song.duration.split(":");
                            if (nums.length >= 3) {
                                console.warn("Audio is too long. Likely does not belong in collection. Skipping...");
                                continue
                            }

                            await downloadSong(song, i, playlist, songProg, songIndex)

                            songProg.style.width = "0";
                            songProg.style.display = "none";
                            songProg.style.color = "";
                        } else if (format === "video") {
                            if (!vid || !vidIndex || !vidProgBar || !vidProg || !vidProgTxt)  {
                                showError("Failed to start download for video", "Video or elements missing");
                                return
                            }

                            await downloadVideo(vid, vidProgBar, vidProg, vidIndex, vidProgTxt)
                        }

                        // small delay so browser breathes
                        await new Promise(res => setTimeout(res, 300));
                    }

                    mediaDownloading = false;
                    downloading = false;
                    downloadBtn.disabled = false;
                    downloadBtn.style.filter = "brightness(100%)";
                }
            } catch (error) {
                if (recents.collection.element && recents.collection.stored) recents.collection.element.style.display = "block"
                loaders[2].style.display = "none";
                playCon.style.display = "none";
                this.tries++;
                switch (this.tries) {
                    case 1: createNotification("Grabbing error", "Could not fetch playlist. Try again?", "error"); break;
                    case 2: createNotification("Grab error", "Maybe it's your internet?", "error"); break;
                    case 3: createNotification("Grab error", "There might be something wrong wit the server", "error"); break;
                    case 4: createNotification("Grabbing error", "Did you even try to reload?", "error"); break;
                    default: createNotification("Grabbing error", "Just try again later, man", "error"); break;
                }
                console.error("Error occured while fetching playlist:", error);
            }
        }
    }
}