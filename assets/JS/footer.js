const FOOTER_HTML = `
    <footer class="site-footer">
        <div class="container is-max-desktop">
            <div class="footer-main">
                <div><strong>CYPHR</strong><span>Simple API key storage.</span></div>
                <div class="tech-stack">
                    <span>Built with</span>
                    <i class="ri-nodejs-fill" title="Node.js"></i>
                    <i class="devicon-cloudflare-plain colored" title="Cloudflare"></i>
                    <img src="https://hono.dev/images/logo.png" class="tech-stack-img" alt="Hono" title="Hono">
                    <i class="devicon-supabase-plain colored" title="Supabase"></i>
                    <img src="https://neon.tech/brand/neon-logomark-dark-color.svg" class="tech-stack-img" alt="Neon" title="Neon">
                </div>
            </div>
            <div class="footer-meta">
                <div>
                    <span><i class="ri-shield-check-line"></i> AES-256-GCM</span>
                    <span><i class="ri-git-repository-line"></i> Open source</span>
                    <span><i class="ri-global-line"></i> Edge-ready</span>
                </div>
                <span>© 2026 CYPHR. All rights reserved.</span>
            </div>
        </div>
    </footer>`;

function injectFooter() {
    const placeholder = document.querySelector("#footer-placeholder");
    if (placeholder) {
        placeholder.outerHTML = FOOTER_HTML;
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectFooter);
}
else {
    injectFooter();
}
