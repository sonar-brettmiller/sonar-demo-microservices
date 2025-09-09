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
        
        // ⚠️ SECURITY ISSUE: SQL injection vulnerability
        const query = `INSERT INTO users (username, email, password) VALUES ('${username}', '${email}', '${hashedPassword}')`;
        
        db.run(query, function(err) {
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

    // ⚠️ SECURITY ISSUE: SQL injection vulnerability in login
    const query = `SELECT * FROM users WHERE username = '${username}'`;
    
    db.get(query, async (err, user) => {
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

    // ⚠️ SECURITY ISSUE: SQL injection vulnerability
    const query = `SELECT * FROM users WHERE id = ${id}`;
    
    db.get(query, (err, user) => {
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

    // ⚠️ SECURITY ISSUE: SQL injection in search functionality
    const query = `SELECT username, email FROM users WHERE username LIKE '%${q}%' OR email LIKE '%${q}%'`;
    
    db.all(query, (err, results) => {
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

    // ⚠️ SECURITY ISSUE: Path traversal vulnerability
    const filePath = path.join(__dirname, 'uploads', filename);
    
    // ⚠️ SECURITY ISSUE: No validation of file path
    fs.readFile(filePath, (err, data) => {
        if (err) {
            return res.status(404).json({ error: 'File not found', path: filePath });
        }
        res.send(data);
    });
});

/**
 * @swagger
 * /api/exec:
 *   post:
 *     summary: Execute system command (admin only)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               command:
 *                 type: string
 */
app.post('/api/exec', authenticateToken, (req, res) => {
    const { command } = req.body;

    // ⚠️ SECURITY ISSUE: Command injection vulnerability
    // ⚠️ SECURITY ISSUE: No authorization check for admin role
    exec(command, (error, stdout, stderr) => {
        if (error) {
            return res.status(500).json({ 
                error: error.message,
                command: command
            });
        }
        
        res.json({
            output: stdout,
            error: stderr,
            command: command
        });
    });
});

// ⚠️ SECURITY ISSUE: Information disclosure endpoint
app.get('/api/debug', (req, res) => {
    res.json({
        environment: process.env,
        secrets: {
            jwtSecret: JWT_SECRET,
            dbPassword: DB_PASSWORD,
            apiKey: API_KEY
        },
        system: {
            platform: process.platform,
            version: process.version,
            cwd: process.cwd()
        }
    });
});

// ⚠️ SECURITY ISSUE: Unrestricted file upload
app.post('/api/upload', (req, res) => {
    // Missing file upload handling, but endpoint exists
    res.json({ message: 'Upload endpoint (not implemented)' });
});

// ⚠️ MAINTAINABILITY ISSUE: Extremely complex function with many violations
function processUserDataWithManyIssues(userData, options, config, metadata, context, settings, flags) {
    // ⚠️ RELIABILITY ISSUE: No null checks
    let result = userData.name.toUpperCase();
    
    // ⚠️ MAINTAINABILITY ISSUE: Excessive cyclomatic complexity
    if (options.format === 'json') {
        if (config.includeMetadata) {
            if (metadata.version === '1.0') {
                if (context.environment === 'production') {
                    if (settings.security === 'high') {
                        if (flags.encryption) {
                            if (userData.role === 'admin') {
                                if (options.detailed) {
                                    result = `ADMIN-${result}-ENCRYPTED-${Date.now()}`;
                                } else {
                                    result = `ADMIN-${result}-SIMPLE`;
                                }
                            } else {
                                result = `USER-${result}-ENCRYPTED`;
                            }
                        } else {
                            result = `SECURE-${result}`;
                        }
                    } else {
                        result = `PROD-${result}`;
                    }
                } else {
                    result = `DEV-${result}`;
                }
            } else {
                result = `V2-${result}`;
            }
        } else {
            result = `SIMPLE-${result}`;
        }
    } else if (options.format === 'xml') {
        result = `<user>${result}</user>`;
    } else if (options.format === 'csv') {
        result = `"${result}","${userData.email}","${userData.role}"`;
    } else {
        result = result.toLowerCase();
    }
    
    // ⚠️ SECURITY ISSUE: More hardcoded secrets
    const SECRET_ENCRYPTION_KEY = 'super-secret-key-456789';
    const INTERNAL_API_TOKEN = 'tk_prod_123456789abcdef';
    
    // ⚠️ RELIABILITY ISSUE: Potential division by zero
    const randomFactor = Math.random() * 0;
    const calculatedValue = 100 / randomFactor;
    
    return result + calculatedValue;
}

// ⚠️ MAINTAINABILITY ISSUE: Duplicated code block 1
function processUserRegistrationData(userData) {
    // ⚠️ RELIABILITY ISSUE: No error handling
    const username = userData.username.trim().toLowerCase();
    const email = userData.email.trim().toLowerCase();
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(username);
    
    if (hasSpecialChars) {
        throw new Error('Username contains invalid characters');
    }
    
    const result = {
        username: username,
        email: email,
        processed: true,
        timestamp: Date.now()
    };
    
    // ⚠️ SECURITY ISSUE: Logging sensitive data
    console.log('Processing user data:', userData.password);
    
    return result;
}

// ⚠️ MAINTAINABILITY ISSUE: Duplicated code block 2 (almost identical)
function processUserLoginData(userData) {
    // ⚠️ RELIABILITY ISSUE: No error handling
    const username = userData.username.trim().toLowerCase();
    const email = userData.email.trim().toLowerCase();
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(username);
    
    if (hasSpecialChars) {
        throw new Error('Username contains invalid characters');
    }
    
    const result = {
        username: username,
        email: email,
        processed: true,
        timestamp: Date.now()
    };
    
    // ⚠️ SECURITY ISSUE: Logging sensitive data
    console.log('Processing login data:', userData.password);
    
    return result;
}

// ⚠️ MAINTAINABILITY ISSUE: Function with too many lines and complexity
function generateUserReportWithManyIssues(userId, includePersonalData, includeFinancialData, includeSystemData, format, encryption, compression, metadata) {
    let report = '';
    let userData = null;
    let financialData = null;
    let systemData = null;
    
    // ⚠️ RELIABILITY ISSUE: Multiple potential null pointer exceptions
    if (includePersonalData) {
        userData = getUserData(userId);
        report += `Name: ${userData.firstName} ${userData.lastName}\n`;
        report += `Email: ${userData.email}\n`;
        report += `Phone: ${userData.phoneNumber}\n`;
        report += `Address: ${userData.address.street} ${userData.address.city}\n`;
        report += `Country: ${userData.address.country}\n`;
        report += `Postal Code: ${userData.address.postalCode}\n`;
    }
    
    if (includeFinancialData) {
        financialData = getFinancialData(userId);
        report += `Account Balance: ${financialData.balance}\n`;
        report += `Credit Score: ${financialData.creditScore}\n`;
        report += `Bank Account: ${financialData.bankAccount.number}\n`;
        report += `Routing Number: ${financialData.bankAccount.routing}\n`;
        report += `Card Number: ${financialData.creditCard.number}\n`;
        report += `CVV: ${financialData.creditCard.cvv}\n`;
    }
    
    if (includeSystemData) {
        systemData = getSystemData(userId);
        report += `Last Login: ${systemData.lastLogin}\n`;
        report += `IP Address: ${systemData.lastIpAddress}\n`;
        report += `Browser: ${systemData.browserInfo}\n`;
        report += `Device: ${systemData.deviceInfo}\n`;
        report += `Session ID: ${systemData.sessionId}\n`;
        report += `API Key: ${systemData.apiKey}\n`;
    }
    
    // ⚠️ MAINTAINABILITY ISSUE: Nested conditions creating high complexity
    if (format === 'json') {
        if (encryption) {
            if (compression) {
                return compressAndEncryptJson(report, metadata);
            } else {
                return encryptJson(report, metadata);
            }
        } else {
            if (compression) {
                return compressJson(report, metadata);
            } else {
                return convertToJson(report, metadata);
            }
        }
    } else if (format === 'xml') {
        if (encryption) {
            if (compression) {
                return compressAndEncryptXml(report, metadata);
            } else {
                return encryptXml(report, metadata);
            }
        } else {
            if (compression) {
                return compressXml(report, metadata);
            } else {
                return convertToXml(report, metadata);
            }
        }
    } else if (format === 'csv') {
        if (encryption) {
            if (compression) {
                return compressAndEncryptCsv(report, metadata);
            } else {
                return encryptCsv(report, metadata);
            }
        } else {
            if (compression) {
                return compressCsv(report, metadata);
            } else {
                return convertToCsv(report, metadata);
            }
        }
    } else {
        return report;
    }
}

// ⚠️ RELIABILITY ISSUE: Functions that will never be called (unreachable code)
function neverCalledFunction1() {
    console.log('This function is never called');
    return 'dead code';
}

function neverCalledFunction2() {
    console.log('This function is also never called');
    return 'more dead code';
}

function neverCalledFunction3() {
    console.log('Yet another function that is never called');
    return 'even more dead code';
}

// ⚠️ SECURITY ISSUE: More hardcoded credentials
const DATABASE_URL = 'postgresql://admin:password123@localhost:5432/production_db';
const REDIS_PASSWORD = 'redis_secret_password_789';
const EMAIL_API_KEY = 'sg.abc123def456ghi789jkl';
const PAYMENT_SECRET_KEY = 'sk_live_prod_secret_key_payment_processor';

// ⚠️ MAINTAINABILITY ISSUE: Magic numbers everywhere
function calculateUserScore(userData) {
    let score = 0;
    score += userData.age * 1.5;
    score += userData.experience * 2.3;
    score += userData.projects * 4.7;
    score += userData.skills.length * 3.2;
    score -= userData.violations * 5.8;
    score += userData.rating * 6.4;
    score *= 1.15;
    score += 42;
    score -= 13;
    score *= 0.95;
    score += 7;
    return Math.round(score * 100) / 100;
}

// Error handling middleware
app.use((err, req, res, next) => {
    // ⚠️ SECURITY ISSUE: Information disclosure in error messages
    console.error(err.stack);
    res.status(500).json({ 
        error: err.message,
        stack: err.stack,
        details: err
    });
});

// Initialize database for both server and tests
initializeDatabase();

// Start server only if not in test mode
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 SonarSource Demo Backend running on port ${PORT}`);
    console.log(`📖 API Documentation: http://localhost:${PORT}/api-docs`);
    console.log(`🔐 JWT Secret: ${JWT_SECRET}`);
    console.log(`🗄️  Database Password: ${DB_PASSWORD}`);
  });
}

module.exports = app;
