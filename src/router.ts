import error from './overlays/error.ts';

const routes: NodeListOf<HTMLElement> =  document.querySelectorAll(".route");

export default {
    sections: {
        home: document.getElementById("home"),
        info: document.getElementById("info"),
        search: document.getElementById("search"),
        grab: document.getElementById("grab"),
    },
    route() {
        const path = new URL(window.location.href).pathname;

        const homeR = document.getElementById("home-r");
        const infoR = document.getElementById("info-r");
        const searchR = document.getElementById("search-r");
        const grabR = document.getElementById("grab-r");

        if (!homeR || !infoR || !searchR || !grabR) {
            error("Failed to render route", "Sidebar navigation element(s) not found");
            return
        }
        // Reset all sidebar navigations
        routes.forEach(route => route.style.backgroundColor = "transparent")
        if (!this.sections.home || !this.sections.info || !this.sections.search || !this.sections.grab) {
            error("Failed to render section", "Section element(s) not found");
            return
        }
        // Hide all sections
        Object.values(this.sections).forEach(section => { if (section) section.style.display = "none"})

        switch (path) {
            case "/info": 
                infoR.style.backgroundColor = "rgba(238, 119, 119, 0.2)";
                this.sections.info.style.display = "block";
            break;
            case "/search":
                searchR.style.backgroundColor = "rgba(238, 119, 119, 0.2)";
                this.sections.search.style.display = "block";
            break;
            case "/grab":
                grabR.style.backgroundColor = "rgba(238, 119, 119, 0.2)";
                this.sections.grab.style.display = "block";
            break;
            case "/":
                homeR.style.backgroundColor = "rgba(238, 119, 119, 0.2)";
                this.sections.home.style.display = "block";
            break;
            default:
                this.sections.home.style.display = "block";
            break;
        }
    },
    listen() { window.addEventListener("popstate", this.route.bind(this)); }
} 