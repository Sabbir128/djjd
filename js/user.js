// User Management System - GitHub Pages Compatible (No Backend)

const UserManager = {
    // Get current user
    getCurrentUser() {
        const user = localStorage.getItem('newsUser');
        return user ? JSON.parse(user) : this.createGuestUser();
    },

    // Create guest user
    createGuestUser() {
        const guest = {
            id: 'guest_' + Date.now(),
            name: 'অতিথি ব্যবহারকারী',
            email: null,
            isGuest: true,
            createdAt: new Date().toISOString(),
            preferredCategory: null
        };
        localStorage.setItem('newsUser', JSON.stringify(guest));
        return guest;
    },

    // Save user
    saveUser(userData) {
        const current = this.getCurrentUser();
        const updated = { ...current, ...userData, isGuest: false };
        localStorage.setItem('newsUser', JSON.stringify(updated));
        return updated;
    },

    // Logout (reset to guest)
    logout() {
        localStorage.removeItem('newsUser');
        localStorage.removeItem('userBookmarks');
        localStorage.removeItem('userLikes');
        localStorage.removeItem('userComments');
        localStorage.removeItem('readingHistory');
    },

    // Bookmarks
    getBookmarks() {
        const bookmarks = localStorage.getItem('userBookmarks');
        return bookmarks ? JSON.parse(bookmarks) : [];
    },

    addBookmark(articleId) {
        const bookmarks = this.getBookmarks();
        if (!bookmarks.includes(articleId)) {
            bookmarks.push(articleId);
            localStorage.setItem('userBookmarks', JSON.stringify(bookmarks));
            
            // Save to article data too
            this.saveToArticleBookmarks(articleId);
            return true;
        }
        return false;
    },

    removeBookmark(articleId) {
        let bookmarks = this.getBookmarks();
        bookmarks = bookmarks.filter(id => id !== articleId);
        localStorage.setItem('userBookmarks', JSON.stringify(bookmarks));
        
        // Remove from article data
        this.removeFromArticleBookmarks(articleId);
        return true;
    },

    isBookmarked(articleId) {
        return this.getBookmarks().includes(articleId);
    },

    // Likes
    getLikes() {
        const likes = localStorage.getItem('userLikes');
        return likes ? JSON.parse(likes) : [];
    },

    toggleLike(articleId) {
        const likes = this.getLikes();
        const index = likes.indexOf(articleId);
        
        if (index > -1) {
            likes.splice(index, 1);
            this.updateArticleLikes(articleId, -1);
            localStorage.setItem('userLikes', JSON.stringify(likes));
            return false; // Unliked
        } else {
            likes.push(articleId);
            this.updateArticleLikes(articleId, 1);
            localStorage.setItem('userLikes', JSON.stringify(likes));
            return true; // Liked
        }
    },

    hasLiked(articleId) {
        return this.getLikes().includes(articleId);
    },

    // Comments
    getUserComments() {
        const comments = localStorage.getItem('userComments');
        return comments ? JSON.parse(comments) : [];
    },

    addUserComment(comment) {
        const comments = this.getUserComments();
        comments.unshift(comment);
        localStorage.setItem('userComments', JSON.stringify(comments));
    },

    // Reading History
    addToHistory(articleId) {
        let history = this.getReadingHistory();
        // Remove if exists (move to top)
        history = history.filter(id => id !== articleId);
        history.unshift(articleId);
        // Keep only last 50
        if (history.length > 50) history = history.slice(0, 50);
        localStorage.setItem('readingHistory', JSON.stringify(history));
    },

    getReadingHistory() {
        const history = localStorage.getItem('readingHistory');
        return history ? JSON.parse(history) : [];
    },

    // Stats
    getUserStats() {
        return {
            bookmarks: this.getBookmarks().length,
            comments: this.getUserComments().length,
            likes: this.getLikes().length,
            readArticles: this.getReadingHistory().length
        };
    },

    // Helper: Update article bookmark count
    saveToArticleBookmarks(articleId) {
        const posts = DataManager.getPosts();
        const post = posts.find(p => p.id == articleId);
        if (post) {
            post.bookmarks = (post.bookmarks || 0) + 1;
            DataManager.savePosts(posts);
        }
    },

    removeFromArticleBookmarks(articleId) {
        const posts = DataManager.getPosts();
        const post = posts.find(p => p.id == articleId);
        if (post && post.bookmarks) {
            post.bookmarks = Math.max(0, post.bookmarks - 1);
            DataManager.savePosts(posts);
        }
    },

    // Helper: Update article like count
    updateArticleLikes(articleId, change) {
        const posts = DataManager.getPosts();
        const post = posts.find(p => p.id == articleId);
        if (post) {
            post.likes = (post.likes || 0) + change;
            DataManager.savePosts(posts);
        }
    }
};
