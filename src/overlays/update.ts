const version = document.getElementById("version");
const update = document.getElementById("update");
const closeUpdate = document.getElementById("close-update");

const currentVersion:string = "Beta 2 - preview ⅠⅠ";
const savedVersion = localStorage.getItem("version");

export default function updateCheck() {
    if (version && savedVersion === currentVersion) version.style.animation = "none"

    if (version && update) {
        version.onclick = () => { 
            version.style.animation = 'shrink-slide-right 1s linear forwards';
            update.style.visibility = 'visible';
            document.body.style.overflow = 'hidden';
            localStorage.setItem("version", currentVersion);
        }
    } else console.warn("Version/Update element not found")

    if (closeUpdate && update) {
        closeUpdate.onclick = () => {
            update.style.visibility = 'hidden';
            document.body.style.overflow = 'auto';
        }
    } else console.warn("close update/update element not found")
}

