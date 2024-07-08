import {
  describe,
  beforeEach,
  expect,
  it,
  MockInstance,
  afterEach,
  vi,
} from 'vitest';

import { TEST_BASE_URL } from '../../../../util';
import * as task from '../../../db/task';
import { NextRequest } from 'next/server';
import {
  CLIENT_CLONE_ERROR,
  CLIENT_ERROR,
  CLIENT_ERROR_CODE,
  HTTP_OK,
  HTTP_OK_CODE,
  SERVER_ERROR,
  SERVER_ERROR_CODE,
} from '../../../common_error';
import { DELETE, PATCH } from './route';

describe('Task Route Handlers', () => {
  let spy: MockInstance | null;
  let url: URL = new URL('/', TEST_BASE_URL);
  const fake_slug = { params: { todo_uuid: 'fake_uuid' } };
  const slug = {
    params: { todo_uuid: '16dc70fc-4089-47ee-9006-4c91b9547602', id: 0 },
  };

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('PATCH /api/task/:todo_uuid/:id', () => {
    beforeEach(() => {
      spy = vi.spyOn(task, 'updateTask');
    });

    it('should return Client Error because uuid is not valid', async () => {
      const req = new NextRequest(url!);
      const res = await PATCH(req, fake_slug);

      const body = await res.json();
      expect(body).toEqual(CLIENT_ERROR);
      expect(res.status).toBe(CLIENT_ERROR_CODE.status);
    });

    it('should return Client Error request is `undefined`', async () => {
      const req = new NextRequest(url!, {});

      const res = await PATCH(req, slug);
      const body = await res.json();

      expect(body).toEqual(CLIENT_ERROR);
      expect(res.status).toBe(CLIENT_ERROR_CODE.status);
    });

    it('should return Client Error because request body is `undefined`', async () => {
      const req = new NextRequest(url!, {
        method: 'POST',
      });
      const res = await PATCH(req, slug);
      const data = await res.json();

      expect(data).toEqual(CLIENT_ERROR);
      expect(res.status).toBe(CLIENT_ERROR_CODE.status);
    });

    it('should return Client Error because `id` is `undefined`', async () => {
      const req = new NextRequest(url!, {
        method: 'PATCH',
        body: JSON.stringify({ parent_id: slug.params.id }),
      });
      const res = await PATCH(req, {
        params: { todo_uuid: slug.params.todo_uuid },
      });
      const data = await res.json();

      expect(data).toEqual(CLIENT_ERROR);
      expect(res.status).toBe(CLIENT_ERROR_CODE.status);
    });

    it('should return Client Error because `clone()` is illegal in most of countries .)', async () => {
      const req = new NextRequest(url!, {
        method: 'PATCH',
        body: JSON.stringify({ parent_id: slug.params.id }),
      });
      const res = await PATCH(req, slug);
      const data = await res.json();

      expect(data).toEqual(CLIENT_CLONE_ERROR);
      expect(res.status).toBe(CLIENT_ERROR_CODE.status);
    });

    it('should return Client Error because request body is empty', async () => {
      const req = new NextRequest(url!, {
        method: 'PATCH',
        body: JSON.stringify({}),
      });
      const res = await PATCH(req, slug);
      const data = await res.json();

      console.log(data);
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
      const res = await PATCH(req, slug);
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
      const res = await PATCH(req, slug);
      const data = await res.json();

      expect(data).toEqual(expected);
      expect(res.status).toBe(HTTP_OK_CODE.status);
    });
  });

  describe('DELETE /api/task/:todo_uuid/:id', () => {
    let req = new NextRequest(url!);
    beforeEach(() => {
      spy = vi.spyOn(task, 'deleteTask');
    });

    it('should return Client Error because uuid is not valid', async () => {
      const res = await DELETE(req!, fake_slug);
      const body = await res.json();

      expect(body).toEqual(CLIENT_ERROR);
      expect(res.status).toBe(CLIENT_ERROR_CODE.status);
    });

    it('should return Server Error because deleteTask returns `undefined`', async () => {
      spy!.mockImplementationOnce(() => undefined);

      const req = new NextRequest(url!);
      const res = await DELETE(req, slug);
      const data = await res.json();

      expect(data).toEqual(SERVER_ERROR);
      expect(res.status).toBe(SERVER_ERROR_CODE.status);
    });

    it('should return Client Error because no record has been deleted', async () => {
      spy!.mockResolvedValue({ rowCount: 0 });

      const req = new NextRequest(url!);
      const res = await DELETE(req, slug);
      const data = await res.json();

      expect(data).toEqual(CLIENT_ERROR);
      expect(res.status).toBe(CLIENT_ERROR_CODE.status);
    });

    it('should return Successful', async () => {
      spy!.mockResolvedValue({ rowCount: 1 });

      const req = new NextRequest(url!);
      const res = await DELETE(req, slug);
      const data = await res.json();

      expect(data).toEqual(HTTP_OK);
      expect(res.status).toBe(HTTP_OK_CODE.status);
    });
  });
});
