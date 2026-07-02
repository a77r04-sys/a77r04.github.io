(function () {
    'use strict';

    // ---------- Single source of truth for project names ----------
    // To rename a project everywhere on the site, edit the value here.
    const PROJECTS = {
        'inverse-kinematics': 'Inverse Kinematics',
        'arm': 'Arm Structure',
        'effector': 'End Effector',
        'effector-p1': 'First Prototype',
        'effector-p2': 'Final Prototype',
        'electrospray': 'Electrospray Research',
        'boom': 'Boom Deployment Mechanism',
        'soup': 'Automatic Soup Stirrer',
        'blade': 'Airfoil Blade',
    };

    function syncProjectNames() {
        document.querySelectorAll('[data-project-id]').forEach((el) => {
            const name = PROJECTS[el.dataset.projectId];
            if (!name) return;
            if (el.tagName === 'BODY') {
                const current = el.querySelector('.breadcrumb .current');
                if (current) current.textContent = name;
                const title = el.querySelector('.project-title');
                if (title) title.textContent = name;
                document.title = name + ' | Ari Rabinovitz';
            } else {
                const h3 = el.querySelector('h3');
                if (h3) h3.textContent = name;
                else el.textContent = name;
            }
        });
    }

    // ---------- Background + progress: inject once ----------
    function injectAtmosphere() {
        const layers = ['aurora', 'grid-bg', 'grain', 'scroll-progress'];
        layers.forEach((id) => {
            if (!document.getElementById(id)) {
                const el = document.createElement('div');
                el.id = id;
                document.body.appendChild(el);
            }
        });
    }

    // ---------- Scroll progress + header shadow ----------
    function bindScroll() {
        const bar = document.getElementById('scroll-progress');
        function onScroll() {
            const h = document.documentElement.scrollHeight - innerHeight;
            const pct = h > 0 ? (scrollY / h) * 100 : 0;
            if (bar) bar.style.width = pct + '%';
            const header = document.querySelector('header');
            if (header) header.classList.toggle('scrolled', scrollY > 30);
        }
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    // ---------- Reveal on scroll ----------
    function bindReveal() {
        function reveal() {
            const els = document.querySelectorAll('.reveal');
            for (let i = 0; i < els.length; i++) {
                if (
                    els[i].getBoundingClientRect().top <
                    innerHeight - 80
                )
                    els[i].classList.add('active');
            }
        }
        window.addEventListener('scroll', reveal, { passive: true });
        window.addEventListener('resize', reveal);
        reveal();
        // Re-run after navbar/footer fetch
        setTimeout(reveal, 200);
        setTimeout(reveal, 600);
    }

    // ---------- Light glow follow on action cards ----------
    function bindCardLight() {
        document.addEventListener('mousemove', (e) => {
            const cards = document.querySelectorAll('.action-card');
            cards.forEach((card) => {
                const r = card.getBoundingClientRect();
                if (
                    e.clientX < r.left - 60 ||
                    e.clientX > r.right + 60 ||
                    e.clientY < r.top - 60 ||
                    e.clientY > r.bottom + 60
                )
                    return;
                const x = ((e.clientX - r.left) / r.width) * 100;
                const y = ((e.clientY - r.top) / r.height) * 100;
                card.style.setProperty('--mx', x + '%');
                card.style.setProperty('--my', y + '%');
            });
        });
    }

    // ---------- Marquee: duplicate content for seamless loop ----------
    function bindMarquee() {
        document.querySelectorAll('.marquee-track').forEach((track) => {
            if (track.dataset.dup === '1') return;
            track.innerHTML += track.innerHTML;
            track.dataset.dup = '1';
        });
    }

    // ---------- Lightbox: click a framed image to view it uncropped ----------
    function bindLightbox() {
        const box = document.createElement('div');
        box.id = 'lightbox';
        const full = document.createElement('img');
        box.appendChild(full);
        document.body.appendChild(box);
        document.addEventListener('click', (e) => {
            const thumb = e.target.closest('.frame img');
            if (thumb && !box.classList.contains('show')) {
                full.src = thumb.src;
                full.alt = thumb.alt || '';
                box.classList.add('show');
            } else if (box.classList.contains('show')) {
                box.classList.remove('show');
            }
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') box.classList.remove('show');
        });
    }

    // ---------- Prev/next navigation at the bottom of project pages ----------
    // Top-level pages cycle through main projects only; the End Effector
    // prototype sub-pages get a local flow so vague sub-page titles
    // ("Final Prototype") never appear on main-project pages.
    const MAIN_ORDER = [
        'inverse-kinematics', 'arm', 'effector',
        'electrospray', 'boom', 'soup', 'blade',
    ];
    const SUB_ORDER = ['effector', 'effector-p1', 'effector-p2', 'electrospray'];
    function injectProjectNav() {
        const id = document.body.dataset.projectId;
        const footHost = document.getElementById('footer-placeholder');
        if (!id || !footHost || document.querySelector('.project-nav')) return;
        const order = MAIN_ORDER.includes(id) ? MAIN_ORDER : SUB_ORDER;
        const i = order.indexOf(id);
        if (i === -1) return;
        const prev = order[(i - 1 + order.length) % order.length];
        const next = order[(i + 1) % order.length];
        const nav = document.createElement('nav');
        nav.className = 'project-nav';
        nav.innerHTML =
            '<a class="pn-prev" href="project-' + prev + '.html">' +
            '<span class="pn-label">← Previous</span>' +
            '<span class="pn-name"></span></a>' +
            '<a class="pn-next" href="project-' + next + '.html">' +
            '<span class="pn-label">Next →</span>' +
            '<span class="pn-name"></span></a>';
        nav.querySelector('.pn-prev .pn-name').textContent = PROJECTS[prev];
        nav.querySelector('.pn-next .pn-name').textContent = PROJECTS[next];
        document.body.insertBefore(nav, footHost);
    }

    // ---------- Touch devices: first tap opens a dropdown, second tap follows the link ----------
    function bindTouchDropdowns() {
        if (!window.matchMedia('(hover: none)').matches) return;
        document.addEventListener('click', (e) => {
            const trigger = e.target.closest('.dropdown > a, .has-sub > a');
            if (trigger) {
                const parent = trigger.parentElement;
                if (!parent.classList.contains('open')) {
                    e.preventDefault();
                    document
                        .querySelectorAll('.dropdown.open, .has-sub.open')
                        .forEach((el) => {
                            if (!el.contains(parent)) el.classList.remove('open');
                        });
                    parent.classList.add('open');
                }
                return;
            }
            document
                .querySelectorAll('.dropdown.open, .has-sub.open')
                .forEach((el) => el.classList.remove('open'));
        });
    }

    // ---------- Load partials (navbar + footer) ----------
    function loadPartials() {
        const navHost = document.getElementById('nav-placeholder');
        const footHost = document.getElementById('footer-placeholder');
        const tasks = [];
        if (navHost) {
            tasks.push(
                fetch('navbar.html')
                    .then((r) => r.text())
                    .then((d) => {
                        navHost.innerHTML = d;
                    })
            );
        }
        if (footHost) {
            tasks.push(
                fetch('footer.html')
                    .then((r) => r.text())
                    .then((d) => {
                        footHost.innerHTML = d;
                    })
            );
        }
        return Promise.all(tasks);
    }

    // ---------- Boot ----------
    function boot() {
        injectAtmosphere();
        bindScroll();
        bindReveal();
        bindCardLight();
        bindTouchDropdowns();
        bindLightbox();
        injectProjectNav();
        bindMarquee();
        syncProjectNames();
        loadPartials().then(syncProjectNames);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
