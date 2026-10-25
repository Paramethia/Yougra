const errorOverlay = document.getElementById("error");
const closeError = document.getElementById("close-error");
const errorTitle = document.getElementById("err-title");
const errorMsg = document.getElementById("err-msg");

export default function error(eT: string, eM: string) {
    if (errorOverlay && closeError) { closeError.onclick = () => { errorOverlay.style.visibility = 'hidden' } } else console.warn("Error overlay and/or close error element not found")

    if (!errorOverlay || !errorTitle || !errorMsg) return
    errorOverlay.style.visibility = "visible";
    errorTitle.innerText = eT;
    errorMsg.innerText = eM;
}