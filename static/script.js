
function createParticles() {
    if (document.getElementById('particles-canvas')) return;
    const canvas = document.createElement('canvas');
    canvas.id = 'particles-canvas';
    document.body.prepend(canvas);
    const ctx = canvas.getContext('2d');
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    const pts = Array.from({ length: 70 }, () => ({
        x: Math.random() * canvas.width, y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.3,
        dx: (Math.random() - 0.5) * 0.35, dy: (Math.random() - 0.5) * 0.35,
        a: Math.random() * 0.5 + 0.15
    }));

    (function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        pts.forEach(p => {
            ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(229,9,20,${p.a})`; ctx.fill();
            p.x += p.dx; p.y += p.dy;
            if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
        });
        requestAnimationFrame(draw);
    })();
}


function injectNavbar() {
    if (document.getElementById('critiq-navbar')) return;

    const nav = document.createElement('nav');
    nav.id = 'critiq-navbar';
    nav.className = 'navbar';
    nav.innerHTML = `
        <div class="navbar-logo">CRITIQ</div>
        <ul class="navbar-links">
            <a href="#" class="nav-link active" data-page="home">Home</a>
            <a href="#" class="nav-link" data-page="about">About</a>
            <a href="#" class="nav-link" data-page="details">Movie Details</a>
        </ul>
    `;
    document.body.prepend(nav);

    nav.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            nav.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            showPage(link.dataset.page);
        });
    });
}


function injectPages() {
    if (document.getElementById('page-about')) return;

    
    const about = document.createElement('div');
    about.id = 'page-about';
    about.className = 'page';
    about.innerHTML = `
        <div class="about-section">
            <div class="about-hero">
                <h2>About CRITIQ</h2>
                <p>CRITIQ is an AI-powered movie recommendation engine that understands your taste and surfaces films you'll actually love — powered by content-based filtering and cosine similarity.</p>
            </div>
            <div class="about-cards">
                <div class="about-card">
                    <div class="about-card-icon">🎬</div>
                    <h3>Smart Picks</h3>
                    <p>Our ML model analyzes genres, cast, crew, and keywords to find movies that match your vibe.</p>
                </div>
                <div class="about-card">
                    <div class="about-card-icon">⚡</div>
                    <h3>Instant Results</h3>
                    <p>Get 5 tailored recommendations in milliseconds using precomputed similarity vectors.</p>
                </div>
                <div class="about-card">
                    <div class="about-card-icon">🎭</div>
                    <h3>5000+ Movies</h3>
                    <p>Built on the TMDB dataset covering thousands of films across every genre and era.</p>
                </div>
            </div>
            <div class="tech-stack">
                <h3>Built With</h3>
                <div class="tech-badges">
                    <span class="badge">Python</span>
                    <span class="badge">Streamlit</span>
                    <span class="badge">Scikit-learn</span>
                    <span class="badge">Pandas</span>
                    <span class="badge">TMDB API</span>
                    <span class="badge">NLP</span>
                    <span class="badge">Cosine Similarity</span>
                </div>
            </div>
        </div>
    `;

    
    const details = document.createElement('div');
    details.id = 'page-details';
    details.className = 'page';
    details.innerHTML = `
        <div class="details-section">
            <div class="details-hero">
                <h2>Movie Details</h2>
                <p>Select a movie on the home page and click Recommend to see details here</p>
            </div>
            <div id="details-content" style="text-align:center; color:#444; font-size:0.9rem; letter-spacing:2px; text-transform:uppercase; margin-top:4rem;">
                No movie selected yet
            </div>
        </div>
    `;

    document.body.appendChild(about);
    document.body.appendChild(details);
}


function showPage(page) {
    const mainBlock = document.querySelector('[data-testid="stMainBlockContainer"]');
    const aboutPage = document.getElementById('page-about');
    const detailsPage = document.getElementById('page-details');

    if (!mainBlock || !aboutPage || !detailsPage) return;

    if (page === 'home') {
        mainBlock.style.display = 'block';
        aboutPage.classList.remove('active');
        detailsPage.classList.remove('active');
    } else if (page === 'about') {
        mainBlock.style.display = 'none';
        aboutPage.classList.add('active');
        detailsPage.classList.remove('active');
    } else if (page === 'details') {
        mainBlock.style.display = 'none';
        aboutPage.classList.remove('active');
        detailsPage.classList.add('active');
        populateDetails();
    }
}


function populateDetails() {
    const container = document.getElementById('details-content');
    if (!container) return;
    const stored = window._lastRecommendations;
    if (!stored || stored.length === 0) {
        container.innerHTML = '<p style="color:#444;letter-spacing:2px;text-transform:uppercase;">No recommendations yet — go to Home first</p>';
        return;
    }
    container.innerHTML = `
        <div class="details-grid">
            ${stored.map((m, i) => `
                <div class="detail-card">
                    <img src="${m.poster}" style="width:100%;border-radius:12px;margin-bottom:1rem;" onerror="this.src='https://via.placeholder.com/300x450?text=No+Poster'">
                    <div class="detail-card-label">Recommendation #${i + 1}</div>
                    <div class="detail-card-value">${m.title}</div>
                </div>
            `).join('')}
        </div>
    `;
}


function captureRecommendations() {
    const captions = document.querySelectorAll('[data-testid="stCaptionContainer"] p');
    const images = document.querySelectorAll('[data-testid="stImage"] img');
    if (captions.length >= 5 && images.length >= 5) {
        window._lastRecommendations = Array.from({ length: 5 }, (_, i) => ({
            title: captions[i]?.innerText || '',
            poster: images[i]?.src || ''
        }));
    }
}


function animateCards() {
    const cols = document.querySelectorAll('[data-testid="stHorizontalBlock"] > div');
    cols.forEach((col, i) => {
        if (col.dataset.animated) return;
        col.dataset.animated = '1';
        col.style.cssText += `opacity:0;transform:translateY(30px);transition:opacity 0.5s ease ${i*0.1}s,transform 0.5s ease ${i*0.1}s`;
        setTimeout(() => { col.style.opacity = '1'; col.style.transform = 'translateY(0)'; }, 80 + i * 100);
    });
}


const observer = new MutationObserver(() => {
    injectNavbar();
    injectPages();
    animateCards();
    captureRecommendations();
});
observer.observe(document.body, { childList: true, subtree: true });


createParticles();
injectNavbar();
injectPages();
