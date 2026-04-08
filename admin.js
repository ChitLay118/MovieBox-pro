import { db } from './firebase-config.js';
import { 
    collection, 
    addDoc, 
    getDocs, 
    setDoc, 
    doc, 
    query, 
    orderBy, 
    limit,
    deleteDoc,
    updateDoc 
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

/**
 * ============================================================================
 * ADMIN FUNCTIONS - Enhanced Version (v6.0)
 * ============================================================================
 * Better error handling, improved UX, and additional features
 */

// ============================================================================
// 1. NOTIFICATION MANAGEMENT (ENHANCED)
// ============================================================================

window.sendNotification = async function() {
    const title = document.getElementById('admin-noti-title').value.trim();
    const message = document.getElementById('admin-noti-msg').value.trim();

    if (!title || !message) {
        showAdminAlert("အမှား", "ခေါင်းစဉ်နှင့် စာသား အပြည့်အစုံ ထည့်ပါဦး", "error");
        return;
    }

    if (title.length < 3) {
        showAdminAlert("အမှား", "ခေါင်းစဉ်သည် အနည်းဆုံး ၃ လုံးရှိရမည်", "error");
        return;
    }

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        showAdminAlert("အမှား", "Admin အဖြစ် အကောင့်ဝင်ထားရန် လိုအပ်သည်", "error");
        return;
    }

    // Verify admin status
    if (currentUser.role !== 'admin' && currentUser.email !== 'yan260702@gmail.com') {
        showAdminAlert("အမှား", "Admin အခွင့်အရည်အတည်း မရှိပါ", "error");
        return;
    }

    try {
        const submitBtn = event.target;
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'ပို့နေပါသည်...';
        }

        await addDoc(collection(db, 'notifications'), {
            title: title,
            message: message,
            date: new Date().toLocaleString('en-GB', { 
                day: 'numeric', 
                month: 'short', 
                hour: '2-digit', 
                minute: '2-digit' 
            }),
            timestamp: new Date().getTime(),
            addedBy: currentUser.email,
            uid: currentUser.uid
        });

        showAdminAlert("အောင်မြင်ပါသည်", "အားလုံးထံ အကြောင်းကြားစာ ပို့ပြီးပါပြီ!", "success");
        
        document.getElementById('admin-noti-title').value = "";
        document.getElementById('admin-noti-msg').value = "";

        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = '📢 အသုံးပြုသူများအားလုံးသို့ ပေးပို့ရန်';
        }
    } catch (error) {
        console.error("✗ Error sending notification:", error);
        showAdminAlert("အမှား", `ပို့ဆောင်မှု မအောင်မြင်ပါ: ${error.message}`, "error");
        
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = '📢 အသုံးပြုသူများအားလုံးသို့ ပေးပို့ရန်';
        }
    }
};

// ============================================================================
// 2. VIDEO MANAGEMENT (ENHANCED)
// ============================================================================

window.addVideo = async function() {
    const title = document.getElementById('video-title')?.value.trim();
    const url = document.getElementById('video-url')?.value.trim();
    const thumb = document.getElementById('video-thumb')?.value.trim();
    const category = document.getElementById('video-category')?.value;
    
    if (!title || !url) {
        showAdminAlert("အမှား", "ကျေးဇူးပြု၍ ခေါင်းစဉ်နှင့် URL ထည့်ပါ", "error");
        return;
    }

    // Validate URL
    if (!isValidUrl(url)) {
        showAdminAlert("အမှား", "URL မှားယွင်းနေပါသည်။ ကျေးဇူးပြု၍ အမှန်တကယ် URL ထည့်ပါ", "error");
        return;
    }
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        showAdminAlert("အမှား", "ကျေးဇူးပြု၍ အကောင့်ဝင်ပါ", "error");
        return;
    }
    
    try {
        const submitBtn = event.target;
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'ထည့်သွင်းနေပါသည်...';
        }

        await addDoc(collection(db, 'videos'), {
            title: title,
            src: url,
            thumb: thumb || 'https://placehold.co/300x200/1a1a1a/cccccc?text=WY+MovieBox',
            category: category || 'other',
            addedBy: currentUser.email,
            addedAt: new Date().toISOString(),
            uid: currentUser.uid,
            active: true
        });
        
        showAdminAlert("အောင်မြင်ပါသည်", "Video ထည့်သွင်းခြင်း အောင်မြင်ပါသည်!", "success");
        document.getElementById('video-title').value = '';
        document.getElementById('video-url').value = '';
        document.getElementById('video-thumb').value = '';

        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = '➕ Video ထည့်သွင်းရန်';
        }
        
    } catch (error) {
        console.error("✗ Error adding video:", error);
        showAdminAlert("အမှား", `အမှား: ${error.message}`, "error");
        
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = '➕ Video ထည့်သွင်းရန်';
        }
    }
};

