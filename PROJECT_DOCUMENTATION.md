# BlockChat Protocol - Complete Project Documentation

## 📋 Project Overview

**BlockChat Protocol** is an educational backend visualization platform that demonstrates how authentication workflows (register, login, session management) function in a real-world application. The project provides a visual, interactive representation of the entire backend process, from HTTP request to database operations.

### Key Features
- **Interactive Authentication Flow**: Register and login forms with real-time backend visualization
- **Dual-Panel Interface**: Left panel shows frontend forms (register/login/dashboard), right panel displays backend workflow
- **7-Step Flow Visualization**: Each step shows what happens at the server level (validation, database query, authentication, token creation)
- **Live Dashboard**: Post-login dashboard with animated flow showing user session status and available features
- **Educational Focus**: Built to teach developers how web authentication actually works under the hood

---

## 🏗️ Architecture

### Technology Stack
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla, no frameworks on main site)
- **Backend**: Node.js with Express.js
- **Database**: SQLite3
- **Build/Runtime**: npm

### System Architecture
```
User Browser (Frontend)
    ├── Register/Login Forms (Left Panel)
    ├── Backend Flow Visualization (Right Panel - Always Visible)
    └── HTTP Requests → Node.js Server
            ├── API Endpoints (/api/login, /api/register)
            ├── Database Operations (SQLite)
            └── Session/Token Management
```

### Two-Panel Layout
```
┌─────────────────────────────────────────┐
│           FULL PAGE (100vh)              │
├──────────────────┬──────────────────────┤
│  LEFT (50%)      │   RIGHT (50%)        │
│                  │                      │
│ Register Form    │  Backend Flow        │
│ OR               │  (7 Steps)           │
│ Login Form       │                      │
│ OR               │  - HTTP Request      │
│ Dashboard Menu   │  - API Endpoint      │
│                  │  - Server Logic      │
│                  │  - Database Query    │
│                  │  - Authentication    │
│                  │  - Session/Token     │
│                  │  - Response          │
│                  │                      │
└──────────────────┴──────────────────────┘
```

---

## 📁 File Structure

### Core Files

#### **index.html**
- Main entry point of the application
- Contains three page sections: Register, Login, Dashboard
- Defines the two-panel layout structure
- Includes backend flow diagrams for all three workflows
- Scripts: `script.js` and `floating-lines.js`

**Key Elements:**
- `#register-page`, `#login-page`, `#dashboard-page`: Three page containers
- `#register-bg`, `#login-bg`, `#dashboard-bg`: Background animation containers
- `.left-side`: Frontend input sections (50% width)
- `.right-side`: Backend flow visualization (50% width)
- Flow diagrams: `#register-flow`, `#login-flow`, `#dashboard-flow`

#### **styles.css** (876 lines)
Complete stylesheet defining:
- Page layout and responsiveness (`.page`, `.container`, `.left-side`, `.right-side`)
- Form styling (inputs, buttons, labels, validation states)
- Backend flow step styling (`.step`, `.flow-diagram`, `.flow-container`)
- Color scheme (dark background, white text, gradient accents)
- Animations (step reveal, arrow animations, button transitions)
- Message boxes and status indicators

**Key Classes:**
- `.page`: Page container (register/login/dashboard)
- `.form-container`, `.form-group`, `.form-button`: Form elements
- `.flow-diagram`, `.step`, `.arrow`: Backend flow visualization
- `.result-badge`: Status indicators (success/error/processing)
- `.floating-lines-container`: Background animation area

#### **script.js** (429 lines)
Main JavaScript application controller:
- **Page Navigation**: `showPage(pageId)` - Switches between register/login/dashboard
- **Form Handling**: `handleLogin()`, `handleRegister()` - Form submission and validation
- **Flow Animation**: Animates 7-step backend flow based on server responses
- **UI Helper Functions**: `disableFormInputs()`, `setButtonLoading()`, `showMessageLogin()`, etc.
- **Auto-Contrast**: Adjusts text color based on background for readability
- **Session Management**: Stores and retrieves login state from localStorage

