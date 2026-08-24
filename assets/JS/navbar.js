import { logoutUser } from "./script.js";

export function initNavbar() {
    const logoutBtn = document.querySelector("#navLogoutBtn");
    if (!logoutBtn) return;

    logoutBtn.addEventListener("click", async function () {
        try {
            await logoutUser();
        } catch (error) {
            console.error("Logout failed:", error);
        }
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initNavbar);
}
else {
    initNavbar();
}
