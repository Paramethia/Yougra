import type { SearchAuthor, SearchVideo, SearchPlaylist } from '../types.ts';;

export default {
    search: {
        element: document.getElementById("recent-searches"),
        stored: localStorage.getItem("recentSearches"),
        set(search: string) {
            const recents = this.stored ? JSON.parse(this.stored) : []
            const existing = recents.indexOf(search);
            if (existing !== -1) recents.splice(existing, 1)
            if (recents.length >= 5) recents.shift()
            recents.push(search);
            localStorage.setItem("recentSearches", JSON.stringify(recents));
        }
    },
    author: {
        element: document.getElementById("recent-authors"),
        stored: localStorage.getItem("recentAuthors"),
        set(author: SearchAuthor) {
            const recents = this.stored ? JSON.parse(this.stored) : []
            const existing = recents.findIndex((a: {id: string}) => a.id === author.id);
            if (existing !== -1) recents.splice(existing, 1)
            if (recents.length >= 8) recents.shift()
            recents.push(author);
            localStorage.setItem("recentAuthors", JSON.stringify(recents));
        }
    },
    video: {
        element: document.getElementById("recent-videos"),
        stored: localStorage.getItem("recentVideos"),
        set(video: SearchVideo) {
            const recents = this.stored ? JSON.parse(this.stored) : []
            const existing = recents.findIndex((v: {id: string}) => v.id === video.id);
            if (existing !== -1) recents.splice(existing, 1)
            if (recents.length >= 4) recents.shift()
            recents.push(video);
            localStorage.setItem("recentVideos", JSON.stringify(recents));
        }
    },
    collection: {
        element: document.getElementById("recent-collections"),
        stored: localStorage.getItem("recentCollections"),
        set(collection: SearchPlaylist) {
            const recents = this.stored ? JSON.parse(this.stored) : []
            const existing = recents.findIndex((c: {id: string}) => c.id === collection.id);
            if (existing !== -1) recents.splice(existing, 1)
            if (recents.length >= 4) recents.shift()
            recents.push(collection);
            localStorage.setItem("recentCollections", JSON.stringify(recents));
        }
    }
}