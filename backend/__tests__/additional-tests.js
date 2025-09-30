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
  });

  describe('File Download Endpoint', () => {
    test('should return 404 for non-existent file', async () => {
      const response = await request(app)
        .get('/api/file?filename=nonexistent.txt')
        .expect(404);

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
  });

  describe('Upload Endpoint', () => {
    test('should handle upload endpoint (not implemented)', async () => {
      const response = await request(app)
        .post('/api/upload')
        .expect(200);

      expect(response.body).toHaveProperty('message');
    });
  });
});