// ===== PAGE NAVIGATION =====
function showPage(pageId) {
    // Destroy previous floating lines
    destroyFloatingLines();
    
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    const page = document.getElementById(pageId);
    if (page) {
        page.classList.add('active');
        
        // Initialize floating lines for the page
        let bgContainerId = null;
        if (pageId === 'register-page') {
            bgContainerId = 'register-bg';
        } else if (pageId === 'login-page') {
            bgContainerId = 'login-bg';
        }
        
        if (bgContainerId) {
            setTimeout(() => {
                initFloatingLines(bgContainerId);
            }, 100);
        }
    }
}

// Navigation links
document.getElementById('to-login-from-register').addEventListener('click', (e) => {
    e.preventDefault();
    clearMessage();
    showPage('login-page');
});

document.getElementById('to-register-from-login').addEventListener('click', (e) => {
    e.preventDefault();
    clearMessage();
    showPage('register-page');
});

// ===== LOGIN FORM HANDLING =====
document.getElementById('login-btn').addEventListener('click', handleLogin);

async function handleLogin() {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();

    // Validate inputs
    if (!email || !password) {
        showMessageLogin('Please fill in all fields', 'error');
        return;
    }

    if (!isValidEmail(email)) {
        showMessageLogin('Please enter a valid email', 'error');
        return;
    }

    // Disable form
    disableFormInputs('login');
    setButtonLoading('login-btn', true);

    // Clear previous results and show login flow
    clearFlowResults('login');
    document.getElementById('login-flow').classList.add('active');
    document.getElementById('register-flow').classList.remove('active');

    // Run animation
    await animateLoginFlow(email, password);

    // Reset form
    disableFormInputs('login', false);
    setButtonLoading('login-btn', false);
}