**Key Functions:**
```javascript
showPage(pageId)                    // Switch pages and show appropriate backend flow
handleLogin()                       // POST /api/login and animate flow steps
handleRegister()                    // POST /api/register and animate flow steps
clearFlowResults(flow)              // Reset flow visualization
updateAutoContrast()                // Adjust text colors for readability
```

#### **floating-lines.js** (Originally WebGL Background)
**Note**: This file has been deleted/recreated. If needed, restore as vanilla JS WebGL particles background:
- Creates animated particles using WebGL
- Exposes global functions: `initFloatingLines(containerId)`, `destroyFloatingLines()`
- Provides fallback gradient when WebGL unavailable
- Called by `script.js` when page loads or navigates

#### **server.js** (Backend)
Node.js/Express backend server:
- **Port**: 3000 (default)
- **Database**: SQLite (`blockchat.db`)
- **Endpoints**:
  - `POST /api/login` - Authenticate user and return session/token
  - `POST /api/register` - Create new user account
  - `GET /` - Serves static files (index.html, styles.css, script.js)

**Demo Credentials:**
```
Email: user@example.com
Password: password123
```

**Response Format** (with flowSteps array for visualization):
```json
{
  "success": true,
  "message": "Login successful",
  "user": { "id": 1, "name": "Demo User", "email": "user@example.com" },
  "token": "jwt_token_here",
  "sessionId": "session_id_here",
  "flowSteps": [
    { "step": 1, "status": "success", "text": "Request received", "data": null, "result": null },
    { "step": 2, "status": "success", "data": { "email": "...", "password": "..." }, "result": "Input validated" },
    ...
  ]
}
```

#### **package.json**
Node.js project manifest:
- Dependencies: `express`, `sqlite3`, `body-parser`, `cors`
- Scripts: `"start": "node server.js"`

---

## 🔄 User Workflow

### 1. **Register Flow** (Register Page)
```
User enters: Full Name, Email, Password, Confirm Password
         ↓
Form validates inputs
         ↓
POST /api/register
         ↓
7-Step Animation (Right Panel):
  1. HTTP Request sent
  2. Validate Input (check all fields)
  3. Check User Exists (email in DB?)
  4. Hash Password (encrypt password)
  5. Insert Database (create user record)
  6. Send Confirmation (email verification)
  7. Response (success or error)
         ↓
Auto-redirect to Login page
```

### 2. **Login Flow** (Login Page)
```
User enters: Email, Password
         ↓
Form validates inputs
         ↓
POST /api/login
         ↓
7-Step Animation (Right Panel):
  1. HTTP Request (POST /login request sent)
  2. API Endpoint (Server receives request, shows email/password)
  3. Server Logic (Validating input data)
  4. Database Query (Searching user in database)
  5. Authentication (Comparing password hashes)
  6. Session/Token (Creating user session)
  7. Response (Sending response with token/sessionId)
         ↓
Store session in localStorage
         ↓
Show Dashboard
```

### 3. **Dashboard Flow** (Dashboard Page)
```
User is logged in
         ↓
Dashboard displays:
  - Welcome message
  - Menu buttons (Messages, Profile, Settings, Logout)
         ↓
Right Panel shows Dashboard Flow:
  1. Session Active (User authenticated ✓)
  2. Messages Module (View and send messages)
  3. Profile Management (Edit user profile)
  4. Settings (Configure preferences)
  5. Logout (End session securely)
```

---

## 🎨 Visual Design

### Color Scheme
- **Background**: Dark (`#0b1220`)
- **Text**: White (`#ffffff`)
- **Primary Accent**: Cyan/Blue (`#4aa3ff`, `#00d4ff`)
- **Success**: Green (`#27ae60`)
- **Error**: Red (`#e74c3c`)
- **Processing**: Blue (`#3498db`)

### Typography
- **Font Family**: Segoe UI, Tahoma, Geneva, Verdana, sans-serif
- **Heading Size**: 40px-44px (large and prominent)
- **Body Text**: 15-17px
- **Label Text**: 15px (slightly bolder)

### Layout Adjustments (Recent)
- **Reduced spacing**: Tighter paddings/gaps between form elements
- **Larger text**: Increased base font-size to 17px
- **White text site-wide**: All text changed to white for contrast
- **Dark backgrounds**: Left and right panels use dark background (`rgba(6, 10, 18, 0.95)`)

