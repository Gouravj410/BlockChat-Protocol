"""
BlockChat Protocol - Educational Backend Visualization
Real-time demonstration of authentication flows with step-by-step visualization
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
import hashlib
import secrets
import os
import time
from datetime import datetime
import atexit

# ===== INITIALIZATION =====
app = Flask(__name__)
CORS(app)

DB_PATH = os.path.join(os.path.dirname(__file__), 'blockchat.db')

def get_db():
    """Get database connection with proper configuration"""
    db = sqlite3.connect(DB_PATH)
    db.row_factory = sqlite3.Row
    # Enable foreign keys
    db.execute("PRAGMA foreign_keys = ON")
    return db

def hash_password(password):
    """Hash password using SHA256"""
    return hashlib.sha256(password.encode()).hexdigest()

def generate_token():
    """Generate JWT token"""
    return 'jwt_' + secrets.token_hex(32)

def init_database():
    """Initialize database with fresh schema"""
    try:
        db = get_db()
        cursor = db.cursor()
        
        # Drop existing tables if they exist
        cursor.execute("DROP TABLE IF EXISTS sessions")
        cursor.execute("DROP TABLE IF EXISTS users")
        
        # Create users table
        cursor.execute('''
            CREATE TABLE users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL COLLATE NOCASE,
                password_hash TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Create sessions table
        cursor.execute('''
            CREATE TABLE sessions (
                id TEXT PRIMARY KEY,
                user_id INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )
        ''')
        
        db.commit()
        
        # Insert demo user
        demo_password = 'password123'
        demo_hash = hash_password(demo_password)
        
        cursor.execute(
            'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
            ('Demo User', 'user@example.com', demo_hash)
        )
        db.commit()
        db.close()
        
        return True
    except Exception as e:
        print(f'❌ Database initialization error: {e}')
        return False

# Initialize database on startup
if not init_database():
    print('CRITICAL: Database initialization failed!')
    exit(1)

# ===== LOGIN ENDPOINT =====
@app.route('/api/login', methods=['POST', 'OPTIONS'])
def login():
    """Handle login requests with step-by-step flow"""
    
    # Handle CORS preflight
    if request.method == 'OPTIONS':
        return '', 200
    
    data = request.json or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '').strip()
    
    flow_steps = []
    
    try:
        # STEP 1: HTTP Request Received
        flow_steps.append({
            'step': 1,
            'title': 'HTTP Request',
            'text': 'POST /login request sent',
            'status': 'active'
        })
        time.sleep(0.8)
        
        # STEP 2: API Endpoint - Receive Request
        flow_steps.append({
            'step': 2,
            'title': 'API Endpoint',
            'text': 'Server receives request',
            'status': 'active',
            'data': {
                'email': email,
                'password': '••••••••'
            }
        })
        time.sleep(0.8)
        
        # STEP 3: Server Logic - Validate Input
        if not email or not password:
            flow_steps.append({
                'step': 3,
                'title': 'Server Logic',
                'text': 'Validating input data',
                'status': 'error',
                'result': '✗ Missing fields'
            })
            time.sleep(0.5)
            
            # Fill remaining as inactive
            for i in range(4, 8):
                flow_steps.append({
                    'step': i,
                    'status': 'inactive'
                })
            
            return jsonify({
                'success': False,
                'message': 'Email and password are required',
                'flowSteps': flow_steps
            }), 400
        
        flow_steps.append({
            'step': 3,
            'title': 'Server Logic',
            'text': 'Validating input data',
            'status': 'success',
            'result': '✓ Input valid'
        })
        time.sleep(0.8)
        
        # STEP 4: Database Query - Find User
        db = get_db()
        cursor = db.cursor()
        cursor.execute('SELECT * FROM users WHERE email = ?', (email,))
        user = cursor.fetchone()
        
        if not user:
            db.close()
            flow_steps.append({
                'step': 4,
                'title': 'Database Query',
                'text': 'Searching user in database',
                'status': 'error',
                'result': '✗ User not found'
            })
            time.sleep(0.5)
            
            for i in range(5, 8):
                flow_steps.append({
                    'step': i,
                    'status': 'inactive'
                })
            
            return jsonify({
                'success': False,
                'message': 'Invalid email or password',
                'flowSteps': flow_steps
            }), 401
        
        flow_steps.append({
            'step': 4,
            'title': 'Database Query',
            'text': 'Searching user in database',
            'status': 'success',
            'result': '✓ User found'
        })
        time.sleep(0.8)
        
        # STEP 5: Authentication - Compare Password Hashes
        password_hash = hash_password(password)
        password_match = password_hash == user['password_hash']
        
        if not password_match:
            db.close()
            flow_steps.append({
                'step': 5,
                'title': 'Authentication',
                'text': 'Comparing password hashes',
                'status': 'error',
                'result': '✗ Wrong password'
            })
            time.sleep(0.5)
            
            for i in range(6, 8):
                flow_steps.append({
                    'step': i,
                    'status': 'inactive'
                })
            
            return jsonify({
                'success': False,
                'message': 'Invalid email or password',
                'flowSteps': flow_steps
            }), 401
        
        flow_steps.append({
            'step': 5,
            'title': 'Authentication',
            'text': 'Comparing password hashes',
            'status': 'success',
            'result': '✓ Password matches'
        })
        time.sleep(0.8)
        
        # STEP 6: Session/Token Creation
        token = generate_token()
        session_id = 'session_' + secrets.token_hex(16)
        
        cursor = db.cursor()
        cursor.execute(
            'INSERT INTO sessions (id, user_id) VALUES (?, ?)',
            (session_id, user['id'])
        )
        db.commit()
        db.close()
        
        flow_steps.append({
            'step': 6,
            'title': 'Session/Token',
            'text': 'Creating user session',
            'status': 'success',
            'result': '✓ JWT created'
        })
        time.sleep(0.8)
        
        # STEP 7: Response
        flow_steps.append({
            'step': 7,
            'title': 'Response',
            'text': '200 OK - Login successful',
            'status': 'success'
        })
        
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'user': {
                'id': user['id'],
                'name': user['name'],
                'email': user['email']
            },
            'token': token,
            'sessionId': session_id,
            'flowSteps': flow_steps
        }), 200
        
    except Exception as e:
        print(f'❌ Login error: {str(e)}')
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}',
            'flowSteps': flow_steps
        }), 500

# ===== REGISTER ENDPOINT =====
@app.route('/api/register', methods=['POST', 'OPTIONS'])
def register():
    """Handle registration requests with step-by-step flow"""
    
    # Handle CORS preflight
    if request.method == 'OPTIONS':
        return '', 200
    
    data = request.json or {}
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '').strip()
    confirm = data.get('confirm', '').strip()
    
    flow_steps = []
    
    try:
        # STEP 1: HTTP Request
        flow_steps.append({
            'step': 1,
            'title': 'HTTP Request',
            'text': 'POST /register request sent',
            'status': 'active'
        })
        time.sleep(0.8)
        
        # STEP 2: Validate Input
        validation_errors = []
        if not name or not email or not password or not confirm:
            validation_errors.append('All fields required')
        elif password != confirm:
            validation_errors.append('Passwords do not match')
        elif len(password) < 6:
            validation_errors.append('Password must be 6+ characters')
        elif '@' not in email or '.' not in email:
            validation_errors.append('Invalid email format')
        
        if validation_errors:
            flow_steps.append({
                'step': 2,
                'title': 'Validate Input',
                'text': 'Checking all fields',
                'status': 'error',
                'result': f'✗ {validation_errors[0]}'
            })
            time.sleep(0.5)
            
            for i in range(3, 8):
                flow_steps.append({
                    'step': i,
                    'status': 'inactive'
                })
            
            return jsonify({
                'success': False,
                'message': validation_errors[0],
                'flowSteps': flow_steps
            }), 400
        
        flow_steps.append({
            'step': 2,
            'title': 'Validate Input',
            'text': 'Checking all fields',
            'status': 'success',
            'result': '✓ All fields valid'
        })
        time.sleep(0.8)
        
        # STEP 3: Check if Email Exists
        db = get_db()
        cursor = db.cursor()
        cursor.execute('SELECT email FROM users WHERE email = ?', (email,))
        existing = cursor.fetchone()
        
        if existing:
            db.close()
            flow_steps.append({
                'step': 3,
                'title': 'Check User Exists',
                'text': 'Email already in database?',
                'status': 'error',
                'result': '✗ Email taken'
            })
            time.sleep(0.5)
            
            for i in range(4, 8):
                flow_steps.append({
                    'step': i,
                    'status': 'inactive'
                })
            
            return jsonify({
                'success': False,
                'message': 'Email already registered',
                'flowSteps': flow_steps
            }), 409
        
        flow_steps.append({
            'step': 3,
            'title': 'Check User Exists',
            'text': 'Email already in database?',
            'status': 'success',
            'result': '✓ Email available'
        })
        time.sleep(0.8)
        
        # STEP 4: Hash Password
        password_hash = hash_password(password)
        flow_steps.append({
            'step': 4,
            'title': 'Hash Password',
            'text': 'Encrypting password',
            'status': 'success',
            'result': '✓ Password hashed'
        })
        time.sleep(0.8)
        
        # STEP 5: Insert into Database
        cursor = db.cursor()
        cursor.execute(
            'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
            (name, email, password_hash)
        )
        db.commit()
        user_id = cursor.lastrowid
        db.close()
        
        flow_steps.append({
            'step': 5,
            'title': 'Insert Database',
            'text': 'Creating user record',
            'status': 'success',
            'result': '✓ User created'
        })
        time.sleep(0.8)
        
        # STEP 6: Send Confirmation Email
        flow_steps.append({
            'step': 6,
            'title': 'Send Confirmation',
            'text': 'Email verification link',
            'status': 'success',
            'result': '✓ Email sent'
        })
        time.sleep(0.8)
        
        # STEP 7: Response
        flow_steps.append({
            'step': 7,
            'title': 'Response',
            'text': '201 Created - Registration successful',
            'status': 'success'
        })
        
        return jsonify({
            'success': True,
            'message': 'Account created successfully!',
            'user': {
                'id': user_id,
                'name': name,
                'email': email
            },
            'flowSteps': flow_steps
        }), 201
        
    except Exception as e:
        print(f'❌ Register error: {str(e)}')
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}',
            'flowSteps': flow_steps
        }), 500

# ===== HEALTH CHECK =====
@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'ok'}), 200

# ===== ERROR HANDLERS =====
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def server_error(error):
    return jsonify({'error': 'Server error'}), 500

# ===== STARTUP =====
if __name__ == '__main__':
    print('\n' + '='*50)
    print('  BLOCKCHAT PROTOCOL - BACKEND VISUALIZER')
    print('='*50)
    print(f'\n✓ Database: {DB_PATH}')
    print('\n📝 DEMO CREDENTIALS:')
    print('   Email: user@example.com')
    print('   Password: password123')
    print('\n🔌 ENDPOINTS:')
    print('   POST /api/login')
    print('   POST /api/register')
    print('   GET /api/health')
    print('\n▶️  Server starting...\n')
    
    # Start Flask
    app.run(
        debug=False,
        host='localhost',
        port=5000,
        use_reloader=False,
        threaded=True
    )
