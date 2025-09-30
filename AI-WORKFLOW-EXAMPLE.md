# 🤖 AI-Focused SonarQube Workflow - Practical Example

## Overview
This document shows a **real-world example** of using AI + SonarQube MCP + Context7 to generate quality-gate-compliant code.

---

## 📋 Example Task: "Add Password Reset Endpoint"

### ❌ Old Workflow (Without SonarQube Integration)
```
User: "Add a password reset endpoint"
AI: [Generates 50-line function with code smells]
Developer: Commits code
CI/CD: ❌ Quality gate fails
Developer: Must manually fix issues
```

### ✅ New Workflow (With SonarQube MCP + Context7)

---

## Step-by-Step Example

### **Step 1: Pre-Generation - Check Current State**

**User Request:**
> "Add a password reset endpoint to the backend API"

**AI Action (Automatic):**
```javascript
// 1. Query current quality gate status
const qgStatus = await mcp_sonarqube_get_project_quality_gate_status({
  projectKey: "sonar-brettmiller_sonar-demo-microservices"
});

// Result:
// - new_coverage: 89.14% ✅ (threshold: 80%)
// - new_maintainability_rating: 1.0 ✅ (threshold: 1.0)
// - All conditions passing ✅

// 2. Check current component metrics
const metrics = await mcp_sonarqube_get_component_measures({
  component: "sonar-brettmiller_sonar-demo-microservices:backend/server.js",
  metricKeys: ["code_smells", "cognitive_complexity", "coverage"]
});

// Result:
// - code_smells: 4
// - cognitive_complexity: low
// - coverage: 89.14%
```

**AI Understanding:**
- ✅ Project is currently passing quality gate
- ✅ Must maintain coverage ≥80%
- ✅ Must not introduce new code smells
- ✅ backend/server.js is the target file

---

### **Step 2: Knowledge Enhancement - Query Context7**

**AI Query to Context7:**
```
1. "Best practices for password reset API endpoints SonarQube compliant"
2. "Secure token generation patterns Node.js"
3. "How to avoid cognitive complexity in authentication flows"
4. "Express.js async error handling best practices"
```

**Knowledge Gained:**
- Use crypto.randomBytes for secure tokens
- Promisify database operations
- Keep endpoint function ≤20 lines
- Extract validation, token generation, and email logic into separate functions
- Add comprehensive tests (happy path + error cases)

---

### **Step 3: Code Generation - Apply Quality Rules**

**AI Generates (Following Rules):**

#### **File: backend/server.js**
```javascript
const crypto = require('crypto');

/**
 * @swagger
 * /api/password-reset/request:
 *   post:
 *     summary: Request password reset
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 */
app.post('/api/password-reset/request', async (req, res) => {
    const { email } = req.body;

    if (!validateEmail(email)) {
        return res.status(400).json({ error: 'Valid email required' });
    }

    try {
        const user = await findUserByEmail(email);
        if (!user) {
            // Return success even if user not found (prevent enumeration)
            return res.status(200).json({ message: 'If email exists, reset link sent' });
        }

        const resetToken = await generateResetToken(user.id);
        await sendPasswordResetEmail(user.email, resetToken);
        
        res.status(200).json({ message: 'If email exists, reset link sent' });
    } catch (error) {
        console.error('Password reset request failed:', error.message);
        res.status(500).json({ error: 'Reset request failed' });
    }
});

// ✅ GOOD: Small, focused helper functions (each ≤10 lines)

// Validate email format
function validateEmail(email) {
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return email && EMAIL_REGEX.test(email);
}

// Find user by email (Promise-based)
function findUserByEmail(email) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM users WHERE email = ?';
        db.get(query, [email], (err, user) => {
            if (err) reject(err);
            else resolve(user);
        });
    });
}

// Generate secure reset token
async function generateResetToken(userId) {
    const TOKEN_LENGTH = 32;
    const TOKEN_EXPIRY_MS = 3600000; // 1 hour
    
    const token = crypto.randomBytes(TOKEN_LENGTH).toString('hex');
    const expiresAt = Date.now() + TOKEN_EXPIRY_MS;
    
    await saveResetToken(userId, token, expiresAt);
    return token;
}

// Save reset token to database
function saveResetToken(userId, token, expiresAt) {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)';
        db.run(query, [userId, token, expiresAt], (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

// Send password reset email (stub for demo)
async function sendPasswordResetEmail(email, token) {
    // In production, integrate with email service
    console.log(`Password reset email sent to ${email}`);
    return Promise.resolve();
}
```

**Quality Analysis:**
- ✅ Main endpoint: 18 lines (under 20 limit)
- ✅ Each helper function: ≤15 lines
- ✅ Cognitive complexity: Low (early returns, no nesting)
- ✅ Security: Parameterized queries, secure token generation
- ✅ Error handling: try/catch with meaningful messages
- ✅ No hardcoded secrets
- ✅ Input validation present

---

### **Step 4: Test Generation - Ensure Coverage**

**AI Generates (Alongside Code):**

