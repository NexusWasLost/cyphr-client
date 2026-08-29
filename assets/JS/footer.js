const FOOTER_HTML = `
    <footer class="site-footer">
        <div class="container is-max-desktop">
            <div class="footer-main">
                <div><strong>CYPHR</strong><span>Simple API key storage.</span></div>
                <div class="tech-stack">
                    <span>Built with</span>
                    <a href="https://nodejs.org/en" target="_blank"><i class="ri-nodejs-fill" title="Node.js"></i></a>
                    <a href="https://www.cloudflare.com/products/workers/" target="_blank"><i class="devicon-cloudflare-plain colored" title="Cloudflare"></i></a>
                    <a href="https://hono.dev/" target="_blank"><img src="https://hono.dev/images/logo.png" class="tech-stack-img" alt="Hono" title="Hono"></a>
                    <a href="https://supabase.com/auth" target="_blank"><i class="devicon-supabase-plain colored" title="Supabase"></i></a>
                    <a href="https://neon.com/" target="_blank"><img src="https://neon.tech/brand/neon-logomark-dark-color.svg" class="tech-stack-img" alt="Neon" title="Neon"></a>
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
