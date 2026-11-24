import recents from '../components/recents.ts';
import showError from '../overlays/error.ts';
import createNotification from '../components/notification.ts';
import tooltipper from '../components/tooltip.ts';
import { route } from '../components/sidebar.ts';
import type { AuthorResponse, SearchAuthor } from '../types.ts';

const domain = window.location.href.split("/")[2];
const apiHost = location.hostname === "localhost" ? "localhost:4480" : "api.yougra.site";

const nothing = document.getElementById("nothing");
const loader = document.getElementById("grab-author");
const authorCon = document.getElementById("author-con");
const aAvatar = document.getElementById("a-avatar") as HTMLImageElement;
const aTitle = document.getElementById("a-title");
const aHandle = document.getElementById("a-handle");
const aSubs = document.getElementById("a-subs");
const cTabs: NodeListOf<HTMLElement> = document.querySelectorAll(".tab");
const videosCon = document.querySelector("#author #videos") as HTMLElement;
const shortsCon = document.querySelector("#author #shorts") as HTMLElement;
const collectionsCon = document.querySelector("#author #collections") as HTMLElement;

export default {
    init() {
        const id = new URL(window.location.href).searchParams.get("id");
        if (id) {
            this.id = id;
            this.fetch();
        }

        if (recents.author.stored && recents.author.element) {
            if (nothing) nothing.style.display = "none";
            const recentAuthors: SearchAuthor[] = JSON.parse(recents.author.stored).reverse();
            if (!id) recents.author.element.style.display = "block";
            recents.author.element.innerHTML = `
                <h3>Recently grabbed authors</h3>
                <div style="display:flex">
                ${recentAuthors.map((author) => { 
                    return `
                    <div class="author">
                        <div style="min-width: 200px; min-height: 107px; border: 1px dashed #303030; border-radius: 5px; background: radial-gradient(#e55, #202020)">
                            <center><img src="${author.thumbnail || '/images/Author.svg'}" loading="lazy" /></center>
                        </div>
                        <h4 class="a-name" title="${author.name}"> ${author.name.length > 20 ? author.name.slice(0, 20).trimEnd() + "..." : author.name} </h4>
                        <h6> ${author.handle || 'YouTube channel'}</h6><font color="#909090"> |</font> <span id="subs">${author.subscribers.replace("cribers", "")}</span>

                        <span class="a-share">
                            <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" fill="#aaa">
                                <path d="M31.2,14.2,41,24.1l-9.8,9.8V26.8L27,27c-6.8.3-12,1-16.1,2.4,3.6-3.8,9.3-6.8,16.7-7.5l3.6-.3V14.2M28.3,6a1.2,1.2,0,0,0-1.1,1.3V17.9C12,19.4,2.2,29.8,2,40.3c0,.6.2,1,.6,1s.7-.3,1.1-1.1c2.4-5.4,7.8-8.5,23.5-9.2v9.7A1.2,1.2,0,0,0,28.3,42a.9.9,0,0,0,.8-.4L45.6,25.1a1.5,1.5,0,0,0,0-2L29.1,6.4a.9.9,0,0,0-.8-.4Z"/>
                            </svg>
                        </span>
                    </div>
                `}).join("")}
                </div>
            `;
            const authors: NodeListOf<HTMLElement> = document.querySelectorAll("#recent-authors .author");

            authors.forEach((author, index) => {
                author.onclick = () => {
                    history.pushState({}, "", `/author?id=${recentAuthors[index]?.id}`);
                    this.id = recentAuthors[index]!.id;
                    this.fetch();
                }
            })

            const authShares: NodeListOf<HTMLElement> = document.querySelectorAll("#recent-authors .a-share");

            authShares.forEach((shareB, index) => {
                const author = recentAuthors[index];
                if (!author) return
                shareB.onclick = (e: MouseEvent) => {
                    e.stopPropagation();
                    shareB.style.animation = 'border-light-up 0.4s ease';
                    setTimeout(() => { shareB.style.animation = 'none' }, 400 );
                    navigator.clipboard.writeText(`${domain}/author?id=${author.id}`);
                }
            });
        }

        const containers = [videosCon, shortsCon, collectionsCon];
        cTabs.forEach((tab, index) => {
            tab.onmouseover = () => { tab.style.backgroundColor = "rgba(175, 105, 105, 0.5)" }
            tab.onmouseout = () => { if (containers[index]?.style.display === "none") tab.style.backgroundColor = "rgba(150, 150, 150, 0.5)" }
            tab.onclick = () => {
                containers.forEach(container => container.style.display = "none");
                cTabs.forEach(tab => tab.style.backgroundColor = "rgba(150, 150, 150, 0.5)");
                tab.style.backgroundColor = "rgba(175, 105, 105, 0.5)";
                if (containers[index]) containers[index].style.display = "flex";
            }
        })
    },
    id: "",
    tries: 0,
    async fetch() {
        if (!this.id) {
            createNotification("Cannot grab author", "No author ID given from URL", "error");
            return;
        }

        if (!nothing || !loader || !authorCon || !aTitle || !aHandle || !aSubs || !videosCon) {
            showError("Failed to start fetching author", "Author rendering element(s) missing");
            return
        }
        
        if (recents.author.element) recents.author.element.style.display = "none";
        loader.style.display = "flex";
        authorCon.style.display = "none";

        try {
            const res = await fetch(`${location.protocol}//${apiHost}/author`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: this.id })
            })

            const author: AuthorResponse = await res.json();

            if (!res.ok && author.errorTitle && author.errorMessage) {
                if (recents.author.element && recents.author.stored) recents.author.element.style.display = "block";
                showError(author.errorTitle, author.errorMessage);
                return
            }

            recents.author.set({ 
                id: this.id, 
                name: author.title, 
                handle: author.handle, 
                thumbnail: author.avatar,
                subscribers: author.subscribers
            })

            nothing.style.display = "none";
            loader.style.display = "none";
            authorCon.style.display = "block";

            const avatarImg = new Image();
            avatarImg.src = author.avatar;

            avatarImg.onerror = () => {
                console.warn("Failed to load author image. Replacing with default...");
                aAvatar.src = "images/Author.svg";
            }

            aAvatar.src = avatarImg.src;
            aTitle.innerText = author.title.length > 17 && screen.width <= 450 ? author.title.slice(0, 17).trimEnd() + ".." : author.title
            aHandle.innerText = author.handle;
            aSubs.innerText = author.subscribers;

            const contents = [author.videos, author.shorts, author.collections]
            cTabs.forEach((tab, index) => {
                const contentType = !index ? 'Videos' : index === 1 ? 'Shorts' : index === 2 ? 'Collections' : '';
                if (contents[index]) tab.innerText = `${contents[index].length} ` + contentType;
                if (!contents[index]?.length) tab.style.display = 'none'
            });

            if (author.videos.length) {
                videosCon.innerHTML = author.videos.map(video => {
                    return `
                        <div class="video">
                            <div style="min-height: 150px; min-width: 200px; position: relative; border: 1px dashed #303030; border-radius: 5px; background: radial-gradient(#e55, #202020)">
                                <img src="${video.thumbnail}" loading="lazy" />
                                <span id="duration">${video.duration}</span>
                            </div>
                            <h4 class="v-title">${video.title.length < 29 ? video.title : video.title.slice(0, 28).trimEnd() + "..."}</h4>
                            <h6>${video.lastTime}</h6> <font color="#909090">|</font> <span id="views">${video.views}</span>
                            <span class="v-share"><svg width="17" height="17" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" fill="#aaa"><g id="Layer_2" data-name="Layer 2"><g id="invisible_box" data-name="invisible box"><rect width="48" height="48" fill="none"/></g><g id="Q3_icons" data-name="Q3 icons"><path d="M31.2,14.2,41,24.1l-9.8,9.8V26.8L27,27c-6.8.3-12,1-16.1,2.4,3.6-3.8,9.3-6.8,16.7-7.5l3.6-.3V14.2M28.3,6a1.2,1.2,0,0,0-1.1,1.3V17.9C12,19.4,2.2,29.8,2,40.3c0,.6.2,1,.6,1s.7-.3,1.1-1.1c2.4-5.4,7.8-8.5,23.5-9.2v9.7A1.2,1.2,0,0,0,28.3,42a.9.9,0,0,0,.8-.4L45.6,25.1a1.5,1.5,0,0,0,0-2L29.1,6.4a.9.9,0,0,0-.8-.4Z"/></g></g></svg></span>
                        </div>
                    `;
                }).join("");
                const vTitles: NodeListOf<HTMLElement> = document.querySelectorAll("#author .v-title");
                tooltipper(vTitles, author.videos);
                const videos: NodeListOf<HTMLElement> = document.querySelectorAll("#author .video");

                setContentRoute(videos, author.videos, "v");
            }
            if (author.shorts.length) {
                shortsCon.innerHTML = author.shorts.map(video => {
                    return `
                        <div class="short">
                            <div style="min-height: 150px; min-width: 200px; position: relative; border: 1px dashed #303030; border-radius: 5px; background: radial-gradient(#e55, #202020)">
                                <center><img src="${video.thumbnail}" loading="lazy" /></center>
                            </div>
                            <h4 class="v-title s-title">${video.title.length < 20 ? video.title : video.title.slice(0, 19).trimEnd() + "..."}</h4>
                            <h6>No date..</h6> <font color="#909090">|</font> <span id="views">${video.views}</span>
                            <span class="v-share"><svg width="17" height="17" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" fill="#aaa"><g id="Layer_2" data-name="Layer 2"><g id="invisible_box" data-name="invisible box"><rect width="48" height="48" fill="none"/></g><g id="Q3_icons" data-name="Q3 icons"><path d="M31.2,14.2,41,24.1l-9.8,9.8V26.8L27,27c-6.8.3-12,1-16.1,2.4,3.6-3.8,9.3-6.8,16.7-7.5l3.6-.3V14.2M28.3,6a1.2,1.2,0,0,0-1.1,1.3V17.9C12,19.4,2.2,29.8,2,40.3c0,.6.2,1,.6,1s.7-.3,1.1-1.1c2.4-5.4,7.8-8.5,23.5-9.2v9.7A1.2,1.2,0,0,0,28.3,42a.9.9,0,0,0,.8-.4L45.6,25.1a1.5,1.5,0,0,0,0-2L29.1,6.4a.9.9,0,0,0-.8-.4Z"/></g></g></svg></span>
                        </div>
                    `;
                }).join("");
                const sTitles: NodeListOf<HTMLElement> = document.querySelectorAll("#author .s-title");
                tooltipper(sTitles, author.shorts);

                const shorts: NodeListOf<HTMLElement> = document.querySelectorAll("#author .short");
                setContentRoute(shorts, author.shorts, "v");
            }
            if (author.collections.length) {
                collectionsCon.innerHTML = author.collections.map((playlist) => {
                    return `
                        <div class="playlist">
                            <div style="min-height: 150px; min-width: 200px; position: relative; border: 1px dashed #303030; border-radius: 5px; background: radial-gradient(#e55, #202020)">
                                <center><img src="${playlist.thumbnail}" loading="lazy" ${playlist.type === "album" ? 'style="width: 55%' : ""}"/></center>
                                <svg id="plist-icon" width="28px" height="28px" viewBox="0 0 24 24" fill="rgba(235, 74, 74, 0.6)" xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M2.25 6C2.25 5.58579 2.58579 5.25 3 5.25H21C21.4142 5.25 21.75 5.58579 21.75 6C21.75 6.41421 21.4142 6.75 21 6.75H3C2.58579 6.75 2.25 6.41421 2.25 6ZM2.25 10C2.25 9.58579 2.58579 9.25 3 9.25H21C21.4142 9.25 21.75 9.58579 21.75 10C21.75 10.4142 21.4142 10.75 21 10.75H3C2.58579 10.75 2.25 10.4142 2.25 10ZM2.25 14C2.25 13.5858 2.58579 13.25 3 13.25H11C11.4142 13.25 11.75 13.5858 11.75 14C11.75 14.4142 11.4142 14.75 11 14.75H3C2.58579 14.75 2.25 14.4142 2.25 14ZM2.25 18C2.25 17.5858 2.58579 17.25 3 17.25H11C11.4142 17.25 11.75 17.5858 11.75 18C11.75 18.4142 11.4142 18.75 11 18.75H3C2.58579 18.75 2.25 18.4142 2.25 18Z" fill="rgba(235, 74, 74, 0.6)"/>
                                    <path d="M18.875 14.1184C20.5288 15.0733 21.3558 15.5507 21.4772 16.2395C21.5076 16.4118 21.5076 16.5882 21.4772 16.7605C21.3558 17.4493 20.5288 17.9267 18.875 18.8816C17.2212 19.8364 16.3942 20.3138 15.737 20.0746C15.5725 20.0148 15.4199 19.9266 15.2858 19.8141C14.75 19.3645 14.75 18.4097 14.75 16.5C14.75 14.5903 14.75 13.6355 15.2858 13.1859C15.4199 13.0734 15.5725 12.9852 15.737 12.9254C16.3942 12.6862 17.2212 13.1636 18.875 14.1184Z" fill="rgba(235, 74, 74, 0.6)"/>
                                </svg>
                            </div>
                            <h4 class="p-title">${playlist.title.length < 29 ? playlist.title : playlist.title.slice(0, 28).trimEnd() + "..."}</h4>
                            <h6>${playlist.type}</h6> <font color="#909090">|</font> <span id="items">${playlist.itemCount}</span>
                            <span class="p-share"><svg width="17" height="17" viewBox="0 0 48 48" fill="#aaa" xmlns="http://www.w3.org/2000/svg"><g id="Layer_2" data-name="Layer 2"><g id="invisible_box" data-name="invisible box"><rect width="48" height="48" fill="none"/></g><g id="Q3_icons" data-name="Q3 icons"><path d="M31.2,14.2,41,24.1l-9.8,9.8V26.8L27,27c-6.8.3-12,1-16.1,2.4,3.6-3.8,9.3-6.8,16.7-7.5l3.6-.3V14.2M28.3,6a1.2,1.2,0,0,0-1.1,1.3V17.9C12,19.4,2.2,29.8,2,40.3c0,.6.2,1,.6,1s.7-.3,1.1-1.1c2.4-5.4,7.8-8.5,23.5-9.2v9.7A1.2,1.2,0,0,0,28.3,42a.9.9,0,0,0,.8-.4L45.6,25.1a1.5,1.5,0,0,0,0-2L29.1,6.4a.9.9,0,0,0-.8-.4Z"/></g></g></svg></span>
                        </div>
                    `;
                }).join("");
                const pTitles: NodeListOf<HTMLElement> = document.querySelectorAll("#author .p-title");
                tooltipper(pTitles, author.collections);

                const collections: NodeListOf<HTMLElement> = document.querySelectorAll("#author .playlist");
                setContentRoute(collections, author.collections, "c");
            }
            
            const vShares: NodeListOf<HTMLElement> = document.querySelectorAll("#author .v-share");
            const pShares: NodeListOf<HTMLElement> = document.querySelectorAll("#author .p-share");
            
            function setContentRoute(elements: NodeListOf<HTMLElement>, contents: {id:string}[], qp: string) {
                elements.forEach((element, index) => {
                    const content = contents[index];
                    if (!content) return 
                    element.onclick = (e) => {
                        e.stopPropagation();
                        history.pushState({}, "", `/grab?${qp}=${content?.id}`);
                        route.grab();
                    }
                });
            }

            if (vShares.length) {
                const videos = author.videos.length && author.shorts.length ? [...author.videos, ...author.shorts] : author.videos;
                vShares.forEach((shareB, index) => {
                    const video = videos[index];
                    if (!video) return
                    shareB.onclick = (e: MouseEvent) => {
                        e.stopPropagation();
                        shareB.style.animation = 'border-light-up 0.4s ease';
                        setTimeout(() => { shareB.style.animation = 'none' }, 400 );
                        navigator.clipboard.writeText(`${domain}/grab?v=${video.id}`);
                    }
                });
            }

            if (pShares) {
                pShares.forEach((shareB, index) => {
                    const playlist = author.collections[index];
                    if (!playlist) return
                    shareB.onclick = (e) => {
                        e.stopPropagation();
                        shareB.style.animation = 'border-light-up 0.4s ease';
                        setTimeout(() => { shareB.style.animation = 'none' }, 400 );
                        navigator.clipboard.writeText(`${domain}/grab?c=${playlist.id}`);
                    }
                });
            }
        } catch (err) {
            loader.style.display = "none";
            authorCon.style.display = "none";
            if (recents.author.element && recents.author.stored) recents.author.element.style.display = "block";
            this.tries++;
            switch (this.tries) {
                case 1: createNotification("Grabbing error", "Could not author page. Try again?", "error"); break;
                case 2: createNotification("Grab error", "Maybe it's your internet?", "error"); break;
                case 3: createNotification("Grab error", "There might be something wrong wit the server", "error"); break;
                case 4: createNotification("Grabbing error", "Did you even try to reload?", "error"); break;
                default: createNotification("Grabbing error", "Just try again later, man", "error"); break;
            }
            console.error("Error occured while fetching author: \n", err);
        }
    }
}