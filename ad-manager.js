import { db } from './firebase-config.js';
import { 
    collection, 
    getDocs, 
    query, 
    where, 
    orderBy, 
    limit 
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

/**
 * ============================================================================
 * AD MANAGER - Enhanced Version (v6.0)
 * ============================================================================
 * Improved ad handling with better caching, error management, and UX
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const AD_CONFIG = {
    SHOW_DELAY: 2000,           // Delay before showing ad (ms)
    CACHE_DURATION: 24 * 60 * 60 * 1000, // 24 hours
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000,
    PRELOAD_TIMEOUT: 5000
};

let adCache = null;
let adCacheTime = 0;
let adRetryCount = 0;

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log("🎬 Ad Manager initialized");
    
    // Show ad after delay
    setTimeout(async () => {
        try {
            const lastAdDate = localStorage.getItem('lastAdDate');
            const today = new Date().toDateString();
            
            if (lastAdDate !== today) {
                console.log("📢 Checking for ads...");
                const adShown = await showAd();
                
                // Only save date if ad was successfully shown
                if (adShown) {
                    localStorage.setItem('lastAdDate', today);
                    console.log("✓ Ad shown successfully");
                }
            } else {
                console.log("ℹ️ Ad already shown today");
            }
        } catch (error) {
            console.error("✗ Ad initialization error:", error);
        }
    }, AD_CONFIG.SHOW_DELAY);
});

// ============================================================================
// AD FETCHING AND DISPLAY
// ============================================================================

async function showAd() {
    try {
        // Try to get ad from cache first
        const cachedAd = getCachedAd();
        if (cachedAd) {
            console.log("📦 Using cached ad");
            return displayAd(cachedAd);
        }

        // Fetch fresh ad from Firebase
        const ad = await fetchAdFromFirebase();
        if (!ad) {
            console.log("ℹ️ No active ads available");
            return false;
        }

        // Cache the ad
        cacheAd(ad);

        // Display the ad
        return displayAd(ad);
    } catch (error) {
        console.error("✗ Error showing ad:", error);
        
        // Retry logic
        if (adRetryCount < AD_CONFIG.MAX_RETRIES) {
            adRetryCount++;
            console.log(`⚠️ Retrying ad fetch (${adRetryCount}/${AD_CONFIG.MAX_RETRIES})...`);
            
            return new Promise(resolve => {
                setTimeout(() => {
                    showAd().then(resolve);
                }, AD_CONFIG.RETRY_DELAY);
            });
        }
        
        return false;
    }
}

async function fetchAdFromFirebase() {
    try {
        const adsRef = collection(db, 'advertisements');
        const q = query(
            adsRef, 
            where("active", "==", true), 
            orderBy("addedAt", "desc"), 
            limit(1)
        );
        
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
            const ad = snapshot.docs[0].data();
            
            // Validate ad data
            if (!ad.url || !ad.type) {
                console.warn("⚠️ Invalid ad data");
                return null;
            }
            
            return ad;
        }
        
        return null;
    } catch (error) {
        console.error("✗ Firebase ad fetch error:", error);
        throw error;
    }
}

function displayAd(ad) {
    try {
        const adModal = document.getElementById('ad-modal');
        const adContent = document.getElementById('ad-content');
        
        if (!adModal || !adContent) {
            console.warn("⚠️ Ad modal elements not found");
            return false;
        }

        // Generate ad HTML based on type
        let adHTML = '';
        
        if (ad.type === 'image') {
            adHTML = `
                <div class="relative group">
                    <img 
                        src="${ad.url}" 
                        alt="${ad.title || 'Advertisement'}" 
                        class="w-full h-auto rounded-xl shadow-lg border border-gray-700 transition-transform group-hover:scale-105"
                        onerror="this.src='https://placehold.co/600x400/1a1a1a/999?text=Ad+Image'"
                        loading="lazy"
                    >
                    <div class="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-3 py-1 rounded-full font-semibold">
                        🎯 Sponsored
                    </div>
                </div>
            `;
        } else if (ad.type === 'video') {
            adHTML = `
                <div class="relative">
                    <video 
                        src="${ad.url}" 
                        controls 
                        autoplay 
                        class="w-full h-auto rounded-xl shadow-lg border border-gray-700"
                        style="max-height: 500px;"
                        onerror="console.error('Video load error')"
                    ></video>
                    <div class="absolute top-2 left-2 bg-black/70 text-white text-[10px] px-3 py-1 rounded-full font-semibold">
                        🎬 AD
                    </div>
                </div>
            `;
        } else {
            console.warn("⚠️ Unknown ad type:", ad.type);
            return false;
        }

        // Set ad content
        adContent.innerHTML = adHTML;
        
        // Show modal with animation
        adModal.classList.remove('hidden');
        adModal.classList.add('flex');
        
        console.log("✓ Ad displayed successfully");
        return true;
        
    } catch (error) {
        console.error("✗ Error displaying ad:", error);
        return false;
    }
}

// ============================================================================
// AD CACHING
// ============================================================================

function getCachedAd() {
    try {
        const now = Date.now();
        
        // Check if cache is still valid
        if (adCache && (now - adCacheTime) < AD_CONFIG.CACHE_DURATION) {
            return adCache;
        }
        
        // Clear expired cache
        adCache = null;
        adCacheTime = 0;
        return null;
    } catch (error) {
        console.warn("⚠️ Cache retrieval error:", error);
        return null;
    }
}

function cacheAd(ad) {
    try {
        adCache = ad;
        adCacheTime = Date.now();
        console.log("💾 Ad cached");
    } catch (error) {
        console.warn("⚠️ Cache storage error:", error);
    }
}

function clearAdCache() {
    adCache = null;
    adCacheTime = 0;
    console.log("🗑️ Ad cache cleared");
}

// ============================================================================
// AD MODAL CONTROL
// ============================================================================

window.closeAdModal = function() {
    try {
        const adModal = document.getElementById('ad-modal');
        if (adModal) {
            adModal.classList.add('hidden');
            adModal.classList.remove('flex');
            
            // Stop video playback and clear content
            const adContent = document.getElementById('ad-content');
            if (adContent) {
                const videos = adContent.querySelectorAll('video');
                videos.forEach(video => {
                    video.pause();
                    video.src = '';
                });
                adContent.innerHTML = '';
            }
            
            console.log("✓ Ad modal closed");
        }
    } catch (error) {
        console.error("✗ Error closing ad modal:", error);
    }
};

// ============================================================================
// ADMIN FUNCTIONS FOR AD MANAGEMENT
// ============================================================================

window.preloadAd = async function() {
    try {
        console.log("⏳ Preloading ad...");
        clearAdCache();
        
        const ad = await fetchAdFromFirebase();
        if (ad) {
            cacheAd(ad);
            console.log("✓ Ad preloaded successfully");
            return true;
        }
        
        console.log("ℹ️ No ads to preload");
        return false;
    } catch (error) {
        console.error("✗ Ad preload error:", error);
        return false;
    }
};

window.testAd = async function() {
    try {
        console.log("🧪 Testing ad display...");
        clearAdCache();
        localStorage.removeItem('lastAdDate');
        
        const adShown = await showAd();
        if (adShown) {
            console.log("✓ Ad test successful");
        } else {
            console.log("ℹ️ No ads available for testing");
        }
    } catch (error) {
        console.error("✗ Ad test error:", error);
    }
};

// ============================================================================
// EXPORT FUNCTIONS
// ============================================================================

export { 
    showAd, 
    fetchAdFromFirebase, 
    displayAd, 
    getCachedAd, 
    cacheAd, 
    clearAdCache 
};
