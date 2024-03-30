import { describe, beforeEach, expect, test } from 'vitest';
import { GET } from './route';
import { TEST_BASE_URL } from '../../util';

describe('Task Route Handlers', () => {
  let url: URL | null = null;
  beforeEach(() => {
    url = new URL('/', TEST_BASE_URL);
  });

  test('should return Tasks!', async () => {
    const req = new Request(url!);
    const res = await GET(req);

    const body = await res.text();
    expect(body).toEqual('Tasks!');
    expect(res.status).toBe(200);
  });
});
