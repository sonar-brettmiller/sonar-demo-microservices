const request = require('supertest');
const app = require('../server');

describe('Backend API - Additional Coverage', () => {
  let authToken;

  beforeAll(async () => {
    // Login to get auth token for protected routes
    const response = await request(app)
      .post('/api/login')
      .send({ username: 'admin', password: 'password123' });
    authToken = response.body.token;
  });

  describe('Registration Endpoint', () => {
    test('should register new user with valid data', async () => {
      const response = await request(app)
        .post('/api/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'securepassword123'
        })
        .expect(201);

      expect(response.body).toHaveProperty('message', 'User registered successfully');
      expect(response.body).toHaveProperty('userId');
    });

    test('should fail when username is missing', async () => {
      const response = await request(app)
        .post('/api/register')
        .send({
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    test('should fail when password is missing', async () => {
      const response = await request(app)
        .post('/api/register')
        .send({
          username: 'testuser',
          email: 'test@example.com'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Login Endpoint', () => {
    test('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({ username: 'admin', password: 'password123' })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).not.toHaveProperty('password');
    });

    test('should fail with invalid username', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({ username: 'nonexistent', password: 'password123' })
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });

    test('should fail with invalid password', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({ username: 'admin', password: 'wrongpassword' })
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });
  });

  describe('Users Endpoint', () => {
    test('should return users list when authenticated', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    test('should fail without authentication token', async () => {
      await request(app)
        .get('/api/users')
        .expect(401);
    });

    test('should fail with invalid token', async () => {
      await request(app)
        .get('/api/users')
        .set('Authorization', 'Bearer invalid-token')
        .expect(403);
    });
  });

  describe('User by ID Endpoint', () => {
    test('should return user by valid ID', async () => {
      const response = await request(app)
        .get('/api/user/1')
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('username');
      expect(response.body).not.toHaveProperty('password');
    });

    test('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/api/user/9999')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'User not found');
    });
  });

  describe('Posts Endpoint', () => {
    test('should return list of posts', async () => {
      const response = await request(app)
        .get('/api/posts')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Search Endpoint', () => {
    test('should search users by query', async () => {
      const response = await request(app)
        .get('/api/search?q=admin')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    test('should handle empty search results', async () => {
      const response = await request(app)
        .get('/api/search?q=nonexistentuser12345')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });

    test('should reject missing search query', async () => {
      const response = await request(app)
        .get('/api/search')
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Search query must be a string');
    });

    test('should reject non-string search query', async () => {
      const response = await request(app)
        .get('/api/search?q[]=malicious')
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Search query must be a string');
    });
  });

  describe('File Download Endpoint', () => {
    test('should return 404 for non-existent file', async () => {
      const response = await request(app)
        .get('/api/file?filename=nonexistent.txt')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    test('should sanitize path traversal attempt to safe basename', async () => {
      // path.basename('../../etc/passwd') = 'passwd', then file not found
      const response = await request(app)
        .get('/api/file?filename=../../etc/passwd')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'File not found');
    });

    test('should reject null filename', async () => {
      const response = await request(app)
        .get('/api/file')
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid filename');
    });

    test('should reject filename with special characters', async () => {
      const response = await request(app)
        .get('/api/file?filename=test<script>.txt')
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid filename characters');
    });

    test('should sanitize filename to basename only', async () => {
      const response = await request(app)
        .get('/api/file?filename=/path/to/file.txt')
        .expect(404);

      // Should try to read 'file.txt' not '/path/to/file.txt'
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('System Info Endpoint', () => {
    test('should return system info for admin user', async () => {
      const response = await request(app)
        .get('/api/system-info')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('platform');
      expect(response.body).toHaveProperty('nodeVersion');
      expect(response.body).toHaveProperty('timestamp');
    });

    test('should fail without authentication', async () => {
      await request(app)
        .get('/api/system-info')
        .expect(401);
    });

    test('should fail for non-admin users', async () => {
      // Register a regular user
      await request(app)
        .post('/api/register')
        .send({ 
          username: 'regularuser2',
          email: 'regular2@example.com',
          password: 'password123'
        });

      // Login as regular user
      const loginResponse = await request(app)
        .post('/api/login')
        .send({ username: 'regularuser2', password: 'password123' });

      const regularToken = loginResponse.body.token;

      // Try to access admin endpoint
      const response = await request(app)
        .get('/api/system-info')
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('error', 'Admin access required');
    });
  });

  describe('Upload Endpoint', () => {
    test('should handle upload endpoint (not implemented)', async () => {
      const response = await request(app)
        .post('/api/upload')
        .expect(501);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Upload functionality not implemented');
    });
  });

  describe('Error Handling Coverage', () => {
    test('should handle database error in registration', async () => {
      // Send duplicate username to trigger database error
      await request(app)
        .post('/api/register')
        .send({
          username: 'admin', // Duplicate
          email: 'duplicate@example.com',
          password: 'password123'
        });
      
      // Second attempt with same username should fail
      const response = await request(app)
        .post('/api/register')
        .send({
          username: 'admin',
          email: 'another@example.com',
          password: 'password123'
        })
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Registration failed');
    });

    test('should handle database error in login', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({ username: 'nonexistent', password: 'wrong' })
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });

    test('should handle file read error', async () => {
      const response = await request(app)
        .get('/api/file?filename=nonexistent.txt')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'File not found');
    });
  });

  describe('Profile Update Error Coverage', () => {
    let adminToken;

    beforeAll(async () => {
      const loginResponse = await request(app)
        .post('/api/login')
        .send({ username: 'admin', password: 'password123' });
      adminToken = loginResponse.body.token;
    });

    test('should handle update error when updating non-existent user', async () => {
      const response = await request(app)
        .put('/api/user/9999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ username: 'nonexistent' })
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Profile update failed');
    });

    test('should handle validation error for whitespace-only input', async () => {
      // Whitespace-only input should be caught by validation
      const response = await request(app)
        .put('/api/user/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ username: '  ', email: '  ' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid input data');
    });
  });
});