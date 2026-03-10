import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const supabaseURL = "https://nflezpwzohwaqwsqswla.supabase.co";
const pKey = "sb_publishable_H1ZiP-Z0WKnCX5eU7hbt0g_rKaHG2pc";

export const supabase = createClient(supabaseURL, pKey);

// Trigger GitHub OAuth
export const loginWithGithub = async function() {
    const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
            redirectTo: window.location.origin + "/dashboard.html"
        }
    });

    if (error) console.error("Login error:", error.message);
}

// Logout user
export const logoutUser = async function() {
    await supabase.auth.signOut();
    window.location.href = "/";
}

// Return session data if logged in, else null
export const getSession = async function() {
    const { data } = await supabase.auth.getSession();
    return data.session || null;
}

// Return user if logged in, else null
export const getUser = async function() {
    const session = await getSession();
    if (session) {
        return session.user;
    }
    return null;
}
