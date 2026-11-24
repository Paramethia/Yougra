const titleTooltip = document.getElementById("title-tp");

type Item = { title: string, author: string } | { title: string, author?: object }

export default function tooltipper(titleElements: NodeListOf<HTMLElement>, items: Item[]) {
    titleElements.forEach((titleE: HTMLElement, index: number) => {
        const item = items[index];
        if (!titleE || !item || !titleTooltip) return
        titleE.addEventListener("mousemove", (e: MouseEvent) => {
            const tip = titleE.id === "s-author" ? item.author : item.title;
            if (typeof tip !== "string") throw new Error("The tooltip item is not a string")
            titleTooltip.innerText = tip;
            titleTooltip.style.top = `${e.clientY - 35}px`;
            titleTooltip.style.left = `${e.clientX - 17}px`;
            titleTooltip.style.visibility = "visible";
        })
        titleE.addEventListener("mouseleave", () => titleTooltip.style.visibility = "hidden" )
    });
}