// ===== PAGE NAVIGATION =====
function showPage(pageId) {
    console.log('📍 showPage("' + pageId + '") called');
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    const page = document.getElementById(pageId);
    if (page) {
        page.classList.add('active');
        console.log('📍 ✅ Page "' + pageId + '" is now active');
    } else {
        console.error('📍 ❌ Page element not found:', pageId);
    }
    destroyFloatingLines();
    setTimeout(() => {
        const bgId = pageId === 'register-page' ? 'register-bg' : pageId === 'login-page' ? 'login-bg' : 'dashboard-bg';
        console.log('📍 Initializing floating lines for:', bgId);
        initFloatingLines(bgId);
    }, 100);
    
    // Switch backend flow based on page
    document.querySelectorAll('.flow-diagram').forEach(flow => flow.classList.remove('active'));
    
    if (pageId === 'register-page') {
        document.getElementById('register-flow').classList.add('active');
    } else if (pageId === 'login-page') {
        document.getElementById('login-flow').classList.add('active');
    } else if (pageId === 'dashboard-page') {
        document.getElementById('dashboard-flow').classList.add('active');
    }
}

// Navigation
document.getElementById('to-login-from-register').addEventListener('click', (e) => { e.preventDefault(); showPage('login-page'); });
document.getElementById('to-register-from-login').addEventListener('click', (e) => { e.preventDefault(); showPage('register-page'); });

// ===== LOGIN =====
document.getElementById('login-btn').addEventListener('click', (e) => { e.preventDefault(); handleLogin(); });

