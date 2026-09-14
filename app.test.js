const request = require('supertest');
const app = require('./app');

describe('SIT223 Student Task API', () => {
  test('GET /health should return status UP', async () => {
    const response = await request(app).get('/health');

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('UP');
  });

  test('GET /api/status should return project status', async () => {
    const response = await request(app).get('/api/status');

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('Running');
  });
});