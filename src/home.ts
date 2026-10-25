import router from './router.ts';
import topbar from './components/topbar.ts';
import sidebar from './components/sidebar.ts';
import updateCheck from './overlays/update.ts';
import info from './sections/info.ts';
import settings from './overlays/settings.ts';
import search from './sections/search.ts';
import grab from './sections/grab.ts';

topbar();
sidebar();
updateCheck();
info();
settings.init();
search.init();
grab.init();
router.listen();
router.route();

// APIs
export const api = { prod: "api.yougra.site", test: "yougra-server.onrender.com"};

// Ping render sever on page load to wake it
window.addEventListener("load", () => {
    setTimeout(() => {
        fetch(`https://${api.test}/ping`).then(() => console.log("Server warmed up")).catch(() => console.warn("Could not reach server (might still be waking up)"));
    }, 1500);
});

const searchI = document.getElementById("search-query") as HTMLInputElement;
const startB = document.getElementById("start") as HTMLButtonElement;

const smallerScreen = screen.width <= 700;
if (!smallerScreen) searchI.style.display = "inline";
const searchB = document.getElementById("search-b");

startB.onclick = () => {
    if (!searchI) return
    if (searchI.style.display === "inline" && !searchI.style.animation.includes("x-shake")) {
        searchI.style.animation = 'x-shake 0.5s linear 4';
        setTimeout(() => { searchI.style.animation = 'none' }, 2400);
    } else { if (searchB) searchB.click() }
}

// === Text switch UI code ===

const switchTexts: NodeListOf<HTMLElement> = document.querySelectorAll(".switch");
const placeholders: [string, string] = ["Enter video/song title or author name", "Enter playlist/album title or artist name"];

setInterval(() => {
    if (!(searchI instanceof HTMLInputElement) || !switchTexts[0] || !switchTexts[1]) return
    switchTexts[0].innerText === "song or video" ? switchTexts[0].innerText = "playlist or album" : switchTexts[0].innerText = "song or video"
    switchTexts[1].innerText === "playlist" ? switchTexts[1].innerText = "album" : switchTexts[1].innerText = "playlist"
    switchTexts.forEach(switchText => switchText.style.animation = "appear 0.5s linear");
    searchI.placeholder === placeholders[0] ? searchI.placeholder = placeholders[1] : searchI.placeholder = placeholders[0]
    setTimeout(() => { switchTexts.forEach(switchText => switchText.style.animation = "") }, 1000 )
}, 10000 );

// Search key listener

function searchKey(event: KeyboardEvent) { 
    const currentPath = new URL(window.location.href).pathname;
    if (event.key === "Enter") {
        if (!searchI || !searchI.value) return
        console.log("searching...");
        if (currentPath !== "/search") {
            history.pushState({}, "", "/search");
            router.route();
        }
        search.fetch();
    }
}
window.addEventListener("keydown", searchKey);