// Search types

export interface SearchVideo {
    id: string,
    url: string,
    title: string,
    author: string,
    thumbnail: string,
    duration: string,
    views: string,
}

export interface SearchPlaylist {
    id: string,
    title: string,
    author: string,
    thumbnail: string,
    type: string,
    itemCount: number,
    url: string,
}

export interface SearchResponse {
    videos: SearchVideo[],
    playlists: SearchPlaylist[],
    errorTitle?: string,
    errorMessage?: string,
}

// Video types

export interface Formats {
    itag: number,
    qualityLabel: string,
    bitrate: string,
    mimeType: string,
    type: "videoonly" | "audioonly",
    size: number,
}

export interface Video {
    id: string,
    title: string,
    author: {
        id: string,
        name: string,
        url: string
    },
    thumbnail: string,
    lengthSeconds: number,
    views: number | string,
    likes: number | string,
    pDate: {
        exact: string,
        relative: string
    },
    song: boolean,
    formats: Formats[]
}

// Collection types

export interface Song {
    id: string,
    title: string,
    author: string,
    duration: string,
}

export interface Playlist {
    title: string,
    author: string,
    thumbnail: string,
    type: string,
    songs: Song[]
}

