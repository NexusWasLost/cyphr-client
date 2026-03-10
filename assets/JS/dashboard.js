import { getSession, logoutUser } from "./script.js";

document.addEventListener("DOMContentLoaded", async function () {
    const session = await getSession();

    // 1. Session Guard
    if (!session) {
        window.location.href = "/login.html";
        return;
    }

    const token = session.access_token;

    // --- Selectors ---
    const addKeyModal = document.querySelector("#addKeyModal");
    const openModalBtn = document.querySelector("#openAddModal");
    const logoutBtn = document.querySelector(".navbar-end .button.is-dark");
    const saveKeyBtn = document.querySelector("#saveKeyBtn");
    const keysTableBody = document.querySelector("#keysTableBody");

    const closeModalElements = document.querySelectorAll("#addKeyModal .modal-background, #addKeyModal .delete, #addKeyModal .modal-card-foot .is-light");

    // --- Helper: Create Row Element ---
    // Generates the <tr> structure for a single key entry
    function createKeyRow(data) {
        const row = document.createElement("tr");
        row.setAttribute("data-id", data.key_id);

        row.innerHTML = `
            <td class="is-vcentered">${data.service_name}</td>
            <td class="is-vcentered"><code>...${data.key_hint}</code></td>
            <td class="has-text-right">
                <div class="buttons is-right">
                    <button class="button is-small btn-copy">Copy</button>
                    <button class="button is-small btn-edit">Edit</button>
                    <button class="button is-small btn-delete">Delete</button>
                </div>
            </td>
        `;
        return row;
    }

    // --- Helper: Check for empty state ---
    // Shows a placeholder if the table has no rows
    function checkEmptyState() {
        if (!keysTableBody) {
            return;
        }

        if (keysTableBody.children.length === 0) {
            keysTableBody.innerHTML = `
                <tr>
                    <td colspan="3" class="has-text-centered has-text-grey py-6">
                        No keys added yet. Click "Add Key" to start.
                    </td>
                </tr>`;
        }
    }

    // --- API: Fetch and List Keys ---
    // Runs on page load to populate the table from the backend
    async function fetchKeys() {
        try {
            const response = await fetch("http://127.0.0.1:8787/api/list-keys", {
                method: "GET",
                headers: {
                    "Authorization": "Bearer " + token
                }
            });

            if (response.ok) {
                const result = await response.json();
                const keys = result.data; // Expecting an array of keys

                if (keys && keys.length > 0) {
                    keysTableBody.innerHTML = ""; // Clear placeholder

                    for (let i = 0; i < keys.length; i++) {
                        const row = createKeyRow(keys[i]);
                        keysTableBody.appendChild(row);
                    }
                }

                checkEmptyState();
            }
            else {
                console.error("Failed to fetch keys: Server error");
                checkEmptyState();
            }
        }
        catch (error) {
            console.error("API Request failed (list-keys):", error);
            checkEmptyState();
        }
    }

    // Initial load call
    fetchKeys();

    // --- Modal Visibility ---
    // Handles opening and closing the "Add Key" modal
    if (openModalBtn) {
        openModalBtn.addEventListener("click", function () {
            addKeyModal.classList.add("is-active");
        });
    }

    for (let i = 0; i < closeModalElements.length; i++) {
        const el = closeModalElements[i];
        el.addEventListener("click", function (e) {
            e.preventDefault();
            addKeyModal.classList.remove("is-active");
        });
    }

    // --- Save Key (POST Request with token) ---
    // Handles form submission and dynamic row injection on success
    if (saveKeyBtn) {
        saveKeyBtn.addEventListener("click", async function (e) {
            e.preventDefault();

            const serviceName = document.querySelector("#serviceName").value;
            const apiKeyName = document.querySelector("#keyLabel").value;
            const apiKeyValue = document.querySelector("#keyValue").value;

            if (!serviceName || !apiKeyName || !apiKeyValue) {
                alert("Please fill in all required fields.");
                return;
            }

            try {
                const response = await fetch("http://127.0.0.1:8787/api/add-key", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + token
                    },
                    body: JSON.stringify({
                        serviceName: serviceName,
                        apiKeyName: apiKeyName,
                        apiKeyValue: apiKeyValue
                    })
                });

                if (response.ok) {
                    const result = await response.json();

                    // Remove "No keys" placeholder
                    const placeholder = keysTableBody.querySelector("td[colspan]");
                    if (placeholder) {
                        keysTableBody.innerHTML = "";
                    }

                    // Inject New Row
                    const row = createKeyRow(result.data);
                    keysTableBody.appendChild(row);

                    // Reset and Close
                    document.querySelector("#serviceName").value = "";
                    document.querySelector("#keyLabel").value = "";
                    document.querySelector("#keyValue").value = "";
                    addKeyModal.classList.remove("is-active");
                }
                else {
                    alert("Error: Server refused the request. Check your token or backend logs.");
                }
            }
            catch (error) {
                console.error("API Request failed:", error);
                alert("Network error. Is the worker running?");
            }
        });
    }

    // --- Logout ---
    // Handles Supabase session termination
    if (logoutBtn) {
        logoutBtn.addEventListener("click", async function () {
            try {
                await logoutUser();
            }
            catch (error) {
                console.error("Logout failed", error);
            }
        });
    }
});
