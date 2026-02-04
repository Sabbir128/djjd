// Article Page Functionality

let currentArticleId = null;
let currentArticle = null;

document.addEventListener('DOMContentLoaded', () => {
    // Get article ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    currentArticleId = urlParams.get('id');
    
    if (!currentArticleId) {
        window.location.href = 'index.html';
        return;
    }
    
    loadArticle();
    setupReadingProgress();
});

// Load article
function loadArticle() {
    currentArticle = DataManager.getPost(currentArticleId);
    
    if (!currentArticle) {
        showToast('আর্টিকেল পাওয়া যায়নি', 'error');
        setTimeout(() => window.location.href = 'index.html', 2000);
        return;
    }

    // Update views
    DataManager.incrementViews(currentArticleId);
    UserManager.addToHistory(currentArticleId);

    // Fill content
    document.getElementById('articleTitle').textContent = currentArticle.title;
    document.getElementById('articleCategory').textContent = currentArticle.category;
    document.getElementById('articleAuthor').textContent = currentArticle.author;
    document.getElementById('articleDate').textContent = formatDate(currentArticle.date);
    document.getElementById('articleViews').textContent = `👁️ ${(currentArticle.views || 0) + 1} বার দেখা`;
    document.getElementById('articleImage').src = currentArticle.image;
    document.getElementById('articleContent').innerHTML = currentArticle.content;
    
    // Reading time
    const wordCount = (currentArticle.content || '').split(/\s+/).length;
    const readTime = Math.ceil(wordCount / 200);
    document.getElementById('readingTime').textContent = `⏱️ ${readTime} মিনিট পড়ুন`;
    
    // Breadcrumb
    document.getElementById('breadcrumbCat').textContent = currentArticle.category;
    document.getElementById('breadcrumbCat').href = `category.html?cat=${currentArticle.category}`;
    document.getElementById('breadcrumbTitle').textContent = currentArticle.title.substring(0, 30) + '...';
    
    // Author
    document.getElementById('authorBoxName').textContent = currentArticle.author;
    document.getElementById('authorImage').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentArticle.author)}&background=random&size=100`;
    document.getElementById('authorBoxImage').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentArticle.author)}&background=random&size=150`;
    
    // Like button state
    updateLikeButton();
    
    // Bookmark button state
    updateBookmarkButton();
    
    // Load comments
    loadComments();
    
    // Load related articles
    loadRelatedArticles();
    
    // Load popular in category
    loadPopularInCategory();
}

// Setup reading progress bar
function setupReadingProgress() {
    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        document.getElementById('readingProgress').style.width = scrolled + '%';
    });
}

// Like functionality
function likeArticle() {
    const isLiked = UserManager.toggleLike(currentArticleId);
    updateLikeButton();
    
    if (isLiked) {
        showToast('লাইক করা হয়েছে! 👍', 'success');
    } else {
        showToast('লাইক সরানো হয়েছে', 'success');
    }
}

function updateLikeButton() {
    const isLiked = UserManager.hasLiked(currentArticleId);
    const likeBtn = document.getElementById('likeBtn');
    const likeIcon = document.getElementById('likeIcon');
    const likeCount = document.getElementById('likeCount');
    
    if (isLiked) {
        likeBtn.classList.add('active');
        likeIcon.textContent = '❤️';
    } else {
        likeBtn.classList.remove('active');
        likeIcon.textContent = '👍';
    }
    
    const article = DataManager.getPost(currentArticleId);
    likeCount.textContent = article?.likes || 0;
}

// Bookmark functionality
function bookmarkArticle() {
    const isBookmarked = UserManager.isBookmarked(currentArticleId);
    
    if (isBookmarked) {
        UserManager.removeBookmark(currentArticleId);
        showToast('বুকমার্ক সরানো হয়েছে', 'success');
    } else {
        UserManager.addBookmark(currentArticleId);
        showToast('বুকমার্ক করা হয়েছে! 🔖', 'success');
    }
    
    updateBookmarkButton();
}

