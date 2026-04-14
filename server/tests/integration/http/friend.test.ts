import { describe, it, expect, beforeEach } from 'vitest';
import { request } from '../util/http';
import { resetDatabase } from '../util/database';

beforeEach(async () => {
  await resetDatabase();
});

describe('GET api/users/me/friend-requests', () => {});

describe('POST api/users/me/friend-requests', () => {});

describe('PATCH api/users/me/friend-requests', () => {});

describe('DELETE api/users/me/friend-requests', () => {});

describe('DELETE api/users/me/friends', () => {});
