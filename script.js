/**
 * WY MovieBox - Enhanced Main JavaScript Logic (v6.0)
 * Improved with search functionality, better error handling, and optimized code
 */

// ============================================================================
// GLOBAL STATE VARIABLES
// ============================================================================

let videos = {};
let translations = {};
let favorites = [];
let currentPlayingMovie = null;
let currentSettings = {};
let searchCache = {};

const defaultSettings = {
    language: 'myanmar',
    theme: 'dark',
};

const ADULT_WEBVIEW_URL = 'https://allkar.vercel.app/';
const MODAPP_WEBVIEW_URL = 'https://world-tv-2-bywaiyan.vercel.app/';

// ============================================================================
// 1. DATA FETCHING AND INITIALIZATION
// ============================================================================

async function loadDataFromJSON() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        videos = data.videos || {};
        translations = data.translations || {};
        buildSearchCache();
        console.log("✓ Data loaded successfully from JSON.");
        
        listenNotifications();
    } catch (e) {
        console.error("✗ Failed to load JSON data:", e);
        const t = translations.myanmar || { 
            Error: "အမှား", 
            jsonError: "ရုပ်ရှင်ဒေတာများ ဖတ်ယူနိုင်ခြင်း မရှိပါ (JSON Error)။" 
        };
        showCustomAlert(t.Error, t.jsonError);
    }
}

function generateVideoIds() {
    let idCounter = 1;
    for (const category in videos) {
        if (Array.isArray(videos[category])) {
            videos[category] = videos[category].map(movie => {
                if (!movie.id) {
                    movie.id = 'v' + idCounter++;
                }
                return movie;
            });
        }
    }
}

function buildSearchCache() {
    searchCache = {};
    for (const category in videos) {
        if (Array.isArray(videos[category])) {
            videos[category].forEach(movie => {
                const searchKey = (movie.title || '').toLowerCase();
                if (!searchCache[searchKey]) {
                    searchCache[searchKey] = [];
                }
                searchCache[searchKey].push(movie);
            });
        }
    }
}

function enableButtons() {
    const navBar = document.getElementById('nav-bar');
    const menuBar = document.getElementById('menu-bar');
    const loadingIndicator = document.getElementById('loading-indicator');
    
    if (loadingIndicator) {
        loadingIndicator.remove();
    }
    
    if (navBar) {
        navBar.classList.remove('pointer-events-none', 'opacity-50');
    }
    
    if (menuBar) {
        menuBar.classList.remove('pointer-events-none', 'opacity-50');
    }
}

window.initializeApp = async function() {
    console.log("🎬 Initializing WY MovieBox app...");
    
    await loadDataFromJSON(); 
    generateVideoIds(); 

    const storedSettings = localStorage.getItem('userSettings');
    const storedFavorites = localStorage.getItem('favorites');
    
    try {
        currentSettings = storedSettings ? { ...defaultSettings, ...JSON.parse(storedSettings) } : { ...defaultSettings };
    } catch (e) {
        console.warn("⚠ Settings parse error, using defaults");
        currentSettings = { ...defaultSettings };
    }
    
    try {
        favorites = storedFavorites ? JSON.parse(storedFavorites) : [];
        if (!Array.isArray(favorites)) favorites = [];
    } catch (e) {
        console.warn("⚠ Favorites parse error");
        favorites = [];
    }
    
    applySettings();
    enableButtons(); 
    
    const homeBtn = document.querySelector('.nav-btn[data-nav="home"]');
    if (homeBtn) {
        changeNav(homeBtn); 
    }
}

// ============================================================================
// 2. NOTIFICATION MANAGEMENT
// ============================================================================

window.toggleNotiModal = function() {
    const modal = document.getElementById('noti-modal');
    if (modal) {
        modal.classList.toggle('hidden');
        if (!modal.classList.contains('hidden')) {
            const badge = document.getElementById('noti-badge');
            if (badge) badge.classList.add('hidden');
        }
    }
}

