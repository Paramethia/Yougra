// Search types

export interface SearchAuthor {
    id: string,
    name: string,
    handle: string,
    thumbnail: string,
    subscribers: string,
}

export interface SearchVideo {
    id: string,
    title: string,
    author: {
        id: string,
        name: string,
        handle: string
    },
    thumbnail: string,
    duration: string,
    views?: string
}

export interface SearchPlaylist {
    id: string,
    title: string,
    thumbnail: string,
    type: string,
    itemCount: string,
}

export interface SearchResponse {
    authors: SearchAuthor[],
    videos: SearchVideo[],
    playlists: SearchPlaylist[],
    errorTitle?: string,
    errorMessage?: string,
}

// Author types 

export interface AuthorVideo {
    id: string,
    thumbnail: string,
    title: string,
    duration: string,
    views: string,
    lastTime: string
}

export interface AuthorShort {
    id: string,
    thumbnail: string,
    title: string,
    views: string
}

export interface AuthorCollection {
    id: string,
    thumbnail: string,
    title: string,
    type: string,
    itemCount: string
}

export interface AuthorResponse {
    avatar: string,
    banner: string,
    title: string,
    handle: string,
    subscribers: string,
    videos: AuthorVideo[],
    shorts: AuthorShort[],
    collections: AuthorCollection[],
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
        handle: string,
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

export interface Media {
    id: string,
    thumbnail: string,
    title: string,
    author: string,
    duration: string,
}

export interface Playlist {
    title: string,
    author: string,
    thumbnail: string,
    type: string,
    media: Media[]
}