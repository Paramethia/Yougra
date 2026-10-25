import router from '../router.ts';
import search from '../sections/search.ts';

const navTog = document.getElementById("nav-tog");
const logo = document.getElementById("logo");
const headSearch = document.getElementById("head-search");
const searchI = document.getElementById("search-query") as HTMLInputElement;
const searchB = document.getElementById("search-b");
const searchIcon = document.querySelector("#search-b > i") as HTMLElement;

const sidebar = document.getElementById("sidebar");

export default function topbar () {
    if (navTog && logo && headSearch && searchB && searchIcon && sidebar) {
        if (screen.width > 700) sidebar.style.display = "inline-block";
        navTog.onclick = () => {
            if (sidebar.style.display === "none") {
                sidebar.style.display = "inline-block"
                navTog.style.backgroundColor = 'rgba(238, 85, 85, 0.5)';
            } else {
                sidebar.style.display = "none"
                navTog.style.backgroundColor = 'transparent';
            }
        }
        logo.onclick = () => { 
            logo.style.animation = 'y-shake 0.4s linear';
            setTimeout(() => { logo.style.animation = '' }, 500 );
            history.pushState({}, "", "/");
            router.route();
        }
        searchB.onclick = () => {
            if (searchI.style.display !== "inline") {
                logo.style.display = "none";
                headSearch.style.width = "80%";
                searchI.style.display = "inline";
                searchB.style.width = "41px";
                searchB.style.height = "41px";
                searchB.style.top = "0";
                searchB.style.padding = "0";
                searchB.style.borderTopLeftRadius = "0";
                searchB.style.borderBottomLeftRadius = "0";
                searchIcon.style.marginTop = "11px";
                return
            }
            const currentPath = new URL(window.location.href).pathname;
            if (currentPath !== "/search") {
                history.pushState({}, "", "/search");
                router.route();
            }
            if (searchI.value) search.fetch()
        }
    } else console.warn("Top bar element(s) missing")
}