// ============================================================================
// 3. ADVERTISEMENT MANAGEMENT (ENHANCED)
// ============================================================================

window.addAdvertisement = async function() {
    const adUrl = document.getElementById('ad-url')?.value.trim();
    const adTitle = document.getElementById('ad-title')?.value.trim();
    
    if (!adUrl) {
        showAdminAlert("အမှား", "ကျေးဇူးပြု၍ URL ထည့်ပါ", "error");
        return;
    }

    if (!isValidUrl(adUrl)) {
        showAdminAlert("အမှား", "URL မှားယွင်းနေပါသည်", "error");
        return;
    }
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        showAdminAlert("အမှား", "ကျေးဇူးပြု၍ အကောင့်ဝင်ပါ", "error");
        return;
    }
    
    try {
        const submitBtn = event.target;
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'ထည့်သွင်းနေပါသည်...';
        }

        const isImage = adUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i);
        const isVideo = adUrl.match(/\.(mp4|webm|ogg|mov)$/i);
        
        if (!isImage && !isVideo) {
            showAdminAlert("အမှား", "ကျေးဇူးပြု၍ ပုံ သို့မဟုတ် ဗီဒီယို URL တစ်ခုထည့်ပါ", "error");
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = '➕ ကြော်ညာထည့်သွင်းရန်';
            }
            return;
        }
        
        await addDoc(collection(db, 'advertisements'), {
            url: adUrl,
            title: adTitle || 'Ad',
            type: isImage ? 'image' : 'video',
            addedBy: currentUser.email,
            addedAt: new Date().toISOString(),
            active: true,
            uid: currentUser.uid
        });
        
        showAdminAlert("အောင်မြင်ပါသည်", "ကြော်ညာထည့်သွင်းခြင်း အောင်မြင်ပါသည်!", "success");
        document.getElementById('ad-url').value = '';
        if (document.getElementById('ad-title')) {
            document.getElementById('ad-title').value = '';
        }

        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = '➕ ကြော်ညာထည့်သွင်းရန်';
        }
        
    } catch (error) {
        console.error("✗ Error adding advertisement:", error);
        showAdminAlert("အမှား", `အမှား: ${error.message}`, "error");
        
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = '➕ ကြော်ညာထည့်သွင်းရန်';
        }
    }
};

// ============================================================================
// 4. USER MANAGEMENT (ENHANCED)
// ============================================================================

