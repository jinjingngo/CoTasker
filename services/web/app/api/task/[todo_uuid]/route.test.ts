import {
  describe,
  beforeEach,
  expect,
  it,
  MockInstance,
  afterEach,
  vi,
} from 'vitest';
import { NextRequest } from 'next/server';

import { GET, POST } from './route';
import { TEST_BASE_URL } from '../../../util';
import {
  CLIENT_ERROR,
  CLIENT_ERROR_CODE,
  HTTP_OK_CODE,
  SERVER_ERROR,
  SERVER_ERROR_CODE,
} from '../../common_error';
import * as task from '../../db/task';

describe('Task Route Handlers', () => {
  let spy: MockInstance | null;
  let url: URL = new URL('/', TEST_BASE_URL);
  const fake_slug = { params: { todo_uuid: 'fake_uuid' } };
  const slug = {
    params: { todo_uuid: '16dc70fc-4089-47ee-9006-4c91b9547602' },
  };

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('GET /api/task/:todo_uuid', () => {
    beforeEach(() => {
      spy = vi.spyOn(task, 'queryTasksByTodoUUID');
    });

    it('should return Client Error because uuid is not valid', async () => {
      const req = new NextRequest(url!);
      const res = await GET(req, fake_slug);

      const body = await res.json();
      expect(body).toEqual(CLIENT_ERROR);
      expect(res.status).toBe(CLIENT_ERROR_CODE.status);
    });

    it('should return Server Error because ', async () => {
      spy!.mockResolvedValue(undefined);
      const req = new NextRequest(url!, {});

      const res = await GET(req, slug);
      const body = await res.json();

      expect(body).toEqual(SERVER_ERROR);
      expect(res.status).toBe(SERVER_ERROR_CODE.status);
    });

    it('should return Server Error because ', async () => {
      spy!.mockResolvedValue([]);
      const req = new NextRequest(url!, {});

      const res = await GET(req, slug);
      const body = await res.json();

      expect(body).toEqual([]);
      expect(res.status).toBe(HTTP_OK_CODE.status);
    });
  });

  describe('POST /api/task/:todo_uuid', () => {
    beforeEach(() => {
      spy = vi.spyOn(task, 'createTask');
    });

    it('should return Client Error because uuid is not valid', async () => {
      const req = new NextRequest(url!);
      const res = await POST(req, fake_slug);

      const body = await res.json();
      expect(body).toEqual(CLIENT_ERROR);
      expect(res.status).toBe(CLIENT_ERROR_CODE.status);
    });

    it('should return Client Error request is `undefined`', async () => {
      const req = new NextRequest(url!, {});

      const res = await POST(req, slug);
      const body = await res.json();

      expect(body).toEqual(CLIENT_ERROR);
      expect(res.status).toBe(CLIENT_ERROR_CODE.status);
    });

    it('should return Client Error because request body is `undefined`', async () => {
      const req = new NextRequest(url!, {
        method: 'POST',
      });
      const res = await POST(req, slug);
      const data = await res.json();

      expect(data).toEqual(CLIENT_ERROR);
      expect(res.status).toBe(CLIENT_ERROR_CODE.status);
    });

    it('should return Server Error because request `title` is `undefined`', async () => {
      const req = new NextRequest(url!, {
        method: 'POST',
        body: JSON.stringify({}),
      });
      const res = await POST(req, slug);
      const data = await res.json();

      expect(data).toEqual(CLIENT_ERROR);
      expect(res.status).toBe(CLIENT_ERROR_CODE.status);
    });

    it('should return Server Error because request `status` is `undefined`', async () => {
      const req = new NextRequest(url!, {
        method: 'POST',
        body: JSON.stringify({
          title: 'Task the First Born',
        }),
      });
      const res = await POST(req, slug);
      const data = await res.json();

      expect(data).toEqual(CLIENT_ERROR);
      expect(res.status).toBe(CLIENT_ERROR_CODE.status);
    });

    it('should return Server Error because `createTask` returns `undefined`', async () => {
      spy!.mockResolvedValue(undefined);
      const payload = {
        title: 'Task the First Born',
        status: 'IN_PROGRESS',
      };

      const req = new NextRequest(url!, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      const res = await POST(req, slug);
      const data = await res.json();

      expect(data).toEqual(SERVER_ERROR);
      expect(res.status).toBe(SERVER_ERROR_CODE.status);
    });

    it('should return a task because `createTask` returns expected value', async () => {
      const expected = {
        title: 'Task the First Born',
        status: 'IN_PROGRESS',
      };
      spy!.mockResolvedValue(expected);

      const req = new NextRequest(url!, {
        method: 'POST',
        body: JSON.stringify(expected),
      });
      const res = await POST(req, slug);
      const data = await res.json();

      expect(data).toEqual(expected);
      expect(res.status).toBe(HTTP_OK_CODE.status);
    });
  });
});
