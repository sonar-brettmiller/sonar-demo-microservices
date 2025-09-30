---
trigger: always_on
description:
globs:
---

# Security Standards (SonarQube Rating A)

**Target:** New Security Rating ≤ 1.0 (A)  
**Current Status:** ✅ PASSING (1.0)

## Critical Security Rules

### Input Validation (XSS Prevention)
```javascript
// ❌ BAD: Direct user input in HTML
element.innerHTML = userInput;

// ✅ GOOD: Sanitize with library
import DOMPurify from 'dompurify';
element.innerHTML = DOMPurify.sanitize(userInput);
```

### SQL Injection Prevention
```javascript
// ❌ BAD: String concatenation
db.query(`SELECT * FROM users WHERE id = ${userId}`);

// ✅ GOOD: Parameterized query
db.query('SELECT * FROM users WHERE id = ?', [userId]);
```

### Secrets Management
```javascript
// ❌ BAD: Hardcoded credentials
const apiKey = 'sk_live_abc123xyz';

// ✅ GOOD: Environment variables
const apiKey = process.env.API_KEY;
```

### Eval/Dynamic Code Execution
```javascript
// ❌ PROHIBITED
eval(userInput);
Function(userCode)();

// ✅ GOOD: Use safe alternatives (JSON.parse, config objects)
const config = JSON.parse(userInput);
```

### Password Storage
```python
# ❌ BAD: Plain text
user.password = request.form['password']

# ✅ GOOD: Hashed with bcrypt
import bcrypt
user.password = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
```

### File Uploads
```javascript
// ✅ REQUIRED: Validate type and size
const ALLOWED_TYPES = ['image/png', 'image/jpeg'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

if (!ALLOWED_TYPES.includes(file.mimetype)) {
  throw new Error('Invalid file type');
}
if (file.size > MAX_SIZE) {
  throw new Error('File too large');
}
```

### Path Traversal Prevention
```javascript
// ❌ BAD: User-controlled paths
fs.readFile(`/uploads/${userFilename}`);

// ✅ GOOD: Validate and sanitize
const path = require('path');
const safePath = path.normalize(userFilename).replace(/^(\.\.[\/\\])+/, '');
```

## HTTPS and CORS

### Secure Protocols
```javascript
// ❌ BAD
fetch('http://api.example.com/data');

// ✅ GOOD
fetch('https://api.example.com/data');
```

### CORS Configuration
```javascript
// ❌ BAD: Wildcard in production
app.use(cors({ origin: '*' }));

// ✅ GOOD: Explicit origins
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS.split(','),
  credentials: true
}));
```

## Prohibited Actions
- ❌ Using `eval()`, `exec()`, `Function()` with user input
- ❌ Hardcoding API keys, passwords, tokens
- ❌ String concatenation in SQL queries
- ❌ Ignoring input validation
- ❌ Exposing stack traces or DB schemas in error messages

## Security Hotspots Review

When introducing security-sensitive code, document:
1. **Why** this approach was chosen
2. **What** mitigations are in place
3. **Assumptions** about the security context

**Example:**
```javascript
// SECURITY HOTSPOT: Using JWT for authentication
// Mitigation: Tokens expire in 15 minutes, refresh tokens rotate
// Assumption: HTTPS is enforced at load balancer level
```

## AI Workflow

### Before Writing Code:
1. ✅ Check if user input is involved → sanitize
2. ✅ Check if secrets are needed → use env vars
3. ✅ Check if database query → use parameterization
4. ✅ Check if file operations → validate paths

### Red Flags to Auto-Fix:
- Any hardcoded credentials → suggest `.env` file
- Any `eval()` usage → refuse and suggest alternatives
- Any unvalidated user input → add validation