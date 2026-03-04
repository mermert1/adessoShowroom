document.addEventListener('DOMContentLoaded', () => {

    // --- Theme Toggle (Dark/Light Mode) ---
    const themeToggle = document.getElementById('theme-toggle');
    const iconMoon = themeToggle?.querySelector('.icon-moon');
    const iconSun = themeToggle?.querySelector('.icon-sun');

    function updateIcons(isDark) {
        if (!iconMoon || !iconSun) return;
        if (isDark) {
            iconMoon.style.display = 'none';
            iconSun.style.display = 'inline';
        } else {
            iconMoon.style.display = 'inline';
            iconSun.style.display = 'none';
        }
    }

    // Check for saved theme
    const savedTheme = localStorage.getItem('buendnis_theme');
    // Default to light if no preference is saved
    const isDark = savedTheme === 'dark';

    if (isDark) {
        document.body.setAttribute('data-theme', 'dark');
    }
    updateIcons(isDark);

    themeToggle?.addEventListener('click', () => {
        const isCurrentlyDark = document.body.getAttribute('data-theme') === 'dark';
        if (isCurrentlyDark) {
            document.body.removeAttribute('data-theme');
            localStorage.setItem('buendnis_theme', 'light');
            updateIcons(false);
        } else {
            document.body.setAttribute('data-theme', 'dark');
            localStorage.setItem('buendnis_theme', 'dark');
            updateIcons(true);
        }
    });

    // --- View Switching ---
    function switchV1View(viewName) {
        // Auth check for certain views
        if (viewName === 'api' && !portalAuthenticated) {
            openModal();
            return;
        }

        document.querySelectorAll('.v1-view').forEach(v => {
            v.style.display = 'none';
        });
        const target = document.getElementById('v1-view-' + viewName);
        if (target) {
            target.style.display = 'flex';
        }

        // Sync main navigation
        document.querySelectorAll('.v1-nav-links a').forEach(a => {
            a.classList.toggle('active', a.getAttribute('data-v1-view') === viewName);
        });

    }

    // --- Docs Sub-Page Switching ---
    function switchV1SubPage(pageName) {
        document.querySelectorAll('.v1-docs-page').forEach(p => p.style.display = 'none');
        const target = document.getElementById('v1-docs-' + pageName);
        if (target) target.style.display = 'block';

        document.querySelectorAll('.v1-docs-nav a').forEach(a => {
            const isActive = a.getAttribute('data-v1-sub') === pageName;
            a.classList.toggle('active', isActive);

            // Expand parent accordion group if active
            if (isActive) {
                const parentGroup = a.closest('.nav-group');
                if (parentGroup && !parentGroup.classList.contains('active')) {
                    // Close others
                    document.querySelectorAll('.nav-group').forEach(other => {
                        other.classList.remove('active');
                        const content = other.querySelector('.nav-group-content');
                        if (content) content.style.display = 'none';
                    });

                    parentGroup.classList.add('active');
                    const content = parentGroup.querySelector('.nav-group-content');
                    if (content) content.style.display = 'flex';
                }
            }
        });
    }

    // Event Listeners for Navigation
    document.querySelectorAll('[data-v1-view]').forEach(el => {
        el.addEventListener('click', e => {
            e.preventDefault();
            switchV1View(el.getAttribute('data-v1-view'));
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    document.querySelectorAll('[data-v1-sub]').forEach(el => {
        el.addEventListener('click', e => {
            e.preventDefault();
            switchV1SubPage(el.getAttribute('data-v1-sub'));
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    // --- Auth & Login Modal ---
    const btnV1Login = document.getElementById('btn-v1-login');
    const btnCtaLogin = document.getElementById('btn-v1-cta-login');
    const loginModal = document.getElementById('portal-login-modal');
    const btnCloseModal = document.getElementById('close-portal-login');
    const btnSubmitLogin = document.getElementById('btn-portal-submit-login');
    let portalAuthenticated = false;

    // Initial auth check — body class controls visibility via CSS
    document.body.classList.remove('authenticated');

    function openModal(e) {
        if (e) e.preventDefault();
        if (loginModal) loginModal.classList.add('active');
    }

    function closeModal() {
        if (loginModal) loginModal.classList.remove('active');
    }

    if (btnV1Login) btnV1Login.addEventListener('click', openModal);
    if (btnCtaLogin) btnCtaLogin.addEventListener('click', openModal);

    if (btnCloseModal) {
        btnCloseModal.addEventListener('click', closeModal);
        loginModal.addEventListener('click', e => {
            if (e.target === loginModal) closeModal();
        });
    }

    function doLogin() {
        portalAuthenticated = true;
        closeModal();

        // Reveal auth-only elements via body class
        document.body.classList.add('authenticated');

        // Update auth section
        const v1AuthSection = document.getElementById('v1-auth-section');
        if (v1AuthSection) {
            v1AuthSection.innerHTML = `
              <div class="user-badge v1-user-badge">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  <span>developer_99</span>
                  <button class="btn btn-sm btn-buendnis-outline" id="btn-v1-logout">Abmelden</button>
              </div>`;
            document.getElementById('btn-v1-logout')?.addEventListener('click', doLogout);
        }

        // Navigate to API catalog
        switchV1View('api');
    }

    function doLogout() {
        portalAuthenticated = false;
        document.body.classList.remove('authenticated');

        const v1AuthSection = document.getElementById('v1-auth-section');
        if (v1AuthSection) {
            v1AuthSection.innerHTML = `<button class="btn btn-buendnis-primary btn-sm" id="btn-v1-login">Portal Login</button>`;
            document.getElementById('btn-v1-login')?.addEventListener('click', openModal);
        }

        switchV1View('home');
    }

    if (btnSubmitLogin) {
        btnSubmitLogin.addEventListener('click', doLogin);
    }

    // --- Docs Sidebar Accordion ---
    const docsNavGroups = document.querySelectorAll('.nav-group');

    docsNavGroups.forEach(group => {
        const toggleBtn = group.querySelector('.nav-group-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                const isActive = group.classList.contains('active');

                // Close all other groups
                docsNavGroups.forEach(otherItem => {
                    otherItem.classList.remove('active');
                    const otherContent = otherItem.querySelector('.nav-group-content');
                    if (otherContent) otherContent.style.display = 'none';
                });

                // Open clicked group if it wasn't active
                if (!isActive) {
                    group.classList.add('active');
                    const content = group.querySelector('.nav-group-content');
                    if (content) content.style.display = 'flex';
                }
            });
        }
    });

    // --- FAQ Accordion ---
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');

        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            // Close all other items
            faqItems.forEach(otherItem => {
                otherItem.classList.remove('active');
                const otherAnswer = otherItem.querySelector('.faq-answer');
                otherAnswer.style.maxHeight = null;
            });

            // If clicked item wasn't active, open it
            if (!isActive) {
                item.classList.add('active');
                const answer = item.querySelector('.faq-answer');
                answer.style.maxHeight = answer.scrollHeight + "px";
            }
        });
    });

    // --- Feedback Toast ---
    const toast = document.createElement('div');
    toast.className = 'portal-toast';
    document.body.appendChild(toast);

    function showToast(message) {
        toast.textContent = message;
        toast.classList.add('visible');
        setTimeout(() => toast.classList.remove('visible'), 3000);
    }

    // Handle Mock Buttons (Mock Configuration/Reports)
    document.querySelectorAll('.toolbar-nav a, .placeholder-link').forEach(a => {
        if (a.getAttribute('href') === '#' || a.classList.contains('placeholder-link')) {
            a.addEventListener('click', e => {
                e.preventDefault();
                showToast(`Funktion "${a.textContent}" ist für diesen Showroom deaktiviert.`);
            });
        }
    });

    // --- Initial Animation Trigger ---
    setTimeout(() => {
        document.querySelectorAll('.fade-up').forEach(el => el.classList.add('visible'));
    }, 100);

    // --- Interactive Policy Cards ---
    const policyWrappers = document.querySelectorAll('.policy-card-wrapper');

    policyWrappers.forEach(wrapper => {
        const front = wrapper.querySelector('.policy-front');
        const backBtn = wrapper.querySelector('.policy-back-btn');
        const backActions = wrapper.querySelectorAll('.policy-back-actions .btn:not(.policy-back-btn)');

        // Click front to flip
        if (front) {
            front.addEventListener('click', () => {
                wrapper.classList.add('flipped');
                policyWrappers.forEach(other => {
                    if (other !== wrapper) other.classList.add('dimmed');
                });
            });
        }

        // Back button to unflip
        if (backBtn) {
            backBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                wrapper.classList.remove('flipped');
                policyWrappers.forEach(other => other.classList.remove('dimmed'));
            });
        }

        // Action buttons on back — directly trigger view switch
        backActions.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                // Reset all cards
                policyWrappers.forEach(w => w.classList.remove('flipped', 'dimmed'));
                // Handle view navigation
                const viewTarget = btn.getAttribute('data-v1-view');
                if (viewTarget) {
                    switchV1View(viewTarget);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
                // Handle onclick attributes (Browse APIs, Contact Sales)
                const onclickAttr = btn.getAttribute('onclick');
                if (onclickAttr) {
                    new Function(onclickAttr)();
                }
            });
        });
    });

    // --- Floating Particle Canvas ---
    const canvas = document.getElementById('landing-particles');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        const PARTICLE_COUNT = 35;

        function resizeCanvas() {
            const container = canvas.parentElement;
            canvas.width = container.offsetWidth;
            canvas.height = container.offsetHeight;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        class Particle {
            constructor() { this.reset(); }
            reset() {
                this.x = Math.random() * canvas.width;
                this.y = canvas.height + Math.random() * 40;
                this.size = Math.random() * 3 + 1;
                this.speedY = -(Math.random() * 0.4 + 0.15);
                this.speedX = (Math.random() - 0.5) * 0.3;
                this.opacity = Math.random() * 0.25 + 0.05;
            }
            update() {
                this.y += this.speedY;
                this.x += this.speedX;
                if (this.y < -10) this.reset();
            }
            draw() {
                ctx.save();
                ctx.globalAlpha = this.opacity;
                ctx.fillStyle = '#00A3E0';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const p = new Particle();
            p.y = Math.random() * canvas.height; // random start position
            particles.push(p);
        }

        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => { p.update(); p.draw(); });
            requestAnimationFrame(animateParticles);
        }
        animateParticles();
    }
});
