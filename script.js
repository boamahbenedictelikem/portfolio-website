// Elements
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-nav');
const year = document.getElementById('year');
const contactForm = document.querySelector('#contact-form');
const modalOverlay = document.getElementById('modal-overlay');
const modalBody = document.getElementById('modal-body');
const modalClose = document.querySelector('.modal-close');
const copyEmailBtn = document.getElementById('copy-email-btn');
const toast = document.getElementById('toast');
const backToTopBtn = document.getElementById('back-to-top');

// 1. Dynamic Year
if (year) {
    year.textContent = new Date().getFullYear();
}


// 3. Mobile Navigation Menu
if (menuToggle && nav) {
    const closeNav = () => {
        nav.classList.remove('is-open');
        menuToggle.setAttribute('aria-expanded', 'false');
        const sr = menuToggle.querySelector('.sr-only');
        if (sr) sr.textContent = 'Open menu';
    };

    menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = nav.classList.toggle('is-open');
        menuToggle.setAttribute('aria-expanded', String(isOpen));
        const sr = menuToggle.querySelector('.sr-only');
        if (sr) sr.textContent = isOpen ? 'Close menu' : 'Open menu';
    });

    nav.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', closeNav);
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (nav.classList.contains('is-open') && !nav.contains(e.target) && !menuToggle.contains(e.target)) {
            closeNav();
        }
    });

    // Close menu on Escape key
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && nav.classList.contains('is-open')) {
            closeNav();
            menuToggle.focus();
        }
    });
}

// 4. Active Navigation Scroll Spy
const navLinks = document.querySelectorAll('.site-nav a[href^="#"]');
const sections = document.querySelectorAll('section[id]');

if (sections.length > 0 && navLinks.length > 0) {
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach((link) => {
                    const href = link.getAttribute('href');
                    if (href === `#${id}`) {
                        link.classList.add('active');
                    } else if (href && href.startsWith('#')) {
                        link.classList.remove('active');
                    }
                });
            }
        });
    }, {
        root: null,
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0
    });

    sections.forEach((section) => sectionObserver.observe(section));
}

// 5. Case Study Modals
const projectCards = document.querySelectorAll('.project-card[data-modal]');

const openModal = (modalKey) => {
    const template = document.getElementById(`tmpl-${modalKey}`);
    if (!template || !modalBody || !modalOverlay) return;

    modalBody.innerHTML = '';
    modalBody.appendChild(template.content.cloneNode(true));
    const titleEl = modalBody.querySelector('h2');
    if (titleEl) {
        titleEl.id = 'modal-title';
    }
    modalOverlay.classList.add('is-active');
    modalOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Trap focus to close button
    if (modalClose) {
        modalClose.focus();
    }
};

const closeModal = () => {
    if (!modalOverlay) return;
    modalOverlay.classList.remove('is-active');
    modalOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
};

projectCards.forEach((card) => {
    const modalKey = card.getAttribute('data-modal');
    card.addEventListener('click', () => openModal(modalKey));
    card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openModal(modalKey);
        }
    });
});

if (modalClose) {
    modalClose.addEventListener('click', closeModal);
}

if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });
}

// Close modal on action button click inside modal
if (modalBody) {
    modalBody.addEventListener('click', (e) => {
        if (e.target.closest('a')) {
            closeModal();
        }
    });
}

// Close modal on ESC key
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('is-active')) {
        closeModal();
    }
});

// 6. Toast Notification Helper
let toastTimer = null;
const showToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    toast.setAttribute('aria-hidden', 'false');

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.classList.remove('show');
        toast.setAttribute('aria-hidden', 'true');
    }, 2800);
};

// 7. Copy Email to Clipboard
if (copyEmailBtn) {
    const emailToCopy = 'boamahbenedictelikem@gmail.com';
    copyEmailBtn.addEventListener('click', async () => {
        let copied = false;
        if (navigator.clipboard && window.isSecureContext) {
            try {
                await navigator.clipboard.writeText(emailToCopy);
                copied = true;
            } catch (_) {
                copied = false;
            }
        }
        if (!copied) {
            try {
                const textarea = document.createElement('textarea');
                textarea.value = emailToCopy;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.select();
                copied = document.execCommand('copy');
                document.body.removeChild(textarea);
            } catch (_) {
                copied = false;
            }
        }

        if (copied) {
            showToast('Email copied to clipboard!');
            const label = copyEmailBtn.querySelector('.copy-label');
            if (label) {
                const originalText = label.textContent;
                label.textContent = 'Copied!';
                setTimeout(() => {
                    label.textContent = originalText;
                }, 2000);
            }
        } else {
            showToast('Email: ' + emailToCopy);
        }
    });
}

// 8. Floating Back to Top Button
if (backToTopBtn) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
            backToTopBtn.classList.add('is-visible');
        } else {
            backToTopBtn.classList.remove('is-visible');
        }
    }, { passive: true });
}

