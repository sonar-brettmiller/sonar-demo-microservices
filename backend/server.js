const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const PORT = process.env.PORT || 5000;

// ⚠️ SECURITY ISSUE: Hardcoded secret key
const JWT_SECRET = "hardcoded-secret-key-123!";
const DB_PASSWORD = "admin123";
const API_KEY = "sk-1234567890abcdef";

// ⚠️ SECURITY ISSUE: Overly permissive CORS
app.use(cors({
    origin: '*',
    credentials: true,
    allowedHeaders: '*'
}));

// Basic middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// ⚠️ SECURITY ISSUE: Using helmet with disabled features
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));

// Initialize SQLite database
const db = new sqlite3.Database(':memory:');

// ⚠️ SECURITY ISSUE: SQL injection vulnerable table creation
function initializeDatabase() {
    db.serialize(() => {
        // Create users table
        db.run(`CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            email TEXT,
            password TEXT,
            role TEXT DEFAULT 'user',
            api_key TEXT
        )`);

        // ⚠️ SECURITY ISSUE: Default admin user with weak password
        const hashedPassword = bcrypt.hashSync('password123', 10);
        db.run(`INSERT INTO users (username, email, password, role, api_key) 
                VALUES ('admin', 'admin@example.com', '${hashedPassword}', 'admin', '${API_KEY}')`);
        
        // Create posts table
        db.run(`CREATE TABLE posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            content TEXT,
            author_id INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Insert sample data
        db.run("INSERT INTO posts (title, content, author_id) VALUES ('Welcome', 'Welcome to our platform!', 1)");
    });
}

// Swagger configuration
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'SonarSource Demo API',
            version: '1.0.0',
            description: 'API with intentional security vulnerabilities for demo purposes'
        },
        servers: [{ url: `http://localhost:${PORT}` }]
    },
    apis: ['./server.js']
};

const specs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// ⚠️ SECURITY ISSUE: Unsafe authentication middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    // ⚠️ SECURITY ISSUE: Using hardcoded secret for JWT verification
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

/**
 * @swagger
 * /api/register:
 *   post:
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 */
app.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body;

    // ⚠️ SECURITY ISSUE: No input validation
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        // ⚠️ SECURITY ISSUE: Weak password hashing (low salt rounds)
        const hashedPassword = await bcrypt.hash(password, 5);
        
        // 🔒 SECURITY: Using parameterized query to prevent SQL injection
        const query = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;
        
        db.run(query, [username, email, hashedPassword], function(err) {
            if (err) {
                // ⚠️ SECURITY ISSUE: Information disclosure through error messages
                return res.status(500).json({ error: err.message, query: query });
            }
            
            // ⚠️ SECURITY ISSUE: Logging sensitive information
            console.log(`New user registered: ${username}, password: ${password}`);
            
            res.status(201).json({ 
                message: 'User registered successfully',
                userId: this.lastID,
                // ⚠️ SECURITY ISSUE: Exposing internal details
                debug: { hashedPassword, originalPassword: password }
            });
        });
    } catch (error) {
        res.status(500).json({ error: 'Registration failed' });
    }
});

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Login user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 */
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    // 🔒 SECURITY: Using parameterized query to prevent SQL injection
    const query = `SELECT * FROM users WHERE username = ?`;
    
    db.get(query, [username], async (err, user) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (!user || !(await bcrypt.compare(password, user.password))) {
            // ⚠️ SECURITY ISSUE: Information disclosure - different error messages
            if (!user) {
                return res.status(401).json({ error: 'User not found' });
            } else {
                return res.status(401).json({ error: 'Invalid password' });
            }
        }

        // ⚠️ SECURITY ISSUE: JWT with hardcoded secret and long expiration
        const token = jwt.sign(
            { userId: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        // ⚠️ SECURITY ISSUE: Sensitive data in response
        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                // ⚠️ SECURITY ISSUE: Exposing API key
                apiKey: user.api_key,
                hashedPassword: user.password
            }
        });
    });
});

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (admin only)
 */
