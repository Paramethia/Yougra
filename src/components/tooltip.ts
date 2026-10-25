import type { SearchVideo, SearchPlaylist, Song } from '../types.ts';

const titleTooltip = document.getElementById("title-tp");

type TooltipI = SearchVideo | SearchPlaylist | Song;

export default function tooltipper(titleElements: NodeListOf<HTMLElement>, items: TooltipI[]) {
    titleElements.forEach((titleE: HTMLElement, index: number) => {
        const item = items[index];
        if (!titleE || !item || !titleTooltip) return
        titleE.addEventListener("mousemove", (e: MouseEvent) => {
            const tip = titleE.id === "s-author" ? item.author : item.title;
            titleTooltip.innerText = tip;
            titleTooltip.style.top = `${e.clientY - 35}px`;
            titleTooltip.style.left = `${e.clientX - 17}px`;
            titleTooltip.style.visibility = "visible";
        })
        titleE.addEventListener("mouseleave", () => titleTooltip.style.visibility = "hidden" )
    });
}