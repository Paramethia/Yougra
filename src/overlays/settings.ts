const settingsO = document.getElementById("settings-o");
const settingsOverlay = document.getElementById("settings");
const closeSettings = document.getElementById("close-settings");
const sets: NodeListOf<HTMLElement> = document.querySelectorAll(".sets");
const immediate = document.getElementById("immediate");
const process = document.getElementById("process");

export default {
    method: localStorage.getItem("method") || "process",
    init() { 
        if (settingsOverlay && settingsO && closeSettings) {
            settingsO.onmouseover = () => { settingsO.style.color = '#e55' }
            settingsO.onmouseout = () => { if (settingsOverlay.style.visibility === 'hidden') settingsO.style.color = 'lightgray' }

            function closeSet() {
                if (!settingsOverlay || !settingsO) return
                settingsOverlay.style.visibility = 'hidden';
                settingsO.style.color = 'white';
                document.body.style.overflow = 'auto';
            }

            settingsO.onclick = () => {
                if (settingsOverlay.style.visibility === 'hidden') {
                    settingsOverlay.style.visibility = 'visible';
                    document.body.style.overflow = 'hidden';
                } else {
                    closeSet()
                }
            }

            closeSettings.onclick = () => { 
                settingsOverlay.style.visibility = 'hidden';
                closeSet()
            }
        } else console.warn("Settings/settings nav element not found")

        const containersOpened = [false, false];

        sets.forEach((con, index) => {
            con.onmouseover = () => {
                con.style.background = 'rgba(238, 119, 119, 0.1)';
            }
            con.onmouseout = () => {
                if (!containersOpened[index]) con.style.background = 'none';
            }
            con.onclick = () => {
                containersOpened[index] = !containersOpened[index];

                sets.forEach((conAgain, i) => {
                    if (i !== index && containersOpened[i]) {
                        containersOpened[i] = false;
                        conAgain.style.animation = 'minimise 1.2s ease forwards';
                        conAgain.style.background = 'none';
                        conAgain.style.overflow = 'hidden';
                        conAgain.scrollTop = 0;
                    }
                });

                if (containersOpened[index]) {
                    con.style.animation = 'expand 1.2s ease forwards';
                    con.style.overflow = 'auto';
                } else {
                    con.style.animation = 'minimise 1.2s ease forwards';
                    con.style.overflow = 'hidden';
                    con.scrollTop = 0;
                } 
            } 
        });

        if (immediate && this.method === "immediate") immediate.style.backgroundColor = 'rgba(170, 170, 170, 0.2)';
        if (process && this.method === "process") process.style.backgroundColor = 'rgba(170, 170, 170, 0.2)';

        if (immediate && process) {
            immediate.onmouseover = () => { if (immediate.style.background !== 'rgba(170, 170, 170, 0.2)') immediate.style.backgroundColor = 'rgba(170, 170, 170, 0.2)' }
            immediate.onmouseout = () => { if (this.method === "process") immediate.style.backgroundColor = '' }
            immediate.onclick = () => { 
                if (this.method === "process") {
                    process.style.backgroundColor = "";
                    this.method = "immediate";
                    localStorage.setItem("method", this.method);
                }
            }

            process.onmouseover = () => { if (process.style.background !== 'rgba(170, 170, 170, 0.2)') process.style.backgroundColor = 'rgba(170, 170, 170, 0.2)' }
            process.onmouseout = () => { if (this.method === "immediate") process.style.backgroundColor = '' }
            process.onclick = () => { 
                if (this.method === "immediate") {
                    immediate.style.backgroundColor = "";
                    this.method = "process";
                    localStorage.setItem("method", this.method);
                }
            }
        } else console.warn("Immediate/Process element not found")
    }
}