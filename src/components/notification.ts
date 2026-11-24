const maxNotis = 4;

export default function createNotification(title: string, message: string, type: string) {
    const container = document.getElementById("notification-container");

    const notification = document.createElement("div");

    if (!container) {
        console.warn("Cannot find notification container.");
        return;
    }

    // Remove oldest notification if limit is reached
    while (container.children.length >= maxNotis) {
        const oldestNotification = container.lastElementChild as HTMLElement;

        oldestNotification.remove();
    }

    notification.className = `yougra-notification ${type}`;
    notification.style.animation = `slide-in-up 0.5s ease-out forwards${type === "success" ? ", glow-pulse 1.2s ease-in-out 0.5s 1" : ""}`;

    const icon = type === "success" ? "check" : type === "warn" ? "triangle-exclamation" : type === "error" ? "exclamation" : type;

    notification.innerHTML = `
        <div class="notification-header">
            <div class="notification-icon">
                <i class="fa-solid fa-type fa-${icon}"></i>
            </div>

            <span class="notification-title">
                ${title}
            </span>

            <button class="notification-close">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>

        <div class="notification-body">
            ${message}
        </div>
    `;

    const notificationCloseButtons = notification.querySelector(".notification-close")

    if (!container || !notificationCloseButtons) {
        console.warn("Cannot find elements for notifications.");
        return
    }

    let removing = false;

    function removeNotification() {
        if (removing) return;
        removing = true;
        notification.style.animation = "disappear 1s ease forwards";
        setTimeout(() => notification.remove(), 1000)
    }

    // Close button
    notificationCloseButtons.addEventListener("click", () => {
        removeNotification();
    });

    // Add notification to container
    container.prepend(notification);

    // Automatically remove after 5 seconds
    setTimeout(() => {
        removeNotification();
    }, 5000);
}