window.loadUserList = async function() {
    try {
        const userListElement = document.getElementById('user-list');
        if (!userListElement) return;

        userListElement.innerHTML = '<div class="text-center text-gray-500 py-4">ဒေတာများ ဖွင့်နေပါသည်...</div>';

        const usersRef = collection(db, 'users');
        const snapshot = await getDocs(usersRef);
        
        let userListHTML = '';
        let totalUsers = 0;

        snapshot.forEach((doc) => {
            const user = doc.data();
            totalUsers++;
            const createdDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString('my-MM') : 'N/A';
            
            userListHTML += `
                <div class="user-item">
                    <div class="flex-1">
                        <div class="font-medium text-white">${user.name || user.email}</div>
                        <div class="text-sm text-gray-400">${user.email}</div>
                        <div class="text-xs mt-1">
                            <span class="inline-block px-2 py-1 rounded-full ${user.role === 'admin' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}">
                                ${user.role === 'admin' ? '👑 Admin' : '👤 User'}
                            </span>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="text-xs text-gray-500">${createdDate}</div>
                    </div>
                </div>
            `;
        });
        
        if (userListHTML) {
            userListHTML = `<div class="mb-4 p-3 bg-gray-800/50 rounded-lg text-center text-sm text-gray-400">📊 စုစုပေါင်း အသုံးပြုသူ: <span class="text-primary font-bold">${totalUsers}</span></div>` + userListHTML;
        }

        userListElement.innerHTML = userListHTML || '<div class="text-center text-gray-500 py-8">အသုံးပြုသူများ မတွေ့ရှိပါ</div>';
        
    } catch (error) {
        console.error("✗ Error loading users:", error);
        const userListElement = document.getElementById('user-list');
        if (userListElement) {
            userListElement.innerHTML = '<div class="text-center text-red-400 py-4">❌ အသုံးပြုသူများ ဖွင့်ရာတွင် အမှားဖြစ်နေပါသည်</div>';
        }
    }
};

// ============================================================================
// 5. NOTIFICATION HISTORY (NEW FEATURE)
// ============================================================================

window.loadNotificationHistory = async function() {
    try {
        const notiHistoryElement = document.getElementById('noti-history');
        if (!notiHistoryElement) return;

        notiHistoryElement.innerHTML = '<div class="text-center text-gray-500 py-4">ဒေတာများ ဖွင့်နေပါသည်...</div>';

        const notificationsRef = collection(db, 'notifications');
        const q = query(notificationsRef, orderBy('timestamp', 'desc'), limit(20));
        const snapshot = await getDocs(q);
        
        let notiHTML = '';
        let totalNotifications = 0;

        snapshot.forEach((doc) => {
            const noti = doc.data();
            totalNotifications++;
            
            notiHTML += `
                <div class="noti-item">
                    <div class="flex justify-between items-start">
                        <div class="flex-1">
                            <h4 class="font-bold text-primary text-sm">${noti.title}</h4>
                            <p class="text-gray-300 text-xs mt-1 leading-relaxed">${noti.message}</p>
                            <div class="flex justify-between items-center mt-2">
                                <span class="text-[10px] text-gray-500">${noti.date || ''}</span>
                                <span class="text-[10px] text-gray-600">by ${noti.addedBy || 'Unknown'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        if (notiHTML) {
            notiHTML = `<div class="mb-4 p-3 bg-gray-800/50 rounded-lg text-center text-sm text-gray-400">📬 စုစုပေါင်း အကြောင်းကြားစာ: <span class="text-primary font-bold">${totalNotifications}</span></div>` + notiHTML;
        }

        notiHistoryElement.innerHTML = notiHTML || '<div class="text-center text-gray-500 py-8">အကြောင်းကြားစာများ မတွေ့ရှိပါ</div>';
        
    } catch (error) {
        console.error("✗ Error loading notification history:", error);
        const notiHistoryElement = document.getElementById('noti-history');
        if (notiHistoryElement) {
            notiHistoryElement.innerHTML = '<div class="text-center text-red-400 py-4">❌ အကြောင်းကြားစာများ ဖွင့်ရာတွင် အမှားဖြစ်နေပါသည်</div>';
        }
    }
};

// ============================================================================
// 6. UTILITY FUNCTIONS
// ============================================================================

function showAdminAlert(title, message, type = 'info') {
    const alertDiv = document.createElement('div');
    const bgColor = type === 'error' ? 'bg-red-600' : type === 'success' ? 'bg-green-600' : 'bg-blue-600';
    const icon = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    
    alertDiv.className = `fixed top-4 right-4 ${bgColor} text-white p-4 rounded-lg shadow-lg z-[110] max-w-sm animate-fadeIn`;
    alertDiv.innerHTML = `
        <h4 class="font-bold flex items-center gap-2">
            <span>${icon}</span>
            <span>${title}</span>
        </h4>
        <p class="text-sm mt-1">${message}</p>
    `;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// ============================================================================
// 7. EXPORT FUNCTIONS FOR EXTERNAL USE
// ============================================================================

export { showAdminAlert, isValidUrl };
