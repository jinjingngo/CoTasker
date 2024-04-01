import { TEST_BASE_URL } from '../../../util';
import { NextRequest } from 'next/server';
import {
  describe,
  beforeEach,
  expect,
  vi,
  it,
  MockInstance,
  afterEach,
} from 'vitest';

import * as todo from '../../db/todo';
import { DELETE, GET, PATCH } from './route';
import {
  CLIENT_ERROR,
  CLIENT_ERROR_CODE,
  HTTP_OK,
  HTTP_OK_CODE,
  SERVER_ERROR,
  SERVER_ERROR_CODE,
} from '../../common_error';

describe('Todo Route Handlers', () => {
  let spy: MockInstance | null;
  let url = new URL('/', TEST_BASE_URL);
  let req = new NextRequest(url!);
  const fakeContext = { params: { uuid: 'fake_uuid' } };
  const context = { params: { uuid: '16dc70fc-4089-47ee-9006-4c91b9547602' } };

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('PATCH /api/todo/:uuid', () => {
    beforeEach(() => {
      spy = vi.spyOn(todo, 'updateTodo');
    });

    it('should return Client Error because uuid is not valid', async () => {
      const res = await PATCH(req!, fakeContext);
      const body = await res.json();

      expect(body).toEqual(CLIENT_ERROR);
      expect(res.status).toBe(CLIENT_ERROR_CODE.status);
    });

    it('should return Client Error because request is `undefined`', async () => {
      const req = new NextRequest(url!, {});

      const res = await PATCH(req, context);
      const body = await res.json();

      expect(body).toEqual(CLIENT_ERROR);
      expect(res.status).toBe(CLIENT_ERROR_CODE.status);
    });

    it('should return Client Error because request body is `undefined`', async () => {
      const req = new NextRequest(url!, {
        method: 'PATCH',
      });
      const res = await PATCH(req, context);
      const data = await res.json();

      expect(data).toEqual(CLIENT_ERROR);
      expect(res.status).toBe(CLIENT_ERROR_CODE.status);
    });

    it('should return Client Error because `title` is missing in request body', async () => {
      const req = new NextRequest(url!, {
        method: 'PATCH',
        body: JSON.stringify({}),
      });
      const res = await PATCH(req, context);
      const data = await res.json();

      expect(data).toEqual(CLIENT_ERROR);
      expect(res.status).toBe(CLIENT_ERROR_CODE.status);
    });

    it('should return Server Error because `updateTodo` returns `undefined`', async () => {
      spy!.mockImplementationOnce(() => undefined);
      const payload = {
        title: 'ToDo the First Born',
      };

      const req = new NextRequest(url!, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      const res = await PATCH(req, context);
      const data = await res.json();

      expect(data).toEqual(SERVER_ERROR);
      expect(res.status).toBe(SERVER_ERROR_CODE.status);
    });

    it('should return a todo', async () => {
      const expected = {
        title: 'ToDo the First Born',
      };
      spy!.mockImplementationOnce(() => expected);

      const req = new NextRequest(url!, {
        method: 'PATCH',
        body: JSON.stringify(expected),
      });
      const res = await PATCH(req, context);
      const data = await res.json();

      expect(data).toEqual(expected);
      expect(res.status).toBe(HTTP_OK_CODE.status);
    });
  });

  describe('DELETE /api/todo/:uuid', () => {
    beforeEach(() => {
      spy = vi.spyOn(todo, 'deleteTodo');
    });

    it('should return Client Error because uuid is not valid', async () => {
      const res = await DELETE(req!, fakeContext);
      const body = await res.json();

      expect(body).toEqual(CLIENT_ERROR);
      expect(res.status).toBe(CLIENT_ERROR_CODE.status);
    });

    it('should return Server Error because deleteTodo returns `undefined`', async () => {
      spy!.mockImplementationOnce(() => undefined);

      const req = new NextRequest(url!);
      const res = await DELETE(req, context);
      const data = await res.json();

      expect(data).toEqual(SERVER_ERROR);
      expect(res.status).toBe(SERVER_ERROR_CODE.status);
    });

    it('should return Client Error because no record has been deleted', async () => {
      spy!.mockResolvedValue({ rowCount: 0 });

      const req = new NextRequest(url!);
      const res = await DELETE(req, context);
      const data = await res.json();

      expect(data).toEqual(CLIENT_ERROR);
      expect(res.status).toBe(CLIENT_ERROR_CODE.status);
    });

    it('should return Successful', async () => {
      spy!.mockResolvedValue({ rowCount: 1 });

      const req = new NextRequest(url!);
      const res = await DELETE(req, context);
      const data = await res.json();

      expect(data).toEqual(HTTP_OK);
      expect(res.status).toBe(HTTP_OK_CODE.status);
    });
  });

  describe('GET /api/todo/:uuid', () => {
    beforeEach(() => {
      spy = vi.spyOn(todo, 'queryTodoByUUID');
    });

    it('should return Client Error because uuid is not valid', async () => {
      const res = await GET(req!, fakeContext);
      const body = await res.json();

      expect(body).toEqual(CLIENT_ERROR);
      expect(res.status).toBe(CLIENT_ERROR_CODE.status);
    });

    it('should return Server Error because deleteTodo returns `undefined`', async () => {
      spy!.mockImplementationOnce(() => undefined);

      const req = new NextRequest(url!);
      const res = await GET(req, context);
      const data = await res.json();

      expect(data).toEqual(SERVER_ERROR);
      expect(res.status).toBe(SERVER_ERROR_CODE.status);
    });

    it('should return Successful', async () => {
      const expected = { uuid: context.params.uuid };
      spy!.mockResolvedValue(expected);

      const req = new NextRequest(url!);
      const res = await GET(req, context);
      const data = await res.json();

      expect(data).toEqual(expected);
      expect(res.status).toBe(HTTP_OK_CODE.status);
    });
  });
});