async function handleLogin() {
    console.log('🔐 [LOGIN] handleLogin() called');
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();
    
    console.log('🔐 [LOGIN] Email:', email, 'Password length:', password.length);
    
    if (!email || !password) {
        console.warn('🔐 [LOGIN] ❌ Missing email or password');
        showMessageLogin('Please fill in all fields', 'error');
        return;
    }
    if (!isValidEmail(email)) {
        console.warn('🔐 [LOGIN] ❌ Invalid email format');
        showMessageLogin('Please enter a valid email', 'error');
        return;
    }

    console.log('🔐 [LOGIN] Preparing UI...');
    disableFormInputs('login');
    setButtonLoading('login-btn', true);
    clearFlowResults('login');
    document.getElementById('login-flow').classList.add('active');
    document.getElementById('register-flow').classList.remove('active');
    console.log('🔐 [LOGIN] UI ready');

    try {
        console.log('🔐 [LOGIN] Sending request to http://localhost:5000/api/login...');
        const resp = await fetch('http://localhost:5000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        console.log('🔐 [LOGIN] Response status:', resp.status);
        const data = await resp.json();
        console.log('🔐 [LOGIN] Response data:', JSON.stringify(data, null, 2));

        // Show each flow step
        console.log('🔐 [LOGIN] Animating', (data.flowSteps || []).length, 'steps...');
        for (const step of (data.flowSteps || [])) {
            console.log('🔐 [LOGIN] Step', step.step, '-', step.status);
            const el = document.querySelector(`#login-flow [data-step="${step.step}"]`);
            if (!el) {
                console.warn('🔐 [LOGIN] Step element not found for step', step.step);
                continue;
            }
            
            el.classList.add('show');
            if (step.step > 1) {
                const arrow = el.previousElementSibling;
                if (arrow?.classList.contains('arrow')) arrow.classList.add('show');
            }
            
            el.classList.remove('success', 'error', 'inactive', 'active');
            el.classList.add(step.status);
            
            if (step.step === 2 && step.data) {
                document.getElementById('display-email').textContent = step.data.email;
                document.getElementById('display-password').textContent = step.data.password;
            }
            
            if (step.result) {
                const map = {3: 'server-result', 4: 'db-result', 5: 'auth-result', 6: 'session-result', 7: 'response-result'};
                const resEl = document.getElementById(map[step.step]);
                if (resEl) resEl.innerHTML = `<span class="result-badge ${step.status}">${step.result}</span>`;
            }
            
            if (step.step === 7) {
                const txt = document.getElementById('response-text');
                if (txt) txt.textContent = step.text;
            }
            
            await new Promise(r => setTimeout(r, 2000));
            if (step.status === 'error') break;
        }

        console.log('🔐 [LOGIN] data.success:', data.success);
        if (data.success) {
            console.log('🔐 [LOGIN] ✅ Login successful!');
            showMessageLogin('✓ Login successful!', 'success');
            const userName = data.user?.name || 'User';
            console.log('🔐 [LOGIN] Saving session with userName:', userName);
            localStorage.setItem('loggedIn', 'true');
            localStorage.setItem('userName', userName);
            console.log('🔐 [LOGIN] Waiting 2 seconds before showing dashboard...');
            await new Promise(r => setTimeout(r, 2000));
            console.log('🔐 [LOGIN] NOW calling showPage("dashboard-page")...');
            showPage('dashboard-page');
            document.getElementById('welcome-user').textContent = `Welcome back, ${userName}!`;
            console.log('🔐 [LOGIN] ✅ Dashboard displayed!');
        } else {
            console.error('🔐 [LOGIN] ❌ Login failed:', data.message);
            showMessageLogin('✗ ' + (data.message || 'Login failed'), 'error');
        }
    } catch (e) {
        console.error('🔐 [LOGIN] ❌ EXCEPTION:', e);
        showMessageLogin('Connection error', 'error');
    }

    console.log('🔐 [LOGIN] Resetting UI...');
    disableFormInputs('login', false);
    setButtonLoading('login-btn', false);
    console.log('🔐 [LOGIN] Complete!');
}

// ===== REGISTER =====
document.getElementById('register-btn').addEventListener('click', (e) => { e.preventDefault(); handleRegister(); });

async function handleRegister() {
    const name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value.trim();
    const confirm = document.getElementById('register-confirm').value.trim();

    if (!name || !email || !password || !confirm) {
        showMessageRegister('Please fill in all fields', 'error');
        return;
    }
    if (!isValidEmail(email)) {
        showMessageRegister('Please enter a valid email', 'error');
        return;
    }
    if (password.length < 6) {
        showMessageRegister('Password must be at least 6 characters', 'error');
        return;
    }
    if (password !== confirm) {
        showMessageRegister('Passwords do not match', 'error');
        return;
    }

    disableFormInputs('register');
    setButtonLoading('register-btn', true);
    clearFlowResults('register');
    document.getElementById('register-flow').classList.add('active');
    document.getElementById('login-flow').classList.remove('active');

    try {
        const resp = await fetch('http://localhost:5000/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, confirm: password })
        });

        const data = await resp.json();

        for (const step of (data.flowSteps || [])) {
            const el = document.querySelector(`#register-flow [data-step="${step.step}"]`);
            if (!el) continue;
            
            el.classList.add('show');
            if (step.step > 1) {
                const arrow = el.previousElementSibling;
                if (arrow?.classList.contains('arrow')) arrow.classList.add('show');
            }
            
            el.classList.remove('success', 'error', 'inactive', 'active');
            el.classList.add(step.status);
            
            if (step.result) {
                const map = {2: 'reg-validation', 3: 'reg-exists', 4: 'reg-hash', 5: 'reg-insert', 6: 'reg-confirm'};
                const resEl = document.getElementById(map[step.step]);
                if (resEl) resEl.innerHTML = `<span class="result-badge ${step.status}">${step.result}</span>`;
            }
            
            await new Promise(r => setTimeout(r, 2000));
            if (step.status === 'error') break;
        }

        if (data.success) {
            // Prefill login email and clear password
            const loginEmailEl = document.getElementById('login-email');
            const loginPasswordEl = document.getElementById('login-password');
            if (loginEmailEl) loginEmailEl.value = email;
            if (loginPasswordEl) loginPasswordEl.value = '';

            // Immediately switch to login page after registration flow completes
            clearFlowResults('login');
            clearMessage();
            showPage('login-page');
            document.getElementById('login-flow').classList.add('active');
            document.getElementById('register-flow').classList.remove('active');
            // Focus password so user can type credentials quickly
            if (loginPasswordEl) loginPasswordEl.focus();
        } else {
            showMessageRegister('✗ ' + (data.message || 'Registration failed'), 'error');
        }
    } catch (e) {
        console.error(e);
        showMessageRegister('Connection error', 'error');
    }

    disableFormInputs('register', false);
    setButtonLoading('register-btn', false);
}

