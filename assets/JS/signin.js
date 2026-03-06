import { getUser, loginWithGithub } from "./script.js";

window.addEventListener("load", async function() {
    const user = await getUser();

    if (user) {
        // Already logged in → go to dashboard
        window.location.href = "/dashboard.html";
    }
});

document.querySelector("#githubSignIn").addEventListener("click", function() {
    loginWithGithub();
});