function listenNotifications() {
    if (typeof firebase !== 'undefined') {
        try {
            firebase.database().ref('notifications').limitToLast(10).on('value', (snapshot) => {
                const notiList = document.getElementById('noti-list');
                const badge = document.getElementById('noti-badge');
                const data = snapshot.val();
                
                if (data && notiList) {
                    if (badge) badge.classList.remove('hidden');
                    notiList.innerHTML = "";
                    Object.values(data).reverse().forEach(noti => {
                        const notiDiv = document.createElement('div');
                        notiDiv.className = 'noti-item';
                        notiDiv.innerHTML = `
                            <h4 class="font-bold text-primary text-sm">${noti.title || 'Notification'}</h4>
                            <p class="text-gray-300 text-xs mt-1 leading-relaxed">${noti.message || ''}</p>
                            <span class="noti-time text-[10px] text-gray-500 mt-2 block">${noti.date || ''}</span>
                        `;
                        notiList.appendChild(notiDiv);
                    });
                }
            });
        } catch (e) {
            console.warn("⚠ Notification listener error:", e);
        }
    }
}

// ============================================================================
// 3. SEARCH FUNCTIONALITY (NEW)
// ============================================================================

window.toggleSearchModal = function() {
    const modal = document.getElementById('search-modal');
    if (modal) {
        modal.classList.toggle('hidden');
        if (!modal.classList.contains('hidden')) {
            const searchInput = document.getElementById('search-input');
            if (searchInput) {
                searchInput.focus();
                searchInput.value = '';
            }
        }
    }
}

window.performSearch = function(query) {
    const resultsContainer = document.getElementById('search-results');
    if (!resultsContainer) return;
    
    if (!query || query.trim().length < 1) {
        resultsContainer.innerHTML = '';
        return;
    }
    
    const searchQuery = query.toLowerCase().trim();
    const results = [];
    
    // Search through all videos
    for (const category in videos) {
        if (Array.isArray(videos[category])) {
            videos[category].forEach(movie => {
                if ((movie.title || '').toLowerCase().includes(searchQuery)) {
                    results.push(movie);
                }
            });
        }
    }
    
    // Display results
    resultsContainer.innerHTML = '';
    if (results.length === 0) {
        resultsContainer.innerHTML = '<p class="text-gray-500 text-center py-4">ရုပ်ရှင်မတွေ့ရှိပါ။</p>';
        return;
    }
    
    results.slice(0, 10).forEach(movie => {
        const resultItem = document.createElement('div');
        resultItem.className = 'search-result-item';
        resultItem.innerHTML = `
            <img src="${movie.thumb}" alt="${movie.title}" class="search-result-thumb" onerror="this.src='https://placehold.co/40x40/333/999?text=No+Image';">
            <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-white truncate">${movie.title}</p>
            </div>
        `;
        resultItem.onclick = () => {
            window.playVideo(movie.id);
            toggleSearchModal();
        };
        resultsContainer.appendChild(resultItem);
    });
}

// ============================================================================
// 4. UI AND VIEW MANAGEMENT
// ============================================================================

function applySettings() {
    const lang = currentSettings.language;
    const body = document.getElementById('body-root');
    
    if (currentSettings.theme === 'light') {
        body.classList.add('light-mode');
        const header = document.getElementById('header-sticky');
        if (header) {
            header.classList.remove('bg-darkbg');
            header.classList.add('bg-midbg');
        }
    } else {
        body.classList.remove('light-mode');
        const header = document.getElementById('header-sticky');
        if (header) {
            header.classList.remove('bg-midbg');
            header.classList.add('bg-darkbg');
        }
    }

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        if (translations[lang] && translations[lang][key]) {
            el.textContent = translations[lang][key];
        } else if (translations.myanmar && translations.myanmar[key]) {
            el.textContent = translations.myanmar[key]; 
        }
    });
}

window.changeTheme = function(theme) {
    currentSettings.theme = theme;
    localStorage.setItem('userSettings', JSON.stringify(currentSettings));
    applySettings();
}

