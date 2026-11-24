import error from './overlays/error.ts';

const routes: NodeListOf<HTMLElement> =  document.querySelectorAll(".route");

interface SEOData {
    title: string;
    description: string;
    url: string;
}

function updateSEO({ title, description, url }: SEOData): void {
    document.title = title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", description);
    document.querySelector('link[rel="canonical"]')?.setAttribute("href", url);
}

const seoData: Record<string, Omit<SEOData, "url">> = {
    "/": {
        title: "Yougra - YouTube Media Grabber",
        description: "Download YouTube videos, music, playlists and albums for free with Yougra. Choose your preferred video quality or download audio in MP3 or M4A formats along with optional metadata. Straight to your device."
    },
    "/info": {
        title: "Yougra - Info",
        description: "Learn more about Yougra, its features, supported formats and how to download YouTube content."
    },
    "/search": {
        title: "YouTube - Search YouTube",
        description: "Search YouTube for videos, music, playlists and other content using Yougra."
    },
    "/author": {
        title: "Yougra - YouTube Authors",
        description: "Explore YouTube authors and browse their videos, shorts and playlists with Yougra."
    },
    "/grab": {
        title: "Yougra - Download YouTube Content",
        description: "Download YouTube videos and audio with your preferred format and quality using Yougra."
    }
};

export default {
    sections: {
        home: document.getElementById("home"),
        info: document.getElementById("info"),
        search: document.getElementById("search"),
        author: document.getElementById("author"),
        grab: document.getElementById("grab"),
    },
    route() {
        let path = new URL(window.location.href).pathname;

        const homeR = document.getElementById("home-r");
        const infoR = document.getElementById("info-r");
        const searchR = document.getElementById("search-r");
        const authorR = document.getElementById("author-r");
        const grabR = document.getElementById("grab-r");

        if (!homeR || !infoR || !searchR || !authorR || !grabR) {
            error("Failed to render route", "Sidebar navigation element(s) not found");
            return
        }
        // Reset all sidebar navigations
        routes.forEach(route => route.style.backgroundColor = "transparent")
        if (!this.sections.home || !this.sections.info || !this.sections.search || !this.sections.author || !this.sections.grab) {
            error("Failed to render section", "Section element(s) not found");
            return
        }
        // Hide all sections
        Object.values(this.sections).forEach(section => { if (section) section.style.display = "none"})

        // Handle unknown routes
        if (!seoData[path]) {
            history.pushState({}, "", "/");
            path = "/";
        }

        // Get SEO data for the current route
        const currentSEO = seoData[path];

        if (!currentSEO) {
            error("Failed to update SEO", "SEO data not found for route");
            return;
        }

        // Update SEO metadata
        updateSEO({
            ...currentSEO,
            url: new URL(path, window.location.origin).href
        });

        switch (path) {
            case "/info": 
                infoR.style.backgroundColor = "rgba(238, 119, 119, 0.2)";
                this.sections.info.style.display = "block";
            break;
            case "/search":
                searchR.style.backgroundColor = "rgba(238, 119, 119, 0.2)";
                this.sections.search.style.display = "block";
            break;
            case "/author": 
                authorR.style.backgroundColor = "rgba(238, 119, 119, 0.2)";
                this.sections.author.style.display = "block";
            break;
            case "/grab":
                grabR.style.backgroundColor = "rgba(238, 119, 119, 0.2)";
                this.sections.grab.style.display = "block";
            break;
            case "/":
                homeR.style.backgroundColor = "rgba(238, 119, 119, 0.2)";
                this.sections.home.style.display = "block";
            break;
        }
    },
    listen() { window.addEventListener("popstate", this.route.bind(this)); }
} 