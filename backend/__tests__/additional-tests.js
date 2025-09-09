const request = require('supertest');
const app = require('../server');

describe('Additional Backend API Tests', () => {
  let authToken;

  beforeAll(async () => {
    // Get auth token for protected routes
    const response = await request(app)
      .post('/api/login')
      .send({ username: 'admin', password: 'password123' });
    
    authToken = response.body.token;
  });

  describe('User Registration', () => {
    test('should register a new user with valid data', async () => {
      const newUser = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'securepassword123'
      };

      const response = await request(app)
        .post('/api/register')
        .send(newUser)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'User registered successfully');
      expect(response.body).toHaveProperty('userId');
    });

    test('should reject registration with missing username', async () => {
      const invalidUser = {
        email: 'test@example.com',
        password: 'password123'
      };

      await request(app)
        .post('/api/register')
        .send(invalidUser)
        .expect(400);
    });

    test('should reject registration with missing password', async () => {
      const invalidUser = {
        username: 'testuser',
        email: 'test@example.com'
      };

      await request(app)
        .post('/api/register')
        .send(invalidUser)
        .expect(400);
    });
  });

  describe('User Authentication', () => {
    test('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({ username: 'admin', password: 'password123' })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('username', 'admin');
      expect(response.body.user).not.toHaveProperty('password');
    });

    test('should reject login with invalid credentials', async () => {
      await request(app)
        .post('/api/login')
        .send({ username: 'admin', password: 'wrongpassword' })
        .expect(401);
    });

    test('should reject login with non-existent user', async () => {
      await request(app)
        .post('/api/login')
        .send({ username: 'nonexistent', password: 'password' })
        .expect(401);
    });
  });

  describe('User Management', () => {
    test('should get all users with valid token', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    test('should reject users request without token', async () => {
      await request(app)
        .get('/api/users')
        .expect(401);
    });

    test('should reject users request with invalid token', async () => {
      await request(app)
        .get('/api/users')
        .set('Authorization', 'Bearer invalid-token')
        .expect(403);
    });
  });

  describe('Individual User Lookup', () => {
    test('should get user by valid ID', async () => {
      const response = await request(app)
        .get('/api/user/1')
        .expect(200);

      expect(response.body).toHaveProperty('id', 1);
      expect(response.body).toHaveProperty('username');
      expect(response.body).toHaveProperty('email');
      expect(response.body).toHaveProperty('role');
      expect(response.body).not.toHaveProperty('password');
    });

    test('should return 404 for non-existent user', async () => {
      await request(app)
        .get('/api/user/999999')
        .expect(404);
    });
  });

  describe('Search Functionality', () => {
    test('should search users by username', async () => {
      const response = await request(app)
        .get('/api/search?q=admin')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('username');
      expect(response.body[0]).toHaveProperty('email');
    });

    test('should search users by email', async () => {
      const response = await request(app)
        .get('/api/search?q=example.com')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    test('should return empty array for no matches', async () => {
      const response = await request(app)
        .get('/api/search?q=nonexistentuser12345')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });

  describe('File Operations', () => {
    test('should handle file download request', async () => {
      await request(app)
        .get('/api/file?filename=test.txt')
        .expect(404); // File doesn't exist, but endpoint should handle it
    });

    test('should expose file path in error (security issue demo)', async () => {
      const response = await request(app)
        .get('/api/file?filename=nonexistent.txt')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'File not found');
      expect(response.body).toHaveProperty('path');
    });
  });

  describe('Upload Endpoint', () => {
    test('should handle upload endpoint (not implemented)', async () => {
      const response = await request(app)
        .post('/api/upload')
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Upload endpoint (not implemented)');
    });
  });

  describe('System Information', () => {
    test('should provide system info for admin users', async () => {
      const response = await request(app)
        .get('/api/system-info')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('platform');
      expect(response.body).toHaveProperty('nodeVersion');
      expect(response.body).toHaveProperty('timestamp');
    });

    test('should reject non-admin users', async () => {
      // First register a regular user
      await request(app)
        .post('/api/register')
        .send({
          username: 'regularuser',
          email: 'regular@example.com',
          password: 'password123'
        });

      // Login as regular user
      const loginResponse = await request(app)
        .post('/api/login')
        .send({ username: 'regularuser', password: 'password123' });

      const userToken = loginResponse.body.token;

      // Try to access admin endpoint
      await request(app)
        .get('/api/system-info')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    test('should reject system-info without authentication', async () => {
      await request(app)
        .get('/api/system-info')
        .expect(401);
    });
  });

  describe('Error Handling', () => {
    test('should handle 404 for non-existent endpoints', async () => {
      await request(app)
        .get('/api/nonexistent')
        .expect(404);
    });

    test('should handle malformed requests gracefully', async () => {
      await request(app)
        .post('/api/login')
        .send('invalid json')
        .expect(400);
    });
  });

  describe('Posts Endpoint', () => {
    test('should return all posts', async () => {
      const response = await request(app)
        .get('/api/posts')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('title');
      expect(response.body[0]).toHaveProperty('content');
    });
  });

  describe('Swagger Documentation', () => {
    test('should serve API documentation', async () => {
      await request(app)
        .get('/api-docs/')
        .expect(301); // Redirect to /api-docs/
    });
  });
});