---

## 🚀 Setup & Running the Project

### Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)

### Installation Steps

1. **Navigate to project directory:**
   ```bash
   cd e:\Gourav\Hackathon\BlockChatProtocol\BlockChat-Protocol
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the backend server:**
   ```bash
   npm start
   ```
   Or:
   ```bash
   node server.js
   ```

4. **Open in browser:**
   ```
   http://localhost:3000
   ```

### Expected Output
```
BLOCKCHAT PROTOCOL - BACKEND
✓ Server running on http://localhost:3000
DEMO CREDENTIALS: Email: user@example.com Password: password123
✓ Connected to SQLite database
✓ Users table ready
✓ Sessions table ready
```

---

## 🔧 How to Make Changes

### Change Form Fields
**File**: `index.html`

**Register Form** (lines 16-41):
```html
<div class="form-group">
    <label>Full Name</label>
    <input type="text" id="register-name" placeholder="John Doe">
</div>
```
- Add new form groups inside `.form-container`
- Update corresponding JavaScript validation in `script.js`

**Example: Add "Phone" field**
```html
<div class="form-group">
    <label>Phone</label>
    <input type="tel" id="register-phone" placeholder="+1-555-0000">
</div>
```

Then update `handleRegister()` in `script.js` to capture and validate.

### Change Backend Flow Steps
**File**: `index.html`

**Flow Diagram** (lines 89-150 for login flow):
```html
<div id="login-flow" class="flow-diagram active">
    <div class="step" data-step="1">
        <div class="step-number">1</div>
        <div class="step-content">
            <div class="step-title">HTTP Request</div>
            <div class="step-text">POST /login request sent</div>
        </div>
    </div>
```

- Each step has `data-step="X"` (1-7)
- Update `step-title` and `step-text` to describe backend operations
- Ensure `step-number` matches `data-step`

### Change Colors
**File**: `styles.css`

**Background Color**:
```css
body {
    background: #0b1220;  /* Change this hex code */
    color: #ffffff;
}
```

**Success Badge**:
```css
.result-badge.success {
    background: #27ae60;  /* Change to new green shade */
    color: white;
}
```

**Primary Accent** (buttons, links):
```css
.form-button {
    background: #4aa3ff;  /* Change to new blue */
}
```

### Change Font Size
**File**: `styles.css`

**Body Text**:
```css
body {
    font-size: 17px;  /* Increase or decrease */
}
```

**Headings**:
```css
.page-content h1 {
    font-size: 44px;  /* Adjust heading size */
}
```

### Add New Backend Flow (e.g., "Password Reset")
**File**: `index.html`

1. Add new flow diagram in `.flow-container`:
```html
<div id="reset-flow" class="flow-diagram">
    <div class="step" data-step="1">
        <!-- Step content -->
    </div>
    <!-- ... 7 steps ... -->
</div>
```

2. Add to page switch logic in `script.js`:
```javascript
function showPage(pageId) {
    // ... existing code ...
    if (pageId === 'register-page') {
        document.getElementById('register-flow').classList.add('active');
    } else if (pageId === 'reset-page') {
        document.getElementById('reset-flow').classList.add('active');
    }
}
```

### Add New Page (e.g., "Forgot Password")
**File**: `index.html`

1. Add page container:
```html
<div id="forgot-password-page" class="page">
    <div id="forgot-bg" class="floating-lines-container"></div>
    <div class="page-content">
        <!-- Form or content here -->
    </div>
