const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// Database setup
const dbPath = path.join(__dirname, 'blockchat.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Database connection error:', err);
    } else {
        console.log('✓ Connected to SQLite database');
        initializeDatabase();
    }
});

// Initialize database schema
function initializeDatabase() {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) console.error('Error creating users table:', err);
        else console.log('✓ Users table ready');
    });

    db.run(`
        CREATE TABLE IF NOT EXISTS sessions (
            id TEXT PRIMARY KEY,
            user_id INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    `, (err) => {
        if (err) console.error('Error creating sessions table:', err);
        else console.log('✓ Sessions table ready');
    });

    // Insert demo user
    const demoEmail = 'user@example.com';
    const demoPassword = 'password123';
    const demoHash = hashPassword(demoPassword);

    db.get('SELECT email FROM users WHERE email = ?', [demoEmail], (err, row) => {
        if (!row) {
            db.run(
                'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
                ['Demo User', demoEmail, demoHash],
                (err) => {
                    if (err) console.error('Error inserting demo user:', err);
                    else console.log('✓ Demo user created (user@example.com)');
                }
            );
        }
    });
}

// Helper functions
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

function generateToken() {
    return 'jwt_' + crypto.randomBytes(32).toString('hex');
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ===== LOGIN ENDPOINT =====
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const flowSteps = [];

    try {
        // Step 1: HTTP Request Received
        flowSteps.push({
            step: 1,
            title: 'HTTP Request',
            text: 'POST /login request sent',
            status: 'active',
            timestamp: new Date().toISOString()
        });
        await delay(800);

        // Step 2: API Endpoint
        flowSteps.push({
            step: 2,
            title: 'API Endpoint',
            text: 'Server receives request',
            status: 'active',
            data: {
                email: email,
                password: '••••••••'
            },
            timestamp: new Date().toISOString()
        });
        await delay(800);

        // Step 3: Server Logic
        if (!email || !password) {
            flowSteps.push({
                step: 3,
                title: 'Server Logic',
                text: 'Validating input data',
                status: 'error',
                result: '✗ Missing fields',
                timestamp: new Date().toISOString()
            });
            return res.status(400).json({
                success: false,
                message: 'Email and password required',
                flowSteps: flowSteps
            });
        }

        flowSteps.push({
            step: 3,
            title: 'Server Logic',
            text: 'Validating input data',
            status: 'success',
            result: '✓ Input valid',
            timestamp: new Date().toISOString()
        });
        await delay(800);

        // Step 4: Database Query
        const user = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        if (!user) {
            flowSteps.push({
                step: 4,
                title: 'Database Query',
                text: 'Searching user in database',
                status: 'error',
                result: '✗ User not found',
                timestamp: new Date().toISOString()
            });
            await delay(800);

            flowSteps.push({
                step: 5,
                title: 'Authentication',
                text: 'Comparing password hashes',
                status: 'inactive',
                timestamp: new Date().toISOString()
            });

            flowSteps.push({
                step: 6,
                title: 'Session/Token',
                text: 'Creating user session',
                status: 'inactive',
                timestamp: new Date().toISOString()
            });

            flowSteps.push({
                step: 7,
                title: 'Response',
                text: '401 Unauthorized',
                status: 'error',
                timestamp: new Date().toISOString()
            });

            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
                flowSteps: flowSteps
            });
        }

        flowSteps.push({
            step: 4,
            title: 'Database Query',
            text: 'Searching user in database',
            status: 'success',
            result: '✓ User found',
            timestamp: new Date().toISOString()
        });
        await delay(800);

        // Step 5: Authentication
        const passwordHash = hashPassword(password);
        const passwordMatch = passwordHash === user.password_hash;

        if (!passwordMatch) {
            flowSteps.push({
                step: 5,
                title: 'Authentication',
                text: 'Comparing password hashes',
                status: 'error',
                result: '✗ Wrong password',
                timestamp: new Date().toISOString()
            });
            await delay(800);

            flowSteps.push({
                step: 6,
                title: 'Session/Token',
                text: 'Creating user session',
                status: 'inactive',
                timestamp: new Date().toISOString()
            });

            flowSteps.push({
                step: 7,
                title: 'Response',
                text: '401 Unauthorized',
                status: 'error',
                timestamp: new Date().toISOString()
            });

            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
                flowSteps: flowSteps
            });
        }

        flowSteps.push({
            step: 5,
            title: 'Authentication',
            text: 'Comparing password hashes',
            status: 'success',
            result: '✓ Password matches',
            timestamp: new Date().toISOString()
        });
        await delay(800);

        // Step 6: Session/Token Creation
        const token = generateToken();
        const sessionId = 'session_' + crypto.randomBytes(16).toString('hex');

        await new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO sessions (id, user_id) VALUES (?, ?)',
                [sessionId, user.id],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });

        flowSteps.push({
            step: 6,
            title: 'Session/Token',
            text: 'Creating user session',
            status: 'success',
            result: '✓ JWT created',
            timestamp: new Date().toISOString()
        });
        await delay(800);

        // Step 7: Response
        flowSteps.push({
            step: 7,
            title: 'Response',
            text: '200 OK - Login successful',
            status: 'success',
            timestamp: new Date().toISOString()
        });

        res.json({
            success: true,
            message: 'Login successful',
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            },
            token: token,
            sessionId: sessionId,
            flowSteps: flowSteps
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            flowSteps: flowSteps
        });
    }
});

