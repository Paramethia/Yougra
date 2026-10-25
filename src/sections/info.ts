const settingsShortcut = document.getElementById("s-shortcut") as HTMLButtonElement;
const settingsO = document.getElementById("settings-o");

export default function() {
    settingsShortcut.onclick = () => {
        if (settingsO) settingsO.click();
    }
}