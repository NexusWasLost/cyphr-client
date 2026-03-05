import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const supabaseURL = "https://nflezpwzohwaqwsqswla.supabase.co";
const pKey = "sb_publishable_H1ZiP-Z0WKnCX5eU7hbt0g_rKaHG2pc";

const supabase = createClient(supabaseURL, pKey);

export const loginWithGithub = function(){
    supabase.auth.signInWithOAuth({
        provider: "github",
        options:{
            redirectTo: window.location.origin + "/dashboard.html"
        }
    });
}

export const logoutUser = async function(){
    await supabase.auth.signOut();
    window.location.href = "/";
}

export const checkSession = async function(){
    const { data } = await supabase.auth.getUser();

    if(!data.user){
        window.location.href = "signin.html";
    }

    //returned inside a promise
    return data.user;
}
