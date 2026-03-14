import { getSession, baseURL } from "./script.js";

document.addEventListener("DOMContentLoaded", init);

async function init() {
    const session = await getSession();

    if (!session) {
        window.location.href = "/login.html";
        return;
    }

    const token = session.access_token;

    const addKeyModal = document.querySelector("#addKeyModal");
    const openModalBtn = document.querySelector("#openAddModal");
    const saveKeyBtn = document.querySelector("#saveKeyBtn");
    const keysTableBody = document.querySelector("#keysTableBody");

    const closeModalElements = document.querySelectorAll(
        "#addKeyModal .modal-background, #addKeyModal .delete, #addKeyModal .modal-card-foot .is-light"
    );

    setUserAvatar(session.user.user_metadata.avatar_url);

    await fetchKeys(token, keysTableBody);
    setupModal(openModalBtn, addKeyModal, closeModalElements);
    setupSaveKey(saveKeyBtn, addKeyModal, keysTableBody, token);
    setupCopyAndDeleteHandler(keysTableBody, token);
    setupEditModal(keysTableBody, token);
}

function createKeyRow(data) {
    const row = document.createElement("tr");
    row.setAttribute("data-id", data.key_id);
    row.classList.add("key-row"); //used for counting total keys
    row.innerHTML = `
        <td class="is-vcentered">${data.service_name} - ${data.key_name}</td>
        <td class="is-vcentered"><code>...${data.key_hint}</code></td>
        <td class="has-text-right">
            <div class="buttons is-right">
                <button id="btn-copy" class="button is-small is-dark btn-copy">Copy</button>
                <button id="btn-edit" class="button is-small is-dark btn-edit">Edit</button>
                <button id="btn-del" class="button is-small is-dark btn-del">Delete</button>
            </div>
        </td>
    `;

    return row;
}

function checkEmptyState(keysTableBody) {
    if (!keysTableBody) return;

    const hasKeys = keysTableBody.querySelectorAll(".key-row").length > 0;
    if (hasKeys) return;

    keysTableBody.innerHTML = `
        <tr class="has-no-key-row">
            <td colspan="3" class="has-text-centered has-text-grey py-6">
                No keys added yet. Click "Add Key" to start.
            </td>
        </tr>`;
}

function initiateKeyLoader(keysTableBody) {
    keysTableBody.innerHTML = `
        <tr class="loader-row">
            <td colspan="3" class="has-text-centered py-6">
                <div class="loader-wrapper is-flex is-flex-direction-column is-align-items-center">
                    <div class="loader is-loading mb-3" style="height: 40px; width: 40px;"></div>
                    <p class="has-text-grey is-size-7 monospace">INITIALIZING SECURE VAULT...</p>
                </div>
            </td>
        </tr>`;
}

async function fetchKeys(token, keysTableBody) {
    initiateKeyLoader(keysTableBody);
    try {
        const response = await fetch(`${baseURL}/api/list-keys`, {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        if (!response.ok) {
            console.error("Failed to fetch keys");
            checkEmptyState(keysTableBody);
            return;
        }

        const result = await response.json();
        const keys = result.data;

        if (!keys || keys.length === 0) {
            checkEmptyState(keysTableBody);
            return;
        }

        keysTableBody.innerHTML = "";

        for (let x = 0; x < keys.length; x++) {
            const row = createKeyRow(keys[x]);
            keysTableBody.appendChild(row);
        }

        updateKeyCount();
    }
    catch (error) {
        console.error("API Request failed:", error);
        checkEmptyState(keysTableBody);
    }
}

function setupModal(openModalBtn, addKeyModal, closeModalElements) {
    if (openModalBtn) {
        openModalBtn.addEventListener("click", function () {
            addKeyModal.classList.add("is-active");
        });
    }

    for (let x = 0; x < closeModalElements.length; x++) {
        closeModalElements[x].addEventListener("click", function (e) {
            e.preventDefault();
            addKeyModal.classList.remove("is-active");
        });
    }
}

function setupSaveKey(saveKeyBtn, addKeyModal, keysTableBody, token) {
    if (!saveKeyBtn) return;

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
            const response = await fetch(`${baseURL}/api/add-key`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify({
                    serviceName,
                    apiKeyName,
                    apiKeyValue
                })
            });

            if (!response.ok) {
                alert("Server refused request");
                return;
            }

            const result = await response.json();

            const placeholder = keysTableBody.querySelector("td[colspan]");
            if (placeholder) keysTableBody.innerHTML = "";

            const row = createKeyRow(result.data);
            keysTableBody.appendChild(row);

            document.querySelector("#serviceName").value = "";
            document.querySelector("#keyLabel").value = "";
            document.querySelector("#keyValue").value = "";

            addKeyModal.classList.remove("is-active");
            updateKeyCount();
        }
        catch (error) {
            console.error("API Request failed:", error);
            alert("Network error");
        }
    });
}

