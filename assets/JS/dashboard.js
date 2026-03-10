import { getSession, logoutUser } from "./script.js";

// ==========================================
// 1. DASHBOARD INITIALIZATION
// ==========================================
const mainContainer = document.querySelector("main .container");

mainContainer.innerHTML = `
    <div class="dashboard-header">
        <h1>Secrets Vault</h1>
        <button class="addserv">+ Add Key</button>
    </div>
    <div class="keys-table">
        <div class="table-head">
            <div class="col-service">Service</div>
            <div class="col-hint">Identifier</div>
            <div class="col-actions">Actions</div>
        </div>
        <div id="keysBody">
            <div id="statusMessage" style="padding: 2rem; text-align: center; color: var(--text-dim);">Scanning vault...</div>
        </div>
    </div>
`;

const keysBody = document.querySelector("#keysBody");

// ==========================================
// 2. RENDER LOGIC
// ==========================================
function renderKeyRow(keyData) {
    const row = document.createElement("div");
    row.classList.add("key-row");

    // key_id used here for targeted actions
    row.setAttribute("data-target", keyData.key_id);

    row.innerHTML = `
        <div class="col-service">
            <span class="service-main">${keyData.service_name}</span>
            <span class="service-sub">${keyData.key_name}</span>
        </div>
        <div class="col-hint">•••• ${keyData.key_hint}</div>
        <div class="col-actions">
            <button class="action-btn copy-btn">Copy</button>
            <button class="action-btn update-btn">Edit</button>
            <button class="action-btn delete-btn">Delete</button>
        </div>
    `;

    // Copy Action
    row.querySelector(".copy-btn").addEventListener("click", function() {
        const id = row.getAttribute("data-target");
        console.log("Requesting plain-text for key_id:", id);
        alert("Copying " + keyData.service_name + "...");
    });

    // Delete Action
    row.querySelector(".delete-btn").addEventListener("click", function() {
        const id = row.getAttribute("data-target");
        if(confirm("Permanently delete " + keyData.service_name + "?")) {
            console.log("Deleting key_id:", id);
            row.remove();
        }
    });

    keysBody.prepend(row);
}

// ==========================================
// 3. LOAD FUNCTION (Fetches all data)
// ==========================================
async function fetchAllKeys() {
    const session = await getSession();
    if (!session) return;

    try {
        const response = await fetch("http://127.0.0.1:8787/api/list-keys", {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + session.access_token
            }
        });

        const result = await response.json();

        if (response.status === 200) {
            keysBody.innerHTML = ""; // Clear loader
            for (let i = 0; i < result.data.length; i++) {
                renderKeyRow(result.data[i]);
            }
        } else if (response.status === 404) {
            // Your backend throws 404 when data.length === 0
            keysBody.innerHTML = `<div style="padding: 2rem; text-align: center; color: var(--text-dim);">Your vault is currently empty.</div>`;
        } else {
            keysBody.innerHTML = `<div style="padding: 2rem; text-align: center; color: #ef4444;">Error: ${result.message}</div>`;
        }
    } catch (error) {
        console.error("Fetch error:", error);
        keysBody.innerHTML = `<div style="padding: 2rem; text-align: center; color: #ef4444;">Could not connect to backend.</div>`;
    }
}

// ==========================================
// 4. CORE EVENTS
// ==========================================
window.addEventListener("load", async function() {
    const session = await getSession();
    if (!session) {
        window.location.href = "/login.html";
        return;
    }

    const emailSpan = document.querySelector("#userEmail");
    if (emailSpan) emailSpan.textContent = session.user.email;

    // Execute the load function
    fetchAllKeys();
});

document.querySelector("#logoutBtn").addEventListener("click", function() {
    logoutUser();
});

// ==========================================
// 5. MODAL LOGIC
// ==========================================
const modal = document.createElement("div");
modal.classList.add("modal");
modal.style.display = "none";
modal.innerHTML = `
    <div class="modal-content">
        <h2 style="margin-bottom:1.5rem">New API Key</h2>
        <input type="text" id="serviceName" placeholder="Service (e.g. OpenAI)" />
        <input type="text" id="apiKeyName" placeholder="Label (e.g. Main Dev)" />
        <input type="password" id="apiKeyValue" placeholder="Secret Key Value" />
        <div class="modal-btns">
            <button id="closeModal" style="background:transparent; border:1px solid var(--border); color:var(--text-dim)">Cancel</button>
            <button id="submitApiKey" style="background:var(--accent); color:white; border:none">Save Secret</button>
        </div>
    </div>
`;
document.body.appendChild(modal);

document.querySelector(".addserv").addEventListener("click", function() { modal.style.display = "flex"; });
document.querySelector("#closeModal").addEventListener("click", function() { modal.style.display = "none"; });

document.querySelector("#submitApiKey").addEventListener("click", async function() {
    const serviceName = document.querySelector("#serviceName").value.trim();
    const apiKeyName = document.querySelector("#apiKeyName").value.trim();
    const apiKeyValue = document.querySelector("#apiKeyValue").value.trim();

    if (!serviceName || !apiKeyValue) return alert("Missing fields");

    const session = await getSession();
    try {
        const response = await fetch("http://127.0.0.1:8787/api/add-key", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + session.access_token
            },
            body: JSON.stringify({ serviceName, apiKeyName, apiKeyValue })
        });

        if (response.ok) {
            const result = await response.json();
            // Remove "Vault empty" message if it exists
            if (keysBody.querySelector('div[style*="text-align: center"]')) {
                keysBody.innerHTML = "";
            }
            renderKeyRow(result.data);
            modal.style.display = "none";
            document.querySelector("#serviceName").value = "";
            document.querySelector("#apiKeyName").value = "";
            document.querySelector("#apiKeyValue").value = "";
        }
    } catch (err) {
        alert("Save failed.");
    }
});
