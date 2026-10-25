import router from '../router.ts';
import search from '../sections/search.ts';
import grab from '../sections/grab.ts';

const searchI = document.getElementById("search-query") as HTMLInputElement;
const searchR = document.getElementById("search-r");
const grabR = document.getElementById("grab-r");

export const route = {
    home() {
        history.pushState({}, "", "/");
        router.route();
    },
    info() {
        history.pushState({}, "", "/info");
        router.route();
    },
    search() {
        const currentPath = new URL(window.location.href).pathname;
        if (currentPath === "/search" || !searchR || !grabR) return
        const routeString = searchI.value ? `/search?q=${encodeURIComponent(searchI.value)}` : "/search";
        history.pushState({}, "", routeString);
        router.route();
        if (searchI.value) search.fetch();
    }, grab() {
        if (!searchR || !grabR) return
        const param = new URL(window.location.href).searchParams.get("v") || new URL(window.location.href).searchParams.get("c");
        let type;
        if (param && new URL(window.location.href).searchParams.get("v")) type = "v"
        if (param && new URL(window.location.href).searchParams.get("c")) type = "c"
        if (!param) history.pushState({}, "", "/grab");
        router.route();
        if (param && type === "v") {
            grab.video.id = param;
            grab.video.fetch();
        } else if (param && type === "c") {
            grab.playlist.id = param;
            grab.playlist.fetch();
        }
    }
}

export default function sidebar() {
    if (searchR && grabR) {

        const routes: NodeListOf<HTMLElement> =  document.querySelectorAll(".route");
        const routers = Object.values(route);
        routes.forEach((route, index) => {
            const handler = routers[index];
            if (handler) route.onclick = handler
        });
    } else console.warn("Search/Link element(s) not found")
}