app.get('/api/users', authenticateToken, (req, res) => {
    // ⚠️ SECURITY ISSUE: No authorization check for admin role
    const query = "SELECT id, username, email, role, api_key FROM users";
    
    db.all(query, (err, users) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(users);
    });
});

/**
 * @swagger
 * /api/user/{id}:
 *   get:
 *     summary: Get user by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
app.get('/api/user/:id', (req, res) => {
    const { id } = req.params;

    // 🔒 SECURITY: Using parameterized query to prevent SQL injection
    const query = `SELECT * FROM users WHERE id = ?`;
    
    db.get(query, [id], (err, user) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // ⚠️ SECURITY ISSUE: Exposing sensitive user data without authentication
        res.json(user);
    });
});

/**
 * @swagger
 * /api/posts:
 *   get:
 *     summary: Get all posts
 */
app.get('/api/posts', (req, res) => {
    // ⚠️ SECURITY ISSUE: No pagination, potential DoS
    const query = "SELECT * FROM posts ORDER BY created_at DESC";
    
    db.all(query, (err, posts) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(posts);
    });
});

/**
 * @swagger
 * /api/search:
 *   get:
 *     summary: Search users
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 */
app.get('/api/search', (req, res) => {
    const { q } = req.query;

    // 🔒 SECURITY: Using parameterized query to prevent SQL injection
    const query = `SELECT username, email FROM users WHERE username LIKE ? OR email LIKE ?`;
    
    db.all(query, [`%${q}%`, `%${q}%`], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

/**
 * @swagger
 * /api/file:
 *   get:
 *     summary: Download file
 *     parameters:
 *       - in: query
 *         name: filename
 *         schema:
 *           type: string
 */
app.get('/api/file', (req, res) => {
    const { filename } = req.query;

    // 🔒 SECURITY: Validate and sanitize filename to prevent path traversal
    if (!filename || typeof filename !== 'string') {
        return res.status(400).json({ error: 'Invalid filename' });
    }
    
    // Remove any path traversal attempts
    const safeFilename = path.basename(filename);
    const SAFE_FILENAME_REGEX = /^[a-zA-Z0-9_.-]+$/;
    
    if (!SAFE_FILENAME_REGEX.test(safeFilename)) {
        return res.status(400).json({ error: 'Invalid filename characters' });
    }
    
    const filePath = path.join(__dirname, 'uploads', safeFilename);
    
    fs.readFile(filePath, (err, data) => {
        if (err) {
            return res.status(404).json({ error: 'File not found' });
        }
        res.send(data);
    });
});

/**
 * @swagger
 * /api/system-info:
 *   get:
 *     summary: Get safe system information (admin only)
 */
app.get('/api/system-info', authenticateToken, (req, res) => {
    // 🔒 SECURITY: Proper authorization check for admin role
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }

    // 🔒 SECURITY: Safe system information without command execution
    res.json({
        platform: process.platform,
        nodeVersion: process.version,
        timestamp: new Date().toISOString()
    });
});

// 🔒 SECURITY: Removed dangerous exec endpoint
// Command execution should never be allowed in production applications

// 🔒 SECURITY: Removed dangerous debug endpoint
// Debug information should never be exposed in production

// 🔒 SECURITY: File upload endpoint with proper restrictions
app.post('/api/upload', authenticateToken, (req, res) => {
    // 🔒 SECURITY: Not implemented to prevent unrestricted uploads
    res.status(501).json({ 
        error: 'Upload functionality not implemented',
        message: 'File upload requires proper security configuration'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    // 🔒 SECURITY: Safe error handling without information disclosure
    console.error('Server error:', err.message);
    res.status(500).json({ 
        error: 'Internal server error'
    });
});

// Initialize database for both server and tests
initializeDatabase();

// Start server only if not in test mode
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 SonarSource Demo Backend running on port ${PORT}`);
    console.log(`📖 API Documentation: http://localhost:${PORT}/api-docs`);
  });
}

module.exports = app;