window.changeNav = function(btn) {
    const nav = btn.dataset.nav;
    const navBtns = document.querySelectorAll('.nav-btn');
    const menuBar = document.getElementById('menu-bar');
    const playerContainer = document.getElementById('player-container');
    const currentTitleBar = document.querySelector('.max-w-4xl.mx-auto.flex.justify-between.items-center.mt-0.mb-6.px-2.w-full');
    const moviesContainer = document.getElementById('movies');
    
    navBtns.forEach(b => {
        b.classList.remove('text-primary', 'font-bold');
        b.classList.add('text-gray-400', 'hover:text-white');
    });

    btn.classList.add('text-primary', 'font-bold');
    btn.classList.remove('text-gray-400', 'hover:text-white'); 

    if (moviesContainer) moviesContainer.innerHTML = '';
    
    if (nav === 'profile' || nav === 'admin' || nav === 'modapp') {
        if (menuBar) menuBar.classList.add('hidden');
        if (playerContainer) playerContainer.classList.add('hidden');
        if (currentTitleBar) currentTitleBar.classList.add('hidden'); 
        if (moviesContainer) {
            moviesContainer.classList.remove('grid', 'grid-cols-2', 'sm:grid-cols-3', 'md:grid-cols-4', 'lg:grid-cols-5', 'gap-3', 'justify-items-center', 'px-0');
            moviesContainer.classList.add('flex', 'flex-col', 'w-full', 'pt-4'); 
        }
    } else {
        if (menuBar) menuBar.classList.remove('hidden');
        if (playerContainer) playerContainer.classList.remove('hidden');
        if (currentTitleBar) currentTitleBar.classList.remove('hidden'); 
        if (moviesContainer) {
            moviesContainer.classList.remove('flex', 'flex-col', 'w-full', 'pt-4');
            moviesContainer.classList.add('grid', 'grid-cols-2', 'sm:grid-cols-3', 'md:grid-cols-4', 'lg:grid-cols-5', 'gap-3', 'justify-items-center', 'px-0');
        }
    }

    switch (nav) {
        case 'home':
            const activeCategoryBtn = document.querySelector('.menu-btn.active-category') || document.querySelector('.menu-btn[data-category="action"]');
            if (activeCategoryBtn) showCategory(activeCategoryBtn.dataset.category, activeCategoryBtn);
            break;
        case 'trending': displayTrending(); break;
        case 'favorites': displayFavorites(); break;
        case 'admin': displayAdminPanel(); break;
        case 'profile': displayProfileSettings(); break;
        case 'modapp': 
            window.open(MODAPP_WEBVIEW_URL, '_blank'); 
            const homeBtn = document.querySelector('.nav-btn[data-nav="home"]');
            if (homeBtn) setTimeout(() => changeNav(homeBtn), 100);
            break;
    }
}

// ============================================================================
// 5. PROFILE SETTINGS (MODERNIZED)
// ============================================================================

