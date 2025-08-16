import request from 'supertest';
import { app, server } from '../index';

describe('API Endpoints', () => {
  afterAll(async () => {
    await server.close();
  });

  describe('GET /', () => {
    it('should return welcome message', async () => {
      const response = await request(app)
        .get('/')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toEqual({
        message: 'Welcome to MyFirstBA2 API',
        version: '1.0.0',
        status: 'healthy',
      });
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(typeof response.body.uptime).toBe('number');
    });
  });

  describe('GET /nonexistent', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/nonexistent')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toEqual({
        error: 'Not Found',
        message: 'Route /nonexistent not found',
      });
    });
  });

  describe('Error handling', () => {
    it('should handle server errors gracefully', async () => {
      // Test error handling by making a request that might cause an error
      // This is a basic test - in a real app, you'd test actual error conditions
      const response = await request(app)
        .post('/')
        .send({ invalid: 'data' })
        .expect(404); // Since POST / doesn't exist, it should return 404

      expect(response.body).toHaveProperty('error');
    });
  });
});