// --- API: Delete Key (Standalone) ---
async function deleteKey(keyId, token) {
    try {
        const response = await fetch(`${baseURL}/api/del-key/${keyId}`, {
            method: "DELETE",
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        if (!response.ok) {
            alert("Failed to delete the key.");
            return false;
        }

        return true;
    }
    catch (error) {
        console.error("Delete request failed:", error);
        alert("Network error while trying to delete key.");
        return false;
    }
}

// --- API: Update Key ---
async function updateKey(keyId, token, newServiceName, newAPIKeyName) {
    try {
        const response = await fetch(`${baseURL}/api/update-key/${keyId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({
                newServiceName,
                newAPIKeyName
            })
        });

        if (!response.ok) {
            alert("Failed to update key.");
            return false;
        }

        return true;
    }
    catch (error) {
        console.error("Update request failed:", error);
        alert("Network error while updating key.");
        return false;
    }
}

// --- Event Delegation: Handle Copy & Delete ---
function setupCopyAndDeleteHandler(keysTableBody, token) {
    if (!keysTableBody) return;

    keysTableBody.addEventListener("click", async function (e) {
        const row = e.target.closest("tr");
        if (!row) return;
        const keyId = row.getAttribute("data-id");

        // --- Copy Key ---
        if (e.target.classList.contains("btn-copy")) {
            const button = e.target;
            try {
                const response = await fetch(`${baseURL}/api/get-key/${keyId}`, {
                    method: "GET",
                    headers: { "Authorization": "Bearer " + token }
                });

                if (!response.ok) {
                    alert("Failed to fetch the key.");
                    return;
                }

                const result = await response.json();
                await navigator.clipboard.writeText(result.key);

                const originalText = button.innerText;
                button.innerText = "Copied!";
                button.classList.add("is-success");
                setTimeout(() => {
                    button.innerText = originalText;
                    button.classList.remove("is-success");
                }, 2000);
            }
            catch (error) {
                console.error("Copy request failed:", error);
                alert("Network error while copying key.");
            }
        }

        // --- Delete Key ---
        if (e.target.classList.contains("btn-del")) {
            const confirmed = confirm("Are you sure you want to delete this key?");
            if (!confirmed) return;

            const success = await deleteKey(keyId, token);
            if (success) {
                row.remove();
                checkEmptyState(keysTableBody);
                updateKeyCount();
            }
        }
    });
}

function setupEditModal(keysTableBody, token) {
    const editKeyModal = document.querySelector("#editKeyModal");
    const editServiceName = document.querySelector("#editServiceName");
    const editKeyLabel = document.querySelector("#editKeyLabel");
    const updateKeyBtn = document.querySelector("#updateKeyBtn");

    const closeElements = document.querySelectorAll(
        "#editKeyModal .modal-background, #editKeyModal .delete, #editKeyModal .btn-edit-cancel"
    );

    let originalService = "";
    let originalLabel = "";

    keysTableBody.addEventListener("click", function (e) {
        if (!e.target.classList.contains("btn-edit")) return;
        const row = e.target.closest("tr");
        const keyId = row.getAttribute("data-id");
        const serviceText = row.children[0].innerText;
        const parts = serviceText.split(" - ");

        originalService = parts[0];
        originalLabel = parts[1];

        editServiceName.value = originalService;
        editKeyLabel.value = originalLabel;

        updateKeyBtn.disabled = true;
        editKeyModal.setAttribute("data-editing-id", keyId);
        editKeyModal.classList.add("is-active");
    });

    editServiceName.addEventListener("input", function () {
        if (editServiceName.value !== originalService || editKeyLabel.value !== originalLabel) {
            updateKeyBtn.disabled = false;
        }
        else {
            updateKeyBtn.disabled = true;
        }
    });

    editKeyLabel.addEventListener("input", function () {
        if (editServiceName.value !== originalService || editKeyLabel.value !== originalLabel) {
            updateKeyBtn.disabled = false;
        }
        else {
            updateKeyBtn.disabled = true;
        }
    });

    updateKeyBtn.addEventListener("click", async function (e) {
        e.preventDefault();

        const activeId = editKeyModal.getAttribute("data-editing-id");
        const row = document.querySelector(`tr[data-id="${activeId}"]`);

        if (!row) return;

        const newServiceName = editServiceName.value;
        const newAPIKeyName = editKeyLabel.value;

        const success = await updateKey(activeId, token, newServiceName, newAPIKeyName);

        if (!success) return;

        row.children[0].innerText = newServiceName + " - " + newAPIKeyName;

        editKeyModal.classList.remove("is-active");
    });

    for (let x = 0; x < closeElements.length; x++) {
        closeElements[x].addEventListener("click", function (e) {
            e.preventDefault();
            editKeyModal.classList.remove("is-active");
        });
    }
}

function setUserAvatar(avatarURL) {
    document.querySelector("#userAvatar").setAttribute("src", avatarURL);
}

function updateKeyCount() {
    const totalKeys = document.querySelectorAll(".key-row");
    const keys = document.querySelector("#totalKeyCount");
    keys.textContent = totalKeys.length;
}
