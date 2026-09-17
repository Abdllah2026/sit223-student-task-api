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
    expect(response.body.project).toBe('SIT223 Student Task API');
    expect(response.body.status).toBe('Running');
  });

  test('GET /api/tasks should return a list of tasks', async () => {
    const response = await request(app).get('/api/tasks');

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  test('POST /api/tasks should create a new task', async () => {
    const response = await request(app)
      .post('/api/tasks')
      .send({
        title: 'Test Jenkins pipeline'
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.title).toBe('Test Jenkins pipeline');
    expect(response.body.completed).toBe(false);
  });

  test('POST /api/tasks should reject an empty title', async () => {
    const response = await request(app)
      .post('/api/tasks')
      .send({});

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('Task title is required');
  });

  test('PUT /api/tasks/:id should update a task', async () => {
    const createResponse = await request(app)
      .post('/api/tasks')
      .send({
        title: 'Task to update'
      });

    const taskId = createResponse.body.id;

    const response = await request(app)
      .put(`/api/tasks/${taskId}`)
      .send({
        completed: true
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.completed).toBe(true);
  });

  test('DELETE /api/tasks/:id should delete a task', async () => {
    const createResponse = await request(app)
      .post('/api/tasks')
      .send({
        title: 'Task to delete'
      });

    const taskId = createResponse.body.id;

    const response = await request(app)
      .delete(`/api/tasks/${taskId}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Task deleted successfully');
  });
});