import { getUser, loginWithGithub } from "./script.js";

document.addEventListener("DOMContentLoaded", async function () {
    // 1. Check if user is already logged in
    try {
        const user = await getUser();
        if (user) {
            window.location.href = "/dashboard.html";
            return;
        }
    }
    catch (error) {
        console.error("Session check failed:", error);
    }

    const githubBtn = document.querySelector("#githubSignIn");
    githubBtn.addEventListener("click", async function (e) {
        e.preventDefault(); // Prevent default link/button behavior
        githubBtn.innerHTML = `<span class="loader is-loading" style="height: 20px; width: 20px;"></span><span>Logging in, Please wait</span>`;
        githubBtn.disabled = true;

        try {
            await loginWithGithub();
        }
        catch (error) {
            console.error("OAuth Initialization failed:", error);
            alert("Could not connect to GitHub. Please try again.");
            githubBtn.innerHTML = "<i class='ri-github-fill'></i><span>Continue with GitHub</span>";
            githubBtn.disabled = false;
        }
    });
});
