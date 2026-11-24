import type { SearchAuthor, SearchVideo, SearchPlaylist } from '../types.ts';

function addRecent(storageKey: string, item: string | {id: string}, maxItems: number): void {
    const raw = localStorage.getItem(storageKey);
    let recents; recents = raw ? JSON.parse(raw) : [];

    if (!Array.isArray(recents)) recents = [];

    if (typeof item === "object" && item.id !== undefined) {
        const existingIndex = recents.findIndex((entry) => entry.id === item.id);
        if (existingIndex !== -1) recents.splice(existingIndex, 1)
    } else if (typeof item === "string") {
        const existingIndex = recents.indexOf(item);
        if (existingIndex !== -1) recents.splice(existingIndex, 1)
    }

    while (recents.length >= maxItems) {
        recents.shift();
    }

    recents.push(item);
    localStorage.setItem(storageKey, JSON.stringify(recents));
}

export default {
    search: {
        element: document.getElementById("recent-searches"),
        stored: localStorage.getItem("recentSearches"),
        set(search: string) {
            addRecent("recentSearches", search, 5);
        }
    },
    author: {
        element: document.getElementById("recent-authors"),
        stored: localStorage.getItem("recentAuthors"),
        set(author: SearchAuthor) {
            addRecent("recentAuthors", author, 8);
        }
    },
    video: {
        element: document.getElementById("recent-videos"),
        stored: localStorage.getItem("recentVideos"),
        set(video: SearchVideo) {
            addRecent("recentVideos", video, 4);
        }
    },
    collection: {
        element: document.getElementById("recent-collections"),
        stored: localStorage.getItem("recentCollections"),
        set(collection: SearchPlaylist) {
            addRecent("recentCollections", collection, 4);
        }
    }
}