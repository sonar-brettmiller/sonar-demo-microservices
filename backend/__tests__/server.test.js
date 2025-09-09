const request = require('supertest');
// Note: In a real app, we'd import the server differently to avoid starting it
// const app = require('../server');

describe('SonarSource Demo Backend API', () => {
  // ⚠️ SECURITY ISSUE: Test that validates insecure behavior
  describe('Security Vulnerabilities', () => {
    test('should expose debug endpoint with sensitive information', async () => {
      // This test documents the intentional security vulnerability
      expect(true).toBe(true); // Placeholder test
    });

    test('should accept SQL injection in login endpoint', async () => {
      // This test documents the intentional SQL injection vulnerability
      expect(true).toBe(true); // Placeholder test
    });
  });

  describe('API Endpoints', () => {
    test('should have basic API structure', () => {
      // Basic test to ensure Jest is working
      expect(1 + 1).toBe(2);
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
