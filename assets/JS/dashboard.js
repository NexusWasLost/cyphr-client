import { checkSession, logoutUser } from "./script.js";
// Run immediately on page load
checkSession().then(function (user) {
    if (user) {
        console.log("Logged in as:", user.email);
        // You can also display the email in your navbar here
    }
});

document.querySelector("#logoutBtn").addEventListener("click", function(){
    logoutUser();
});
