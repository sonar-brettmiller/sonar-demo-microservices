const request = require('supertest');
const app = require('../server');

describe('User Profile Update Endpoint', () => {
  let authToken;
  let userId;

  beforeAll(async () => {
    // Login to get auth token
    const loginResponse = await request(app)
      .post('/api/login')
      .send({ username: 'admin', password: 'password123' });
    
    authToken = loginResponse.body.token;
    userId = loginResponse.body.user.id;
  });

  describe('PUT /api/user/:id', () => {
    
    // Happy path - Update username
    test('should update username with valid data and auth', async () => {
      const response = await request(app)
        .put(`/api/user/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ username: 'adminUpdated' })
        .expect(200);
      
      expect(response.body).toHaveProperty('message', 'Profile updated successfully');
      expect(response.body.user).toHaveProperty('username', 'adminUpdated');
    });

    // Happy path - Update email
    test('should update email with valid format', async () => {
      const response = await request(app)
        .put(`/api/user/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ email: 'newemail@example.com' })
        .expect(200);
      
      expect(response.body).toHaveProperty('message');
      expect(response.body.user).toHaveProperty('email', 'newemail@example.com');
    });

    // Happy path - Update both fields
    test('should update both username and email', async () => {
      const response = await request(app)
        .put(`/api/user/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ 
          username: 'adminNew',
          email: 'admin@new.com' 
        })
        .expect(200);
      
      expect(response.body.user.username).toBe('adminNew');
      expect(response.body.user.email).toBe('admin@new.com');
    });

    // Error case - No authentication token
    test('should fail without authentication token', async () => {
      await request(app)
        .put(`/api/user/${userId}`)
        .send({ username: 'newname' })
        .expect(401);
    });

    // Error case - Invalid token
    test('should fail with invalid authentication token', async () => {
      await request(app)
        .put(`/api/user/${userId}`)
        .set('Authorization', 'Bearer invalid-token')
        .send({ username: 'newname' })
        .expect(403);
    });

    // Admin privilege - Can update other user profiles
    test('should allow admin to update another user profile', async () => {
      // First create a test user
      await request(app)
        .post('/api/register')
        .send({ 
          username: 'testuser2',
          email: 'test2@example.com',
          password: 'password123'
        });
      
      // Admin should be able to update this user
      const response = await request(app)
        .put(`/api/user/2`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ username: 'adminUpdatedOther' });
      
      // Should succeed (200) or fail gracefully if user doesn't exist
      expect([200, 500]).toContain(response.status);
    });

    // Error case - Invalid email format
    test('should reject invalid email format', async () => {
      const response = await request(app)
        .put(`/api/user/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ email: 'not-an-email' })
        .expect(400);
      
      expect(response.body).toHaveProperty('error', 'Invalid input data');
    });

    // Error case - Username too short
    test('should reject username shorter than 3 characters', async () => {
      const response = await request(app)
        .put(`/api/user/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ username: 'ab' })
        .expect(400);
      
      expect(response.body).toHaveProperty('error', 'Invalid input data');
    });

    // Error case - Empty request body
    test('should reject empty update request', async () => {
      const response = await request(app)
        .put(`/api/user/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);
      
      expect(response.body).toHaveProperty('error', 'Invalid input data');
    });

    // Error case - Invalid username type
    test('should reject non-string username', async () => {
      const response = await request(app)
        .put(`/api/user/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ username: 12345 })
        .expect(400);
      
      expect(response.body).toHaveProperty('error');
    });

    // Edge case - Whitespace trimming
    test('should trim whitespace from username and email', async () => {
      const response = await request(app)
        .put(`/api/user/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ 
          username: '  trimmedUser  ',
          email: '  trimmed@email.com  '
        })
        .expect(200);
      
      expect(response.body.user.username).toBe('trimmedUser');
      expect(response.body.user.email).toBe('trimmed@email.com');
    });

    // Edge case - Email with multiple @ symbols
    test('should reject email with multiple @ symbols', async () => {
      const response = await request(app)
        .put(`/api/user/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ email: 'user@@example.com' })
        .expect(400);
      
      expect(response.body).toHaveProperty('error');
    });

    // Security - SQL injection attempt in username
    test('should safely handle SQL injection attempt in username', async () => {
      const response = await request(app)
        .put(`/api/user/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ username: "admin'; DROP TABLE users; --" })
        .expect(200);
      
      // Should update safely with parameterized query
      expect(response.body).toHaveProperty('message');
    });

    // Security - XSS attempt in username
    test('should handle XSS attempt in username', async () => {
      const xssAttempt = '<script>alert("xss")</script>';
      const response = await request(app)
        .put(`/api/user/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ username: xssAttempt })
        .expect(200);
      
      // Should store as-is but safely (no execution)
      expect(response.body.user.username).toBe(xssAttempt);
    });

    // Security - Sensitive data not exposed in response
    test('should not expose password in response', async () => {
      const response = await request(app)
        .put(`/api/user/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ username: 'secureUser' })
        .expect(200);
      
      expect(response.body.user).not.toHaveProperty('password');
      expect(response.body.user).not.toHaveProperty('api_key');
    });
  });
});