function updateBookmarkButton() {
    const isBookmarked = UserManager.isBookmarked(currentArticleId);
    const bookmarkBtn = document.getElementById('bookmarkBtn');
    const bookmarkIcon = document.getElementById('bookmarkIcon');
    
    if (isBookmarked) {
        bookmarkBtn.classList.add('active');
        bookmarkIcon.textContent = '🔴';
    } else {
        bookmarkBtn.classList.remove('active');
        bookmarkIcon.textContent = '🔖';
    }
}

// Comments
function loadComments() {
    const comments = CommentManager.getComments(currentArticleId);
    document.getElementById('commentCount').textContent = comments.length;
    
    const list = document.getElementById('commentsList');
    if (comments.length === 0) {
        list.innerHTML = '<p style="text-align: center; color: var(--gray); padding: 20px;">কোনো মন্তব্য নেই। প্রথম মন্তব্য করুন!</p>';
        return;
    }
    
    list.innerHTML = comments.map(c => `
        <div class="comment-item">
            <div class="comment-header">
                <strong>${c.name}</strong>
                <span>${formatDate(c.date)}</span>
            </div>
            <p class="comment-text">${c.text}</p>
            <div class="comment-actions">
                <button onclick="likeComment(${c.id})">👍 ${c.likes || 0}</button>
            </div>
        </div>
    `).join('');
}

function addComment(e) {
    e.preventDefault();
    
    const name = document.getElementById('commentName').value;
    const email = document.getElementById('commentEmail').value;
    const text = document.getElementById('commentText').value;
    
    CommentManager.addComment(currentArticleId, name, email, text);
    
    // Clear form
    document.getElementById('commentText').value = '';
    
    // Reload comments
    loadComments();
    
    showToast('মন্তব্য পোস্ট করা হয়েছে!', 'success');
}

function likeComment(commentId) {
    CommentManager.likeComment(commentId);
    loadComments();
}

// Share functionality
function shareArticle() {
    document.getElementById('shareModal').style.display = 'flex';
}

function closeShareModal() {
    document.getElementById('shareModal').style.display = 'none';
}

function shareTo(platform) {
    const url = window.location.href;
    const title = currentArticle?.title || 'News Article';
    
    let shareUrl = '';
    switch(platform) {
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
            break;
        case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
            break;
        case 'whatsapp':
            shareUrl = `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`;
            break;
    }
    
    if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=400');
    }
    closeShareModal();
}

function copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
        showToast('লিংক কপি করা হয়েছে!', 'success');
        closeShareModal();
    });
}

// Print
function printArticle() {
    window.print();
}

// Font size
let currentFontSize = 18;
function changeFontSize(change) {
    const content = document.getElementById('articleContent');
    if (change === 0) {
        currentFontSize = 18;
    } else {
        currentFontSize += change * 2;
        currentFontSize = Math.max(14, Math.min(26, currentFontSize));
    }
    content.style.fontSize = currentFontSize + 'px';
}

// Related articles
function loadRelatedArticles() {
    const posts = DataManager.getPosts().filter(p => 
        p.id != currentArticleId && p.category === currentArticle?.category
    ).slice(0, 3);
    
    const container = document.getElementById('relatedArticles');
    container.innerHTML = posts.map(p => `
        <a href="article.html?id=${p.id}" class="related-article">
            <img src="${p.image}" alt="" onerror="this.src='https://via.placeholder.com/100x80'">
            <div>
                <h5>${p.title}</h5>
                <small>${formatDate(p.date)}</small>
            </div>
        </a>
    `).join('') || '<p>সম্পর্কিত খবর নেই</p>';
}

// Popular in category
function loadPopularInCategory() {
    const posts = DataManager.getPosts()
        .filter(p => p.category === currentArticle?.category && p.id != currentArticleId)
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 5);
    
    const container = document.getElementById('popularInCategory');
    container.innerHTML = posts.map((p, i) => `
        <a href="article.html?id=${p.id}" class="popular-item">
            <span class="pop-number">${i + 1}</span>
            <div>
                <h5>${p.title}</h5>
                <small>${p.views || 0} views</small>
            </div>
        </a>
    `).join('') || '<p>কোনো খবর নেই</p>';
}

// Toast
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    if (toast && toastMessage) {
        toastMessage.textContent = message;
        toast.className = `toast ${type} show`;
        setTimeout(() => toast.classList.remove('show'), 3000);
    } else {
        alert(message);
    }
}