// 9. Contact Formspree Form Handling
if (contactForm) {
    const fields = ['name', 'email', 'message'];

    const setFieldError = (field, message) => {
        const input = contactForm.elements[field];
        if (!input) return;
        const row = input.closest('.form-row');
        if (row) {
            row.classList.toggle('has-error', Boolean(message));
        }
        const errorEl = document.querySelector(`#${field}-error`);
        if (errorEl) {
            errorEl.textContent = message;
        }
        input.setAttribute('aria-invalid', String(Boolean(message)));
    };

    // Clear field errors as user types
    fields.forEach((field) => {
        const input = contactForm.elements[field];
        if (input) {
            input.addEventListener('input', () => {
                const row = input.closest('.form-row');
                if (row && row.classList.contains('has-error')) {
                    setFieldError(field, '');
                    const status = document.querySelector('#form-status');
                    if (status && status.classList.contains('error')) {
                        status.textContent = '';
                        status.className = 'form-status';
                    }
                }
            });
        }
    });

    contactForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(contactForm);
        const name = String(formData.get('name') || '').trim();
        const email = String(formData.get('email') || '').trim();
        const message = String(formData.get('message') || '').trim();

        const errors = {
            name: name ? '' : 'Please enter your name.',
            email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? '' : 'Please enter a valid email address.',
            message: message.length >= 10 ? '' : 'Please share at least 10 characters describing your request.'
        };

        fields.forEach((field) => setFieldError(field, errors[field]));
        const status = document.querySelector('#form-status');
        if (!status) return;
        status.className = 'form-status';

        if (Object.values(errors).some(Boolean)) {
            status.textContent = 'Please check the highlighted fields above.';
            status.classList.add('error');
            contactForm.querySelector('.has-error input, .has-error textarea')?.focus();
            return;
        }

        const submitButton = contactForm.querySelector('.submit-button');
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.classList.add('is-loading');
        }
        status.textContent = 'Sending your message...';

        try {
            const response = await fetch(contactForm.action, {
                method: contactForm.method,
                body: new FormData(contactForm),
                headers: {
                    Accept: 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Form submission failed.');
            }

            if (submitButton) {
                submitButton.disabled = false;
                submitButton.classList.remove('is-loading');
            }
            status.textContent = 'Thank you! Your message has been sent. I will respond to you promptly.';
            status.classList.add('success');
            showToast('Message sent successfully!');
            contactForm.reset();
        } catch (error) {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.classList.remove('is-loading');
            }
            status.textContent = 'Something went wrong. Please try again or email me directly.';
            status.classList.add('error');
        }
    });
}

// 10. GitHub Repositories — Live Fetch
(function loadGitHubRepos() {
    const grid = document.getElementById('gh-repo-grid');
    if (!grid) return;

    const GITHUB_USER = 'boamahbenedictelikem';
    const SKIP_REPOS = new Set([
        'portfolio-website',
        'skills-introduction-to-github',
        'skills-copilot-codespaces-vscode',
    ]);

    // GitHub language colours (subset)
    const LANG_COLORS = {
        JavaScript: '#f1e05a',
        TypeScript: '#3178c6',
        Python: '#3572A5',
        HTML: '#e34c26',
        CSS: '#563d7c',
        PHP: '#4F5D95',
        'C++': '#f34b7d',
        Java: '#b07219',
        Shell: '#89e051',
        Vue: '#41b883',
    };

    function langColor(lang) {
        return LANG_COLORS[lang] || '#7a8e88';
    }

    function buildCard(repo) {
        const card = document.createElement('a');
        card.href = repo.html_url;
        card.target = '_blank';
        card.rel = 'noopener noreferrer';
        card.className = 'gh-repo-card';
        card.setAttribute('aria-label', `View ${repo.name} on GitHub`);

        const name = document.createElement('span');
        name.className = 'gh-repo-name';
        name.textContent = repo.name.replace(/-/g, '\u00a0').replace(/_/g, '\u00a0');

        const desc = document.createElement('p');
        desc.className = 'gh-repo-desc';
        desc.textContent = repo.description || 'No description provided.';

        const footer = document.createElement('div');
        footer.className = 'gh-repo-footer';

        if (repo.language) {
            const dot = document.createElement('span');
            dot.className = 'gh-lang-dot';
            dot.style.background = langColor(repo.language);
            dot.setAttribute('aria-hidden', 'true');

            const lang = document.createElement('span');
            lang.className = 'gh-lang-name';
            lang.textContent = repo.language;

            footer.appendChild(dot);
            footer.appendChild(lang);
        }

        if (repo.stargazers_count > 0) {
            const stars = document.createElement('span');
            stars.className = 'gh-stat';
            stars.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>' + repo.stargazers_count;
            footer.appendChild(stars);
        }

        if (repo.forks_count > 0) {
            const forks = document.createElement('span');
            forks.className = 'gh-stat';
            forks.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><circle cx="18" cy="6" r="3"/><path d="M6 9v2a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V9"/></svg>' + repo.forks_count;
            footer.appendChild(forks);
        }

        const arrow = document.createElement('span');
        arrow.className = 'gh-arrow';
        arrow.setAttribute('aria-hidden', 'true');
        arrow.textContent = '\u2197';
        footer.appendChild(arrow);

        card.appendChild(name);
        card.appendChild(desc);
        card.appendChild(footer);
        return card;
    }

    fetch('https://api.github.com/users/' + GITHUB_USER + '/repos?per_page=100&sort=updated&type=public')
        .then(function(res) {
            if (!res.ok) throw new Error('GitHub API error');
            return res.json();
        })
        .then(function(repos) {
            var filtered = repos.filter(function(r) {
                return !r.fork && !SKIP_REPOS.has(r.name) && !r.archived;
            });

            grid.innerHTML = '';

            if (filtered.length === 0) {
                grid.innerHTML = '<p class="gh-error">No public repositories found.</p>';
                return;
            }

            filtered.forEach(function(repo) {
                grid.appendChild(buildCard(repo));
            });
        })
        .catch(function() {
            grid.innerHTML = '<p class="gh-error">Could not load repositories — <a href="https://github.com/' + GITHUB_USER + '" target="_blank" rel="noopener noreferrer" style="color:var(--accent)">view them on GitHub \u2197</a></p>';
        });
}());
