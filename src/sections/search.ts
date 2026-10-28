import { api } from '../home.ts';
import showError from '../overlays/error.ts';
import { route } from '../components/sidebar.ts';
import settings from '../overlays/settings.ts';
import tooltipper from '../components/tooltip.ts';
import type { SearchResponse, SearchVideo, SearchPlaylist} from '../types.ts';

const searchI = document.getElementById("search-query") as HTMLInputElement | null;
const loader = document.getElementById("search-loader");
const searchErr = document.getElementById("search-err-msg");
const searchResults = document.getElementById("search-results");
const vidsCon = document.getElementById("vids");
const pListsCon = document.getElementById("plists");

const vors = document.getElementById("v/s");
const pora = document.getElementById("p/a");
const vids = document.getElementById("vids");
const plists = document.getElementById("plists");

function validYouTubeURL(url: string) {
    return (
        /^https?:\/\/(www\.)?(youtube|music\.youtube)\.com\/(watch\?v=|shorts\/|live\/|playlist\?list=)/.test(url) ||
        /^https?:\/\/(www\.)?(youtube|music\.youtube)\.com\/watch\?.*&list=/.test(url) ||
        /^https?:\/\/youtu\.be\//.test(url)
    );
}

function extractContentId(url: string) {
    if (!validYouTubeURL(url)) return url
    
	const parsed = new URL(url);
    if (!parsed) return null

	// youtu.be/<id>
    if (parsed.hostname === "youtu.be") return parsed.pathname.slice(1) || null

    // youtube.com/watch?v=<id>
    if ((parsed.hostname === "youtube.com" || parsed.hostname === "www.youtube.com" || parsed.hostname === "music.youtube.com") && parsed.searchParams.has("v")) {
        return parsed.searchParams.get("v");
    }

    // youtube.com/shorts/<id> or youtube.com/live/<id>
    const match = parsed.pathname.match(/^\/(?:shorts|live)\/([^/]+)/);

    if (match?.[1]) {
        return match[1];
    }

    // Playlist ID
    return parsed.searchParams.get("list");
}

