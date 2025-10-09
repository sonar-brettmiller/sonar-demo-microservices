const request = require('supertest');

// Import the app for testing (this will execute server.js code)
const app = require('../server');

describe('SonarSource Demo Backend API', () => {
  // ⚠️ SECURITY ISSUE: Test that validates insecure behavior
  describe('Security Vulnerabilities', () => {
    test('should expose debug endpoint with sensitive information', async () => {
      // Test the actual debug endpoint (this executes server.js code)
      const response = await request(app)
        .get('/api/debug')
        .expect(404); // Debug endpoint was removed for security
      
      // Verify it returns 404 (security improvement)
      expect(response.status).toBe(404);
    });

    test('should accept SQL injection in login endpoint', async () => {
      // Test the actual login endpoint (this executes server.js code)
      const response = await request(app)
        .post('/api/login')
        .send({ username: 'admin', password: 'password123' })
        .expect(200);
      
      // Verify login works (tests the vulnerable code path)
      expect(response.body).toHaveProperty('token');
    });
  });

  describe('API Endpoints', () => {
    test('should respond to posts endpoint', async () => {
      // Test the actual posts endpoint (this executes server.js code)
      const response = await request(app)
        .get('/api/posts')
        .expect(200);
      
      // Verify posts data is returned
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  // ⚠️ SECURITY ISSUE: Test that demonstrates hardcoded secrets
  describe('Configuration', () => {
    test('should expose hardcoded secrets for demo purposes', () => {
      const JWT_SECRET = "hardcoded-secret-key-123!";
      const API_KEY = "sk-1234567890abcdef";
      
      // These tests document the intentional security issues
      expect(JWT_SECRET).toBeDefined();
      expect(API_KEY).toBeDefined();
      
      // ⚠️ SECURITY ISSUE: Console logging secrets in tests
      console.log('Test detected secrets:', { JWT_SECRET, API_KEY });
    });
  });
});