function displayProfileSettings() {
    const moviesContainer = document.getElementById('movies');
    if (!moviesContainer) return;
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};
    const t = translations[currentSettings.language] || translations.myanmar;
    const userName = currentUser.name || currentUser.email?.split('@')[0] || 'User';

    moviesContainer.innerHTML = `
        <div class="max-w-md mx-auto w-full space-y-6 pb-24 px-2">
            <!-- Profile Card -->
            <div class="profile-gradient-card p-8 rounded-[2.5rem] shadow-2xl text-center relative overflow-hidden">
                <div class="relative z-10">
                    <div class="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full mx-auto p-1 mb-4 border-2 border-white/50 overflow-hidden shadow-inner">
                        <img src="https://ui-avatars.com/api/?name=${userName}&background=random" class="rounded-full w-full h-full object-cover" alt="Avatar">
                    </div>
                    <h2 class="text-2xl font-bold text-white">${userName}</h2>
                    <p class="text-blue-100 text-xs opacity-80">${currentUser.email || ''}</p>
                    <span class="inline-block mt-2 px-3 py-1 bg-black/20 rounded-full text-[10px] text-white uppercase tracking-wider">
                        ${currentUser.role === 'admin' ? 'Administrator' : 'Verified Member'}
                    </span>
                </div>
                <div class="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            </div>

            <!-- Preferences Section -->
            <div class="space-y-3">
                <h3 class="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] ml-4">ဆက်တင်များ</h3>
                
                <div class="setting-item-card">
                    <div class="flex items-center space-x-4">
                        <div class="bg-blue-500/10 p-2.5 rounded-2xl text-blue-400 shadow-sm">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 0h3m-3-3a13.05 13.05 0 01-2.81 7.393L14.5 18"></path></svg>
                        </div>
                        <span class="font-semibold text-sm">ဘာသာစကား</span>
                    </div>
                    <select onchange="changeLanguage(this.value)" class="bg-transparent text-sm text-gray-400 outline-none border-none cursor-pointer focus:ring-0">
                        <option value="myanmar" ${currentSettings.language === 'myanmar' ? 'selected' : ''}>မြန်မာ</option>
                        <option value="english" ${currentSettings.language === 'english' ? 'selected' : ''}>English</option>
                    </select>
                </div>

                <div class="setting-item-card" onclick="changeTheme(document.getElementById('theme-toggle').checked ? 'dark' : 'light')">
                    <div class="flex items-center space-x-4">
                        <div class="bg-yellow-500/10 p-2.5 rounded-2xl text-yellow-500 shadow-sm">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707"></path></svg>
                        </div>
                        <span class="font-semibold text-sm">အမှောင်ခွင်</span>
                    </div>
                    <input type="checkbox" id="theme-toggle" class="hidden" ${currentSettings.theme === 'dark' ? 'checked' : ''}>
                    <div class="w-10 h-5 bg-blue-600 rounded-full relative transition-colors shadow-inner">
                        <div class="absolute right-1 top-1 w-3 h-3 bg-white rounded-full transition-all ${currentSettings.theme === 'dark' ? 'translate-x-0' : '-translate-x-5'}"></div>
                    </div>
                </div>
            </div>

            <!-- Danger Zone -->
            <div class="pt-4">
                <button onclick="logout()" class="w-full bg-red-500/5 hover:bg-red-500 text-red-500 hover:text-white p-5 rounded-[2rem] font-bold transition-all duration-300 flex items-center justify-center space-x-3 border border-red-500/10 shadow-sm">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                    <span>အကောင့်မှ ထွက်ရန်</span>
                </button>
            </div>
            
            <button onclick="openAdultWebview()" class="w-full bg-gray-800/80 hover:bg-red-600 text-gray-400 hover:text-white p-4 rounded-3xl text-sm font-medium transition-all duration-300 flex items-center justify-center space-x-2 border border-gray-700">
                <span>🔞</span>
                <span>${t.adultContent || 'Adult Content (18+)'}</span>
            </button>
        </div>
    `;
}

// ============================================================================
// 6. VIDEO DISPLAY FUNCTIONS
// ============================================================================

window.showCategory = function(category, btn) {
    const moviesContainer = document.getElementById('movies');
    if (!moviesContainer) return;
    moviesContainer.innerHTML = '';
    
    document.querySelectorAll('.menu-btn').forEach(b => {
        b.classList.remove('active-category', 'active-category-blue', 'text-white');
        b.classList.add('bg-gray-800', 'text-white', 'hover:bg-gray-700');
    });

    if (btn) {
        btn.classList.add('active-category', 'active-category-blue', 'text-white');
        btn.classList.remove('bg-gray-800', 'hover:bg-gray-700');
    }

    const moviesList = videos[category] || [];
    if (moviesList.length === 0) {
        const t = translations[currentSettings.language] || translations.myanmar;
        moviesContainer.innerHTML = `<h2 class="text-xl font-bold text-center w-full mb-4 text-white/80 col-span-full">${t.noContent || 'No Content Available'}</h2>`;
        return;
    }
    moviesList.forEach(movie => moviesContainer.appendChild(createMovieCard(movie)));
};

function displayTrending() {
    const moviesContainer = document.getElementById('movies');
    if (!moviesContainer) return;
    const t = translations[currentSettings.language] || translations.myanmar;
    const trendingMovies = videos.trending || []; 
    moviesContainer.innerHTML = `<h2 class="text-xl font-bold text-center w-full mb-4 text-white/80 col-span-full">${t.trendingTitle || 'Trending Movies'}</h2>`;
    if (trendingMovies.length === 0) {
        moviesContainer.innerHTML += `<p class="text-center w-full text-gray-500 col-span-full">${t.noTrending || 'No trending content'}</p>`;
        return;
    }
    trendingMovies.forEach(movie => moviesContainer.appendChild(createMovieCard(movie)));
}

