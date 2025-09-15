import request from 'supertest';
import app from '../index';

describe('Basic API Tests', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('healthy');
    });
  });

  describe('GET /api-docs', () => {
    it('should return Swagger UI', async () => {
      const response = await request(app)
        .get('/api-docs')
        .expect(200);

      expect(response.text).toContain('swagger');
    });
  });

  describe('GET /api-docs.json', () => {
    it('should return OpenAPI JSON', async () => {
      const response = await request(app)
        .get('/api-docs.json')
        .expect(200);

      expect(response.body).toHaveProperty('info');
      expect(response.body.info.title).toBe('AI Style Editor API');
    });
  });
});
