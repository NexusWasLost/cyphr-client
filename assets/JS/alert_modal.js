const ALERT_HTML = `
    <div class="modal" id="customAlertModal">
        <div class="modal-background"></div>
        <div class="modal-content">
            <div class="box has-text-centered">
                <button class="delete is-pulled-right" aria-label="close"></button>
                <h3 class="title is-5" id="alertTitle"></h3>
                <p id="alertMessage" class="mb-5"></p>
                <button class="button btn-save-modal" id="alertOkBtn">Understood</button>
            </div>
        </div>
    </div>`;

const CONFIRM_HTML = `
    <div id="customConfirmModal" class="modal">
        <div class="modal-background"></div>
        <div class="modal-card">
            <header class="modal-card-head">
                <p class="modal-card-title" id="confirmTitle"></p>
                <button class="delete" aria-label="close"></button>
            </header>
            <section class="modal-card-body">
                <p id="confirmMessage"></p>
            </section>
            <footer class="modal-card-foot is-justify-content-end">
                <button class="button btn-edit-cancel" id="confirmNoBtn">Cancel</button>
                <button class="button btn-del-danger" id="confirmYesBtn">Yes, Delete</button>
            </footer>
        </div>
    </div>`;

function injectModalDOM() {
    if (!document.querySelector("#customAlertModal")) {
        const container = document.createElement("div");
        container.id = "global-ui-container";
        container.innerHTML = ALERT_HTML + CONFIRM_HTML;
        document.body.appendChild(container);
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectModalDOM);
} else {
    injectModalDOM();
}

export function showAlert(title, message) {
    return new Promise(function (resolve) {
        injectModalDOM();
        const modal = document.querySelector("#customAlertModal");

        document.querySelector("#alertTitle").textContent = title;
        document.querySelector("#alertMessage").textContent = message;

        const okBtn = document.querySelector("#alertOkBtn");
        const crossBtn = modal.querySelector(".delete");
        const background = modal.querySelector(".modal-background");

        function close() {
            modal.classList.remove("is-active");
            okBtn.removeEventListener("click", close);
            crossBtn.removeEventListener("click", close);
            background.removeEventListener("click", close);
            resolve();
        }

        okBtn.addEventListener("click", close);
        crossBtn.addEventListener("click", close);
        background.addEventListener("click", close);

        modal.classList.add("is-active");
    });
}

export function showConfirm(title, message) {
    return new Promise(function (resolve) {
        injectModalDOM();
        const modal = document.querySelector("#customConfirmModal");

        document.querySelector("#confirmTitle").textContent = title;
        document.querySelector("#confirmMessage").textContent = message;

        const yesBtn = document.querySelector("#confirmYesBtn");
        const noBtn = document.querySelector("#confirmNoBtn");
        const crossBtn = modal.querySelector(".delete");
        const background = modal.querySelector(".modal-background");

        function handleYes() {
            modal.classList.remove("is-active");
            cleanup();
            resolve(true);
        }

        function handleNo() {
            modal.classList.remove("is-active");
            cleanup();
            resolve(false);
        }

        function cleanup() {
            yesBtn.removeEventListener("click", handleYes);
            noBtn.removeEventListener("click", handleNo);
            crossBtn.removeEventListener("click", handleNo);
            background.removeEventListener("click", handleNo);
        }

        yesBtn.addEventListener("click", handleYes);
        noBtn.addEventListener("click", handleNo);
        crossBtn.addEventListener("click", handleNo);
        background.addEventListener("click", handleNo);

        modal.classList.add("is-active");
    });
}

export function setupModalClose(modal, closeElements) {
    closeElements.forEach(function (element) {
        element.addEventListener("click", function (e) {
            e.preventDefault();
            modal.classList.remove("is-active");
        });
    });
}