function displayFavorites() {
    const moviesContainer = document.getElementById('movies');
    if (!moviesContainer) return;
    const t = translations[currentSettings.language] || translations.myanmar;
    const favoriteMovies = favorites.map(id => findMovieById(id)).filter(movie => movie !== null);
    moviesContainer.innerHTML = `<h2 class="text-xl font-bold text-center w-full mb-4 text-white/80 col-span-full">${t.favoritesTitle || 'My Favorites'}</h2>`;
    if (favoriteMovies.length === 0) {
        moviesContainer.innerHTML += `<p class="text-center w-full text-gray-500 col-span-full py-20">${t.noFavorites || 'No favorites yet.'}</p>`;
        return;
    }
    favoriteMovies.forEach(movie => moviesContainer.appendChild(createMovieCard(movie)));
}

function createMovieCard(movie) {
    const movieId = movie.id; 
    const isFav = favorites.includes(movieId); 
    const t = translations[currentSettings.language] || translations.myanmar;
    const card = document.createElement('div');
    const bgColorClass = currentSettings.theme === 'light' ? 'bg-white' : 'bg-gray-800';
    
    card.className = `movie-card ${bgColorClass} rounded-lg shadow-md hover:shadow-primary/50 transition-all duration-300 transform hover:scale-[1.05] overflow-hidden cursor-pointer w-full flex flex-col group`;
    card.innerHTML = `
        <div class="relative w-full aspect-video" onclick="window.playVideo('${movieId}')"> 
            <img src="${movie.thumb}" alt="${movie.title}" class="w-full h-full object-cover absolute transition-transform group-hover:scale-110" onerror="this.src='https://placehold.co/200x112/333/999?text=No+Image';">
            <div class="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors"></div>
            <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <svg class="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"></path></svg>
            </div>
            ${isFav ? `<div class="absolute top-2 left-2 text-red-500 z-10 bg-black/50 p-1 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg></div>` : ''}
        </div>
        <div class="p-3 flex flex-col flex-grow">
            <p class="text-[0.75rem] font-semibold leading-tight mb-2 truncate text-white/90">${movie.title}</p> 
            <button onclick="window.playVideo('${movieId}')" class="mt-auto text-[0.7rem] font-bold text-primary border border-primary/50 py-2 px-3 rounded-lg hover:bg-primary hover:text-black transition-all">
                ▶ ${t.nowPlaying || 'Play'}
            </button>
        </div>
    `;
    return card;
}

window.playVideo = function(movieId) {
    const movie = findMovieById(movieId);
    if (!movie) {
        console.warn("⚠ Movie not found:", movieId);
        return;
    }
    currentPlayingMovie = movie;
    const iframePlayer = document.getElementById('iframePlayer');
    const currentMovieTitle = document.getElementById('current-movie-title');
    if (iframePlayer) iframePlayer.src = movie.src;
    if (currentMovieTitle) currentMovieTitle.textContent = movie.title;
    updateFavoriteButtonState(movieId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function findMovieById(id) {
    for (const category in videos) {
        if (Array.isArray(videos[category])) {
            const movie = videos[category].find(movie => movie.id === id);
            if (movie) return movie;
        }
    }
    return null;
}

function updateFavoriteButtonState(movieId) {
    const favoriteBtn = document.getElementById('favorite-btn');
    if (favoriteBtn) {
        favoriteBtn.classList.toggle('text-red-500', favorites.includes(movieId));
        favoriteBtn.classList.toggle('text-gray-500', !favorites.includes(movieId));
    }
}

window.toggleFavorite = function() {
    if (!currentPlayingMovie) return;
    const index = favorites.indexOf(currentPlayingMovie.id);
    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push(currentPlayingMovie.id);
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateFavoriteButtonState(currentPlayingMovie.id);
}

function toggleFullScreen() {
    const playerContainer = document.getElementById('player-container');
    if (!playerContainer) return;
    try {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            playerContainer.requestFullscreen();
        }
    } catch (e) {
        console.warn("⚠ Fullscreen error:", e);
    }
}

// ============================================================================
// 7. ADULT WEBVIEW MANAGEMENT
// ============================================================================

window.openAdultWebview = function() {
    const modal = document.getElementById('adult-webview-modal');
    if (!modal) {
        const newModal = document.createElement('div');
        newModal.id = 'adult-webview-modal';
        newModal.className = 'fixed inset-0 z-[120] flex flex-col bg-darkbg';
        newModal.innerHTML = `
            <header class="w-full bg-midbg border-b border-gray-700 p-4 flex justify-between items-center">
                <h2 class="text-xl font-bold text-primary">WY MovieBox 18+</h2>
                <button onclick="closeAdultWebview()" class="bg-primary text-black font-bold py-2 px-6 rounded-xl hover:opacity-90 transition">ပြန်သွားပါ</button>
            </header>
            <iframe id="adultWebviewIframe" src="${ADULT_WEBVIEW_URL}" class="flex-grow w-full border-none"></iframe>
        `;
        document.body.appendChild(newModal);
    } else {
        modal.classList.remove('hidden');
    }
    document.body.style.overflow = 'hidden';
}

window.closeAdultWebview = function() {
    const modal = document.getElementById('adult-webview-modal');
    if (modal) {
        const iframe = document.getElementById('adultWebviewIframe');
        if (iframe) iframe.src = 'about:blank';
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

// ============================================================================
// 8. SETTINGS AND LANGUAGE MANAGEMENT
// ============================================================================

window.changeLanguage = function(lang) {
    currentSettings.language = lang;
    localStorage.setItem('userSettings', JSON.stringify(currentSettings));
    applySettings();
    const currentNav = document.querySelector('.nav-btn.text-primary');
    if (currentNav) changeNav(currentNav);
}

// ============================================================================
// 9. ADMIN PANEL
// ============================================================================

function displayAdminPanel() {
    const moviesContainer = document.getElementById('movies');
    if (!moviesContainer) return;
    const t = translations[currentSettings.language] || translations.myanmar;
    
    moviesContainer.innerHTML = `
        <div class="admin-panel w-full">
            <h2 class="text-3xl font-bold text-primary mb-8">Admin Dashboard</h2>
            
            <!-- Notification Section -->
            <div class="admin-section">
                <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
                    <svg class="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5.951-1.429 5.951 1.429a1 1 0 001.169-1.409l-7-14z"></path></svg>
                    အကြောင်းကြားစာ ပေးပို့ခြင်း
                </h3>
                <input type="text" id="admin-noti-title" class="admin-input" placeholder="ခေါင်းစီး...">
                <textarea id="admin-noti-msg" class="admin-input h-24 mt-2" placeholder="အကြောင်းအရာ..."></textarea>
                <button onclick="window.sendNotification()" class="admin-btn mt-4 w-full">📢 အသုံးပြုသူများအားလုံးသို့ ပေးပို့ရန်</button>
            </div>

            <!-- User List Section -->
            <div class="admin-section">
                <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
                    <svg class="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM9 12a6 6 0 11-12 0 6 6 0 0112 0z"></path></svg>
                    အသုံးပြုသူများ
                </h3>
                <button onclick="window.loadUserList()" class="admin-btn mb-4 w-full">👥 အသုံးပြုသူများ ဖွင့်ရန်</button>
                <div id="user-list" class="user-list"></div>
            </div>
        </div>
    `;
}

// ============================================================================
// 10. UTILITY FUNCTIONS
// ============================================================================

function showCustomAlert(title, message) {
    const alertDiv = document.getElementById('simple-alert');
    if (alertDiv) {
        alertDiv.innerHTML = `
            <div class="fixed top-4 right-4 bg-red-600 text-white p-4 rounded-lg shadow-lg z-[110] max-w-sm">
                <h4 class="font-bold">${title}</h4>
                <p class="text-sm mt-1">${message}</p>
            </div>
        `;
        setTimeout(() => {
            alertDiv.innerHTML = '';
        }, 5000);
    } else {
        alert(`${title}: ${message}`);
    }
}

// Close search modal when clicking outside
document.addEventListener('click', function(event) {
    const searchModal = document.getElementById('search-modal');
    if (searchModal && !searchModal.classList.contains('hidden')) {
        if (!event.target.closest('#search-modal') && !event.target.closest('[onclick*="toggleSearchModal"]')) {
            // Allow closing only if clicking outside
        }
    }
});

// Close ad modal function
window.closeAdModal = function() {
    const modal = document.getElementById('ad-modal');
    if (modal) {
        modal.classList.add('hidden');
        const adContent = document.getElementById('ad-content');
        if (adContent) adContent.innerHTML = '';
    }
}
