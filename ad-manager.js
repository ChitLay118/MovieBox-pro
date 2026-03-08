import { db } from './firebase-config.js';
import { collection, getDocs, query, where, orderBy, limit } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

/**
 * App စတက်ချိန်တွင် ကြော်ညာပြရန် စစ်ဆေးခြင်း
 */
document.addEventListener('DOMContentLoaded', async () => {
    // App ပွင့်ပြီး ၂ စက္ကန့်အကြာတွင် ကြော်ညာရှိမရှိ စစ်မည်
    setTimeout(async () => {
        try {
            // User အနေနဲ့ ဒီနေ့အတွက် ကြော်ညာကြည့်ပြီးပြီလား စစ်ဆေးခြင်း
            const lastAdDate = localStorage.getItem('lastAdDate');
            const today = new Date().toDateString();
            
            if (lastAdDate !== today) {
                const adShown = await showAd();
                // ကြော်ညာ အမှန်တကယ်ပြသနိုင်မှသာ ရက်စွဲကို မှတ်သားမည်
                if (adShown) {
                    localStorage.setItem('lastAdDate', today);
                }
            }
        } catch (error) {
            console.error("Ad initialization error:", error);
        }
    }, 2000);
});

/**
 * Firebase မှ ကြော်ညာကို ဆွဲယူပြီး Modal ဖြင့် ပြသခြင်း
 */
async function showAd() {
    try {
        // Active ဖြစ်နေသော နောက်ဆုံးတင်ထားသည့် ကြော်ညာ ၁ ခုကို ယူခြင်း
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
            const adModal = document.getElementById('ad-modal');
            const adContent = document.getElementById('ad-content');
            
            if (!adModal || !adContent) return false;

            // ကြော်ညာအမျိုးအစားအလိုက် HTML ထုတ်ခြင်း
            if (ad.type === 'image') {
                adContent.innerHTML = `
                    <div class="relative group">
                        <img src="${ad.url}" alt="Advertisement" class="w-full h-auto rounded-xl shadow-lg border border-gray-700">
                        <div class="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded">Sponsored</div>
                    </div>
                `;
            } else if (ad.type === 'video') {
                adContent.innerHTML = `
                    <div class="relative">
                        <video src="${ad.url}" controls autoplay class="w-full h-auto rounded-xl shadow-lg border border-gray-700"></video>
                        <div class="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded">AD</div>
                    </div>
                `;
            }
            
            // Modal ကို ပြသရန်
            adModal.classList.remove('hidden');
            adModal.classList.add('flex'); // Tailwind flex box ဖြင့် အလယ်မှာပြရန်
            return true;
        }
        return false;
    } catch (error) {
        console.error("Error loading ad from Firebase:", error);
        return false;
    }
}

/**
 * ကြော်ညာ Modal ပိတ်သည့် Function
 */
window.closeAdModal = function() {
    const adModal = document.getElementById('ad-modal');
    if (adModal) {
        adModal.classList.add('hidden');
        adModal.classList.remove('flex');
        
        // Video ရှိနေပါက ရပ်တန့်ရန် (Content ကို ရှင်းလိုက်ခြင်း)
        const adContent = document.getElementById('ad-content');
        if (adContent) adContent.innerHTML = '';
    }
};
