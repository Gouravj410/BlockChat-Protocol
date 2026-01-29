// Copy and paste this into DevTools Console on http://localhost:8000
// This will monitor and log everything happening during login

console.log('🔍 Starting comprehensive login flow monitor...\n');

// Store original functions
const origShowPage = window.showPage;
const origFetch = window.fetch;
let loginAttempt = 0;

// Monitor showPage calls
window.showPage = function(pageId) {
    console.log(`📍 showPage("${pageId}") called`);
    console.trace('  Call stack:');
    return origShowPage.call(this, pageId);
};

// Monitor all fetch calls
window.fetch = function(...args) {
    const url = args[0];
    if (url.includes('localhost:5000/api')) {
        console.log(`📤 FETCH: ${args[1]?.method || 'GET'} ${url}`);
    }
    
    return origFetch.apply(this, args).then(response => {
        if (url.includes('localhost:5000/api')) {
            console.log(`📥 RESPONSE: ${response.status} ${response.statusText}`);
            
            // Clone and parse to log
            return response.clone().json().then(data => {
                if (url.includes('/login')) {
                    console.group('🔐 LOGIN RESPONSE DATA');
                    console.log('success:', data.success);
                    console.log('user:', data.user);
                    console.log('message:', data.message);
                    console.log('flowSteps:', data.flowSteps?.length || 0);
                    console.log('Full data:', data);
                    console.groupEnd();
                }
                // Return original response
                return response.clone();
            }).catch(e => {
                console.error('Failed to parse JSON:', e);
                return response;
            });
        }
        return response;
    });
};

// Monitor localStorage changes
const origSetItem = Storage.prototype.setItem;
Storage.prototype.setItem = function(key, value) {
    if (key.includes('log') || key.includes('user')) {
        console.log(`💾 localStorage.setItem("${key}", "${value}")`);
    }
    return origSetItem.call(this, key, value);
};

// Monitor page visibility changes
document.addEventListener('visibilitychange', () => {
    console.log(`👁️ Visibility changed: ${document.visibilityState}`);
});

// Monitor page reload
window.addEventListener('beforeunload', () => {
    console.log('⚠️ PAGE RELOAD DETECTED');
});

// Monitor all page transitions
const allPages = document.querySelectorAll('[id$="-page"]');
const observer = new MutationObserver(mutations => {
    mutations.forEach(m => {
        if (m.target.classList) {
            if (m.attributeName === 'class' && m.target.id?.includes('-page')) {
                const isActive = m.target.classList.contains('active');
                console.log(`🎭 Page "${m.target.id}" ${isActive ? '✅ ACTIVATED' : '❌ DEACTIVATED'}`);
            }
        }
    });
});

allPages.forEach(page => {
    observer.observe(page, { attributes: true, attributeFilter: ['class'] });
});

console.log('✅ Monitor installed. Now try logging in and watch the console output below.\n');
console.log('------- LOGIN OUTPUT -------\n');
