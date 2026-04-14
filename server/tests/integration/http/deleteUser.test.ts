import { describe, it, expect } from 'vitest';
import { request } from '../util/http';

describe('DELETE /api/users/me', async () => {
  it('should return 200 and delete user', async () => {
    const { jwt } = await request.createAndSignIn({
      name: 'test',
      email: 'test@gmail.com',
      password: 'Test@Test.Test',
    });

    const deleteUserResponse = await request.deleteUser(jwt);
    const fetchUserResponse = await request.fetchUserInfo(jwt);

    expect(deleteUserResponse.status).toBe(200);
    expect(deleteUserResponse.body.success).toBe(true);

    expect(fetchUserResponse.status).toBe(401);
    expect(fetchUserResponse.body.code).toBe('INVALID_TOKEN');
  });
});
