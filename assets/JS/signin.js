import { loginWithGithub } from "./script.js";

document.querySelector("#githubSignIn").addEventListener("click", function () {
    loginWithGithub();
});
