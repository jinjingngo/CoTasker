import { describe, beforeEach, expect, it } from 'vitest';
import { GET } from './route';
import { TEST_BASE_URL } from '../../util';
import { HTTP_OK_CODE } from '../common_error';
import { NextRequest } from 'next/server';

describe('Task Route Handlers', () => {
  let url: URL | null = null;
  beforeEach(() => {
    url = new URL('/', TEST_BASE_URL);
  });

  it('should return Tasks!', async () => {
    const req = new NextRequest(url!);
    const res = await GET(req);

    const body = await res.json();
    expect(body).toEqual([]);
    expect(res.status).toBe(HTTP_OK_CODE.status);
  });
});