async function animateLoginFlow(email, password) {
    try {
        const response = await fetch('http://localhost:5000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        const flowSteps = data.flowSteps || [];

        // Display each step from the server
        for (const flowStep of flowSteps) {
            const stepIndex = flowStep.step - 1;
            const stepElement = document.querySelector(`#login-flow [data-step="${flowStep.step}"]`);
            if (!stepElement) continue;

            // Show step with animation
            stepElement.classList.add('show');
            
            // Show arrow before this step (if not the first step)
            if (flowStep.step > 1) {
                const previousArrow = stepElement.previousElementSibling;
                if (previousArrow && previousArrow.classList.contains('arrow')) {
                    previousArrow.classList.add('show');
                }
            }

            // Reset classes
            stepElement.classList.remove('success', 'error', 'inactive', 'active');

            // Add appropriate class based on status
            if (flowStep.status === 'success') {
                stepElement.classList.add('success');
            } else if (flowStep.status === 'error') {
                stepElement.classList.add('error');
            } else if (flowStep.status === 'inactive') {
                stepElement.classList.add('inactive');
            } else if (flowStep.status === 'active') {
                stepElement.classList.add('active');
            }

            // Update content based on step
            if (flowStep.step === 2 && flowStep.data) {
                document.getElementById('display-email').textContent = flowStep.data.email;
                document.getElementById('display-password').textContent = flowStep.data.password;
            }

            // Update result indicators
            if (flowStep.result) {
                const resultMap = {
                    3: 'server-result',
                    4: 'db-result',
                    5: 'auth-result',
                    6: 'session-result',
                    7: 'response-result'
                };
                const resultId = resultMap[flowStep.step];
                if (resultId) {
                    const resultEl = document.getElementById(resultId);
                    if (resultEl) {
                        const badge = flowStep.status === 'success' ? 'success' : 'error';
                        resultEl.innerHTML = `<span class="result-badge ${badge}">${flowStep.result}</span>`;
                    }
                }
            }

            // Update response text
            if (flowStep.step === 7) {
                const responseText = document.getElementById('response-text');
                responseText.textContent = flowStep.text;
            }

            // Wait before moving to next step (2 seconds for visibility)
            await sleep(2000);
            
            // If this step is an error, stop showing remaining steps
            if (flowStep.status === 'error') {
                break;
            }
        }

        if (data.success) {
            showMessageLogin('✓ Login successful! Welcome back.', 'success');

            // Get user name from the response
            const userName = data.user?.name || 'User';

            // Switch to dashboard after a delay
            setTimeout(() => {
                showPage('dashboard-page');
                document.getElementById('welcome-user').textContent = `Welcome back, ${userName}!`;

                // Initialize floating lines animation
                initFloatingLines('dashboard-bg');
            }, 2000);
        } else {
            showMessageLogin('✗ ' + data.message, 'error');
        }

        // Steps remain visible - do not clear

    } catch (error) {
        console.error('Login error:', error);
        showMessageLogin('Connection error. Make sure backend is running on port 5000', 'error');
        clearStepStyles('#login-flow');
    }
}

// ===== REGISTER FORM HANDLING =====
document.getElementById('register-btn').addEventListener('click', handleRegister);

async function handleRegister() {
    const name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value.trim();
    const confirm = document.getElementById('register-confirm').value.trim();

    // Validate inputs
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

    // Disable form
    disableFormInputs('register');
    setButtonLoading('register-btn', true);

    // Clear previous results and show register flow
    clearFlowResults('register');
    document.getElementById('register-flow').classList.add('active');
    document.getElementById('login-flow').classList.remove('active');

    // Run animation
    await animateRegisterFlow(name, email, password);

    // Reset form
    disableFormInputs('register', false);
    setButtonLoading('register-btn', false);
}

async function animateRegisterFlow(name, email, password) {
    try {
        const response = await fetch('http://localhost:5000/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password, confirm: password })
        });

        const data = await response.json();
        const flowSteps = data.flowSteps || [];

        // Display each step from the server
        for (const flowStep of flowSteps) {
            const stepIndex = flowStep.step - 1;
            const stepElement = document.querySelector(`#register-flow [data-step="${flowStep.step}"]`);
            if (!stepElement) continue;

            // Show step with animation
            stepElement.classList.add('show');
            
            // Show arrow before this step (if not the first step)
            if (flowStep.step > 1) {
                const previousArrow = stepElement.previousElementSibling;
                if (previousArrow && previousArrow.classList.contains('arrow')) {
                    previousArrow.classList.add('show');
                }
            }

            // Reset classes
            stepElement.classList.remove('success', 'error', 'inactive', 'active');

            // Add appropriate class based on status
            if (flowStep.status === 'success') {
                stepElement.classList.add('success');
            } else if (flowStep.status === 'error') {
                stepElement.classList.add('error');
            } else if (flowStep.status === 'inactive') {
                stepElement.classList.add('inactive');
            } else if (flowStep.status === 'active') {
                stepElement.classList.add('active');
            }

            // Update result indicators
            if (flowStep.result) {
                const resultMap = {
                    2: 'reg-validation',
                    3: 'reg-exists',
                    4: 'reg-hash',
                    5: 'reg-insert',
                    6: 'reg-confirm',
                    7: 'reg-response'
                };
                const resultId = resultMap[flowStep.step];
                if (resultId) {
                    const resultEl = document.getElementById(resultId);
                    if (resultEl) {
                        const badge = flowStep.status === 'success' ? 'success' : 'error';
                        resultEl.innerHTML = `<span class="result-badge ${badge}">${flowStep.result}</span>`;
                    }
                }
            }

            // Update response text
            if (flowStep.step === 7) {
                const responseText = document.getElementById('reg-response');
                responseText.textContent = flowStep.text;
            }

            // Wait before moving to next step (2 seconds for visibility)
            await sleep(2000);
            
            // If this step is an error, stop showing remaining steps
            if (flowStep.status === 'error') {
                break;
            }
        }

        if (data.success) {
            showMessageRegister('✓ Account created! You can now log in with your credentials.', 'success');
        } else {
            showMessageRegister('✗ ' + data.message, 'error');
        }

        // Steps remain visible - do not clear

    } catch (error) {
        console.error('Register error:', error);
        showMessageRegister('Connection error. Make sure backend is running on port 5000', 'error');
        clearStepStyles('#register-flow');
    }
}

// ===== HELPER FUNCTIONS =====

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function disableFormInputs(formType = 'login', disable = true) {
    const pageId = formType === 'register' ? 'register-page' : 'login-page';
    const page = document.getElementById(pageId);
    if (!page) return;
    
    const inputs = page.querySelectorAll('input');
    inputs.forEach(input => {
        input.disabled = disable;
    });
}