// ===== HELPER FUNCTIONS =====
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function disableFormInputs(form, disable = true) {
    const page = document.getElementById(form === 'register' ? 'register-page' : 'login-page');
    if (page) page.querySelectorAll('input').forEach(i => i.disabled = disable);
}

function setButtonLoading(id, loading) {
    const btn = document.getElementById(id);
    if (loading) {
        btn.disabled = true;
        btn.textContent = id.includes('login') ? 'Logging in...' : 'Registering...';
    } else {
        btn.disabled = false;
        btn.textContent = id.includes('login') ? 'Login' : 'Register';
    }
}

function showMessageLogin(text, type) {
    const box = document.getElementById('message-box-login');
    const txt = document.getElementById('message-text-login');
    box.classList.remove('hidden', 'success', 'error');
    txt.textContent = text;
    box.classList.add(type);
    // Auto-hide after 3-4 seconds
    clearTimeout(box.__hideTimer);
    if (type === 'error') {
        box.__hideTimer = setTimeout(() => box.classList.add('hidden'), 4000);
    } else {
        box.__hideTimer = setTimeout(() => box.classList.add('hidden'), 3000);
    }
}

function showMessageRegister(text, type) {
    const box = document.getElementById('message-box-register');
    const txt = document.getElementById('message-text-register');
    box.classList.remove('hidden', 'success', 'error');
    txt.textContent = text;
    box.classList.add(type);
    // Auto-hide after 3-4 seconds
    clearTimeout(box.__hideTimer);
    if (type === 'error') {
        box.__hideTimer = setTimeout(() => box.classList.add('hidden'), 4000);
    } else {
        box.__hideTimer = setTimeout(() => box.classList.add('hidden'), 3000);
    }
}

function clearMessage() {
    document.getElementById('message-box-login').classList.add('hidden');
    document.getElementById('message-box-register').classList.add('hidden');
}

function clearFlowResults(flow) {
    const el = document.getElementById(flow + '-flow');
    if (!el) return;
    el.querySelectorAll('[id*="result"], [id*="response"]').forEach(e => e.textContent = '');
    el.querySelectorAll('.step').forEach(s => s.classList.remove('active', 'success', 'error', 'inactive', 'show'));
    el.querySelectorAll('.arrow').forEach(a => a.classList.remove('show'));
}

function clearStepStyles(sel) {
    document.querySelectorAll(sel + ' .step').forEach(s => s.classList.remove('active', 'success', 'error', 'inactive', 'show'));
    document.querySelectorAll(sel + ' .arrow').forEach(a => a.classList.remove('show'));
}

// ===== DASHBOARD =====
document.getElementById('logout-btn').addEventListener('click', () => {
    destroyFloatingLines();
    document.getElementById('login-email').value = '';
    document.getElementById('login-password').value = '';
    document.getElementById('register-name').value = '';
    document.getElementById('register-email').value = '';
    document.getElementById('register-password').value = '';
    document.getElementById('register-confirm').value = '';
    clearFlowResults('login');
    clearFlowResults('register');
    localStorage.clear();
    showPage('register-page');
    clearMessage();
    showMessageRegister('✓ Logged out', 'success');
    setTimeout(() => document.getElementById('message-box-register').classList.add('hidden'), 2000);
});