// ===== REGISTER ENDPOINT =====
app.post('/api/register', async (req, res) => {
    const { name, email, password, confirm } = req.body;
    const flowSteps = [];

    try {
        // Step 1: HTTP Request
        flowSteps.push({
            step: 1,
            title: 'HTTP Request',
            text: 'POST /register request sent',
            status: 'active',
            timestamp: new Date().toISOString()
        });
        await delay(800);

        // Step 2: Validate Input
        const validationErrors = [];
        if (!name || !email || !password || !confirm) {
            validationErrors.push('All fields required');
        }
        if (password !== confirm) {
            validationErrors.push('Passwords do not match');
        }
        if (password && password.length < 6) {
            validationErrors.push('Password too short');
        }
        if (!email.includes('@')) {
            validationErrors.push('Invalid email format');
        }

        if (validationErrors.length > 0) {
            flowSteps.push({
                step: 2,
                title: 'Validate Input',
                text: 'Checking all fields',
                status: 'error',
                result: '✗ ' + validationErrors[0],
                timestamp: new Date().toISOString()
            });
            await delay(800);

            // Fill remaining steps as inactive
            for (let i = 3; i <= 7; i++) {
                flowSteps.push({
                    step: i,
                    title: ['', '', 'Check User Exists', 'Hash Password', 'Insert Database', 'Send Confirmation', 'Response'][i],
                    text: ['', '', 'Email already in database?', 'Encrypting password', 'Creating user record', 'Email verification link', 'Sending response...'][i],
                    status: 'inactive',
                    timestamp: new Date().toISOString()
                });
            }

            return res.status(400).json({
                success: false,
                message: validationErrors[0],
                flowSteps: flowSteps
            });
        }

        flowSteps.push({
            step: 2,
            title: 'Validate Input',
            text: 'Checking all fields',
            status: 'success',
            result: '✓ All fields valid',
            timestamp: new Date().toISOString()
        });
        await delay(800);

        // Step 3: Check if user exists
        const existingUser = await new Promise((resolve, reject) => {
            db.get('SELECT email FROM users WHERE email = ?', [email], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        if (existingUser) {
            flowSteps.push({
                step: 3,
                title: 'Check User Exists',
                text: 'Email already in database?',
                status: 'error',
                result: '✗ Email already registered',
                timestamp: new Date().toISOString()
            });
            await delay(800);

            // Fill remaining steps as inactive
            for (let i = 4; i <= 7; i++) {
                flowSteps.push({
                    step: i,
                    title: ['', 'Hash Password', 'Insert Database', 'Send Confirmation', 'Response'][i - 3],
                    text: ['', 'Encrypting password', 'Creating user record', 'Email verification link', 'Sending response...'][i - 3],
                    status: 'inactive',
                    timestamp: new Date().toISOString()
                });
            }

            return res.status(409).json({
                success: false,
                message: 'Email already registered',
                flowSteps: flowSteps
            });
        }

        flowSteps.push({
            step: 3,
            title: 'Check User Exists',
            text: 'Email already in database?',
            status: 'success',
            result: '✓ Email available',
            timestamp: new Date().toISOString()
        });
        await delay(800);

        // Step 4: Hash Password
        const passwordHash = hashPassword(password);
        flowSteps.push({
            step: 4,
            title: 'Hash Password',
            text: 'Encrypting password',
            status: 'success',
            result: '✓ Password hashed',
            timestamp: new Date().toISOString()
        });
        await delay(800);

        // Step 5: Insert into Database
        const userId = await new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
                [name, email, passwordHash],
                function(err) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });

        flowSteps.push({
            step: 5,
            title: 'Insert Database',
            text: 'Creating user record',
            status: 'success',
            result: '✓ User created',
            timestamp: new Date().toISOString()
        });
        await delay(800);

        // Step 6: Send Confirmation (simulated)
        flowSteps.push({
            step: 6,
            title: 'Send Confirmation',
            text: 'Email verification link',
            status: 'success',
            result: '✓ Email sent',
            timestamp: new Date().toISOString()
        });
        await delay(800);

        // Step 7: Response
        flowSteps.push({
            step: 7,
            title: 'Response',
            text: '201 Created - Registration successful',
            status: 'success',
            timestamp: new Date().toISOString()
        });

        res.status(201).json({
            success: true,
            message: 'Account created successfully',
            user: {
                id: userId,
                name: name,
                email: email
            },
            flowSteps: flowSteps
        });

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            flowSteps: flowSteps
        });
    }
});

// Start the server
const server = app.listen(PORT, () => {
    console.log('\n╔════════════════════════════════════╗');
    console.log('║    BLOCKCHAT PROTOCOL - BACKEND     ║');
    console.log('╚════════════════════════════════════╝\n');
    console.log(`✓ Server running on http://localhost:${PORT}`);
    console.log(`✓ Database: ${dbPath}`);
    console.log('\nDEMO CREDENTIALS:');
    console.log('  Email: user@example.com');
    console.log('  Password: password123\n');
    console.log('Endpoints:');
    console.log('  POST /api/login');
    console.log('  POST /api/register\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n✓ Shutting down...');
    db.close();
    server.close(() => {
        console.log('✓ Server stopped');
        process.exit(0);
    });
});
