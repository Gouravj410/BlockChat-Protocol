# BlockChat Protocol - Backend Visualization Tool

An educational tool that visually demonstrates how authentication flows work through a two-column interface:
- **Left**: A working frontend form (Login/Register)
- **Right**: Real-time backend flow visualization

## Features

### Login Flow (7 Steps)
1. **HTTP Request** - POST /login request sent
2. **API Endpoint** - Server receives request with credentials
3. **Server Logic** - Input validation
4. **Database Query** - Search for user in database
5. **Authentication** - Compare password hashes
6. **Session/Token** - Create JWT session token
7. **Response** - Send success/error response

### Register Flow (7 Steps)
1. **HTTP Request** - POST /register request sent
2. **Validate Input** - Check all required fields
3. **Check User Exists** - Verify email not already registered
4. **Hash Password** - Encrypt password securely
5. **Insert Database** - Create user record
6. **Send Confirmation** - Send verification email
7. **Response** - Send success/error response

## Demo Credentials

Test the login flow:
- **Email**: user@example.com
- **Password**: password123

Or register a new account with any email format.

## Color Coding

- 🟢 **Green** - Success (step completed successfully)
- 🔴 **Red** - Error (validation failed)
- 🔵 **Blue** - Active (currently processing)
- ⚪ **Grey** - Inactive (not yet reached)

## How It Works

1. User fills in form on the **LEFT side**
2. Clicks Login/Register button
3. **RIGHT side** animates step-by-step showing:
   - What request is sent
   - How server processes it
   - Database interactions
   - Authentication checks
   - Final response sent back

Each step lights up one at a time, helping beginners understand:
- The request/response cycle
- Why certain steps are necessary
- What happens at each layer
- Why security measures exist

## Design Philosophy

✅ **Simple** - No complex code shown, just visual flow  
✅ **Clear** - One line of text per step  
✅ **Educational** - Shows the "why" not the "how"  
✅ **Interactive** - Users see immediate cause and effect  
✅ **Beautiful** - Modern, responsive design  

## Usage

1. Open `index.html` in a web browser
2. Switch between Login and Register tabs
3. Fill in the form
4. Click the button and watch the backend flow animate
5. Open browser console to see demo credentials logged

## Files

- `index.html` - Structure and layout
- `styles.css` - Styling and animations
- `script.js` - Interactivity and flow logic

## Perfect For

📚 **Learning** - Beginners understanding web development  
👨‍🏫 **Teaching** - Demonstrating authentication concepts  
💼 **Portfolio** - Impressive project for interviews  
🎓 **Practice** - Understanding request/response cycles  

---

Made to help beginners finally understand how backend authentication works.