document.getElementById('messages-btn').addEventListener('click', () => showMessageRegister('📨 Coming soon!', 'success'));
document.getElementById('profile-btn').addEventListener('click', () => showMessageRegister('👤 Coming soon!', 'success'));
document.getElementById('settings-btn').addEventListener('click', () => showMessageRegister('⚙️ Coming soon!', 'success'));

// ===== INITIALIZATION =====

// Early init on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOMContentLoaded - Script initialized');
});

window.addEventListener('load', () => {
    console.log('📄 Page load event fired');
    
    // Check localStorage for existing session
    const isLoggedIn = localStorage.getItem('loggedIn') === 'true';
    const userName = localStorage.getItem('userName');
    
    console.log('📄 Checking session - loggedIn:', isLoggedIn, 'userName:', userName);
    
    if (isLoggedIn && userName) {
        console.log('📄 ✅ Showing dashboard (session exists)');
        showPage('dashboard-page');
        document.getElementById('welcome-user').textContent = `Welcome back, ${userName}!`;
    } else {
        console.log('📄 Showing register page (no session)');
        showPage('register-page');
    }
    
    // Setup auto contrast
    setTimeout(() => {
        updateAutoContrast();
        setupAutoContrastObservers();
    }, 300);
});
function parseRGBString(rgb) {
    if (!rgb) return null;
    const m = rgb.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const parts = m[1].split(',').map(p => p.trim());
    const r = Number(parts[0]), g = Number(parts[1]), b = Number(parts[2]), a = parts[3] !== undefined ? Number(parts[3]) : 1;
    return {r, g, b, a};
}

function getEffectiveBackgroundColor(el) {
    let node = el;
    while (node && node !== document.documentElement) {
        const style = getComputedStyle(node);
        const bg = style.backgroundColor;
        const parsed = parseRGBString(bg);
        if (parsed && parsed.a > 0 && !(parsed.r === 0 && parsed.g === 0 && parsed.b === 0 && bg === 'transparent')) return parsed;
        node = node.parentElement;
    }
    const bodyBg = parseRGBString(getComputedStyle(document.body).backgroundColor);
    return bodyBg || {r: 245, g: 245, b: 245, a: 1};
}

function srgbChannelToLinear(c) {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function luminance(rgb) {
    const r = srgbChannelToLinear(rgb.r);
    const g = srgbChannelToLinear(rgb.g);
    const b = srgbChannelToLinear(rgb.b);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function updateAutoContrast() {
    try {
        ['.dashboard-content', '.left-side', '.page-content', '.step', '.menu-btn', '.dashboard-header-left h2', '.dashboard-header p', '.subtitle', '.page-content h1', '.flow-container', '.backend-wrapper h2', '.form-group label', '.message-box', '.step-title', '.step-text'].forEach(sel => {
            document.querySelectorAll(sel).forEach(el => {
                const bg = getEffectiveBackgroundColor(el);
                const lum = luminance(bg);
                el.style.color = lum > 0.6 ? '#111' : '#ffffff';
            });
        });
    } catch (e) {}
}

function setupAutoContrastObservers() {
    const observer = new MutationObserver(() => {
        clearTimeout(window.__autoContrastTimer);
        window.__autoContrastTimer = setTimeout(updateAutoContrast, 120);
    });
    ['body', '#register-bg', '#login-bg', '#dashboard-bg'].forEach(sel => {
        const node = document.querySelector(sel);
        if (node) observer.observe(node, {attributes: true, childList: true, subtree: true});
    });
    window.addEventListener('resize', () => {
        clearTimeout(window.__autoContrastTimer);
        window.__autoContrastTimer = setTimeout(updateAutoContrast, 120);
    });
}

// Consolidated load handling already set above; ensure auto-contrast runs once on load
