import request from 'supertest';
import { describe, it, expect } from 'vitest';
import { server } from '../../src/server';

describe('GET /api/status', () => {
  it('should return 200 and ok', async () => {
    const response = await request(server).get('/api/status');

    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);
  });
});
