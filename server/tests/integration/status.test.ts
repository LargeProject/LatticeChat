import request from 'supertest';
import { describe, it, expect} from 'vitest';
import { app } from "../../src";

describe('GET /api/status', () => {
  it('should return 200 and ok', async () => {
    const response = await request(app).get('/api/status');

    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);
  })
});