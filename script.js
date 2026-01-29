// ===== TAB SWITCHING =====
document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
        const tabName = button.dataset.tab;

        // Hide all tab contents
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        // Deactivate all buttons
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });

        // Show selected tab and activate button
        document.getElementById(tabName).classList.add('active');
        button.classList.add('active');

        // Switch flow diagram
        document.querySelectorAll('.flow-diagram').forEach(flow => {
            flow.classList.remove('active');
        });
        document.getElementById(tabName + '-flow').classList.add('active');

        // Clear messages
        clearMessage();
    });
});

// ===== LOGIN FORM HANDLING =====
document.getElementById('login-btn').addEventListener('click', handleLogin);

async function handleLogin() {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();

    // Validate inputs
    if (!email || !password) {
        showMessage('Please fill in all fields', 'error');
        return;
    }

    if (!isValidEmail(email)) {
        showMessage('Please enter a valid email', 'error');
        return;
    }

    // Disable form
    disableFormInputs();
    setButtonLoading('login-btn', true);

    // Clear previous results
    clearFlowResults('login');

    // Run animation
    await animateLoginFlow(email, password);

    // Reset form
    disableFormInputs(false);
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
            showMessage('✓ Login successful! Welcome back.', 'success');

            // Get user name from the response
            const userName = data.user?.name || 'User';

            // Switch left panel to dashboard after a delay
            setTimeout(() => {
                // hide form and show dashboard section inside left panel
                const formSection = document.getElementById('form-section');
                const dashboardSection = document.getElementById('dashboard-section');
                if (formSection && dashboardSection) {
                    formSection.classList.add('hidden');
                    dashboardSection.classList.remove('hidden');
                }

                document.getElementById('welcome-user').textContent = `Welcome back, ${userName}!`;

                // Initialize floating lines animation inside dashboard bg
                initFloatingLines('dashboard-bg');
            }, 2000);
        } else {
            showMessage('✗ ' + data.message, 'error');
        }

        // Steps remain visible - do not clear

    } catch (error) {
        console.error('Login error:', error);
        showMessage('Connection error. Make sure backend is running on port 5000', 'error');
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
        showMessage('Please fill in all fields', 'error');
        return;
    }

    if (!isValidEmail(email)) {
        showMessage('Please enter a valid email', 'error');
        return;
    }

    if (password.length < 6) {
        showMessage('Password must be at least 6 characters', 'error');
        return;
    }

    if (password !== confirm) {
        showMessage('Passwords do not match', 'error');
        return;
    }

    // Disable form
    disableFormInputs();
    setButtonLoading('register-btn', true);

    // Clear previous results
    clearFlowResults('register');

    // Run animation
    await animateRegisterFlow(name, email, password);

    // Reset form
    disableFormInputs(false);
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
            showMessage('✓ Account created! Please check your email to verify.', 'success');
            
            // Get user name from the response
            const userName = data.user?.name || 'User';
            
            // Switch left panel to dashboard after a delay
            setTimeout(() => {
                const formSection = document.getElementById('form-section');
                const dashboardSection = document.getElementById('dashboard-section');
                if (formSection && dashboardSection) {
                    formSection.classList.add('hidden');
                    dashboardSection.classList.remove('hidden');
                }
                document.getElementById('welcome-user').textContent = `Welcome, ${userName}!`;

                // Initialize floating lines animation inside dashboard bg
                initFloatingLines('dashboard-bg');
            }, 2000);
        } else {
            showMessage('✗ ' + data.message, 'error');
        }

        // Steps remain visible - do not clear

    } catch (error) {
        console.error('Register error:', error);
        showMessage('Connection error. Make sure backend is running on port 5000', 'error');
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

function disableFormInputs(disable = true) {
    const currentTab = document.querySelector('.tab-content.active');
    const inputs = currentTab.querySelectorAll('input');
    inputs.forEach(input => {
        input.disabled = disable;
    });
}

function setButtonLoading(buttonId, loading) {
    const button = document.getElementById(buttonId);
    if (loading) {
        button.disabled = true;
        button.classList.add('loading');
        button.textContent = '';
        const tabName = buttonId.split('-')[0];
        button.textContent = tabName === 'login' ? 'Logging in...' : 'Registering...';
    } else {
        button.disabled = false;
        button.classList.remove('loading');
        button.textContent = buttonId.includes('login') ? 'Login' : 'Register';
    }
}

function showMessage(text, type) {
    const messageBox = document.getElementById('message-box');
    const messageText = document.getElementById('message-text');

    messageBox.classList.remove('hidden', 'success', 'error');
    messageText.textContent = text;
    messageBox.classList.add(type);
}

function clearMessage() {
    const messageBox = document.getElementById('message-box');
    messageBox.classList.add('hidden');
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
    
    // Switch back to login page
    const formSection = document.getElementById('form-section');
    const dashboardSection = document.getElementById('dashboard-section');
    if (formSection && dashboardSection) {
        dashboardSection.classList.add('hidden');
        formSection.classList.remove('hidden');
    }
    
    // Reset to login tab
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelector('[data-tab="login"]').classList.add('active');
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById('login').classList.add('active');
    document.querySelectorAll('.flow-diagram').forEach(flow => flow.classList.remove('active'));
    document.getElementById('login-flow').classList.add('active');
    
    showMessage('✓ Logged out successfully', 'success');
    setTimeout(() => clearMessage(), 2000);
});

document.getElementById('messages-btn').addEventListener('click', () => {
    showMessage('📨 Messages feature coming soon!', 'success');
});

document.getElementById('profile-btn').addEventListener('click', () => {
    showMessage('👤 Profile feature coming soon!', 'success');
});

document.getElementById('settings-btn').addEventListener('click', () => {
    showMessage('⚙️ Settings feature coming soon!', 'success');
});
