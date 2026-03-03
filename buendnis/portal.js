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
            target.style.display = 'block';
        }

        // Sync main navigation
        document.querySelectorAll('.v1-nav-links a').forEach(a => {
            a.classList.toggle('active', a.getAttribute('data-v1-view') === viewName);
        });

        // Sync Drupal tabs
        document.querySelectorAll('.drupal-tabs a').forEach(a => {
            a.classList.toggle('active', a.getAttribute('data-v1-view') === viewName);
        });
    }

    // --- Docs Sub-Page Switching ---
    function switchV1SubPage(pageName) {
        document.querySelectorAll('.v1-docs-page').forEach(p => p.style.display = 'none');
        const target = document.getElementById('v1-docs-' + pageName);
        if (target) target.style.display = 'block';
        document.querySelectorAll('.v1-docs-nav a').forEach(a => {
            a.classList.toggle('active', a.getAttribute('data-v1-sub') === pageName);
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

    // Initial auth check to hide elements for guests
    document.querySelectorAll('.auth-only').forEach(el => el.style.display = 'none');

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

        // Reveal auth-only elements (use '' to not override CSS display)
        document.querySelectorAll('.auth-only').forEach(el => el.style.display = '');

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
        document.querySelectorAll('.auth-only').forEach(el => el.style.display = 'none');

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
    document.querySelectorAll('.toolbar-nav a').forEach(a => {
        if (a.getAttribute('href') === '#') {
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
});
