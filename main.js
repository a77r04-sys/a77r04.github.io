(function () {
    'use strict';

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
        bindMarquee();
        loadPartials();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