</div>
```

2. Add navigation event in `script.js`:
```javascript
document.getElementById('forgot-btn').addEventListener('click', (e) => {
    e.preventDefault();
    showPage('forgot-password-page');
});
```

### Add New API Endpoint
**File**: `server.js`

```javascript
app.post('/api/forgot-password', async (req, res) => {
    const { email } = req.body;
    
    // Your logic here
    // Generate reset token, send email, etc.
    
    const flowSteps = [
        { step: 1, status: 'success', text: 'Request received' },
        { step: 2, status: 'success', result: 'Email validated' },
        // ... more steps ...
    ];
    
    res.json({
        success: true,
        message: 'Reset link sent',
        flowSteps: flowSteps
    });
});
```

---

## 📊 Backend Flow Step Structure

Each API response includes a `flowSteps` array that drives the right-panel animation:

```javascript
{
    step: 1,                           // Step number (1-7)
    status: 'success|error|processing', // Visual state
    text: 'Description',               // Display text (step 7 only)
    data: { email: '...', password: '...' }, // Data for step 2 (optional)
    result: 'Validation passed'        // Result badge text (optional)
}
```

**Status meanings:**
- `success`: Green badge, step completes successfully
- `error`: Red badge, stops animation here
- `processing`: Blue badge, in-progress state
- `inactive`: Gray badge, skipped step

---

## 🐛 Debugging

### Check Backend Logs
Open browser DevTools (F12) → Console tab:
- Shows page navigation logs (📍 prefix)
- Shows login/register flow logs (🔐 prefix)
- Shows error messages with red ❌

### Common Issues

**Issue**: Page not responding to form submission
- Check browser console for errors
- Verify `/api/login` endpoint is reachable: `curl http://localhost:3000/api/login`
- Ensure backend is running: `npm start`

**Issue**: Backend flow doesn't animate
- Check that response includes `flowSteps` array
- Verify step IDs in HTML match server response
- Check browser DevTools → Network tab to see response

**Issue**: Text colors hard to read
- Update `styles.css` background colors
- Adjust `color` property in relevant CSS classes
- Run `updateAutoContrast()` function in console to auto-fix

**Issue**: Floating lines (particles) background not showing
- Delete `floating-lines.js` and restart server
- Check browser console for WebGL errors
- Verify `.floating-lines-container` has non-zero width/height

---

## 📝 Key Functions Reference

### script.js

| Function | Purpose | Parameters |
|----------|---------|------------|
| `showPage(pageId)` | Switch active page and update right-panel flow | `pageId`: 'register-page', 'login-page', 'dashboard-page' |
| `handleLogin()` | Process login form and animate flow | None (reads form inputs) |
| `handleRegister()` | Process register form and animate flow | None (reads form inputs) |
| `clearFlowResults(flow)` | Reset flow visualization | `flow`: 'login' or 'register' |
| `disableFormInputs(form, disable)` | Enable/disable form inputs | `form`: 'register' or 'login', `disable`: boolean |
| `showMessageLogin(text, type)` | Display message (success/error) | `text`: message, `type`: 'success' or 'error' |
| `updateAutoContrast()` | Auto-adjust text colors | None |

### floating-lines.js (if present)

| Function | Purpose | Parameters |
|----------|---------|------------|
| `window.initFloatingLines(containerId)` | Initialize background animation | `containerId`: HTML element ID |
| `window.destroyFloatingLines(containerId)` | Cleanup animation | `containerId`: HTML element ID (optional) |

---

## 📚 Resources

### Project Files Checklist
- ✅ `index.html` - Main page structure (253 lines)
- ✅ `styles.css` - All styling (876 lines)
- ✅ `script.js` - Frontend logic (429 lines)
- ✅ `server.js` - Backend API
- ✅ `package.json` - Dependencies
- ✅ `floating-lines.js` - Background animation (deleted/can be restored)

### Database
- **File**: `blockchat.db` (created automatically on first run)
- **Tables**: 
  - `users` (id, name, email, password_hash)
  - `sessions` (id, userId, token, sessionId, createdAt)

---

## 🎯 Next Steps for Customization

1. **Change Branding**: Replace "BlockChat" with your app name in HTML/CSS
2. **Add More Flows**: Create flows for forgot password, email verification, 2FA
3. **Customize Steps**: Modify the 7 steps to match your actual backend logic
4. **Add Features**: Messages, profiles, settings functionality on dashboard
5. **Deploy**: Configure for production (database, environment variables, hosting)

---

## 📞 Support Notes

- All timestamps use `Date.now()` (milliseconds since epoch)
- Passwords stored as bcrypt hashes in production
- Sessions stored in database, retrieved via sessionId
- CORS enabled for local development
- Static files cached with `?v=1.1` query string

---

**Last Updated**: January 30, 2026  
**Version**: 1.0  
**Status**: Educational / Development