#### **File: backend/__tests__/password-reset.test.js**
```javascript
const request = require('supertest');
const app = require('../server');

describe('Password Reset Endpoint', () => {
  describe('POST /api/password-reset/request', () => {
    
    // Happy path
    test('should accept valid email and return success message', async () => {
      const response = await request(app)
        .post('/api/password-reset/request')
        .send({ email: 'admin@example.com' })
        .expect(200);
      
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('reset link sent');
    });

    // Error case: Invalid email format
    test('should reject invalid email format', async () => {
      const response = await request(app)
        .post('/api/password-reset/request')
        .send({ email: 'not-an-email' })
        .expect(400);
      
      expect(response.body).toHaveProperty('error', 'Valid email required');
    });

    // Error case: Missing email
    test('should reject missing email', async () => {
      const response = await request(app)
        .post('/api/password-reset/request')
        .send({})
        .expect(400);
      
      expect(response.body).toHaveProperty('error');
    });

    // Edge case: Non-existent email (prevent enumeration)
    test('should return success even for non-existent email', async () => {
      const response = await request(app)
        .post('/api/password-reset/request')
        .send({ email: 'nonexistent@example.com' })
        .expect(200);
      
      expect(response.body.message).toContain('reset link sent');
    });

    // Edge case: Empty email
    test('should reject empty email string', async () => {
      const response = await request(app)
        .post('/api/password-reset/request')
        .send({ email: '' })
        .expect(400);
      
      expect(response.body).toHaveProperty('error');
    });
  });
});
```

**Coverage Analysis:**
- ✅ Happy path: Covered
- ✅ Invalid input: Covered
- ✅ Missing input: Covered
- ✅ Edge cases: Covered
- ✅ Security case (enumeration prevention): Covered
- **Estimated coverage: ~95%** ✅

---

### **Step 5: Self-Review - Quality Checklist**

**AI Self-Check:**
```markdown
✅ Functions are ≤20 lines
✅ No nested conditionals >3 levels
✅ All magic numbers replaced with constants (TOKEN_LENGTH, TOKEN_EXPIRY_MS)
✅ No duplicated code
✅ Tests written for all functions
✅ Tests cover all branches (happy path + errors + edge cases)
✅ Error handling present (try/catch)
✅ No hardcoded secrets (using crypto.randomBytes)
✅ Input validation added (validateEmail)
✅ No unused imports
✅ Parameterized queries used
✅ Security best practices followed
```

**Result:** ✅ All checks pass

---

### **Step 6: Run Local Tests**

**AI Executes:**
```bash
cd backend && npm test -- --coverage
```

**Result:**
```
PASS __tests__/password-reset.test.js
  Password Reset Endpoint
    POST /api/password-reset/request
      ✓ should accept valid email and return success message
      ✓ should reject invalid email format
      ✓ should reject missing email
      ✓ should return success even for non-existent email
      ✓ should reject empty email string

Test Suites: 3 passed, 3 total
Tests:       28 passed, 28 total
Coverage:    91.2% ✅ (exceeds 80% threshold)
```

---

### **Step 7: Validate with SonarQube MCP**

**AI Queries:**
```javascript
// Check component metrics after generation
const newMetrics = await mcp_sonarqube_get_component_measures({
  component: "sonar-brettmiller_sonar-demo-microservices:backend/server.js",
  metricKeys: ["new_coverage", "new_code_smells", "new_bugs", "cognitive_complexity"]
});

// Expected results:
// - new_coverage: 95% ✅ (above 80%)
// - new_code_smells: 0 ✅
// - new_bugs: 0 ✅
// - cognitive_complexity: low ✅
```

**AI Evaluation:**
- ✅ Coverage target met
- ✅ No new code smells introduced
- ✅ Cognitive complexity acceptable
- ✅ Ready to present to user

---

### **Step 8: Present to User**

**AI Response:**
```markdown
✅ I've added a secure password reset endpoint to backend/server.js with the following features:

**Implementation:**
- POST /api/password-reset/request endpoint
- Secure token generation using crypto.randomBytes
- Email enumeration prevention (same response for existing/non-existing emails)
- 1-hour token expiration
- Parameterized database queries

**Quality Metrics:**
- ✅ Test Coverage: 95% (exceeds 80% requirement)
- ✅ Code Smells: 0
- ✅ Function Length: All ≤20 lines
- ✅ Cognitive Complexity: Low
- ✅ Security: Follows best practices

**Files Modified:**
- backend/server.js (added 5 functions, total 78 lines)
- backend/__tests__/password-reset.test.js (new file, 5 tests)

All tests passing ✅
Ready to commit - quality gate will pass ✅
```

---

## 🎯 Outcome Comparison

### Without AI+SonarQube Workflow:
```
Time to first commit: 30 minutes
Quality gate failures: 3-5 issues
Time to fix issues: 45-60 minutes
Total time: 75-90 minutes
Developer frustration: High 😤
```

### With AI+SonarQube Workflow:
```
Time to first commit: 5 minutes
Quality gate failures: 0 issues ✅
Time to fix issues: 0 minutes
Total time: 5 minutes
Developer satisfaction: High 😊
Quality: Guaranteed ✅
```

---

## 🚀 Key Success Factors

1. **Pre-flight checks** using SonarQube MCP prevented blind generation
2. **Context7 queries** provided best-practice patterns
3. **Quality-first generation** followed established rules
4. **Test-driven approach** ensured coverage from start
5. **Automated validation** caught issues before commit

---

## 📚 Reusable Patterns Learned

From this example, these patterns can be reused for future AI generations:

1. **Promisify callbacks** for better maintainability
2. **Extract validation functions** to reduce complexity
3. **Early returns** for cleaner control flow
4. **Named constants** instead of magic numbers
5. **Comprehensive test coverage** (happy + error + edge cases)
6. **Security-first design** (enumeration prevention, secure tokens)

---

## 🔄 Continuous Improvement

After this workflow:
- AI learns these patterns
- Future generations follow same quality standards
- Quality gates pass on first commit
- Development velocity increases
- Technical debt decreases

**Result:** Sustainable, high-quality code generation! 🎉
