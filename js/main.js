// Main Website Functionality

document.addEventListener('DOMContentLoaded', () => {
    renderPosts();
    updateDate();
    loadTheme();
    loadTicker();
});

// Load theme
function loadTheme() {
    const theme = getTheme();
    document.documentElement.setAttribute('data-theme', theme);
}

// Load ticker text
function loadTicker() {
    const settings = DataManager.getSettings();
    const ticker = document.getElementById('ticker-text');
    if (ticker && settings.tickerText) {
        ticker.textContent = settings.tickerText;
    }
}

// Update date
function updateDate() {
    const dateEl = document.getElementById('current-date');
    if (dateEl) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateEl.textContent = new Date().toLocaleDateString('en-US', options);
    }
}

// Render all posts
function renderPosts(category = 'all') {
    const posts = DataManager.getPostsByCategory(category);
    const sorted = posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    renderHero(sorted.slice(0, 4));
    renderGrid(sorted.slice(4));
}

// Render hero section
function renderHero(posts) {
    const heroSection = document.getElementById('heroSection');
    if (!heroSection || posts.length === 0) return;

    const main = posts[0];
    const sides = posts.slice(1, 4);

    heroSection.innerHTML = `
        <div class="hero-main" onclick="openArticle(${main.id})">
            <img src="${main.image}" alt="${main.title}" onerror="this.src='https://via.placeholder.com/800x500?text=NewsDaily'">
            <div class="hero-overlay">
                <span class="category-tag">${main.category}</span>
                <h1 class="hero-title">${main.title}</h1>
                <div class="hero-meta">
                    <span>By ${main.author}</span>
                    <span>${formatDate(main.date)}</span>
                    <span>${main.views || 0} views</span>
                </div>
            </div>
        </div>
        <div class="hero-side">
            ${sides.map(post => `
                <div class="side-card" onclick="openArticle(${post.id})">
                    <img src="${post.image}" alt="${post.title}" onerror="this.src='https://via.placeholder.com/400x200?text=News'">
                    <div class="side-overlay">
                        <span class="category-tag" style="font-size: 0.7rem; padding: 2px 8px;">${post.category}</span>
                        <h3 class="side-title">${post.title}</h3>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Render news grid
function renderGrid(posts) {
    const grid = document.getElementById('newsGrid');
    if (!grid) return;

    if (posts.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--gray);">No more articles available.</p>';
        return;
    }

    grid.innerHTML = posts.map(post => `
        <article class="news-card" onclick="openArticle(${post.id})">
            <div style="overflow: hidden;">
                <img class="news-image" src="${post.image}" alt="${post.title}" onerror="this.src='https://via.placeholder.com/400x300?text=NewsDaily'">
            </div>
            <div class="news-content">
                <div class="news-category">${post.category}</div>
                <h3 class="news-title">${post.title}</h3>
                <p class="news-excerpt">${post.excerpt}</p>
                <div class="news-meta">
                    <div class="author">
                        <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(post.author)}&background=random" class="author-avatar" alt="">
                        <span>${post.author}</span>
                    </div>
                    <span>${formatDate(post.date)}</span>
                </div>
            </div>
        </article>
    `).join('');
}

// Open article
function openArticle(id) {
    const post = DataManager.getPost(id);
    if (!post) return;

    // Increment views
    DataManager.incrementViews(id);

    const mainContent = document.getElementById('mainContent');
    const articlePage = document.getElementById('articlePage');
    const footer = document.querySelector('footer');

    if (mainContent) mainContent.style.display = 'none';
    if (footer) footer.style.display = 'none';
    if (articlePage) {
        articlePage.style.display = 'block';
        
        document.getElementById('articleImage').src = post.image;
        document.getElementById('articleCategory').textContent = post.category;
        document.getElementById('articleTitle').textContent = post.title;
        document.getElementById('articleAuthor').textContent = `By ${post.author}`;
        document.getElementById('articleDate').textContent = formatDate(post.date);
        document.getElementById('articleReadTime').textContent = `${Math.ceil((post.content || '').length / 1000)} min read`;
        document.getElementById('articleViews').textContent = `${post.views || 0} views`;
        document.getElementById('articleContent').innerHTML = post.content || post.excerpt;
        
        window.scrollTo(0, 0);
    }
}

// Show home
function showHome() {
    const mainContent = document.getElementById('mainContent');
    const articlePage = document.getElementById('articlePage');
    const footer = document.querySelector('footer');

    if (mainContent) mainContent.style.display = 'block';
    if (footer) footer.style.display = 'block';
    if (articlePage) articlePage.style.display = 'none';
    
    window.scrollTo(0, 0);
}

// Filter by category
function filterCategory(category) {
    renderPosts(category);
    showHome();
    
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
        window.scrollTo({ top: heroSection.offsetTop - 100, behavior: 'smooth' });
    }
}

// Mobile menu toggle
function toggleMobileMenu() {
    const navMenu = document.getElementById('navMenu');
    if (navMenu) {
        navMenu.classList.toggle('active');
    }
}

// Toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    if (toast && toastMessage) {
        toastMessage.textContent = message;
        toast.className = `toast ${type} show`;
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
          }
      
