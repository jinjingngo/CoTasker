import {
  beforeEach,
  afterEach,
  describe,
  MockInstance,
  vi,
  it,
  expect,
} from 'vitest';
import { Pool } from 'pg';

import * as db from '../client/db';
import { queryTodos, createTodo, updateTodo, deleteTodo } from './todo';

describe('DB Todo', () => {
  let spy: MockInstance<[], Pool> | null = null;

  beforeEach(() => {
    spy = vi.spyOn(db, 'getDBPool');
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('queryTodo', () => {
    it('should return `undefined` because `getDBPool()` throws an error', async () => {
      spy!.mockImplementationOnce(() => {
        throw Error();
      });

      const todos = await queryTodos(0, 5);
      expect(todos).toBeUndefined();
    });

    it('should return `undefined` because `query()` throws an error', async () => {
      spy!.mockImplementationOnce(() => {
        return {
          query: () => {
            throw Error();
          },
        } as unknown as Pool;
      });
      const todos = await queryTodos(0, 5);
      expect(todos).toBeUndefined();
    });

    it('should return expected object', async () => {
      spy!.mockImplementation(() => {
        return {
          query: (_query: string, values: []) => {
            return { rows: values ? [] : [{ total: 0 }] };
          },
        } as unknown as Pool;
      });

      const todos = await queryTodos(0, 5);
      expect(todos).toStrictEqual({ todo: [], total: 0 });
    });
  });

  describe('createTodo', () => {
    const title = 'Todo the First Born';
    it('should return `undefined` because `getDBPool()` throws an error', async () => {
      spy!.mockImplementationOnce(() => {
        throw Error();
      });

      const todo = await createTodo(title);
      expect(todo).toBeUndefined();
    });

    it('should return `undefined` because `query()` throws an error', async () => {
      spy!.mockImplementationOnce(() => {
        return {
          query: () => {
            throw Error();
          },
        } as unknown as Pool;
      });
      const todo = await createTodo(title);
      expect(todo).toBeUndefined();
    });

    it('should return expected object', async () => {
      const expected = { title };
      spy!.mockImplementation(() => {
        return {
          query: () => {
            return {
              rows: [expected],
            };
          },
        } as unknown as Pool;
      });

      const todo = await createTodo(title);
      expect(todo).toStrictEqual(expected);
    });
  });

  describe('updateTodo', () => {
    const uuid = '16dc70fc-4089-47ee-9006-4c91b9547602';
    const title = 'Todo the Updated Born';
    it('should return `undefined` because `getDBPool()` throws an error', async () => {
      spy!.mockImplementationOnce(() => {
        throw Error();
      });

      const todo = await updateTodo(uuid, title);
      expect(todo).toBeUndefined();
    });

    it('should return `undefined` because `query()` throws an error', async () => {
      spy!.mockImplementationOnce(() => {
        return {
          query: () => {
            throw Error();
          },
        } as unknown as Pool;
      });
      const todo = await updateTodo(uuid, title);
      expect(todo).toBeUndefined();
    });

    it('should return expected object', async () => {
      const expected = { uuid, title };
      spy!.mockImplementation(() => {
        return {
          query: () => {
            return {
              rows: [expected],
            };
          },
        } as unknown as Pool;
      });

      const todo = await updateTodo(uuid, title);
      expect(todo).toStrictEqual(expected);
    });
  });

  describe('deleteTodo', () => {
    const uuid = '16dc70fc-4089-47ee-9006-4c91b9547602';
    it('should return `undefined` because `getDBPool()` throws an error', async () => {
      spy!.mockImplementationOnce(() => {
        throw Error();
      });

      const todo = await deleteTodo(uuid);
      expect(todo).toBeUndefined();
    });

    it('should return `undefined` because `query()` throws an error', async () => {
      spy!.mockImplementationOnce(() => {
        return {
          query: () => {
            throw Error();
          },
        } as unknown as Pool;
      });
      const todo = await deleteTodo(uuid);
      expect(todo).toBeUndefined();
    });

    it('should return expected object', async () => {
      const expected = { rowCount: 1 };
      spy!.mockImplementation(() => {
        return {
          query: () => expected,
        } as unknown as Pool;
      });

      const tasks = await deleteTodo(uuid);
      expect(tasks).toStrictEqual(expected);
    });
  });
});