function setButtonLoading(buttonId, loading) {
    const button = document.getElementById(buttonId);
    if (loading) {
        button.disabled = true;
        button.classList.add('loading');
        button.textContent = buttonId.includes('login') ? 'Logging in...' : 'Registering...';
    } else {
        button.disabled = false;
        button.classList.remove('loading');
        button.textContent = buttonId.includes('login') ? 'Login' : 'Register';
    }
}

function showMessageLogin(text, type) {
    const messageBox = document.getElementById('message-box-login');
    const messageText = document.getElementById('message-text-login');

    messageBox.classList.remove('hidden', 'success', 'error');
    messageText.textContent = text;
    messageBox.classList.add(type);
}

function showMessageRegister(text, type) {
    const messageBox = document.getElementById('message-box-register');
    const messageText = document.getElementById('message-text-register');

    messageBox.classList.remove('hidden', 'success', 'error');
    messageText.textContent = text;
    messageBox.classList.add(type);
}

function clearMessage() {
    const messageBoxLogin = document.getElementById('message-box-login');
    const messageBoxRegister = document.getElementById('message-box-register');
    if (messageBoxLogin) messageBoxLogin.classList.add('hidden');
    if (messageBoxRegister) messageBoxRegister.classList.add('hidden');
}

function clearFlowResults(flowType) {
    const flowSelector = '#' + flowType + '-flow';
    const flow = document.getElementById(flowType + '-flow');
    
    // Clear result content
    const resultElements = flow.querySelectorAll('[id*="result"], [id*="response"], [id*="display"]');
    resultElements.forEach(el => {
        el.textContent = '';
        el.innerHTML = '';
    });
    
    // Clear step visibility and styles
    const steps = flow.querySelectorAll('.step');
    steps.forEach(step => {
        step.classList.remove('active', 'success', 'error', 'inactive', 'show');
    });
    
    // Hide arrows
    const arrows = flow.querySelectorAll('.arrow');
    arrows.forEach(arrow => {
        arrow.classList.remove('show');
    });
}

function clearStepStyles(flowSelector) {
    const steps = document.querySelectorAll(flowSelector + ' .step');
    steps.forEach(step => {
        step.classList.remove('active', 'success', 'error', 'inactive', 'show');
    });
    
    // Also hide arrows
    const arrows = document.querySelectorAll(flowSelector + ' .arrow');
    arrows.forEach(arrow => {
        arrow.classList.remove('show');
    });
}

// Demo credentials notification
console.log('Demo Credentials:');
console.log('Email: user@example.com');
console.log('Password: password123');
console.log('(or register a new account with any email ending in @demo)');

// DASHBOARD PAGE HANDLERS
document.getElementById('logout-btn').addEventListener('click', () => {
    // Destroy floating lines
    destroyFloatingLines();
    
    // Clear forms
    document.getElementById('login-email').value = '';
    document.getElementById('login-password').value = '';
    document.getElementById('register-name').value = '';
    document.getElementById('register-email').value = '';
    document.getElementById('register-password').value = '';
    document.getElementById('register-confirm').value = '';
    
    // Clear all flow results
    clearFlowResults('login');
    clearFlowResults('register');
    
    // Switch back to register page
    showPage('register-page');
    clearMessage();
    
    // Initialize floating lines for register page
    setTimeout(() => {
        initFloatingLines('register-bg');
    }, 100);
    
    showMessageRegister('✓ Logged out successfully', 'success');
    setTimeout(() => {
        document.getElementById('message-box-register').classList.add('hidden');
    }, 2000);
});

document.getElementById('messages-btn').addEventListener('click', () => {
    showMessageRegister('📨 Messages feature coming soon!', 'success');
});

document.getElementById('profile-btn').addEventListener('click', () => {
    showMessageRegister('👤 Profile feature coming soon!', 'success');
});

document.getElementById('settings-btn').addEventListener('click', () => {
    showMessageRegister('⚙️ Settings feature coming soon!', 'success');
});

// Initialize floating lines for all pages on load
window.addEventListener('load', () => {
    setTimeout(() => {
        initFloatingLines('register-bg');
    }, 200);
});

// Initialize floating lines when each page becomes active (will be called when needed)
