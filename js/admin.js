// Admin Panel Functionality

// Check authentication on load
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadTheme();
    updateDashboard();
    showSection('dashboard');
});

// Authentication check
function checkAuth() {
    const isAuthenticated = sessionStorage.getItem('adminAuthenticated');
    const loginTime = sessionStorage.getItem('loginTime');
    
    // Session expires after 2 hours
    const SESSION_DURATION = 2 * 60 * 60 * 1000;
    
    if (!isAuthenticated || !loginTime || (Date.now() - parseInt(loginTime)) > SESSION_DURATION) {
        logout();
        return false;
    }
    return true;
}

// Logout
function logout() {
    sessionStorage.removeItem('adminAuthenticated');
    sessionStorage.removeItem('loginTime');
    window.location.href = 'login.html';
}

// Show section
function showSection(section) {
    // Update nav
    document.querySelectorAll('.admin-nav a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('onclick').includes(section)) {
            link.classList.add('active');
        }
    });

    // Hide all sections
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.classList.remove('active');
    });

    // Show selected
    const selected = document.getElementById(section + '-section');
    if (selected) {
        selected.classList.add('active');
    }

    // Update title
    const titles = {
        'dashboard': 'Dashboard',
        'new-post': 'Create New Post',
        'posts': 'All Posts',
        'settings': 'Settings'
    };
    document.getElementById('pageTitle').textContent = titles[section] || 'Admin Panel';

    // Refresh data if needed
    if (section === 'dashboard') updateDashboard();
    if (section === 'posts') renderAllPosts();
}

// Update dashboard stats
function updateDashboard() {
    const stats = DataManager.getStats();
    
    document.getElementById('totalPosts').textContent = stats.total;
    document.getElementById('totalViews').textContent = stats.views.toLocaleString();
    document.getElementById('thisWeek').textContent = stats.thisWeek;
    document.getElementById('categories').textContent = stats.categories;

    // Recent posts table
    const posts = DataManager.getPosts().slice(0, 5);
    const tbody = document.getElementById('recentPostsTable');
    
    if (tbody) {
        tbody.innerHTML = posts.map(post => `
            <tr>
                <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <img src="${post.image}" class="post-thumb" onerror="this.src='https://via.placeholder.com/60x40'">
                        <span style="font-weight: 600;">${post.title.substring(0, 40)}...</span>
                    </div>
                </td>
                <td><span class="category-tag" style="font-size: 0.75rem;">${post.category}</span></td>
                <td>${formatDate(post.date)}</td>
                <td>${post.views || 0}</td>
                <td>
                    <div class="action-btns">
                        <button class="btn-icon btn-edit" onclick="editPost(${post.id})" title="Edit">✏️</button>
                        <button class="btn-icon btn-delete" onclick="deletePost(${post.id})" title="Delete">🗑️</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
}

// Render all posts
function renderAllPosts() {
    const posts = DataManager.getPosts();
    const tbody = document.getElementById('allPostsTable');
    
    if (tbody) {
        tbody.innerHTML = posts.map(post => `
            <tr>
                <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <img src="${post.image}" class="post-thumb" onerror="this.src='https://via.placeholder.com/60x40'">
                        <div>
                            <div style="font-weight: 600;">${post.title.substring(0, 50)}...</div>
                            <small style="color: var(--gray);">${post.excerpt.substring(0, 60)}...</small>
                        </div>
                    </div>
                </td>
                <td><span class="category-tag" style="font-size: 0.75rem;">${post.category}</span></td>
                <td>${post.author}</td>
                <td>${formatDate(post.date)}</td>
                <td>${post.views || 0}</td>
                <td>
                    <div class="action-btns">
                        <button class="btn-icon btn-edit" onclick="editPost(${post.id})" title="Edit">✏️</button>
                        <button class="btn-icon btn-delete" onclick="deletePost(${post.id})" title="Delete">🗑️</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
}

// Preview image
function previewImage() {
    const url = document.getElementById('postImage').value;
    const preview = document.getElementById('imagePreview');
    
    if (url && preview) {
        preview.src = url;
        preview.style.display = 'block';
        preview.onerror = function() {
            this.style.display = 'none';
            showToast('Invalid image URL', 'error');
        };
    }
}

// Save post
function savePost(e) {
    e.preventDefault();
    
    if (!checkAuth()) return false;

    const post = {
        id: Date.now(),
        title: document.getElementById('postTitle').value,
        category: document.getElementById('postCategory').value,
        image: document.getElementById('postImage').value,
        excerpt: document.getElementById('postExcerpt').value,
        content: document.getElementById('postContent').value.replace(/\n/g, '</p><p>'),
        author: document.getElementById('postAuthor').value,
        date: new Date().toISOString(),
        views: 0
    };

    DataManager.addPost(post);
    showToast('Post published successfully!', 'success');
    
    // Reset form
    document.getElementById('postForm').reset();
    document.getElementById('imagePreview').style.display = 'none';
    
    return false;
}

// Reset form
function resetForm() {
    document.getElementById('postForm').reset();
    document.getElementById('imagePreview').style.display = 'none';
}

// Edit post
function editPost(id) {

                              
