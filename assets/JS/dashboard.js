import { getSession, logoutUser } from "./script.js";

window.addEventListener("load", async function() {
    const session = await getSession();

    if (!session) {
        // Not logged in → go to signin
        window.location.href = "/signin.html";
        return;
    }

    console.log("Logged in as:", session.user.email);

    // Access token
    const accessToken = session.access_token;
    console.log("Access Token:", accessToken);

    // You can now use accessToken to call Supabase APIs or your backend
});

document.querySelector("#logoutBtn").addEventListener("click", function() {
    logoutUser();
});