export default {
    init() {
        const searchQ = new URL(window.location.href).searchParams.get("q")
        if (searchQ && searchI) {
            searchI.value = searchQ;
            this.fetch();
        }

        if (vors && pora && vids && plists) {
            vors.onmouseover = () => { vors.style.backgroundColor = "rgba(150, 150, 150, 0.3)" }
            pora.onmouseover = () => { pora.style.backgroundColor = "rgba(150, 150, 150, 0.3)" }
            vors.onmouseout = () => { if (vids.style.display === "none") vors.style.backgroundColor = "rgba(150, 150, 150, 0.1)" }
            pora.onmouseout = () => { if (plists.style.display === "none") pora.style.backgroundColor = "rgba(150, 150, 150, 0.1)" }

            vors.onclick = () => { 
                if (vids.style.display === "none") {
                    vids.style.display = "flex";
                    vors.innerHTML = vors.innerHTML.replace("▽", "△");
                } else {
                    vids.style.display = "none";
                    vors.innerHTML = vors.innerHTML.replace("△", "▽");
                }
            }
            pora.onclick = () => { 
                if (plists.style.display === "none") { 
                    plists.style.display = "flex";
                    pora.innerHTML = pora.innerHTML.replace("▽", "△");
                } else { 
                    plists.style.display = "none";
                    pora.innerHTML = pora.innerHTML.replace("△", "▽");
                } 
            }
        }
    },
    tries: 0,
    async fetch() {
        if (!searchI || !loader || !searchErr || !vidsCon || !searchResults || !vors || !pora || !vids || !plists) {
            showError("Failed to render search results", "1 or more search element(s) missing")
            return;
        }
        const searchInput: string = searchI.value;

        if (!searchInput) {
            searchErr.innerText = "Type something!!";
            setTimeout(() => { searchErr.innerText = "" }, 3400 );
            return
        }

        if (searchInput.includes("https://") && !/youtube\.com|youtu\.be/.test(searchInput)) {
            searchErr.innerText = "Only YouTube links, pal";
            setTimeout(() => { searchErr.innerText = "" }, 4400 );
            return
        }

        if (validYouTubeURL(searchInput)) {
            //searchI.value = "";
            const type = searchInput.includes("playlist?list=") ? "c" : "v";
            history.pushState({}, "", `/grab?${type}=${extractContentId(searchInput)}`);
            route.grab();
            return
        }

        loader.style.display = "inline-flex";

        const response = await fetch(`https://${api.prod}/search`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ input: searchInput })
        }).catch((err) => {
            loader.style.display = "none";
            this.tries++;
            switch (this.tries) {
                case 1: searchErr.innerText = "Could not search. Try again?"; break;
                case 2: searchErr.innerText = "Maybe it's your internet?"; break;
                case 3: searchErr.innerText = "There might be something wrong going on with the app"; break;
                case 4: searchErr.innerText = "Did you even try to reload?"; break;
                default: searchErr.innerText = "Just try again later, man"; break;
            }
            setTimeout(() => { searchErr.innerText = "" }, this.tries === 3 ? 5000 : 4000);
            return
        });

        loader.style.display = "none";

        if (!response) throw new Error("No response recieved")
        const resData: SearchResponse = await response.json();
        if (resData.errorTitle && resData.errorMessage) showError(resData.errorTitle, resData.errorMessage);

        const videos: SearchVideo[] = resData.videos;
        const playlists: SearchPlaylist[] = resData.playlists;

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
                            <center><img src="${playlist.thumbnail}" ${playlist.type !== "Playlist"? 'style="width: 55%"' : ""}/></center>
                            <svg id="plist-icon" fill="rgba(235, 74, 74, 0.6)" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="28px" height="28px" viewBox="0 0 476.91 476.909" xml:space="preserve" stroke="#aaa"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <path d="M62.802,142.287h121.682c4.45,0,10.95-3.805,13.32-7.999l24.816-41.066H62.802C28.12,93.222,0,121.342,0,156.026v20.779 C13.266,156.086,36.425,142.287,62.802,142.287z"></path> <path d="M414.105,67.708H266.913c-8.681,0-19.151,6.125-23.399,13.685l-7.147,1228l-28.489,47.157 c-4.246,7.558-14.719,13.684-23.393,13.684H62.802C28.12,154.062,0,182.183,0,216.865v115.794v13.737 c0,34.685,28.12,62.805,62.802,62.805h351.303c34.685,0,62.805-28.12,62.805-62.805v-13.737V156.026v-25.515 C476.91,95.829,448.79,67.708,414.105,67.708z M208.372,335.332h163.952c4.34,0,7.851,3.515,7.851,7.851 c0,4.349-3.511,7.851-7.851,7.851H208.372c-4.332,0-7.851-3.502-7.851-7.851C200.521,338.847,204.04,335.332,208.372,335.332z M200.521,301.762c0-4.344,3.519-7.851,7.851-7.851h163.952c4.34,0,7.851,3.507,7.851,7.851c0,4.341-3.511,7.851-7.851,7.851 H208.372C204.04,309.612,200.521,306.103,200.521,301.762z M380.19,216.52c0,4.332-3.526,7.851-7.85,7.851H250.659 c-4.332,0-7.847-3.519-7.847-7.851c0-4.334,3.515-7.851,7.847-7.851H372.34C376.664,208.669,380.19,212.186,380.19,216.52z M372.34,252.491c4.323,0,7.85,3.502,7.85,7.85c0,4.341-3.526,7.852-7.85,7.852H208.372c-4.332,0-7.851-3.511-7.851-7.852 c0-4.348,3.519-7.85,7.851-7.85H372.34z M128.618,305.337c10.395-6.052,21.512-8.007,30.413-6.288v-67.912V208.82v-6.899h6.904 h10.047h35.53c3.817,0,6.899,3.092,6.899,6.899v15.409c0,3.815-3.09,6.901-6.899,6.901h-35.53v87.636h-0.088 c-0.571,10.552-8.752,22.466-21.919,30.132c-17.829,10.379-37.956,9.028-44.955-2.989 C102.017,333.878,110.791,315.716,128.618,305.337z"></path> </g> </g> </g></svg>
                        </div>
                        <h4 class="p-title">${playlist.title.length < 29 ? playlist.title : playlist.title.slice(0, 28).trimEnd() + "..."}</h4>
                        <h6>${playlist.type}</h6> <font color="#909090">|</font> <span id="items">${playlist.itemCount}</span>
                        <span class="p-share"><svg width="17" height="17" viewBox="0 0 48 48" fill="#aaa" xmlns="http://www.w3.org/2000/svg"><g id="Layer_2" data-name="Layer 2"><g id="invisible_box" data-name="invisible box"><rect width="48" height="48" fill="none"/></g><g id="Q3_icons" data-name="Q3 icons"><path d="M31.2,14.2,41,24.1l-9.8,9.8V26.8L27,27c-6.8.3-12,1-16.1,2.4,3.6-3.8,9.3-6.8,16.7-7.5l3.6-.3V14.2M28.3,6a1.2,1.2,0,0,0-1.1,1.3V17.9C12,19.4,2.2,29.8,2,40.3c0,.6.2,1,.6,1s.7-.3,1.1-1.1c2.4-5.4,7.8-8.5,23.5-9.2v9.7A1.2,1.2,0,0,0,28.3,42a.9.9,0,0,0,.8-.4L45.6,25.1a1.5,1.5,0,0,0,0-2L29.1,6.4a.9.9,0,0,0-.8-.4Z"/></g></g></svg></span>
                    </div>
                `;
            }).join("");
        }

        searchResults.style.display = "block";
        vors.innerHTML = vors.innerHTML.replace("△", "▽");  
        vors.style.backgroundColor = "rgba(150, 150, 150, 0.1)";

        if (!playlists.length) {
            [vors, pora].forEach(element => element.style.display = "none");
            vids.style.display = "flex";
            plists.style.display = "none";
        } else {
            [vors, pora].forEach(element => {
                element.style.display = "block";
                if (settings.allResults) {
                    if (element.id === "v/s" && vids.style.display === "none") element.click();
                    if (element.id === "p/a" && plists.style.display === "none") element.click();
                }
            });
            const [vCount, pCount] = [document.getElementById("v-count"), document.getElementById("p-count")]
            if (vCount) vCount.innerText = String(videos.length);
            if (pCount) pCount.innerText = String(playlists.length);
            if (!settings.allResults) vids.style.display = "none";
        }

        const vidCons: NodeListOf<HTMLElement> = document.querySelectorAll(".video");
        const plistCons: NodeListOf<HTMLElement> = document.querySelectorAll(".playlist");

        vidCons.forEach((vidCon, index) => {
            const video = videos[index];
            if (!video) return
            vidCon.onclick = (e) => {
                e.stopPropagation();
                history.pushState({}, "", `/grab?v=${video.id}`);
                route.grab();
            }
        });
        if (playlists.length && plistCons) {
            plistCons.forEach((plistCon, index) => { 
                const playlist = playlists[index];
                if (!playlist) return
                plistCon.onclick = (e) => {
                    e.stopPropagation();
                    history.pushState({}, "", `/grab?c=${playlist.id}`);
                    route.grab();
                }
            });
        }

        const vTitles: NodeListOf<HTMLElement> = document.querySelectorAll(".v-title");
        const pTitles: NodeListOf<HTMLElement> = document.querySelectorAll(".p-title");

        tooltipper(vTitles, videos);
        if (playlists.length) tooltipper(pTitles, playlists);

        const videoShares: NodeListOf<HTMLElement> = document.querySelectorAll(".v-share");
        const playlistShares: NodeListOf<HTMLElement> = document.querySelectorAll(".p-share");

        const urlSep = window.location.href.split("/");
        const domain = urlSep[2];

        videoShares.forEach((shareB, index) => {
           const video = videos[index];
            if (!video) return
            shareB.onclick = (e: MouseEvent) => {
                e.stopPropagation();
                shareB.style.animation = 'border-light-up 0.4s ease';
                setTimeout(() => { shareB.style.animation = 'none' }, 400 );
                navigator.clipboard.writeText(`${domain}/grab?v=${video.id}`);
            }
        });
        if (playlistShares) {
            playlistShares.forEach((shareB, index) => {
                const playlist = playlists[index];
                if (!playlist) return
                shareB.onclick = (e) => {
                    e.stopPropagation();
                    shareB.style.animation = 'border-light-up 0.4s ease';
                    setTimeout(() => { shareB.style.animation = 'none' }, 400 );
                    navigator.clipboard.writeText(`${domain}/grab?c=${playlist.id}`);
                }
            });
        }
    }
}